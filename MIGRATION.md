# EchoSpeak v1 → v2 — migration & clean-up checklist

Companion to `ARCHITECTURE.md`. Everything marked **[done]** is already applied in this working
tree. Everything marked **[todo]** is the remaining work, in the order it should be done.

---

## 1. Files deleted

| File | Why | Status |
|---|---|---|
| `src/services/speechService.js` | Replaced by `src/core/speechController.js`. Its flag-based lifecycle (`isListening`, nulling `recognition` before `onend`) was the source of the stop/abort races. | **[done]** — `git rm` |
| `src/services/audioRecorder.js` | Split: chimes + analysers → `core/audioEngine.js` (one AudioContext instead of two), recording → `speechController.startRecording()` so it can be arbitrated against STT, `playAudio()` → `ui/playback.js`. | **[done]** — `git rm` |
| `src/styles/main.css` | 1764 lines mixing tokens, shell and module styles with ~370 lines of `!important` media queries. Split into four files; see below. | **[done]** |

## 2. Files added

    src/core/stateMachine.js       deterministic FSM + generation tokens
    src/core/audioEngine.js        THE single AudioContext
    src/core/permissionGate.js     mic permission as a state, never a throw
    src/core/sttAdapters.js        SttAdapter interface + 3 backends
    src/core/speechController.js   single source of truth for mic and voice
    src/ui/actionBar.js            the one bottom bar; FAB bound to the FSM
    src/ui/statusStrip.js          non-latching state / permission messaging
    src/ui/icons.js                inline SVG set
    src/ui/playback.js             HTMLAudioElement playback of recorded blobs
    src/styles/tokens.css          design tokens + safe-area vars
    src/styles/shell.css           header, nav rail, viewport, action bar, FAB
    src/styles/components.css      buttons, forms, cards, chat, feedback
    src/styles/legacy-modules.css  trimmed remainder of main.css
    android/.../MicPermissionPlugin.java   permission STATE oracle for the web layer

## 3. CSS split — what went where

| Old `main.css` lines | Destination |
|---|---|
| 1–67 (tokens, body) | `tokens.css`, `shell.css` |
| 68–77 (`.glass-panel`) | kept in `legacy-modules.css` as a compat shim — still referenced by module markup |
| 78–312 (app container, top header, lang switcher, stat chips, voice select, nav tabs, module viewport) | `shell.css`, rewritten mobile-first |
| 313–1396 (module-internal styles) | `legacy-modules.css`, plus a mobile-reconciliation block at the end |
| 1397–1764 (four stacked mobile media queries) | **deleted.** ~370 lines of `!important` that existed only to referee two competing fixed bottom bars. The v2 shell is mobile-first, so there is nothing left to override. |

`legacy-modules.css` is 1117 lines and shrinks as each module moves onto `components.css`.

---

## 4. Call-site migration — mechanical mapping

Applied across all seven modules. Use this table if you have local branches to rebase.

| v1 | v2 |
|---|---|
| `speechService.speak({text, rate})` | `speechController.speak({text, rate, intent: SpeakIntent.USER})` |
| `speechService.startListening({...})` | `await speechController.listen({...})` — now returns `{ok, reason, permission}` |
| `speechService.stopListening()` | `speechController.stopListening()` (graceful) |
| `speechService.abortListening()` | `speechController.abortListening()` (discards transcript) |
| `speechService.stopSpeaking()` | `speechController.stopSpeaking()` |
| `speechService.isSpeechRecognitionSupported()` | `speechController.sttSupported` |
| `speechService.getDefaultRecognitionLang()` | `speechController.recognitionLang()` |
| `audioRecorder.playChime('incorrect')` | `audioEngine.playChime('error')` |
| `audioRecorder.playChime('chime')` | `audioEngine.playChime('success')` |
| `audioRecorder.startRecording(canvas)` | `await speechController.startRecording({canvas})` |
| `audioRecorder.stopRecording()` | `await speechController.stopRecording()` |
| `audioRecorder.playAudio(url)` | `playLocalAudio(url)` from `ui/playback.js` |
| `stopSpeaking(); stopListening(); stopRecording();` | `speechController.reset(reason)` |

