// Text-to-speech adapters.
//
// WHY THIS FILE EXISTS
// Android System WebView's speechSynthesis is unreliable to useless: voice
// lists come back empty, utterances are silently paused after ~15s, a speak()
// issued right after cancel() is swallowed, and German voices are frequently
// missing. The web layer had accumulated three workarounds for this and the
// device still produced no voice / the wrong voice / cut-off speech.
//
// On the device we now use the native Android TextToSpeech engine through
// @capacitor-community/text-to-speech, selected at runtime exactly like the
// STT adapters. Chrome / the PWA keep the Web Speech implementation.
//
// ---------------------------------------------------------------------------
// TtsAdapter interface
//
//   get id(): string
//   get supported(): boolean
//   setLanguage(lang)                 'de' | 'en'
//   voices(): Array<{id, name, lang}> selectable voices (may be empty)
//   get selectedVoiceId(): string|null
//   selectVoice(id): boolean
//   onVoicesChanged(fn): unsubscribe
//   speak({ text, lang, rate, pitch, onStart, onBoundary, onEnd, onError })
//       Supersedes any utterance in progress. Exactly one of onEnd / onError
//       fires per call, and NOTHING fires after cancel().
//   cancel()
//   installVoiceData(): Promise<boolean>   native only; opens the OS installer
// ---------------------------------------------------------------------------

import { getNativePlugin } from './nativeBridge.js';

const BCP47 = { de: 'de-DE', en: 'en-US' };
const toBcp47 = (lang) => (lang && lang.includes('-') ? lang : (BCP47[lang] || BCP47.en));

// Android pauses Web Speech utterances longer than ~15s, so long text is
// spoken as a queue of sentence-sized chunks.
export const MAX_CHUNK_CHARS = 200;

/**
 * Split text into <= MAX_CHUNK_CHARS chunks at sentence boundaries. Each chunk
 * carries its absolute offset so boundary events stay meaningful. Pure and
 * index-based: spans are contiguous, so nothing is dropped and offsets are
 * correct by construction.
 */
export function chunkText(text) {
  if (text.length <= MAX_CHUNK_CHARS) return [{ text, offset: 0 }];

  const sentences = [];
  const re = /[^.!?…:;\n]+[.!?…:;\n]*\s*/g;
  let match;
  let consumed = 0;
  while ((match = re.exec(text)) !== null) {
    if (match[0].length === 0) { re.lastIndex += 1; continue; }
    sentences.push([match.index, match.index + match[0].length]);
    consumed = match.index + match[0].length;
  }
  if (consumed < text.length) sentences.push([consumed, text.length]);
  if (!sentences.length) sentences.push([0, text.length]);

  // Hard-split oversize spans, preferring a space strictly before the limit
  // (a space exactly on the limit would make the chunk one char too long).
  const spans = [];
  sentences.forEach(([start, end]) => {
    let from = start;
    while (end - from > MAX_CHUNK_CHARS) {
      const limit = from + MAX_CHUNK_CHARS;
      const space = text.lastIndexOf(' ', limit - 1);
      const cut = space > from ? space + 1 : limit;
      spans.push([from, cut]);
      from = cut;
    }
    if (end > from) spans.push([from, end]);
  });

  // Re-merge neighbours while they fit, so prosody survives.
  const chunks = [];
  let curStart = null;
  let curEnd = null;
  spans.forEach(([start, end]) => {
    if (curStart === null) { curStart = start; curEnd = end; return; }
    if (end - curStart <= MAX_CHUNK_CHARS) {
      curEnd = end;
    } else {
      chunks.push({ text: text.slice(curStart, curEnd), offset: curStart });
      curStart = start;
      curEnd = end;
    }
  });
  if (curStart !== null) chunks.push({ text: text.slice(curStart, curEnd), offset: curStart });

  // A whitespace-only utterance may never fire onend and would stall the queue.
  const speakable = chunks.filter((c) => c.text.trim().length > 0);
  return speakable.length ? speakable : [{ text, offset: 0 }];
}

class VoiceListeners {
  constructor() { this._fns = new Set(); }
  add(fn) { this._fns.add(fn); return () => this._fns.delete(fn); }
  emit() { this._fns.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }
}

// --- Null adapter ------------------------------------------------------------

