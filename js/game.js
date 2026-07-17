// Shiva's Wisdom - Main Game Controller

const GameManager = {
  // Game State
  currentTeachingIndex: 0,
  score: 0,
  attempts: 0, // Number of incorrect attempts for the current teaching
  isInputActive: false, // Disables clicking options during transitions
  
  // Cache DOM Elements
  container: document.getElementById('game-container'),
  btnBegin: document.getElementById('btn-begin-wisdom'),
  btnStartGame: document.getElementById('btn-start-game'),
  btnPlayAgain: document.getElementById('btn-play-again'),
  btnReturnHome: document.getElementById('btn-return-home'),
  screenWelcome: document.getElementById('screen-welcome'),
  screenInstructions: document.getElementById('screen-instructions'),
  screenEnding: document.getElementById('screen-ending'),
  sentenceContainer: document.getElementById('sentence-container'),
  optionsContainer: document.getElementById('river-options-container'),
  scoreVal: document.getElementById('score-val'),
  finalScoreVal: document.getElementById('final-score-val'),
  
  // Initialize Event Listeners
  init() {
    // Start background music system
    SoundManager.initBGM();

    if (this.btnBegin) {
      this.btnBegin.addEventListener('click', () => {
        // Play ambient bell to initialize Audio Context
        SoundManager.playBell();
        this.startGame();
      });
    }

    if (this.btnStartGame) {
      this.btnStartGame.addEventListener('click', () => {
        SoundManager.playBell();
        this.startGame();
      });
    }

    if (this.btnPlayAgain) {
      this.btnPlayAgain.addEventListener('click', () => {
        SoundManager.playBell();
        this.startGame();
      });
    }

    if (this.btnReturnHome) {
      this.btnReturnHome.addEventListener('click', () => {
        SoundManager.playBell();
        this.restartGame();
      });
    }
  },

  // Transition to Instructions Screen
  showInstructions() {
    this.container.className = 'state-instructions';
    if (this.screenWelcome) {
      this.screenWelcome.classList.add('hidden');
    }
    if (this.screenInstructions) {
      this.screenInstructions.classList.remove('hidden');
    }
    if (this.screenEnding) {
      this.screenEnding.classList.add('hidden');
    }
  },

  // Transition to Gameplay Screen
  startGame() {
    this.container.className = 'state-gameplay';
    
    // Start background music loop when user clicks PLAY
    SoundManager.playBGM();

    if (this.screenWelcome) {
      this.screenWelcome.classList.add('hidden');
    }
    if (this.screenInstructions) {
      this.screenInstructions.classList.add('hidden');
    }
    if (this.screenEnding) {
      this.screenEnding.classList.add('hidden');
    }
    this.currentTeachingIndex = 0;
    this.score = 0;
    this.updateScoreboard();
    VisualManager.resetLotuses();
    VisualManager.resetEndingLotus();
    VisualManager.shivaReset();
    VisualManager.vishnuReset();
    VisualManager.resetCamera();
    
    // Show in-game instruction overlay
    this.showInGameInstructions();

    // Start first teaching
    setTimeout(() => {
      this.loadTeaching(this.currentTeachingIndex);
    }, 1000);
  },

  // Load a teaching by index
  loadTeaching(index) {
    if (index >= TEACHINGS.length) {
      this.endGame();
      return;
    }

    this.attempts = 0;
    this.isInputActive = false;
    VisualManager.shivaReset();
    VisualManager.vishnuReset();
    VisualManager.resetCamera();
    VisualManager.hideVishnuSpeech();
    this.optionsContainer.classList.remove('active');
    this.optionsContainer.innerHTML = '';

    // Step 1: Shiva Speaks
    this.stepShivaSpeaks();
  },

  // Step 1: Shiva Speaks (Display full sentence in clouds)
  // Step 1: Shiva Speaks (Display sentence with blank placeholder immediately)
  stepShivaSpeaks() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    const words = teaching.sentence.split(' ');
    
    this.sentenceContainer.innerHTML = '';
    this.sentenceContainer.classList.remove('hidden');

    // Create cloud elements for each word, leaving target blank
    words.forEach((word, idx) => {
      const cloud = document.createElement('div');
      cloud.className = 'word-cloud';
      cloud.dataset.index = idx;
      cloud.style.animationDelay = `${idx * 100}ms`;
      
      const cleaned = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      
      if (cleaned === teaching.missingWord.toLowerCase()) {
        // Target blank placeholder (no letters, underscores, or hints)
        cloud.id = 'target-blank';
        cloud.classList.add('target-word', 'blank-placeholder');
        cloud.textContent = ''; 
        cloud.dataset.originalWord = word; // Store original word (with punctuation)
      } else {
        cloud.textContent = word;
      }

      this.sentenceContainer.appendChild(cloud);
    });

    // Directly transition to Vishnu guides and options loading after a brief fade-in (600ms)
    setTimeout(() => {
      this.stepVishnuGuides();
    }, 600);
  },

  // Step 2: (Bypassed) Word Falls is no longer used, kept as empty stub
  stepWordFalls() {},

  // Step 3: Vishnu Guides (Contemplating gesture, camera focus, narration)
  stepVishnuGuides() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    
    // Prepare Vishnu behavior
    VisualManager.vishnuContemplate();
    VisualManager.focusCameraOnGanga();

    // Wait for player to look at the river, then start Step 4
    setTimeout(() => {
      this.stepPlayerRestores();
    }, 2000);
  },

  // Step 4: Player Restores Wisdom (Options float in Ganga)
  stepPlayerRestores() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    
    // Shuffle options
    const shuffledOptions = this.shuffleArray([...teaching.options]);
    this.optionsContainer.innerHTML = '';

    shuffledOptions.forEach(optText => {
      // Create the OptionContainer wrapper
      const container = document.createElement('div');
      container.className = 'option-container';
      
      // Lotus Image
      const lotus = document.createElement('img');
      lotus.className = 'option-lotus';
      lotus.src = 'assets/clouds/lotus.png';
      lotus.alt = 'Lotus Base';
      
      // Golden Glow
      const glow = document.createElement('div');
      glow.className = 'option-glow';
      
      // Cloud Element
      const cloud = document.createElement('div');
      cloud.className = 'option-cloud';
      cloud.textContent = optText;
      
      // Append in layout order: Cloud -> Glow -> Lotus
      container.appendChild(cloud);
      container.appendChild(glow);
      container.appendChild(lotus);
      
      // Bind click to the container
      container.addEventListener('click', (e) => this.handleOptionClick(e, container, optText));
      
      this.optionsContainer.appendChild(container);
    });

    // Make options clickable
    this.optionsContainer.classList.add('active');
    this.isInputActive = true;
  },

  // Handle option click
  handleOptionClick(e, element, selectedWord) {
    // Fade out instructions immediately if still visible
    this.fadeInstructionsOut();

    if (!this.isInputActive) return;

    const teaching = TEACHINGS[this.currentTeachingIndex];
    const isCorrect = selectedWord.toLowerCase() === teaching.missingWord.toLowerCase();
    const containerRect = this.container.getBoundingClientRect();

    if (isCorrect) {
      // Correct behavior
      this.isInputActive = false;
      this.optionsContainer.classList.remove('active');
      
      // Glow clicked option
      element.classList.add('glowing');

      // Award Score based on attempt
      let pointsAwarded = 0;
      if (this.attempts === 0) pointsAwarded = 100;
      else if (this.attempts === 1) pointsAwarded = 75;
      else if (this.attempts >= 2) pointsAwarded = 0;

      this.score += pointsAwarded;

      // Animate returning to sentence along a Bezier curve
      this.animateCloudToSentence(element, teaching.missingWord, () => {
        this.updateScoreboard();

        // Restored visual reactions
        VisualManager.shivaSmile();
        VisualManager.vishnuNod();
        VisualManager.hideVishnuSpeech();

        // Show floating score popup above Shiva
        const shivaRect = document.getElementById('shiva-character').getBoundingClientRect();
        const popupX = (shivaRect.left + shivaRect.width / 2) - containerRect.left;
        const popupY = shivaRect.top - containerRect.top - 40;
        VisualManager.showFloatingScore(pointsAwarded, popupX, popupY);

        // Glow the entire sentence
        const allClouds = this.sentenceContainer.querySelectorAll('.word-cloud');
        allClouds.forEach(c => c.classList.add('glowing'));

        // Bloom a lotus
        VisualManager.bloomLotus(this.currentTeachingIndex);

        // Continue to next teaching after delay
        setTimeout(() => {
          this.nextTeaching();
        }, 3000);
      });

    } else {
      // Incorrect behavior: melting cloud collapse, permanent removal, and repositioning
      this.isInputActive = false;
      this.optionsContainer.classList.remove('active');

      this.attempts++;

      // 1. Brief pause (150ms)
      setTimeout(() => {
        // 2. Start melting and dissolving animation
        element.classList.add('melting-water');
        
        // Play soft poof sound
        SoundManager.playPoof();

        // Spawn dissolution particles (mist, droplets, sparkles, fragments)
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const particleX = rect.left - containerRect.left + rect.width / 2;
        const particleY = rect.top - containerRect.top + rect.height / 2;
        this.createMeltingParticles(particleX, particleY);

        // 3. When the dissolve animation finishes (500ms after melt starts, 650ms total)
        setTimeout(() => {
          const riverContainer = document.querySelector('.river-ganga-container');
          const riverRect = riverContainer.getBoundingClientRect();
          const splashX = (rect.left + rect.width / 2) - riverRect.left;
          const splashY = (rect.top + rect.height / 2) - riverRect.top + 80;

          // Cinematic splash & low-volume splash audio
          VisualManager.createCinematicSplash(splashX, splashY);
          SoundManager.playSplash();

          // 4. Smoothly slide the remaining elements into their new positions
          this.repositionRemainingOptions(element);

          // 5. Check if we should auto-complete (at 2 attempts)
          if (this.attempts >= 2) {
            // Remove wrong cloud and trigger automatic restoration
            element.remove();
            
            setTimeout(() => {
              this.triggerAutoRestore();
            }, 400); // Small delay to let reposition finish
          } else {
            // Wait for reposition to settle before checking option count / re-enabling input
            setTimeout(() => {
              element.remove(); // Clean up from DOM after it's hidden
              
              // Check if only one option remains (it must be the correct one)
              const remainingOptions = this.optionsContainer.querySelectorAll('.option-container');
              if (remainingOptions.length <= 1) {
                this.triggerAutoRestore();
              } else {
                this.isInputActive = true;
                this.optionsContainer.classList.add('active');
              }
            }, 400);
          }

        }, 500);

      }, 150);
    }
  },

  // Animate the correct cloud from Ganga back to the sentence blank along a curved path
  animateCloudToSentence(element, wordText, callback) {
    const containerRect = this.container.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();
    const blank = document.getElementById('target-blank');
    if (!blank) return;
    const blankRect = blank.getBoundingClientRect();

    // Create flying clone
    const flyer = document.createElement('div');
    flyer.className = 'word-cloud glowing';
    flyer.textContent = wordText;
    flyer.style.position = 'absolute';
    flyer.style.zIndex = '110';
    this.container.appendChild(flyer);

    // Hide original option in the river
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';

    // Bezier control points
    const p0 = { x: elemRect.left - containerRect.left, y: elemRect.top - containerRect.top };
    const p2 = { x: blankRect.left - containerRect.left, y: blankRect.top - containerRect.top };
    
    // Control point P1 is offset upwards to create a natural arching trajectory
    const p1 = {
      x: p0.x + (p2.x - p0.x) * 0.25,
      y: p2.y - 120
    };

    const duration = 1200; // 1.2s smooth glide
    const startTime = performance.now();
    const self = this;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Cubic Ease Out: progress starts fast and decelerates
      const t = 1 - Math.pow(1 - progress, 3);

      // Quadratic Bezier interpolation
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

      flyer.style.left = `${x}px`;
      flyer.style.top = `${y}px`;
      
      // Gentle swell scale along the trajectory
      const scale = 1.0 + Math.sin(t * Math.PI) * 0.15;
      flyer.style.transform = `scale(${scale})`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove flyer on arrival
        flyer.remove();
        
        // Blank cloud enlarges, glows, and reveals original word
        blank.classList.add('locked-arrival', 'glowing');
        blank.textContent = blank.dataset.originalWord || wordText;
        
        // Play chime sound
        SoundManager.playBell();

        if (callback) callback();

        setTimeout(() => {
          blank.classList.remove('locked-arrival');
        }, 1000);
      }
    }

    requestAnimationFrame(animate);
  },

  // Trigger Automatic Restoration after 2 failures or when only the correct option remains
  triggerAutoRestore() {
    this.isInputActive = false;
    this.optionsContainer.classList.remove('active');

    // Find the correct option element still remaining
    let correctElem = null;
    const options = this.optionsContainer.querySelectorAll('.option-container');
    const teaching = TEACHINGS[this.currentTeachingIndex];
    options.forEach(opt => {
      const cloudEl = opt.querySelector('.option-cloud');
      if (cloudEl && cloudEl.textContent.toLowerCase() === teaching.missingWord.toLowerCase()) {
        correctElem = opt;
      }
    });

    const containerRect = this.container.getBoundingClientRect();

    // Make Ganga sparkle
    VisualManager.setRiverSparkle(true);

    setTimeout(() => {
      if (correctElem) {
        correctElem.classList.add('glowing');
        SoundManager.playBell(); // Play success sound

        // Award score according to attempts
        let pointsAwarded = 0;
        if (this.attempts === 0) pointsAwarded = 100;
        else if (this.attempts === 1) pointsAwarded = 75;
        else pointsAwarded = 50;

        this.score += pointsAwarded;
        
        // Sparkle and rise from Ganga along Bezier curve
        this.animateCloudToSentence(correctElem, teaching.missingWord, () => {
          this.updateScoreboard();

          VisualManager.shivaSmile();
          VisualManager.vishnuNod();
          VisualManager.hideVishnuSpeech();

          // Show floating score popup above Shiva
          const shivaRect = document.getElementById('shiva-character').getBoundingClientRect();
          const popupX = (shivaRect.left + shivaRect.width / 2) - containerRect.left;
          const popupY = shivaRect.top - containerRect.top - 40;
          VisualManager.showFloatingScore(pointsAwarded, popupX, popupY);

          // Glow the entire sentence
          const allClouds = this.sentenceContainer.querySelectorAll('.word-cloud');
          allClouds.forEach(c => c.classList.add('glowing'));

          // Bloom a lotus
          VisualManager.bloomLotus(this.currentTeachingIndex);

          setTimeout(() => {
            this.nextTeaching();
          }, 3000);
        });
      }
      
      // Turn off sparkles after 1 second
      setTimeout(() => {
        VisualManager.setRiverSparkle(false);
      }, 1000);
    }, 1500);
  },

  // Advance to the next teaching
  nextTeaching() {
    this.currentTeachingIndex++;
    this.loadTeaching(this.currentTeachingIndex);
  },

  // Transition to Ending Screen
  endGame() {
    this.container.className = 'state-ending';
    if (this.screenEnding) {
      this.screenEnding.classList.remove('hidden');
    }
    this.sentenceContainer.classList.add('hidden');
    this.optionsContainer.innerHTML = '';
    
    // Set visual states
    VisualManager.shivaBless();
    VisualManager.vishnuNamaste();
    VisualManager.focusCameraOnGanga();

    // Display final score
    if (this.finalScoreVal) {
      this.finalScoreVal.textContent = this.score;
    }

    // Bloom the giant lotus in River Ganga
    setTimeout(() => {
      VisualManager.bloomEndingLotus();
    }, 800);
  },

  // Restart the game completely
  restartGame() {
    this.container.className = 'state-opening';
    if (this.screenWelcome) {
      this.screenWelcome.classList.remove('hidden');
    }
    if (this.screenInstructions) {
      this.screenInstructions.classList.add('hidden');
    }
    if (this.screenEnding) {
      this.screenEnding.classList.add('hidden');
    }
    this.currentTeachingIndex = 0;
    this.score = 0;
    this.updateScoreboard();
    
    // Clear in-game instructions
    this.fadeInstructionsOut();
    
    // Reset all visuals
    VisualManager.shivaReset();
    VisualManager.vishnuReset();
    VisualManager.resetCamera();
    VisualManager.resetLotuses();
    VisualManager.resetEndingLotus();
    VisualManager.hideVishnuSpeech();
    
    this.sentenceContainer.innerHTML = '';
    this.optionsContainer.innerHTML = '';
  },

  // Show in-game instruction overlay
  showInGameInstructions() {
    const panel = document.getElementById('game-instructions-panel');
    if (!panel) return;

    clearTimeout(this.instructionTimeout);
    panel.classList.remove('hidden', 'fade-out');
    // Trigger layout paint
    panel.offsetHeight;
    panel.classList.add('show');

    // Automatically fade out after 9 seconds
    this.instructionTimeout = setTimeout(() => {
      this.fadeInstructionsOut();
    }, 9000);

    // Bind close button
    const closeBtn = document.getElementById('btn-close-instructions');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fadeInstructionsOut();
      });
    }
  },

  // Fade out in-game instructions
  fadeInstructionsOut() {
    const panel = document.getElementById('game-instructions-panel');
    if (!panel || !panel.classList.contains('show')) return;

    clearTimeout(this.instructionTimeout);
    panel.classList.remove('show');
    panel.classList.add('fade-out');

    // Add hidden after animation completes (500ms transition)
    setTimeout(() => {
      panel.classList.add('hidden');
    }, 500);
  },

  // Helper: Update scoreboard
  updateScoreboard() {
    if (this.scoreVal) {
      this.scoreVal.textContent = this.score;
    }
  },

  // Create magical melting particle effects
  createMeltingParticles(x, y) {
    const particleCount = 24;
    const parentContainer = this.container;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'melt-particle';
      
      const rand = Math.random();
      if (rand < 0.3) {
        // White mist
        p.style.width = `${10 + Math.random() * 14}px`;
        p.style.height = `${10 + Math.random() * 14}px`;
        p.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        p.style.borderRadius = '50%';
        p.style.filter = 'blur(1.5px)';
      } else if (rand < 0.65) {
        // Blue water droplet
        p.style.width = `${3 + Math.random() * 4}px`;
        p.style.height = `${7 + Math.random() * 7}px`;
        p.style.backgroundColor = 'rgba(72, 202, 228, 0.75)';
        p.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      } else if (rand < 0.85) {
        // Soft gold sparkle
        p.style.width = `${5 + Math.random() * 6}px`;
        p.style.height = `${5 + Math.random() * 6}px`;
        p.style.backgroundColor = '#ffd700';
        p.style.borderRadius = '50%';
        p.style.boxShadow = '0 0 6px #ffd700, 0 0 2px #fff';
      } else {
        // Fading cloud fragment
        p.style.width = `${8 + Math.random() * 10}px`;
        p.style.height = `${6 + Math.random() * 8}px`;
        p.style.backgroundColor = 'rgba(240, 240, 240, 0.7)';
        p.style.borderRadius = '30% 70% 70% 30% / 50% 60% 40% 50%';
      }

      p.style.position = 'absolute';
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.zIndex = '120';
      
      parentContainer.appendChild(p);

      // Math physics simulation: radial velocity + gravity pull
      const angle = Math.random() * Math.PI * 2;
      const velocity = 1.5 + Math.random() * 3.5;
      const dx = Math.cos(angle) * velocity;
      const dy = -0.5 - Math.random() * 2.5; // slight pop upwards first

      const duration = 500 + Math.random() * 600;
      const startTime = performance.now();

      function animateParticle(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing trajectory
        const curX = x + dx * (progress * 12);
        // y_cur = y_start + vy * t + 0.5 * g * t^2
        const curY = y + dy * (progress * 12) + (0.5 * 9.8 * Math.pow(progress * 1.4, 2) * 8);

        p.style.transform = `translate(${curX - x}px, ${curY - y}px) scale(${1 - progress})`;
        p.style.opacity = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animateParticle);
        } else {
          p.remove();
        }
      }

      requestAnimationFrame(animateParticle);
    }
  },

  // Reposition remaining option clouds smoothly using FLIP technique
  repositionRemainingOptions(removedElement) {
    const others = Array.from(this.optionsContainer.querySelectorAll('.option-container')).filter(el => el !== removedElement);
    
    // 1. Record initial positions
    const firstRects = others.map(el => ({
      el,
      rect: el.getBoundingClientRect()
    }));

    // 2. Hide the removed element from the layout flow
    removedElement.style.display = 'none';

    // 3. Measure final positions and animate
    requestAnimationFrame(() => {
      firstRects.forEach(item => {
        const lastRect = item.el.getBoundingClientRect();
        const invertX = item.rect.left - lastRect.left;
        const invertY = item.rect.top - lastRect.top;

        // Apply inverse transform instantly
        item.el.style.transition = 'none';
        item.el.style.transform = `translate(${invertX}px, ${invertY}px)`;

        // Force layout repaint
        item.el.offsetHeight;

        // Smoothly animate back to normal position
        item.el.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
        item.el.style.transform = 'translate(0, 0)';
      });

      // Clean up transitions after animation completes
      setTimeout(() => {
        others.forEach(item => {
          item.el.style.transition = '';
          item.el.style.transform = '';
        });
      }, 850);
    });
  },

  // Helper: Shuffle Array (Fisher-Yates)
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};

// Initialize Game on script load
window.addEventListener('DOMContentLoaded', () => {
  GameManager.init();
});