**`speak()` now requires provenance.** A call without `intent` returns `false`, logs a stack trace
to its own call site, and increments `speechController.stats.blockedSpeakCalls`. This is
deliberate: it is what makes rogue auto-TTS impossible to reintroduce.

---

## 5. Semantic fixes (not mechanical)

### 5.1 Rogue TTS — **[done]**

| Site | v1 behaviour | Fix |
|---|---|---|
| `vocationalModule.js:92` | `setTimeout(speak, 350)` inside `initRoleplay()`, which runs on render, on domain change and on language switch | removed; opening line has a replay button |
| `roleplayModule.js:62` | same, inside `initScenario()` | removed |
| `vocationalModule.js:968` | nested `setTimeout(speak, 300)` inside `setTimeout(…, 700)` after a reply | `intent: TURN` with a one-shot `turnId`; inner timeout deleted (the controller already defers one macrotask after `cancel()`, which is the real Android quirk the delay was guessing at) |
| `roleplayModule.js:394` | same shape | `intent: TURN` with `turnId` |

Verified in-browser: 4 tab switches + 2 language switches + 3 forged `speak()` calls produced
**zero** utterances; all three forgeries were rejected.

### 5.2 Dual-microphone collision — **[done]**

`shadowingModule.js` started `MediaRecorder` and `SpeechRecognition` against the same device and
papered over the Android collision with a user-agent sniff (`_isMobileSession`), which still broke
on Android tablets reporting a desktop UA.

**Product decision:** scoring is the point of the exercise, so the mic goes to recognition.
The A/B playback recording is now a **separate, explicitly user-initiated pass**
(`toggleRecordPlayback()`, its own `⏺ Record` button) that runs without recognition. UA sniffing is
gone. Verified: `startRecording()` while `LISTENING` returns `{ok:false, reason:'mic-busy-listening'}`.

### 5.3 Single AudioContext — **[done]**
Two contexts merged into `audioEngine`, created lazily on first user gesture, never `close()`d,
30s idle auto-suspend.

### 5.4 `onvoiceschanged` double assignment — **[done]**
Was set in both `speechService.js:63` and `main.js:266`; the second silently discarded the first.
`speechController` is now the single owner and everyone else uses `onVoicesChanged(fn)`.

### 5.5 Scroll container — **[done]**
`.app-shell` used `min-height`, which let the column grow past the screen so the **document**
scrolled instead of `.app-viewport`. The reserved bottom padding scrolled away with the content and
the last rows sat under the action bar. Fixed with `height: 100dvh` + `overflow: hidden` on
`html, body` + `min-height: 0` on the flex child. Verified: content bottom 705px vs bar top 740px.

### 5.6 Legacy grid overflow — **[done]**
Grid/flex children default to `min-width: auto` and refuse to shrink below min-content, so one long
German compound (*Qualitätskontrolle*, *Patientengefährdung*) pushed cards ~40px past a 375px
viewport where `overflow-x: hidden` silently clipped them. Fixed with `min-width: 0` +
`overflow-wrap: anywhere`. Verified: **0 overflowing elements across all seven modules** at 375px.

### 5.7 `PROCESSING` never exited — **[done]**
`listen()` moves the FSM to `PROCESSING` on a final transcript and leaves the exit to the module.
`readAloudModule`, `dictationModule` and `phoneticsModule` never called `finishProcessing()`, so
after *any* successful recognition the machine parked in `PROCESSING` and the status strip showed a
sticky "Antwort wird geprüft…" until the user navigated away. Read Aloud is the core exercise, so
this was the most damaging of the late finds. Four `onResult` handlers patched.

### 5.8 Fresh install defaulted to English — **[done]**
`storageService` defaulted `language: 'en'` in two places, so a clean device booted into English
even though the vocational tracks are built around formal German *Siezen*. Both defaults and
`<html lang>` now say `de`. (This was invisible during testing because the browser had `'en'`
persisted from v1 — it only reproduces after `localStorage.clear()`.)