class NullTtsAdapter {
  get id() { return 'none'; }
  get supported() { return false; }
  get selectedVoiceId() { return null; }
  setLanguage() {}
  voices() { return []; }
  selectVoice() { return false; }
  onVoicesChanged() { return () => {}; }
  speak({ onError } = {}) {
    if (onError) onError({ error: 'not-supported', message: 'Speech output is not available on this device.' });
  }
  cancel() {}
  async installVoiceData() { return false; }
}

// --- Web Speech (Chrome / Edge / Safari PWA) ----------------------------------

class WebSynthTtsAdapter {
  constructor(synth) {
    this._synth = synth;
    this._lang = 'de';
    this._all = [];
    this._selected = null;
    this._ready = false;
    this._session = 0;
    this._deferTimer = null;
    this._listeners = new VoiceListeners();
    this._loadVoices();
  }

  get id() { return 'webspeech'; }
  get supported() { return true; }
  get selectedVoiceId() { return this._selected ? this._selected.voiceURI : null; }

  setLanguage(lang) {
    this._lang = lang === 'en' ? 'en' : 'de';
    this._pickVoice();
    this._listeners.emit();
  }

  voices() {
    return this._pool().map((v) => ({ id: v.voiceURI, name: v.name, lang: v.lang }));
  }

  selectVoice(id) {
    const found = this._all.find((v) => v.voiceURI === id);
    if (found) this._selected = found;
    return !!found;
  }

  onVoicesChanged(fn) { return this._listeners.add(fn); }

  _loadVoices() {
    const load = () => {
      try { this._all = this._synth.getVoices() || []; } catch (e) { this._all = []; }
      if (this._all.length) this._ready = true;
      this._pickVoice();
      this._listeners.emit();
    };
    load();
    // Single owner of onvoiceschanged (v1 assigned it in two files).
    if ('onvoiceschanged' in this._synth) this._synth.onvoiceschanged = load;
    // Some engines never fire onvoiceschanged; poll briefly.
    if (!this._ready) {
      let tries = 0;
      const poll = setInterval(() => {
        tries += 1;
        load();
        if (this._ready || tries >= 10) clearInterval(poll);
      }, 250);
    }
  }

