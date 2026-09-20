// Web Speech API Wrapper for EchoSpeak (TTS & STT)

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.currentUtterance = null;
    this.recognition = null;
    this.isListening = false;
    this.currentLang = 'en'; // 'en' | 'de'

    this.initVoices();
    this.initRecognition();
  }

  setLanguage(lang = 'en') {
    this.currentLang = lang;
    this.initVoices();
  }

  getLanguage() {
    return this.currentLang;
  }

  getDefaultRecognitionLang() {
    return this.currentLang === 'de' ? 'de-DE' : 'en-US';
  }

  // ---- Text-to-Speech (TTS) ----
  initVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      const all = this.synth.getVoices();
      const prefix = this.currentLang === 'de' ? 'de' : 'en';
      
      // Filter for target language voices
      this.voices = all.filter(v => v.lang.toLowerCase().startsWith(prefix));
      if (this.voices.length === 0) {
        this.voices = all; // Fallback if system language codes are unusual
      }

      // Pick a great default voice
      let preferred = null;
      if (this.currentLang === 'de') {
        preferred = this.voices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Katja') || v.name.includes('Hedda') || v.name.includes('Stefan')) &&
          (v.lang.includes('de-DE') || v.lang.includes('de'))
        ) || this.voices.find(v => v.lang.toLowerCase().includes('de')) || this.voices[0];
      } else {
        preferred = this.voices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')) &&
          (v.lang.includes('en-US') || v.lang.includes('en-GB'))
        ) || this.voices.find(v => v.lang.includes('en-US')) || this.voices[0];
      }

      this.selectedVoice = preferred || null;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  getAvailableVoices() {
    return this.voices;
  }

  setVoiceByUri(uri) {
    const found = this.voices.find(v => v.voiceURI === uri);
    if (found) {
      this.selectedVoice = found;
    }
  }

  speak({ text, rate = 1.0, pitch = 1.0, onBoundary = null, onStart = null, onEnd = null, onError = null }) {
    if (!this.synth) {
      if (onError) onError(new Error('Speech Synthesis not supported in this browser.'));
      return;
    }

    this.stopSpeaking();

    // Workaround for Chrome bug where long utterances get paused
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.lang = this.selectedVoice ? this.selectedVoice.lang : this.getDefaultRecognitionLang();

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    if (onBoundary) {
      utterance.onboundary = (event) => {
        onBoundary(event);
      };
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  // ---- Speech-to-Text (Speech Recognition) ----
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser environment.');
      this.recognitionSupported = false;
      return;
    }
    this.recognitionSupported = true;
  }

  isSpeechRecognitionSupported() {
    return this.recognitionSupported;
  }

  startListening({
    lang = null,
    continuous = true,
    interimResults = true,
    onStart = null,
    onInterim = null,
    onResult = null,
    onError = null,
    onEnd = null
  }) {
    if (!this.recognitionSupported) {
      if (onError) onError(new Error('Speech Recognition is only supported in Chrome, Edge, and Chromium-based browsers.'));
      return;
    }

    this.stopListening();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang || this.getDefaultRecognitionLang();
    this.recognition.continuous = continuous;
    this.recognition.interimResults = interimResults;
    this.recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let hadFatalError = false;
    let isAborted = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let finalAccum = '';
      let interimAccum = '';

      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res && res[0]) {
          const text = res[0].transcript;
          if (res.isFinal) {
            finalAccum += (finalAccum ? ' ' : '') + text;
          } else {
            interimAccum += (interimAccum ? ' ' : '') + text;
          }
        }
      }

      finalTranscript = finalAccum;
      const combined = (finalAccum + (finalAccum && interimAccum ? ' ' : '') + interimAccum).trim();

      if (onInterim) {
        onInterim({
          final: finalAccum,
          interim: interimAccum,
          full: combined
        });
      }
    };

    this.recognition.onerror = (event) => {
      const errType = event.error || (event.message || 'unknown');
      console.warn('Speech recognition error event:', errType);

      // 'aborted' is triggered when the user stops listening manually
      if (errType === 'aborted') {
        isAborted = true;
        return;
      }

      // 'no-speech' is non-fatal on mobile (e.g. user thought for a second before speaking)
      if (errType === 'no-speech') {
        hadFatalError = false;
        if (onError) onError(event);
        return;
      }

      hadFatalError = true;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.recognition = null;

      // Only invoke onResult when there was no fatal error, session wasn't aborted, and text was captured
      if (!hadFatalError && !isAborted && finalTranscript.trim() && onResult) {
        onResult(finalTranscript.trim());
      }

      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      hadFatalError = true;
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        // abort() immediately shuts down recognition on mobile WebViews without waiting
        this.recognition.abort();
      } catch (e) {
        try {
          this.recognition.stop();
        } catch (err) {
          // Ignore
        }
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const speechService = new SpeechService();