### 5.9 Native plugin probes were dead code — **[done]**
`permissionGate` and `createSttAdapter` both read `window.Capacitor.Plugins.X`. Since Capacitor 3
that object is populated **only** by `registerPlugin()` — verified: `Plugins[pluginName] = proxy`
appears exactly once in `@capacitor/core/dist/index.js`, inside `registerPlugin`. The native
bridge never writes to it. Both probes therefore always resolved `undefined`, `MicPermissionPlugin`
was unreachable, and a future speech plugin would never have been selected — silently, because
both paths fall back. New `src/core/nativeBridge.js` resolves plugins via
`isPluginAvailable()` + `registerPlugin()`. Verified on web: `isNative === false`,
`_nativePlugin === null`, Web Speech still selected.

### 5.10 Service worker registration was lost — **[done]**
v1 registered `sw.js` from `pwaInstaller.js`, which v2 no longer imports. Without this, existing
PWA installs keep the v1 worker and its cache and never see this build. Registration moved into
`main.js` (guarded to http/https so the Capacitor `file://` shell skips it) and `CACHE_NAME` bumped
`v3 → v4` so the `activate` handler purges stale caches.

### 5.11 Desktop action bar would have been below the fold — **[done]**
`.action-bar` is a `body` child *outside* `.app-shell`, and 5.5 made `body` `overflow: hidden`.
The ≥900px rule switched it to `position: sticky`, which then had no scroll context. It now stays
`fixed` at every width and desktop only centres and rounds it. Verified at 1280×768:
top 680, bottom 752, in viewport.

### 5.12 All seven modules now publish to the shared action bar — **[done]**

Every module implements `publishActions()`; none renders its own fixed bottom bar any more.
`legacy-modules.css` hides `.control-bar.mobile-app-bar` and `.mic-action-btn.mobile-fab-mic`
rather than deleting them from the markup, because the modules' own methods still read those
elements to update label text and recording classes — hidden elements are still returned by
`querySelector`, so nothing needed null-guarding.

| Module | FAB | Bar buttons |
|---|---|---|
| Vocational (roleplay mode) | `startDictation` | Hören · Tipp · Senden · Neu |
| Vocational (other modes) | *hidden* | Neu |
| Roleplay | `startDictation` | Hören · Tipp · Senden · Neu |
| Read Aloud | `toggleSpeaking` | Hören · Neu · Import |
| Shadowing | `toggleRecordShadow` | Nativ · Langsam · Aufnahme |
| Dictation | `toggleSpeakVerification` | Zurück · Prüfen · Lösung · Weiter |
| Phonetics (minimal pairs) | *hidden* | Kontrast · Zungen |
| Phonetics (twisters) | `toggleTwisterRecord` | Demo · Nächster · Paare |
| Vault | *hidden* | Neu · Suchen |

Design decisions worth knowing:

- **The FAB is hidden, not disabled, where there is nothing to say.** The vault is a reference
  view; minimal pairs always start a test from a specific word-pair card, so a bare FAB would not
  know which pair to test.
- **Navigation stays out of the thumb bar where a better control already exists.** Shadowing keeps
  its stepper dots; dictation has no stepper, so Zurück/Weiter take two bar slots and their
  disabled states are recomputed on every move.
- **Single navigation paths.** `goToSentence()`, `setTab()`, `cycleCategory()`, `cycleTwister()`
  and `toggleQuickAdd()` were extracted so the inline control and the bar control run the same
  code. Each calls `speechController.reset()` first, so changing lesson/sentence/tab is a proper
  audio boundary.
- **Two `alert()` calls removed** (readAloud mic permission, vault empty-word). Both now use the
  non-blocking status strip; the permission one offers the Android settings route.

### 5.13 FAB stop delegates to the module — **[done]**
`actionBar._onFabClick()` called `speechController.stopListening()` directly in the `LISTENING`
state, bypassing the module. Several modules do real work on stop — flush the interim transcript,
score it, reset view state — so that work was being skipped. The FAB now calls `mic.onStop()` when
the module supplied one, falling back to a plain stop otherwise.

### 5.14 `stopListening()` could strand the machine in `LISTENING` — **[done]**
Found while testing 5.13. If the adapter had no live session, `stop()` was a silent no-op and
nothing ever moved the FSM out of `LISTENING` — the FAB stayed on "stop" and the UI claimed the mic
was open forever. Two guards added:

1. Adapters expose `get active()`; `stopListening()` transitions straight to `IDLE` when there is
   no live session.
