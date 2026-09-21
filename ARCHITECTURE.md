# EchoSpeak — Architecture & Audio State Machine (v2)

Mobile-first rebuild targeting **Android WebView (Capacitor) first**, Chrome/Edge PWA second,
desktop last. This document is the contract; the code in `src/core/` implements it.

---

## 0. Two verified facts that shape this design

Both were verified against this repository, not assumed.

### Fact 1 — There is no SpeechRecognition in the Android APK

`android/app/src/main/assets/capacitor.plugins.json` is `[]`, and no speech plugin exists in
`node_modules`. The Capacitor shell runs in **Android System WebView**, which does **not**
implement `webkitSpeechRecognition` — that API is a Chrome-branded feature backed by Google's
servers, not part of the WebView platform surface.

**Consequence:** every STT call in the current APK silently fails. The v1 code treats
`webkitSpeechRecognition` as always-present, so the app shows its "please use Chrome" banner on
its own primary target.

**Design response:** STT goes behind an **adapter interface** (`src/core/sttAdapters.js`) with
runtime capability probing:

| Adapter | Selected when | Where it runs |
|---|---|---|
| `CapacitorSpeechAdapter` | `window.Capacitor.Plugins.SpeechRecognition` exists | APK, once the plugin is installed |
| `WebSpeechAdapter` | `window.(webkit)SpeechRecognition` exists | Chrome / Edge PWA |
| `NullSttAdapter` | neither | Android System WebView today, Firefox, older iOS |

`NullSttAdapter` is not an error state. It reports `supported === false`, the UI hides the mic FAB
and promotes the typed-response path, and **every exercise except live scoring still works**.
That is the difference between "degraded" and "broken".

To light up STT in the APK:

    npm i @capacitor-community/speech-recognition && npx cap sync android

No application code changes — the adapter is selected at runtime.

### Fact 2 — Capacitor already bridges the WebView mic permission

`node_modules/@capacitor/android/.../BridgeWebChromeClient.java:102-124` already overrides
`onPermissionRequest` and maps `android.webkit.resource.AUDIO_CAPTURE` to `RECORD_AUDIO` +
`MODIFY_AUDIO_SETTINGS` through the activity-result permission launcher.

**Consequence:** the `pendingPermissionRequest` field in the current `MainActivity.java` is
**dead code** — it is declared, null-checked, and never assigned, because nothing installs a
`WebChromeClient` that would populate it.

**Design response:** `MainActivity` must **not** install its own `WebChromeClient`. Doing so
replaces Capacitor's and silently kills the file chooser, geolocation and JS dialogs. The new
`MainActivity` instead:

1. Lets Capacitor own `onPermissionRequest`.
2. Registers a `@CapacitorPlugin` exposing permission **state** to JS (`check`, `request`,
   `openSettings`) so the web layer can render an accurate, non-blocking permission UI.
3. Releases the mic in `onPause` so it is never held while backgrounded.

---

## 1. Directory structure

    src/
      core/                     # NEW — platform layer, zero UI, zero app knowledge
        stateMachine.js         # generic deterministic FSM + generation tokens
        audioEngine.js          # THE single AudioContext (chimes + analysers)
        permissionGate.js       # mic permission, WebView-safe, never blocks UI
        sttAdapters.js          # SttAdapter interface + 3 implementations
        speechController.js     # single source of truth: STT + TTS + mic ownership
      modules/                  # feature views (unchanged responsibilities)
      data/                     # scenario / lesson / glossary content
      services/                 # storageService, diffEngine, pwaInstaller
      styles/
        tokens.css              # NEW — design tokens, safe-area vars
        shell.css               # NEW — header, nav rail, viewport, bottom bar, FAB
        components.css          # NEW — buttons, forms, chat, mic, cards
        legacy-modules.css      # main.css minus shell + minus !important patches

**Deleted concepts:** `services/speechService.js` (replaced by `core/speechController.js`) and the
STT/TTS half of `services/audioRecorder.js`. The recording half moves behind
`speechController.startRecording()` so it can be arbitrated against STT.

---

## 2. The state machine

One machine, one owner, one mic.

                        +--------------------------------------+
                        |                                      |
                        v                                      |
      +--------+  listen()   +-----------+  result/stop  +------------+
      |        |------------>| LISTENING |-------------->| PROCESSING |
      |        |             +-----------+               +------------+
      |        |                                               |
      |  IDLE  |  record()   +-----------+                     | speak({turnId})
      |        |------------>| RECORDING |---------------------+
      |        |             +-----------+                     v
      |        |                                         +----------+
      |        |<----------------------------------------| SPEAKING |
      +--------+          end / cancel / abort           +----------+
           ^                                                   |
           |            speak({intent:'user'})                 |
           +---------------------------------------------------+

### States

| State | Mic held by | TTS active | Meaning |
|---|---|---|---|
| `IDLE` | nobody | no | resting; all hardware released |
| `LISTENING` | `SpeechRecognition` | no | STT transcribing |
| `RECORDING` | `MediaRecorder` | no | capturing audio for playback |
| `PROCESSING` | nobody | no | scoring/diffing; hardware already released |
| `SPEAKING` | nobody | yes | TTS playing |

