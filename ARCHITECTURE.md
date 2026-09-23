# EchoSpeak — architecture (v3)

A spoken workplace-German trainer for people starting in German hospital **IT support** and
**clinical laboratories**. Android first (Capacitor), browser/PWA second. The learner picks a
workplace situation, answers the other person out loud (or by typing), and gets coaching on how
professional the reply sounded — with Arabic explanations.

This document describes what the code does today. History is in `git log`.

---

## 1. What the app is

Three tabs and one full-screen session:

| Screen | Job |
|---|---|
| **Üben** (home) | Pick a scenario. Each is shown as a *ticket*: `INC-…` on the service desk, `LAB-…` in the lab. A finished ticket is stamped **Gelöst** / **Freigegeben**. |
| **Session** | The conversation. The other person's line appears; the learner answers by mic or keyboard, taps **Senden**, gets a coaching card, taps **Weiter**. Ends with a summary and the stamp. |
| **Wörter** | Searchable workplace vocabulary with IPA, Arabic meaning and playback. |
| **Quiz** | "Welche Antwort ist professionell?" — multiple choice. |

Read Aloud, Shadowing, Dictation, Phonetics, generic Roleplay, the Vault and Text-Politur were
removed in v3: the app does one thing. They are recoverable from git history.

### Content

`src/data/vocationalData.js` holds 20 scenarios (IT + lab × German + English, 5 each, identical
order and step counts in both languages). Each step has the partner's line, three phrasings — one
professional and two realistic mistakes — and feedback: a correction, a key term with IPA, the next
workplace action, and Arabic coaching.

The **glossary and quiz are derived** from the scenarios (`src/app/content.js`): every step's key
term becomes a glossary entry and every step becomes a quiz question, merged with the few authored
entries. That turned 4 terms and 2 questions per domain into 18 and 15 without inventing content.

### Scoring (`src/app/scoring.js`)

The learner answers in their own words, so exact matching is useless. The answer is compared with
**each** phrasing (content-word overlap with light stemming; umlauts folded so speech-to-text output
and typing compare equally). Verdicts:

| Verdict | Rule |
|---|---|
| **Vorsicht** (risky) | closest to one of the *mistakes*, clearly ahead of the professional phrasing |
| **Professionell** | ≥ 0.55 similarity to the professional phrasing |
| **Auf gutem Weg** | ≥ 0.30 |
| **Eigene Formulierung** | too different to judge — shown with the model answer, not marked wrong |

Validated against the data: all 56 professional phrasings score *Professionell*, all 112 mistakes
score *Vorsicht*. It is a similarity heuristic, not grammar checking, and the labels say so.

---

## 2. Directory structure

    src/
      main.js                 bootstrap: shell wiring, routes, fonts, styles
      app/
        router.js             hash router; every navigation resets speech
        store.js              one versioned localStorage key: settings, progress, quiz
        content.js            scenarios as tickets; derived glossary and quiz
        scoring.js            answer evaluation (pure)
        strings.js            all interface copy, DE + EN
        dom.js                h() element builder - no HTML string templates
      views/
        home.js session.js words.js quiz.js settings.js common.js
      core/                   platform layer, no UI
        speechController.js   policy: state machine, provenance, mic ownership
        sttAdapters.js        speech-to-text backends
        ttsAdapters.js        text-to-speech backends
        permissionGate.js     mic permission as a state, never a throw
        stateMachine.js       deterministic FSM with generation tokens
        audioEngine.js        the single AudioContext (UI chimes)
        nativeBridge.js       Capacitor plugin resolution
      ui/
        actionBar.js          session controls; the mic mirrors the state machine
        statusStrip.js        transient messages (mic state, permission, missing voice)
        sheet.js icons.js
      styles/
        tokens.css base.css shell.css views.css
      data/
        vocationalData.js

Views build DOM with `h()`, never by concatenating HTML. The v2 modules interpolated scenario text
into `innerHTML` templates and re-rendered and re-bound everything on each change.

---

## 3. Speech: one controller, pluggable engines

`speechController` owns **policy**; `sttAdapters` / `ttsAdapters` own **engines**. Nothing outside
`src/core/` touches `speechSynthesis`, `SpeechRecognition`, `AudioContext` or `getUserMedia`.

### Engines are chosen at runtime

| | On the Android device (APK) | In Chrome / the PWA |
|---|---|---|
| speech-to-text | `@capacitor-community/speech-recognition` 7.0.1 | Web Speech `SpeechRecognition` |
| text-to-speech | `@capacitor-community/text-to-speech` 8.0.2 (native Android engine) | Web Speech `speechSynthesis` |
| neither available | typed answers; mic hidden | same |