2. A 4s watchdog: if the recognizer accepts `stop()` but never fires `onend` — a documented Android
   WebView failure — it is aborted and the machine forced to `IDLE`. The delay is deliberately
   generous, because a recognizer flushing buffered audio legitimately takes a second or two and
   cutting it short would discard a valid transcript.

### 5.15 `.section-actions` / card-header overflow — **[done]**
A `<select>` takes its intrinsic width from its *longest* option, so a lesson titled
"A1 - Das morgendliche Kaffeeritual" pushed the non-wrapping `.section-actions` row ~85px past a
375px viewport and `overflow-x: hidden` clipped the import button off-screen. Same class of bug in
the inline-styled flex row inside `.card-header-bar` (vocational's "Neustart"). Both now wrap.

### 5.16 Career Pro Studio could never advance a scenario — **[done]**

`vocationalModule.processUserReply()` called `storageService.incrementWordCount()`, which **has
never existed** on `storageService` — the method was wrong from the feature's original commit
(`5103bc1`). Every single user reply in the Career Pro Studio threw a `TypeError`, so the default
tab's roleplay could not advance past step one. Surfaced by walking the new scenarios end to end.
Replaced with `recordActivity({ words, minutes })`, the API the other six modules already use,
which also updates the practice streak.

### 5.17 Coaching card squeezed to 129px — **[done]**

A feedback card lives inside a chat bubble capped at `max-width: 85%`. After the avatar, gap and
padding, that left ~129px of content on a 375px screen for a correction, a multi-term vocabulary
entry, IPA, a follow-up step and an Arabic note — and the inherited `overflow-wrap: anywhere`
then broke German compounds mid-word (*Patientengefähr / ung*), which is unusable for a
pronunciation aid. Three fixes:

- bubbles carrying feedback get a `has-feedback` modifier and take the full conversation width
  below 768px (295px instead of 251px, with a smaller avatar);
- `.voc-vocab-code` and sibling term elements opt back out to `overflow-wrap: break-word`, so
  terms break at separators, never mid-word;
- module buttons may wrap their label at phone width — a nowrap button carrying a full scenario
  title ("Active-Directory-Konto gesperrt (Deeskalation)") was wider than its own row and no
  amount of `flex-wrap` on the parent could fix it, because the button itself could not shrink.

---

## 6. Android — **[done]**

1. **`MainActivity.java` rewritten.** The old `pendingPermissionRequest` field was dead code: it was
   declared and null-checked but never assigned, because nothing installed a `WebChromeClient` that
   could populate it. Capacitor's `BridgeWebChromeClient` already handles `AUDIO_CAPTURE`
   (`BridgeWebChromeClient.java:102-124`).
   **Do not add a `WebChromeClient` here** — it would replace Capacitor's and break the file
   chooser, geolocation and JS dialogs.
2. **`MicPermissionPlugin.java` added.** Exposes permission *state*, so the UI can tell
   "not asked yet" from "denied once" from "denied permanently, prompt suppressed". Conflating the
   last two is what latched the v1 red error state.
3. **`onPause` releases the mic** via `window.echoSpeech.reset()`. Android does not stop
   MediaStream tracks for a backgrounded WebView.

### Speech recognition in the APK — **[done]**

`@capacitor-community/speech-recognition@7.0.1` is installed and synced.
`capacitor.plugins.json` now lists
`com.getcapacitor.community.speechrecognition.SpeechRecognition`, and Gradle wiring
(`capacitor.settings.gradle`, `capacitor.build.gradle`) was generated by the sync. No application
code changed: `createSttAdapter()` resolves the plugin at runtime, which is what the adapter layer
was built for.

**Correction to an earlier note in this file:** it previously said you must add a `<queries>`
block for `android.speech.RecognitionService` to `AndroidManifest.xml`. That is **not** required —
the plugin ships its own `android/src/main/AndroidManifest.xml` containing exactly that block, and
AGP merges it into the app. Adding it by hand would be redundant.

Verified against the installed plugin rather than assumed: registered name, `available()`,
`start()` options, `PermissionStatus.speechRecognition`, and both event payloads
(`partialResults`, `listeningState`) all match what `CapacitorSpeechAdapter` expects. See
ARCHITECTURE.md section 0 for the table.

**Still unbuilt:** the APK has never been compiled — this machine has no JDK and no Android SDK
(`gradlew` fails at `JAVA_HOME is not set`). Building needs **JDK 21** (both Capacitor 8 and the
plugin declare `JavaVersion.VERSION_21`) and **Android SDK platform 36**:

    cd android && ./gradlew assembleDebug
    # -> android/app/build/outputs/apk/debug/app-debug.apk

---

## 7. Remaining work — **[todo]**

In priority order.

1. ~~Publish action-bar controls from the other five modules.~~ **Done — see 5.12.**

2. ~~Handle the `listen()` result in the remaining modules.~~ **Done.** Every module that opens the
   microphone now routes permission failures to `statusStrip.showPermission(...)` with a retry.
   Vault is the only module with no such call, because it never opens the mic.

3. **`src/services/pwaInstaller.js` is orphaned.** It drives DOM that v2 removed
   (`headerInstallBtn`, `mobileAppModal`) — a QR-code / localtunnel panel with a **a hardcoded
   personal IP address** and a `loca.lt` tunnel URL baked into `index.html`. That was
   dev scaffolding and does not belong in a production build. Either delete the file, or keep just
   the `beforeinstallprompt` handling and wire it to a button in the settings sheet. Nothing imports
   it today, so it is tree-shaken out either way.

4. **Retire `legacy-modules.css` module by module.** Rule for anything added to it: no
   `!important`, no `position: fixed`, no viewport-level layout. Ten `!important` declarations
   survive (`user-select: text` overrides, `.btn-danger`, `.active-toggle`) and `.modal-overlay` is
   now dead — `index.html` uses `.modal` / `.modal-panel`.

   **Cascade caveat:** `legacy-modules.css` loads *after* `components.css` and still defines
   `.btn`, `.btn-*` and `.form-input`. At equal specificity the later sheet wins, so the legacy
   button and input sizing currently overrides the new 48px tap targets and 16px font floor for
   module-rendered controls. The shell's own controls (`.bar-btn`, `.fab-mic`, `.nav-chip`,
   `.icon-btn`) are unaffected — they exist only in `shell.css`. Retiring a module's styles is what
   activates the new sizing for it; until then the `min-height` rules added to `.control-bar .btn`
   in the reconciliation block cover the important cases.