### The three invariants

**I1 — `LISTENING` and `RECORDING` are mutually exclusive states, not a convention.**
This is the dual-mic Android collision. v1's `shadowingModule.js:339-351` starts `MediaRecorder`
and `SpeechRecognition` against the same device; on Android one of them takes `NotReadableError`
or the recognizer aborts instantly. Because both are now *states* of one machine, the transition
table makes the collision **structurally unrepresentable** — `startRecording()` while `LISTENING`
is rejected by `canTransition()`. It cannot be reached by forgetting a convention.

**I2 — Entering `IDLE`, `LISTENING` or `RECORDING` unconditionally tears down TTS.**
`_hardStop()` runs `speechSynthesis.cancel()`, clears the utterance queue, kills the chunk timer,
and releases mic tracks. There is no path into a mic state with audio still playing.

**I3 — Every async callback is generation-checked.**
`_gen` increments on *every* transition. Each recognition handler, utterance handler and
`MediaRecorder` handler captures `gen` at creation and returns immediately if
`gen !== this._gen`. A late `onend` from a session the user already cancelled cannot mutate
current state.

This replaces v1's flag soup. `speechService.js:252` guards `stopListening()` on `this.isListening`,
which only flips true inside `onstart` — so stopping during the start handshake was a no-op that
leaked an orphan recognizer. `abortListening()` nulled `this.recognition` *before* `onend` fired,
so that handler ran against a dead reference. Generation tokens fix both without a single extra
boolean, and without the `pendingStopEval` flag and 350ms timeout from commits `d5d9051` /
`e0da9d8`.

---

## 3. Zero rogue TTS — mechanically enforced

The bug: `vocationalModule.js:92` and `roleplayModule.js:62` call
`setTimeout(() => speechService.speak(...), 350)` from `initRoleplay()` / `initScenario()`, which
run on **render** and on **language switch**. Open the tab, or flip EN/DE, and the device starts
talking with no user action. `vocationalModule.js:968` nests a second one.

The fix is not "delete those three calls" — it is making the class of bug unwriteable.
`speak()` **requires a provenance argument** and refuses anything else:

    speak({ text, intent: 'user' })            // inside a user-gesture window
    speak({ text, intent: 'turn', turnId })    // direct reply to a submitted turn
    speak({ text })                            // <-- REJECTED, returns false, warns

**`intent: 'user'`** — valid only while a gesture window is open. The controller installs a
capture-phase `pointerdown` / `keydown` / `touchend` listener that stamps `_lastGestureAt`. The
window is `USER_GESTURE_WINDOW_MS = 3000` — long enough to survive an `await` on permission or
storage, far too short to survive module construction, `DOMContentLoaded`, or a tab change.

**`intent: 'turn'`** — the roleplay case: the AI must answer *after* the learner speaks. The module
calls `openTurn()` when it accepts user input; that returns a one-shot `turnId`. `speak()` accepts
that id exactly once, then burns it. `_hardStop()` and any transition to `IDLE` void the open turn,
so a reply queued before the user left the screen cannot fire afterwards.

Rejected calls increment `speechController.stats.blockedSpeakCalls` and warn with a stack trace, so
a regression is visible in the console instead of audible to the user.

**Autoplay reality check:** this gate is also what makes TTS *work*. Android WebView blocks
`speechSynthesis.speak()` outside a user-activation context; v1's `setTimeout(..., 350)` broke the
activation chain, so those auto-speaks were both unwanted *and* unreliable.

---

## 4. TTS on Android: chunking, not resume-hacks

Two Android quirks are handled in the controller's utterance queue:

1. **Utterances over ~15s get silently paused.** The common workaround is a
   `setInterval(() => synth.resume(), 10000)` keepalive, which on Android WebView can restart the
   utterance from the beginning. Instead, text is **split at sentence boundaries into <=200-char
   chunks** and spoken as a sequential queue. Each chunk is short enough never to hit the pause
   watchdog, and cancellation granularity improves as a side effect.

2. **`cancel()` immediately followed by `speak()` swallows the new utterance.** Every `speak()`
   defers its first `synth.speak()` by one macrotask after `cancel()`, re-checking the generation
   token before it fires.

**Chunking must not break word highlighting.** `readAloudModule` drives its karaoke highlight off
`onboundary.charIndex`, which is chunk-relative. Each chunk carries its `offset` into the original
string and the controller emits `charIndex: chunk.offset + event.charIndex`, so consumers keep
receiving absolute indices into the text they passed in.

---

## 5. Single AudioContext

v1 creates **two**: `audioRecorder.audioContext` (visualizer, line 47) and `audioRecorder._chimeCtx`
(chimes, line 208). Mobile Chrome caps hardware contexts at ~6; every unreleased one is permanent,
so a handful of tab switches exhausts the budget and all audio dies silently.

`core/audioEngine.js` owns exactly one, lazily constructed **on the first user gesture** (a context
built before one is born `suspended` and often never resumes on Android). It exposes:

