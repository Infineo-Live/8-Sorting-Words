// Shiva's Wisdom - Audio Manager
const AudioCtx = window.AudioContext || window.webkitAudioContext;

const SoundManager = {
  ctx: null,
  bgMusic: null,
  isMuted: false,
  fadeInterval: null,
  currentNarration: null,
  baseBgVolume: 0.25,
  duckedBgVolume: 0.25 * 0.25, // 25% of normal volume
  narrationCount: 0,

  // Play narration audio for the completed sentence
  playNarration(audioPath, onEndedCallback) {
    // Stop any currently playing narration
    if (this.currentNarration) {
      this.currentNarration.pause();
      this.currentNarration.currentTime = 0;
      this.narrationCount = Math.max(0, this.narrationCount - 1);
    }

    if (!audioPath) {
      if (onEndedCallback) onEndedCallback();
      return;
    }

    this.narrationCount++;
    if (this.narrationCount === 1) {
      this.fadeToVolume(this.duckedBgVolume, 400); // Duck background music
    }

    this.currentNarration = new Audio(audioPath);
    
    if (this.isMuted) {
      this.currentNarration.volume = 0;
    }

    this.currentNarration.onended = () => {
      this.currentNarration = null;
      this.narrationCount = Math.max(0, this.narrationCount - 1);
      if (this.narrationCount === 0) {
        this.fadeToVolume(this.baseBgVolume, 800); // Restore background music
      }
      if (onEndedCallback) onEndedCallback();
    };
    
    this.currentNarration.onerror = () => {
      console.warn(`Narration file missing or failed to load: ${audioPath}`);
      this.currentNarration = null;
      this.narrationCount = Math.max(0, this.narrationCount - 1);
      if (this.narrationCount === 0) {
        this.fadeToVolume(this.baseBgVolume, 800);
      }
      if (onEndedCallback) onEndedCallback();
    };

    this.currentNarration.play().catch(e => {
      console.warn('Narration playback prevented:', e);
      this.currentNarration = null;
      this.narrationCount = Math.max(0, this.narrationCount - 1);
      if (this.narrationCount === 0) {
        this.fadeToVolume(this.baseBgVolume, 800);
      }
      if (onEndedCallback) onEndedCallback();
    });
  },

  // Initialize Audio Context on first user interaction to bypass browser autoplay blocks
  init() {
    if (!this.ctx && AudioCtx) {
      try {
        this.ctx = new AudioCtx();
      } catch (e) {
        console.error("Web Audio API not supported", e);
      }
    }
  },

  // Initialize BGM and Mute Controls
  initBGM() {
    if (this.bgMusic) return;

    this.bgMusic = new Audio('assets/audio/ambient.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.preload = 'auto';

    // Load mute preference
    this.isMuted = localStorage.getItem('shivas_wisdom_muted') === 'true';

    // Update initial button icon
    this.updateToggleButton();

    // Set initial volume
    this.bgMusic.volume = 0;

    // Add first interaction fallback to initialize Web Audio API context for sound effects
    const startOnInteraction = () => {
      this.init(); // Initialize AudioContext for sound effects
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
    };
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);

    // Mute/unmute button click handler
    const toggleBtn = document.getElementById('sound-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }
  },

  playBGM() {
    if (!this.bgMusic) return;
    if (this.isMuted) {
      this.bgMusic.volume = 0;
      this.bgMusic.pause();
      return;
    }

    // Attempt to play
    this.bgMusic.play().then(() => {
      if (!this.isMuted) {
        let target = this.narrationCount > 0 ? this.duckedBgVolume : this.baseBgVolume;
        this.fadeToVolume(target, 2000); // Fade in over 2.0s
      }
    }).catch(err => {
      // Audio autoplay policy is handled by startOnInteraction event listener
      console.log("Autoplay blocked or audio not ready yet:", err);
    });
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('shivas_wisdom_muted', this.isMuted ? 'true' : 'false');
    this.updateToggleButton();

    if (this.isMuted) {
      // Fade out BGM, then pause
      this.fadeToVolume(0, 2000, () => {
        if (this.isMuted && this.bgMusic) {
          this.bgMusic.pause();
        }
      });
    } else {
      // Resume and fade in BGM
      if (this.bgMusic) {
        let target = this.narrationCount > 0 ? this.duckedBgVolume : this.baseBgVolume;
        if (this.bgMusic.paused) {
          this.bgMusic.play().then(() => {
            this.fadeToVolume(target, 2000);
          });
        } else {
          this.fadeToVolume(target, 2000);
        }
      }
    }
  },

  fadeToVolume(targetVolume, durationMs, callback) {
    if (!this.bgMusic || this.isMuted) {
      if (callback) callback();
      return;
    }
    clearInterval(this.fadeInterval);

    const stepTime = 50;
    const steps = Math.max(1, durationMs / stepTime);
    const volumeStep = (targetVolume - this.bgMusic.volume) / steps;
    const isFadingUp = targetVolume > this.bgMusic.volume;

    this.fadeInterval = setInterval(() => {
      if (!this.bgMusic) {
        clearInterval(this.fadeInterval);
        return;
      }
      let nextVol = this.bgMusic.volume + volumeStep;
      let reachedTarget = isFadingUp ? (nextVol >= targetVolume) : (nextVol <= targetVolume);
      
      if (reachedTarget) {
        this.bgMusic.volume = Math.max(0, Math.min(1, targetVolume));
        clearInterval(this.fadeInterval);
        if (callback) callback();
      } else {
        this.bgMusic.volume = Math.max(0, Math.min(1, nextVol));
      }
    }, stepTime);
  },

  updateToggleButton() {
    const toggleBtn = document.getElementById('sound-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = this.isMuted ? '🔇' : '🔊';
      toggleBtn.setAttribute('aria-label', this.isMuted ? 'Unmute Sound' : 'Mute Sound');
    }
  },

  // Synthesize a meditative Tibetan bell/chime sound
  playBell() {
    this.init();
    if (!this.ctx || this.isMuted) return; // Mute bell if master muted

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const fundamental = 293.66; // D4 (a warm, meditative frequency)

    // Bell overtones: ratio to fundamental, volume factor, decay duration in seconds
    const harmonics = [
      { ratio: 1.0, volume: 0.5, decay: 3.0 },
      { ratio: 1.5, volume: 0.25, decay: 2.5 },
      { ratio: 2.0, volume: 0.15, decay: 2.0 },
      { ratio: 2.61, volume: 0.1, decay: 1.5 },
      { ratio: 3.5, volume: 0.05, decay: 1.0 },
      { ratio: 4.2, volume: 0.02, decay: 0.8 }
    ];

    // Master lowpass filter to warm up the tone and emulate a metal singing bowl
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 2.5);
    filter.connect(this.ctx.destination);

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h.ratio, now);

      // Tibetan bell envelope: instant strike, slow exponential ring-out
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(h.volume, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

      osc.connect(gainNode);
      gainNode.connect(filter);

      osc.start(now);
      osc.stop(now + h.decay);
    });
  },

  // Synthesize a realistic water splash & plop sound
  playSplash() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // 1. Soft white noise burst for the splash
    const bufferSize = this.ctx.sampleRate * 0.4; // 0.4s duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.4);

    // 2. A tiny sine wave sweep for the "plop" (water bubble)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

    oscGain.gain.setValueAtTime(0.001, now + 0.05);
    oscGain.gain.linearRampToValueAtTime(0.15, now + 0.07);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now + 0.05);
    osc.stop(now + 0.22);

    // 3. Low frequency swell for the ripple ambience
    const rippleOsc = this.ctx.createOscillator();
    const rippleGain = this.ctx.createGain();
    
    rippleOsc.type = 'triangle';
    rippleOsc.frequency.setValueAtTime(80, now);
    rippleOsc.frequency.linearRampToValueAtTime(60, now + 0.6);
    
    rippleGain.gain.setValueAtTime(0.001, now);
    rippleGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    rippleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    
    rippleOsc.connect(rippleGain);
    rippleGain.connect(this.ctx.destination);
    
    rippleOsc.start(now);
    rippleOsc.stop(now + 0.6);
  },

  // Synthesize a soft magical "poof" sound effect
  playPoof() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // Airy noise burst for the poof effect
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.035, now + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.25);
  },

  // Synthesize an arpeggiated major chord chime for correct answers
  playCorrectChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const baseFreq = 587.33; // D5
    const notes = [1, 1.25, 1.5, 1.875, 2.0]; // Arpeggiated D Major Triad overtones
    
    notes.forEach((ratio, index) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now + index * 0.05);
      
      gainNode.gain.setValueAtTime(0.001, now + index * 0.05);
      gainNode.gain.linearRampToValueAtTime(0.06, now + index * 0.05 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 1.2);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 1.2);
    });
  },

  // Synthesize a soft low-frequency thunder rumble for incorrect answers
  playThunder() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const duration = 1.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Create brown noise via filtering
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.exponentialRampToValueAtTime(35, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + duration);
  }
};