  _pool() {
    const prefix = this._lang;
    const matching = this._all.filter((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
    return matching.length ? matching : this._all;
  }

  _pickVoice() {
    const pool = this._pool();
    if (!pool.length) { this._selected = null; return; }
    if (this._selected && pool.some((v) => v.voiceURI === this._selected.voiceURI)) return;
    const quality = /Natural|Neural|Online|Google|Enhanced|Premium/i;
    const region = this._lang === 'de' ? /de-DE/i : /en-US|en-GB/i;
    this._selected =
      pool.find((v) => quality.test(v.name) && region.test(v.lang)) ||
      pool.find((v) => region.test(v.lang)) ||
      pool.find((v) => v.localService) ||
      pool[0];
  }

  speak({ text, lang, rate = 1, pitch = 1, onStart = null, onBoundary = null, onEnd = null, onError = null }) {
    this.cancel();
    const session = ++this._session;
    const alive = () => session === this._session;
    const chunks = chunkText(String(text));
    let idx = 0;
    let settled = false;

    const settle = (fn, arg) => {
      if (!alive() || settled) return;
      settled = true;
      if (fn) fn(arg);
    };

    const next = () => {
      if (!alive()) return;
      if (idx >= chunks.length) { settle(onEnd); return; }

      const chunk = chunks[idx];
      const first = idx === 0;
      let u;
      try {
        u = new SpeechSynthesisUtterance(chunk.text);
      } catch (err) {
        settle(onError, { error: 'utterance-failed', message: String(err) });
        return;
      }
      u.rate = Math.max(0.5, Math.min(2, rate));
      u.pitch = Math.max(0.5, Math.min(1.5, pitch));
      if (this._selected) {
        u.voice = this._selected;
        u.lang = this._selected.lang;
      } else {
        u.lang = toBcp47(lang || this._lang);
      }
      u.onstart = () => { if (alive() && first && onStart) onStart(); };
      if (onBoundary) {
        u.onboundary = (e) => {
          if (!alive()) return;
          onBoundary({ charIndex: chunk.offset + (e.charIndex || 0), charLength: e.charLength || 0, name: e.name });
        };
      }
      u.onend = () => { if (!alive()) return; idx += 1; next(); };
      u.onerror = (e) => {
        if (!alive()) return;
        const code = (e && e.error) || '';
        // Our own cancel() landing; the session check usually catches it first.
        if (code === 'interrupted' || code === 'canceled') return;
        settle(onError, { error: code || 'synthesis-failed', message: `Speech output failed (${code || 'unknown'}).` });
      };
      try {
        this._synth.speak(u);
      } catch (err) {
        settle(onError, { error: 'synthesis-failed', message: String(err) });
      }
    };

    // A speak() in the same task as cancel() is swallowed on Android WebView.
    this._deferTimer = setTimeout(() => { this._deferTimer = null; next(); }, 0);
  }

  cancel() {
    this._session += 1;
    if (this._deferTimer) { clearTimeout(this._deferTimer); this._deferTimer = null; }
    try {
      if (this._synth.speaking || this._synth.pending || this._synth.paused) this._synth.cancel();
    } catch (e) { /* engine already idle */ }
  }

  async installVoiceData() { return false; }
}

// --- Native Android TextToSpeech ----------------------------------------------
//
// Contract verified against the plugin source (TextToSpeechPlugin.java, 8.0.2):
//   speak()  resolves when the utterance FINISHES (onDone), rejects on engine
//            error, and rejects with "This language is not supported." when
//            the device has no voice data for the requested language.
//   stop()   calls tts.stop(); the interrupted speak() call is never settled,
//            so this adapter ignores it by session token.

class CapacitorTtsAdapter {
  constructor(plugin) {
    this._plugin = plugin;
    this._lang = 'de';
    this._session = 0;
    this._langSupport = new Map();
    this._listeners = new VoiceListeners();
  }

  get id() { return 'native'; }
  get supported() { return true; }
  // The Android engine picks its default voice for the language; the device's
  // own TTS settings are where a learner changes it.
  get selectedVoiceId() { return null; }
  setLanguage(lang) { this._lang = lang === 'en' ? 'en' : 'de'; this._listeners.emit(); }
  voices() { return []; }
  selectVoice() { return false; }
  onVoicesChanged(fn) { return this._listeners.add(fn); }

  async _isSupported(bcp) {
    if (this._langSupport.has(bcp)) return this._langSupport.get(bcp);
    let ok = true;
    try {
      const res = await this._plugin.isLanguageSupported({ lang: bcp });
      ok = !!(res && res.supported);
    } catch (e) {
      ok = true; // unknown: let speak() decide and report
    }
    // Only cache positives: a learner may install voice data and come back.
    if (ok) this._langSupport.set(bcp, true);
    return ok;
  }

  async speak({ text, lang, rate = 1, pitch = 1, onStart = null, onEnd = null, onError = null }) {
    this.cancel();
    const session = ++this._session;
    const alive = () => session === this._session;
    const bcp = toBcp47(lang || this._lang);

    const supported = await this._isSupported(bcp);
    if (!alive()) return;
    if (!supported) {
      if (onError) onError({ error: 'lang-unsupported', lang: bcp, message: `No ${bcp} voice is installed on this device.` });
      return;
    }

    if (onStart) onStart();
    try {
      await this._plugin.speak({
        text: String(text),
        lang: bcp,
        rate: Math.max(0.5, Math.min(2, rate)),
        pitch: Math.max(0.5, Math.min(1.5, pitch)),
        volume: 1.0,
        queueStrategy: 0 // Flush: a new utterance replaces the current one
      });
      if (alive() && onEnd) onEnd();
    } catch (err) {
      if (!alive()) return;
      const message = String((err && err.message) || err || '');
      const unsupported = /not supported/i.test(message);
      if (unsupported) this._langSupport.delete(bcp);
      if (onError) onError({ error: unsupported ? 'lang-unsupported' : 'synthesis-failed', lang: bcp, message });
    }
  }

  cancel() {
    this._session += 1;
    try {
      const r = this._plugin.stop();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch (e) { /* engine not ready */ }
  }

  async installVoiceData() {
    try {
      await this._plugin.openInstall();
      this._langSupport.clear();
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Native engine wins on the device: it is the only one that works reliably
 * there. Web Speech elsewhere.
 */
export function createTtsAdapter() {
  if (typeof window === 'undefined') return new NullTtsAdapter();
  const native = getNativePlugin('TextToSpeech');
  if (native) return new CapacitorTtsAdapter(native);
  if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined') {
    return new WebSynthTtsAdapter(window.speechSynthesis);
  }
  return new NullTtsAdapter();
}

export { NullTtsAdapter, WebSynthTtsAdapter, CapacitorTtsAdapter };
