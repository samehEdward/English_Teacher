// Audio Recording & Web Audio API Visualizer

class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.isRecording = false;
    this.animationFrameId = null;
  }

  async initMicrophone() {
    if (this.stream) return this.stream;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return this.stream;
    } catch (err) {
      console.error('Microphone permission denied or unavailable:', err);
      throw err;
    }
  }

  async startRecording(canvasElement = null) {
    await this.initMicrophone();
    this.audioChunks = [];
    this.audioBlob = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }

    // Setup Web Audio Context for visualizer
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);

    // Initialize MediaRecorder
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      else mimeType = '';
    }

    const options = mimeType ? { mimeType } : undefined;
    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;

    if (canvasElement) {
      this.startWaveformVisualizer(canvasElement);
    }
  }

  releaseMicrophone() {
    if (this.stream) {
      try {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        // Ignore
      }
      this.stream = null;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      this.releaseMicrophone();
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecording = false;
        this.stopWaveformVisualizer();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.stopWaveformVisualizer();
        this.audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        resolve({ blob: this.audioBlob, url: this.audioUrl });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording = false;
        this.stopWaveformVisualizer();
        resolve(null);
      }
    });
  }

  startWaveformVisualizer(canvas) {
    const ctx = canvas.getContext('2d');
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.isRecording) {
        // Draw resting ambient line
        this.drawIdleWave(ctx, canvas.width, canvas.height);
        return;
      }

      this.animationFrameId = requestAnimationFrame(draw);
      this.analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create glowing gradient line
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#ec4899');

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6366f1';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }

  drawIdleWave(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  stopWaveformVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  playAudio(url = null) {
    const target = url || this.audioUrl;
    if (!target) return null;
    const audio = new Audio(target);
    audio.play();
    return audio;
  }

  // Synthesizes pleasant modern UI chimes using Web Audio API
  playChime(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'tap') {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'incorrect') {
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }
}

export const audioRecorder = new AudioRecorderService();