- `playChime(type)` — `success` | `tap` | `alert` | `error`
- `createAnalyser(stream)` -> `{ analyser, release() }` — callers never touch the context
- `unlock()` — idempotent, called from the global gesture listener
- 30s idle auto-suspend, transparent auto-resume

The context is never `close()`d: a closed context cannot be reopened and the browser's count
never drops.

---

## 6. Permission handling that cannot lock the UI red

`core/permissionGate.js` returns a **state**, never throws at the caller:

| Result | Cause | UI response |
|---|---|---|
| `granted` | mic available | proceed |
| `prompt` | not yet asked | "Tap to enable microphone" |
| `denied` | user said no / OS blocked | actionable hint + `openSettings()` on Android; **retryable** |
| `busy` | `NotReadableError` — another app holds the mic | "Close other apps, then retry" |
| `unavailable` | `NotFoundError` / no `getUserMedia` | hide mic UI, promote typed input |

`denied` is **cached for 60s only**, never permanently. v1's failure mode was latching a red error
state that survived the user granting permission in Android settings and returning to the app.
`navigator.permissions.query({name:'microphone'})` throws in Android WebView, so it is try/caught
and falls back to a `getUserMedia` probe whose tracks are stopped immediately.

---

## 7. Mobile UI shell

**One fixed bottom bar, not two.** v1 has seven wide nav tabs *and* a per-module
`.control-bar.mobile-app-bar`, both competing for the bottom of a phone screen, reconciled by ~370
lines of `!important` media queries (`main.css:1397-1764`).

    +-----------------------------+
    | header (sticky, 52px)       |  brand - lang - streak - voice
    +-----------------------------+
    | nav rail (scroll-x chips)   |  7 chips, snap, no wrap, not fixed
    +-----------------------------+
    |                             |
    | module viewport             |  the only scroll container
    | (scroll-y, overscroll       |
    |  contain, momentum)         |
    |                             |
    +-----------------------------+
    |  [ic]  [ic]  (FAB)  [ic]    |  <- the ONLY fixed element
    |      safe-area-inset        |
    +-----------------------------+

- **Bottom bar owns `position: fixed`.** Nav is a scrolling chip rail under the sticky header.
- **FAB** is 64px, centred, `IDLE`->mic / `LISTENING`->stop, with a pulse ring driven by the state
  machine rather than module-local booleans.
- **Secondary controls** are 48x48 tap targets with SVG icons and single-word labels, max 4.
- `viewport-fit=cover` + `padding-bottom: env(safe-area-inset-bottom, 16px)`.
- The viewport reserves `--bottom-bar-h` so content never hides behind the bar.

**Performance:** `background-attachment: fixed` was already removed (`main.css:61`); this build
keeps it out and additionally avoids `backdrop-filter` on the scroll container — the remaining
repaint cost on mid-range Android — confining it to the two non-scrolling bars.

**Input hardening:** commit `9db0ca5` already applied
`spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off"` to all nine
module-rendered fields; this rebuild verified that and adds the missing `enterkeyhint` so the
Android soft keyboard shows Send/Done rather than a newline key. Note these are **lowercase HTML
attributes** — the camelCase form (`spellCheck`, `autoCorrect`) is React's JSX convention and
would be inert in this template-literal codebase.

---

## 8. Dual-domain vocational engine

The content layer (`src/data/vocationalData.js`) already carries both domains x both languages with
Arabic coaching notes. The engine is **scripted branching, not an LLM** — there is no backend and
the app is offline-first. "Advances dynamically" means:

- each scenario is a `steps[]` chain; each step has `aiSpeech`, `suggestedResponses[]`,
  `bestResponseIdx` and structured `feedback`
- the learner may speak freely (STT), pick a suggestion, or type; the response is scored by
  `diffEngine` similarity against the suggestions
- the branch taken selects the next step and the escalation pressure

| | Domain A — Enterprise / Hospital IT | Domain B — Medical & Chemical Lab |
|---|---|---|
| Systems | EPIC, Citrix, Active Directory, clinical apps | LIS, centrifuges, analysers, reagents |
| Pressure | ticket escalation, emergency SLA, **Patientengefährdung** | critical values, calibration drift, hygiene |
| Register | formal **Sie**, de-escalation, phone troubleshooting | **Probenannahme**, pre-analytics, QC reporting |

Default register is formal German workplace **Sie**; English is the secondary track.

---

## 9. Module contract

Every module implements:

    class Module {
      constructor(container)  // render markup ONLY - no audio, no speak, no mic
      mount()                 // becomes visible; may bind, must not speak
      unmount()               // leaving; MUST release everything it owns
      setLanguage(lang)       // re-render; must not speak
    }

`main.js` calls `speechController.reset()` on every tab change and language switch — one call in
one place, replacing the three-line `stopSpeaking(); stopListening(); stopRecording();` incantation
repeated at six v1 call sites, each free to drift out of sync.

Modules never touch `speechSynthesis`, `SpeechRecognition`, `AudioContext`, `MediaRecorder` or
`getUserMedia` directly. `speechController` is the only door.
