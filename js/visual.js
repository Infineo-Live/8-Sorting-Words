// Shiva's Wisdom - Visual FX & Character State Manager

// Inject helper keyframe animations dynamically to keep the styling self-contained
(function injectAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes vishnuNod {
      0% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(8px) rotate(1.5deg); }
      65% { transform: translateY(-2px) rotate(-0.5deg); }
      100% { transform: translateY(0) rotate(0deg); }
    }
    .nodding {
      animation: vishnuNod 0.7s ease-in-out;
    }
  `;
  document.head.appendChild(style);
})();

const VisualManager = {
  // Character Elements
  shiva: document.getElementById('shiva-character'),
  vishnu: document.getElementById('vishnu-character'),
  scene: document.getElementById('game-scene'),
  vishnuSpeech: document.getElementById('vishnu-speech'),
  vishnuSpeechText: document.getElementById('vishnu-speech-text'),
  riverSparkles: document.getElementById('river-sparkles'),
  endingLotus: document.getElementById('ending-lotus-container'),
  wisdomReveal: document.getElementById('wisdom-reveal-text'),
  floatingScoreArea: document.getElementById('floating-score'),

  // Shiva States
  setShivaState(state) {
    if (!this.shiva) return;
    this.shiva.className = `character shiva state-${state}`;
  },

  shivaSmile() {
    this.setShivaState('smile');
  },

  shivaBless() {
    this.setShivaState('bless');
  },

  shivaReset() {
    this.setShivaState('normal');
  },

  // Vishnu States
  setVishnuState(state) {
    if (!this.vishnu) return;
    this.vishnu.className = `character vishnu state-${state}`;
  },

  vishnuContemplate() {
    this.setVishnuState('chin');
  },

  vishnuNamaste() {
    this.setVishnuState('namaste');
  },

  vishnuReset() {
    this.setVishnuState('normal');
  },

  vishnuNod() {
    if (!this.vishnu) return;
    this.vishnu.classList.add('nodding');
    setTimeout(() => {
      this.vishnu.classList.remove('nodding');
    }, 700);
  },

  // Vishnu Speech Bubble
  showVishnuSpeech(text, duration = null) {
    if (!this.vishnuSpeech || !this.vishnuSpeechText) return;
    
    this.vishnuSpeechText.textContent = text;
    this.vishnuSpeech.classList.remove('hidden');

    if (duration) {
      setTimeout(() => {
        this.hideVishnuSpeech();
      }, duration);
    }
  },

  hideVishnuSpeech() {
    if (this.vishnuSpeech) {
      this.vishnuSpeech.classList.add('hidden');
    }
  },

  // Camera Gaze Controls
  focusCameraOnGanga() {
    if (this.scene) {
      this.scene.classList.add('camera-focus-ganga');
    }
  },

  resetCamera() {
    if (this.scene) {
      this.scene.classList.remove('camera-focus-ganga');
    }
  },

  // River Effects
  setRiverSparkle(active) {
    if (!this.riverSparkles) return;
    if (active) {
      this.riverSparkles.classList.add('sparkling');
    } else {
      this.riverSparkles.classList.remove('sparkling');
    }
  },

  createRipple(x, y) {
    const container = document.querySelector('.river-ganga-container');
    if (!container) return;

    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    container.appendChild(ripple);

    // Clean up
    setTimeout(() => {
      ripple.remove();
    }, 850);
  },

  createSplash(x, y) {
    const container = document.querySelector('.river-ganga-container');
    if (!container) return;

    const splash = document.createElement('div');
    splash.className = 'water-splash';
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;

    // 3 droplets for the splash
    for (let i = 0; i < 3; i++) {
      const drop = document.createElement('div');
      drop.className = 'splash-drop';
      splash.appendChild(drop);
    }

    container.appendChild(splash);

    // Clean up
    setTimeout(() => {
      splash.remove();
    }, 700);
  },

  // Floating score popups
  showFloatingScore(amount, x, y) {
    if (!this.floatingScoreArea) return;

    const popup = document.createElement('div');
    popup.className = 'floating-score';
    popup.textContent = `+${amount}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    this.floatingScoreArea.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 1800);
  },

  // Lotus Flower Tracker
  bloomLotus(index) {
    const slot = document.getElementById(`lotus-slot-${index}`);
    if (slot) {
      const svg = slot.querySelector('.lotus-flower-svg');
      if (svg) {
        svg.classList.add('bloomed');
      }
    }
  },

  resetLotuses() {
    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById(`lotus-slot-${i}`);
      if (slot) {
        const svg = slot.querySelector('.lotus-flower-svg');
        if (svg) {
          svg.classList.remove('bloomed');
        }
      }
    }
  },

  // Ending Giant Lotus Bloom
  bloomEndingLotus() {
    if (this.endingLotus && this.wisdomReveal) {
      this.endingLotus.classList.remove('hidden');
      // Trigger class transition in next tick
      setTimeout(() => {
        this.endingLotus.classList.add('bloomed');
      }, 50);

      // Reveal wisdom text after lotus opens
      setTimeout(() => {
        this.wisdomReveal.classList.remove('hidden');
        this.wisdomReveal.classList.add('visible');
      }, 1200);
    }
  },

  resetEndingLotus() {
    if (this.endingLotus && this.wisdomReveal) {
      this.endingLotus.classList.remove('bloomed');
      this.endingLotus.classList.add('hidden');
      this.wisdomReveal.classList.remove('visible');
      this.wisdomReveal.classList.add('hidden');
    }
  },

  // Premium water collision splash with ripples, droplets, foam and sparkles
  createCinematicSplash(x, y) {
    const container = document.querySelector('.river-ganga-container');
    if (!container) return;

    const splashGroup = document.createElement('div');
    splashGroup.className = 'cinematic-splash';
    splashGroup.style.left = `${x}px`;
    splashGroup.style.top = `${y}px`;
    container.appendChild(splashGroup);

    // 1. Expansion Ripples (2 ripples with staggered delay)
    for (let i = 0; i < 2; i++) {
      const ripple = document.createElement('div');
      ripple.className = 'splash-ripple';
      ripple.style.animationDelay = `${i * 150}ms`;
      splashGroup.appendChild(ripple);
    }

    // 2. Upward shooting droplets (5 droplets with varied angles and speeds)
    for (let i = 0; i < 5; i++) {
      const drop = document.createElement('div');
      drop.className = 'splash-droplet';
      const angle = -75 + (i * 30); // Angles: -75, -45, -15, 15, 45
      const force = 40 + Math.random() * 30; // Random heights
      drop.style.setProperty('--dx', `${Math.sin(angle * Math.PI / 180) * force}px`);
      drop.style.setProperty('--dy', `${-Math.cos(angle * Math.PI / 180) * force}px`);
      splashGroup.appendChild(drop);
    }

    // 3. White Foam Particles (4 small particles drifting slightly)
    for (let i = 0; i < 4; i++) {
      const foam = document.createElement('div');
      foam.className = 'splash-foam';
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 15;
      foam.style.setProperty('--fx', `${Math.cos(angle) * dist}px`);
      foam.style.setProperty('--fy', `${Math.sin(angle) * dist}px`);
      splashGroup.appendChild(foam);
    }

    // 4. Sparkles (3 tiny bright stars fading)
    for (let i = 0; i < 3; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'splash-sparkle';
      sparkle.style.left = `${-15 + Math.random() * 30}px`;
      sparkle.style.top = `${-10 + Math.random() * 15}px`;
      sparkle.style.animationDelay = `${Math.random() * 200}ms`;
      splashGroup.appendChild(sparkle);
    }

    // Cleanup after 900ms
    setTimeout(() => {
      splashGroup.remove();
    }, 900);
  }
};
