# EchoSpeak — changes and status

Companion to `ARCHITECTURE.md`. The detailed v1 → v2 checklist that used to live here is in git
history (`git show 4a80ae8:MIGRATION.md`); most of it described modules that v3 removed.

---

## v3 — rebuilt around one job

Reported problems: the app did not work properly on the phone (voice problems), looked bad, was too
complicated, and the code was still messy. Two commits address them.

### 1. Device fixes — `fix(android): make mic and voice work on the device`

| Problem | Cause | Fix |
|---|---|---|
| Mic session ended immediately on the phone, nothing captured | Native STT adapter used partial mode, where the plugin resolves `start()` at once; the adapter took that as "finished" | Non-partial mode: `start()` resolves with the result or rejects with the error |
| No voice / wrong voice / cut-off speech | Android WebView `speechSynthesis` is unreliable | Native Android TTS via `@capacitor-community/text-to-speech` 8.0.2, behind a TTS adapter layer |
| Silent failure when German voice data is missing | Engine refuses the language; nothing told the learner | Status strip names the problem and offers the OS voice-data installer |
| Sporadic "Audio recording error" | Permission check opened and closed a WebView mic track just before the native recognizer | Return as soon as the native plugin grants |

### 2. Rebuild — `refactor: rebuild the app around the vocational trainer`

**Scope.** Kept: *Gesprächssimulation*, *Fachbegriffe & Glossar*, *Situations-Quiz* (the learner's
choice). Removed: Read Aloud, Shadowing, Dictation, Phonetics, generic Roleplay, Vault,
Text-Politur, plus their data (`lessonsData*.js`, `i18n.js`) and services (`speechService`,
`storageService`, `diffEngine`, `pwaInstaller`, `playback`). With Shadowing gone nothing records
audio, so the MediaRecorder path, waveform analysers and the `RECORDING` state were removed from the
core too.

**Code.** The 1,320-line template-literal module with inline styles became small views
(`home`, `session`, `words`, `quiz`, `settings`) that build DOM with `h()`; a hash router that resets
speech on every navigation (and makes Android's back button work); one versioned storage key
(carrying over the v1 language choice); all copy in `strings.js`; scoring as a pure, tested module.
`legacy-modules.css` and `components.css` are gone; four stylesheets derive from one token file.

**Design.** See ARCHITECTURE.md § 4. Light "hospital corridor" palette with one action colour,
signage-style condensed titles, a hyper-legible reading face, scenarios as tickets with a completion
stamp. No emoji avatars, no glass gradients.

**Content.** Glossary and quiz are now derived from the scenarios: 18 terms and 15 questions per
domain instead of 4 and 2.

**Size.** JS bundle 340 KB → 170 KB; CSS 37 KB → 23 KB; ~200 KB of fonts bundled for offline use.

---

## Verification

### Automated / scripted

| Check | Result |
|---|---|
| Native STT adapter against a mock modelled on `SpeechRecognition.java` | session stays alive until the result; transcript delivered once; "No match"/"No speech input" non-fatal; audio error reported; `abort()` ignores late results; refused permission reported |
| Native TTS adapter against a mock modelled on `TextToSpeechPlugin.java` | start/end once; `de-DE` + flush strategy; missing German voice → `lang-unsupported`; installer opens; cancel suppresses callbacks |
| Scoring against all authored phrasings | 56/56 professional → *Professionell*; 112/112 mistakes → *Vorsicht* |
| Scoring on realistic input | paraphrase → *Professionell*; blaming paraphrase → *Vorsicht*; unrelated → *Eigene Formulierung*; raw lowercase STT without umlauts → *Professionell* |
| TTS chunker edge cases | 7/7 lossless, offsets correct, no chunk over 200 chars |

### In the browser at 375 × 812

| Check | Result |
|---|---|
| Full session: answer → coaching → Weiter → risky answer → Nochmal → finish | works; nothing spoken on entry; next line spoken only after tapping Weiter; ticket stamped and progress saved |
| Mic flow with a scripted recognizer | LISTENING → PROCESSING → IDLE; interim and final text reach the draft; tapping the mic again stops |
| Mic permission denied | clear, actionable message; denial cached 60 s then re-checked |
| Speech without a gesture across 11 route changes and two language switches | **0** utterances, **0** errors |
| Android back button (history.back) from a session | returns to the list |
| Horizontal overflow on every screen | none |
| Fonts | all five faces load from the bundle |

### Not verified — be explicit

1. **No physical device yet.** The native adapters were tested against mocks built from the
   plugins' Java, and the APK builds, but neither plugin has run on a phone. `adb devices` was empty
   at every check.
2. **Real microphone.** The browser pane blocks capture, so recognition was exercised with a
   scripted recognizer, not a voice.
3. **Service worker.** Registration is blocked in the test browser; `sw.js` is served correctly.

## Remaining work

1. **Install on a phone and listen.** With USB debugging on:
   `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`, then check `chrome://inspect`
   for the WebView console. Watch for: German voice present (if not, the app offers the installer),
   recognition returning text, and no "Audio recording error".
2. **Arabic font.** Arabic uses the device's system face (Noto Naskh on most Android phones). If a
   device renders it poorly, bundle `@fontsource/noto-naskh-arabic`.
3. **Content depth.** `it_ad_lockout` and `lab_critical_val` have 2 steps; the rest have 3.
