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

  // Journey Tracker Updates
  advanceJourney(index) {
    this.bloomLotus(index);
    const activeNode = document.getElementById(`journey-node-${index}`);
    if (activeNode) {
      activeNode.classList.add('active');
    }
  },

  resetJourney() {
    this.resetLotuses();
    for (let i = 0; i < 4; i++) {
      const node = document.getElementById(`journey-node-${i}`);
      if (node) {
        node.classList.remove('active');
      }
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

  // Journey Tracker Updates
  advanceJourney(index) {
    this.bloomLotus(index);
    const activeNode = document.getElementById(`journey-node-${index}`);
    if (activeNode) {
      activeNode.classList.add('active');
    }
  },

  resetJourney() {
    this.resetLotuses();
    for (let i = 0; i < 4; i++) {
      const node = document.getElementById(`journey-node-${i}`);
      if (node) {
        node.classList.remove('active');
      }
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
  },

  spawnCelebrationEffects() {
    const layer = document.getElementById('ending-effects-layer');
    if (!layer) return;

    // Spawn Stars
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'celebration-particle';
        star.style.width = Math.random() * 8 + 4 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = 100 + Math.random() * 20 + '%';
        star.style.animationDuration = Math.random() * 3 + 3 + 's';
        layer.appendChild(star);
        setTimeout(() => { if(star.parentNode) star.remove(); }, 6000);
      }, Math.random() * 2000);
    }

    // Spawn Petals
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const petal = document.createElement('div');
        petal.className = 'celebration-petal';
        petal.style.width = Math.random() * 20 + 20 + 'px';
        petal.style.height = Math.random() * 20 + 20 + 'px';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = Math.random() * 5 + 5 + 's';
        layer.appendChild(petal);
        setTimeout(() => { if(petal.parentNode) petal.remove(); }, 10000);
      }, Math.random() * 3000);
    }
  }
};

class AmbientManager {
  constructor() {
    this.bgLayer = document.getElementById('ambient-bg-layer');
    this.fgLayer = document.getElementById('ambient-fg-layer');
    this.isRunning = true;
    
    // Visibility API to pause animations when tab is inactive
    document.addEventListener("visibilitychange", () => {
      this.isRunning = !document.hidden;
    });

    this.init();
  }

  init() {
    // Initial batch of fireflies
    for(let i=0; i<20; i++) this.spawnFirefly(true);
    
    // Ambient loops
    setInterval(() => { if (this.isRunning) this.spawnFirefly(); }, 2000);
    setInterval(() => { if (this.isRunning) this.spawnBirdFlock(); }, 20000);
    setInterval(() => { if (this.isRunning) this.spawnLeaf(); }, 4000);
  }

  spawnFirefly(randomStart = false) {
    if(!this.fgLayer || document.querySelectorAll('.ambient-firefly').length > 25) return;
    
    const firefly = document.createElement('div');
    firefly.className = 'ambient-firefly';
    
    const size = Math.random() * 4 + 2;
    firefly.style.width = `${size}px`;
    firefly.style.height = `${size}px`;
    
    // Start somewhere in the bottom half of the screen
    const startX = Math.random() * 100;
    const startY = 50 + Math.random() * 40;
    firefly.style.left = `${startX}%`;
    firefly.style.top = `${startY}%`;
    
    // Target offset
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    firefly.style.setProperty('--tx', `${tx}px`);
    firefly.style.setProperty('--ty', `${ty}px`);
    
    // Timing
    const dur = 4 + Math.random() * 6;
    const blink = 1 + Math.random() * 3;
    firefly.style.setProperty('--dur', `${dur}s`);
    firefly.style.setProperty('--blink', `${blink}s`);
    
    if (randomStart) {
      firefly.style.animationDelay = `-${Math.random() * 5}s`;
    }
    
    this.fgLayer.appendChild(firefly);
    
    // Remove after some time and spawn a new one to keep the loop dynamic
    setTimeout(() => {
      if (firefly.parentNode) firefly.remove();
    }, (dur * 1000) * 3); // lives for a few cycles
  }

  spawnBirdFlock() {
    if(!this.bgLayer) return;
    
    const flockSize = 2 + Math.floor(Math.random() * 3);
    const startY = 10 + Math.random() * 30; // Top 10-40% of screen
    const dur = 15 + Math.random() * 10;
    
    for (let i=0; i<flockSize; i++) {
      setTimeout(() => {
        if (!this.isRunning) return;
        const bird = document.createElement('div');
        bird.className = 'ambient-bird';
        bird.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22,12 c-2,-2 -5,-3 -7,-1 c-1,1 -2,2 -4,2 c-2,0 -3,-1 -4,-2 c-2,-2 -5,-1 -7,1 c1,3 4,4 6,2 c1,-1 2,-2 4,-2 c2,0 3,1 4,2 c2,2 5,1 6,-2 z"></path></svg>`;
        
        bird.style.setProperty('--sy', `${startY + (Math.random() * 10 - 5)}%`);
        bird.style.setProperty('--ey', `${startY + (Math.random() * 20 - 10)}%`);
        bird.style.setProperty('--s', `${0.4 + Math.random() * 0.4}`);
        bird.style.setProperty('--op', `${0.4 + Math.random() * 0.4}`);
        bird.style.setProperty('--dur', `${dur}s`);
        
        this.bgLayer.appendChild(bird);
        setTimeout(() => { if(bird.parentNode) bird.remove(); }, dur * 1000);
      }, i * (500 + Math.random() * 1000));
    }
  }

  spawnLeaf() {
    if(!this.fgLayer || document.querySelectorAll('.ambient-leaf').length > 10) return;
    
    const leaf = document.createElement('div');
    leaf.className = 'ambient-leaf';
    
    const dur = 8 + Math.random() * 6;
    leaf.style.setProperty('--sx', `${Math.random() * 100}%`);
    leaf.style.setProperty('--ex', `${Math.random() * 100}%`);
    leaf.style.setProperty('--dur', `${dur}s`);
    leaf.style.setProperty('--spin', `${2 + Math.random() * 2}s`);
    leaf.style.setProperty('--op', `${0.4 + Math.random() * 0.4}`);
    
    this.fgLayer.appendChild(leaf);
    
    setTimeout(() => {
      if (leaf.parentNode) leaf.remove();
    }, dur * 1000);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.ambientManager = new AmbientManager();
});