Why native on the device: Android System WebView has **no** `webkitSpeechRecognition`, and its
`speechSynthesis` is unreliable (empty voice lists, silent or cut-off speech, missing German voices).
Plugins are resolved through `registerPlugin()` + `isPluginAvailable()` (`nativeBridge.js`) —
`window.Capacitor.Plugins.X` is only populated by `registerPlugin()`, never by the bridge itself.

### Native STT runs in non-partial mode — on purpose

Verified against `SpeechRecognition.java`: in partial mode `start()` resolves **immediately**, the
final text arrives later as an event, "stopped" is reported *before* that final text, errors reject
an already-resolved call and vanish, and `stop()` never resolves. The first version treated the early
resolve as "finished" and ended every session ~50 ms after it began. In non-partial mode `start()`
resolves with the result or **rejects with the error** — reliable, at the cost of no live interim
text on the phone. "No match" / "No speech input" end quietly; real errors are reported. A 45 s cap
covers recognizers that never answer.

### Native TTS

`speak()` resolves when the utterance finishes and rejects with *"This language is not supported"*
when the phone has no German voice data. The status strip then offers **Installieren**, which opens
the Android voice-data installer. `stop()` never settles the interrupted call, so the adapter ignores
late results by session token.

### The state machine

    IDLE ──listen()──▶ LISTENING ──transcript──▶ PROCESSING ──finishProcessing()──▶ IDLE
      │                    │  stop / no speech / error ─────────────────────────────▶ IDLE
      └──speak()──▶ SPEAKING ──end / error / cancel──▶ IDLE

- **One mic owner.** Speech recognition is the only consumer of the microphone; the app records no
  audio of its own. Entering `LISTENING` always cancels speech output first.
- **Generation tokens.** Every transition bumps a counter; every async callback checks the value it
  started with and drops itself if stale. A late result from a cancelled session cannot change state.
- **Never stranded.** `stopListening()` goes straight to `IDLE` if the adapter has no live session,
  and a 4 s watchdog forces `IDLE` if a recognizer accepts `stop()` but never ends.

### No speech the learner didn't ask for

`speak()` refuses any call without provenance:

    speak({ text, intent: 'user' })           within 3 s of a real tap / key press
    speak({ text, intent: 'turn', turnId })   one-shot reply to a submitted turn

Refused calls return `false`, count in `stats.blockedSpeakCalls`, and log the call site. Entering a
session speaks nothing; the partner's next line is read only right after the learner taps
**Weiter** (switchable in settings). Every route change calls `speechController.reset()`.

### Permissions (`permissionGate.js`)

Returns a state (`granted` / `prompt` / `denied` / `busy` / `unavailable`), never throws. `denied` is
cached for 60 s only, so granting in Android settings recovers without a restart. On the device,
once the native plugin grants `RECORD_AUDIO`, the gate returns immediately — it no longer opens and
closes a WebView audio track right before the native recognizer takes the mic (that race caused
sporadic "Audio recording error").

Android side: `MainActivity` leaves Capacitor's `BridgeWebChromeClient` in charge of WebView
permission requests and registers `MicPermissionPlugin`, which reports whether permission is
granted, not yet asked, or permanently denied (only then is the settings screen the way forward).

---

## 4. Design

**Direction — a German hospital corridor.** Cool green-grey paper (`#EEF2EF`), ink `#16211D`, and
one action colour, surgical teal `#0A6F5C`, used only for the mic and primary buttons. Amber for
coaching, red for risky phrasing. Domain colours come from sample-tube caps: IT blue `#2E58C9`,
lab violet `#7B3DB5`.

**Type.** *Barlow Condensed* for titles and labels (the DIN-like voice of German hospital signage),
*Atkinson Hyperlegible* for reading (letter shapes built to stay distinct — useful for long German
compounds on a phone), *IBM Plex Mono* for ticket numbers. All bundled locally via `@fontsource`,
Latin subsets only, so the offline APK needs no network.

**Signature.** Scenarios are tickets with a coloured cap stripe and a mono ID; completing one lands
a rotated stamp. That is the one animated moment; everything else stays quiet.

**Layout rules.** The document never scrolls — `.view` is the only scroll container. The tab bar is
a normal flex item; in a session the fixed action bar replaces it and `.app` pads its bottom by the
bar height, so the sticky draft field always sits directly above the bar. Tap targets ≥ 44–48 px,
text fields at 16 px (below that Android zooms on focus), safe-area insets respected,
`prefers-reduced-motion` honoured, `color-mix()` always preceded by a plain fallback for older
WebViews.