5. **Domain content.** Both domains are now complete against the brief. Six scenarios were added
   in **both German and English** (12 total). Domain A, appended to
   `VOCATIONAL_SCENARIOS[lang].it_support`:

   | id | Scenario | Level | Steps |
   |---|---|---|---|
   | `it_epic_chart_de` / `_en` | EPIC: patient chart locked after a ward transfer (ICU), ending on the downtime procedure | B2 | 3 |
   | `it_citrix_session_de` / `_en` | Citrix: published app will not launch — a ghost session from the previous day | B2 | 3 |
   | `it_patient_risk_de` / `_en` | **Patientengefährdung**: medication module down in theatre, P1 escalation | C1 | 3 |

   Each step carries `suggestedResponses` with one best answer and two realistic wrong ones — the
   distractors are the teaching content: deflecting to a ticket during an ICU handover, granting
   blanket access "to fix it faster", rebooting a shared Citrix server, and closing a
   patient-safety incident with "I'll note it in the ticket". Feedback includes the correction,
   a German/English term with IPA, the next concrete action, and Arabic coaching notes.

   Domain B, appended to `VOCATIONAL_SCENARIOS[lang].lab_medical`:

   | id | Scenario | Level | Steps |
   |---|---|---|---|
   | `lab_centrifuge_de` / `_en` | **Zentrifuge**: imbalance plus citrate tubes spun on the serum programme, ending in a fresh draw and an equipment-record entry | B2 | 3 |
   | `lab_hygiene_de` / `_en` | **Hygiene**: PPE breach by a non-technical visitor plus an infectious spill, covering surface disinfection and hand hygiene | B2 | 3 |
   | `lab_calibration_de` / `_en` | **Kalibrierung**: calibration curve fails after a reagent lot change; structured call to the manufacturer's hotline | C1 | 3 |

   The three lab scenarios deliberately use three *different* interlocutor types, because the
   register required is what is being practised:

   - **Coaching downward** (trainee): correct a safety error without humiliating the person —
     the wrong answers are both "it's not a big deal" and "you should have been paying attention".
   - **Enforcing a rule sideways** (non-technical visitor): be firm about containment level 2
     without being rude; the failure mode is snapping "did you not read the sign?".
   - **Reporting outward** (external service engineer): the learner is the *caller* for the first
     time and must lead with parameter, error code, trigger and current state, then close on a
     ticket number and a time window.

   `lab_qc_outlier_en` (Westgard rule violation) was added last to close the final parity gap —
   a faithful mirror of the German original rather than an expanded rewrite, so switching language
   mid-scenario lands on the equivalent exercise. It is inserted at index 1 to match the German
   ordering.

   **Content is now complete against the brief.** Both domains carry 5 scenarios in each language,
   at matching indices with matching step counts:

   | index | it_support | lab_medical | steps |
   |---|---|---|---|
   | 0 | AD lockout | critical potassium value | 2 |
   | 1 | remote support / VPN | QC Westgard outlier | 3 |
   | 2 | EPIC chart access | centrifuge imbalance | 3 |
   | 3 | Citrix ghost session | hygiene / PPE breach | 3 |
   | 4 | Patientengefährdung (C1) | calibration failure (C1) | 3 |

   `it_remote_network` and `lab_qc_outlier` were each extended from 1 step to 3, in both
   languages simultaneously so the parity above holds. The added steps were chosen to teach
   something the other scenarios do not:

   - **`it_remote_network` step 2** — the user says outright that he does not understand
     networking. The trap answer is technically correct jargon ("verifying the interface metrics
     in the split-tunnelling profile"); the good answer explains the routing table in plain
     language *and ties it back to the symptom the user described himself* (public web works,
     internal servers time out). Dumping jargon is scored as a communication failure, not
     competence.
   - **`it_remote_network` step 3** — the user mentions a colleague had the same fault this
     morning. The trap is closing the ticket because *this* user now works. The good answer
     recognises an ITIL **Problem** rather than two Incidents and raises a problem record.
   - **`lab_qc_outlier` step 2** — root-cause narrowing. The trap is "I measured it again and the
     second value was better", i.e. testing into compliance, which is a serious QC violation.
   - **`lab_qc_outlier` step 3** — the consequence that makes QC matter: **every patient result
     since the last valid control must be reviewed retrospectively**, held back, re-measured, and
     any report already sent actively reissued as a corrected report. The trap — "the deviation
     was only in the control, not in the patient samples" — is the exact conceptual error the
     step exists to correct. This is deliberately distinct from `lab_calibration`, which covers
     instrument troubleshooting rather than result release.

   Four scenarios remain at 2 steps (`it_ad_lockout`, `lab_critical_val`, both languages). They
   are complete exchanges rather than truncated ones, so they were left alone.

6. **Delete `.claude/launch.json`** if you do not want the dev-server config committed.

7. **`docs/` has been regenerated** by `vite build` — the `pwaFixPlugin` mirrors `dist/` into
   `docs/` on every build. The old hashed bundles are deleted and new ones added, so committing
   this work changes the GitHub Pages output as well as the source.

---

## 8. Verification performed

Run in Chrome at a 375×812 mobile viewport against the dev server.

| Check | Result |
|---|---|
| 4 tab switches + 2 language switches | **0 utterances spoken** |
| `speak()` with no `intent` | rejected |
| `speak()` with forged `turnId` | rejected |
| `speak()` `intent:'user'` outside gesture window | rejected |
| `speak()` `intent:'user'` inside gesture window | **accepted and spoken** |
| `turnId` reuse | accepted once, rejected on reuse |
| `reset()` voids an open turn | rejected after reset |
| `startRecording()` while `LISTENING` | rejected, `mic-busy-listening` |
| `speak()` while mic held | rejected |
| 227-char utterance | split into 2 chunks (178 + 49), **byte-for-byte lossless** |
| boundary `charIndex` after chunking | absolute (max 218 > 200) and monotonic — karaoke highlight intact |
| state after playback | returns to `IDLE`, `onEnd` fires |
| document horizontal scroll | none |
| content hidden behind action bar | none (705px vs 740px) |
| elements overflowing viewport, all 7 modules | **0** |
| console errors across all 7 modules | none |
| `background-attachment` | `scroll` (no fixed repaint) |
| `backdrop-filter` on scroll container | absent (bars only) |

Chunker edge cases additionally unit-tested in Node: short text, long German paragraph, no
punctuation, a 650-char unbreakable token, whitespace runs, exactly 200/201 chars, and Unicode —
all lossless, correct offsets, no chunk over the limit.

Re-verified after the scenario additions (5.16–5.17), at 375×812:

| Check | Result |
|---|---|
| schema validation, all languages and domains | all required fields present; IDs unique |
| scenarios played to completion, every language × domain | **20/20**, every step played (n/expected matched) |
| DE/EN parity: same scenarios at same indices, same step counts | yes — 2,3,3,3,3 in all four tracks; 56 steps total |
| literal backslashes / mojibake in any scenario string | none (checked every string recursively) |
| coaching card renders correction + vocab + IPA + Arabic | yes, verified on Prio-1 and Zentrifuge |
| vocabulary terms break at separators, not mid-word | yes (`overflow-wrap: break-word`) |
| overflowing elements, 7 modules + feedback card open | **0** |
| rogue TTS across both languages × both domains × all scenarios | **0 utterances** |
| runtime errors during the same run | **0** |

Re-verified after the action-bar migration (5.12–5.15), at 375×812:

| Check | Result |
|---|---|
| all 7 modules publish bar actions | yes; correct button set per module and per mode |
| duplicate inline mic / control bars still visible | **0** across all 7 |
| FAB hidden where no mic applies (vault, minimal pairs) | yes |
| vocational mode switch re-publishes the bar | roleplay → 4 buttons + FAB; vocab → 1 button, no FAB |
| dictation Zurück/Weiter disabled states | correct at first and last sentence |
| FAB stop delegates to the module | module flag cleared, state → `IDLE` |
| stale `LISTENING` with no live adapter session | recovers to `IDLE` instead of stranding |
| elements overflowing viewport, all 7 modules | **0** |
| rogue TTS after 7-module tour + 2 language switches | **0 utterances** |
| errors during full exercise (all modules, both languages, tab/mode switches, quick-add, dictation nav) | **0** |

Earlier verification, on a cleared `localStorage`:

| Check | Result |
|---|---|
| fresh-install language | `de` (app + `<html lang>`) |
| `PROCESSING` exits via `finishProcessing()` | `PROCESSING -> IDLE` |
| `permissionGate.isNative` on web | `false` |
| native plugin resolution on web | `null` (no crash from the `@capacitor/core` import) |
| STT backend still selected on desktop Chrome | `webspeech` |
| desktop 1280×768 action bar | `fixed`, 640px, centred, top 680 / bottom 752, in viewport |

**Not verified — be explicit about these:**

1. **No physical Android device or APK run.** The Android-specific claims (WebView lacking
   `webkitSpeechRecognition`, `cancel()`-then-`speak()` swallowing, the ~15s utterance pause,
   `onPause` mic retention) are handled defensively but were exercised in desktop Chrome.
2. **The Java was not compiled.** There is no JDK on this machine (`java` is not on `PATH` and no
   JDK was found), so `./gradlew compileDebugJavaWithJavac` could not run. The two files were
   reviewed against the Capacitor 8 plugin API by hand — `registerPlugin()` before
   `super.onCreate()`, `requestPermissionForAlias` + `@PermissionCallback`,
   `startActivityForResult` + `@ActivityCallback`, imports all used — but **run a Gradle compile
   before trusting them.**
3. **Service worker registration could not be confirmed.** `sw.js` serves correctly (HTTP 200,
   `text/javascript`) and the registration call fires, but it fails inside the embedded test
   browser with *"An unknown error occurred when fetching the script"* — that context blocks
   service workers. Verify in a normal Chrome tab.
4. **No real microphone session.** The test environment has no mic, so STT was verified by driving
   the state machine directly, not by speaking. Adapter callback wiring
   (`onInterim`/`onFinal`/`onEnd` ordering) is unexercised end-to-end.
5. **No automated test suite.** All of the above is manual. The chunker is the only unit-tested
   unit; `speechController`'s transition table is the obvious next candidate.
