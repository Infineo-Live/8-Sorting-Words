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

    // Clear any active idle sparkle loops
    if (this.idleSparkleInterval) {
      clearInterval(this.idleSparkleInterval);
      this.idleSparkleInterval = null;
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

  // Step 1: Shiva Speaks (Display sentence with blank placeholder immediately)
  stepShivaSpeaks() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    const words = teaching.sentence.split(' ');
    
    this.sentenceContainer.innerHTML = '';
    this.sentenceContainer.classList.remove('hidden');

    // Create cloud elements for each word, leaving target blank
    const cloudsArray = [];
    words.forEach((word, idx) => {
      const cloud = document.createElement('div');
      cloud.className = 'word-cloud';
      cloud.dataset.index = idx;
      cloud.style.opacity = '0';
      cloud.style.pointerEvents = 'none';
      
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
      cloudsArray.push(cloud);
    });

    // Helper to spawn magical sparkles
    const createSparkles = (x, y, count = 10) => {
      for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'magical-sparkle';
        const size = Math.random() * 8 + 4;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--tx', `${tx}px`);
        sparkle.style.setProperty('--ty', `${ty}px`);
        sparkle.style.animationDelay = `${Math.random() * 80}ms`;
        
        this.sentenceContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 900);
      }
    };

    // Calculate layout coordinates after browser rendering pass
    setTimeout(() => {
      const containerRect = this.sentenceContainer.getBoundingClientRect();
      const cloudRects = cloudsArray.map(c => c.getBoundingClientRect());

      // Timing helper for varied natural speeds (Disney/Pixar style)
      const getDuration = (idx) => {
        if (idx === 0) return 2.4; // First cloud is slow and floaty
        if (idx === 1) return 1.9;
        if (idx === 2) return 1.8;
        if (idx === 3) return 1.7;
        if (idx === 4) return 1.6;
        return 1.5; // Default for subsequent clouds
      };

      // Position First Cloud off-screen to the left using translate3d
      const firstRect = cloudRects[0];
      const firstOffsetX = -firstRect.left - 350; // Off-screen left
      cloudsArray[0].style.setProperty('--first-start-x', `${firstOffsetX}px`);
      cloudsArray[0].style.setProperty('--first-start-y', `0px`);
      cloudsArray[0].style.transform = `translate3d(${firstOffsetX}px, 0px, 0) scale(0.96) rotate(-1.5deg)`;
      cloudsArray[0].style.opacity = '0'; // Keyframe animation handles fade-in

      // Position all subsequent clouds directly behind their previous neighbor using translate3d
      for (let idx = 1; idx < cloudsArray.length; idx++) {
        const prevRect = cloudRects[idx - 1];
        const currRect = cloudRects[idx];

        const prevCenterX = (prevRect.left + prevRect.right) / 2 - containerRect.left;
        const prevCenterY = (prevRect.top + prevRect.bottom) / 2 - containerRect.top;

        const currCenterX = (currRect.left + currRect.right) / 2 - containerRect.left;
        const currCenterY = (currRect.top + currRect.bottom) / 2 - containerRect.top;

        const offsetX = prevCenterX - currCenterX;
        const offsetY = prevCenterY - currCenterY;

        cloudsArray[idx].style.setProperty('--start-x', `${offsetX}px`);
        cloudsArray[idx].style.setProperty('--start-y', `${offsetY}px`);
        cloudsArray[idx].style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(0.95) rotate(-1deg)`;
        cloudsArray[idx].style.opacity = '0';
      }

      // Trigger first cloud float entrance (2.4 seconds)
      setTimeout(() => {
        cloudsArray[0].style.animation = 'firstCloudEntrance 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards';
        cloudsArray[0].style.opacity = '1';

        // Real-time sparkle tracker along its path
        let sparkleInterval = setInterval(() => {
          const rect = cloudsArray[0].getBoundingClientRect();
          const x = (rect.left + rect.right) / 2 - containerRect.left;
          const y = (rect.top + rect.bottom) / 2 - containerRect.top;
          createSparkles(x, y, 2);
        }, 100);
        
        setTimeout(() => clearInterval(sparkleInterval), 2400);
      }, 50);

      // Start sequential reveal after first cloud settles (2.4s)
      setTimeout(() => {
        let idx = 1;
        
        const revealNext = () => {
          if (idx >= cloudsArray.length) {
            // End of reveal: wait for last cloud to settle, then cleanup inline styles and assign desynchronized idle floats
            const lastDuration = getDuration(cloudsArray.length - 1) * 1000;
            setTimeout(() => {
              cloudsArray.forEach((cloud, cIdx) => {
                cloud.style.transform = '';
                cloud.style.transition = '';
                cloud.style.opacity = '';
                // Desynchronized float and breathe animations for every single cloud
                const duration = 5.0 + cIdx * 0.7;
                const delay = cIdx * -0.4;
                cloud.style.animation = `breatheCloud${(cIdx % 4) + 1} ${duration}s ease-in-out infinite alternate ${delay}s, textGlowBreath 3s ease-in-out infinite alternate`;
                cloud.style.pointerEvents = 'auto';
              });

              // Start idle sparkle emitter (emits golden sparks every 4 seconds)
              if (this.idleSparkleInterval) clearInterval(this.idleSparkleInterval);
              this.idleSparkleInterval = setInterval(() => {
                if (!this.sentenceContainer.classList.contains('hidden')) {
                  const activeClouds = Array.from(this.sentenceContainer.querySelectorAll('.word-cloud:not(.blank-placeholder)'));
                  if (activeClouds.length > 0) {
                    const randomCloud = activeClouds[Math.floor(Math.random() * activeClouds.length)];
                    const r = randomCloud.getBoundingClientRect();
                    const pR = this.sentenceContainer.getBoundingClientRect();
                    const sx = (r.left + r.right) / 2 - pR.left;
                    const sy = (r.top + r.bottom) / 2 - pR.top;
                    createSparkles(sx, sy, 3);
                  }
                }
              }, 4000);

              // Transition to Vishnu guides step
              this.stepVishnuGuides();
            }, lastDuration + 100);
            return;
          }

          const prevRect = cloudRects[idx - 1];
          const prevCenterX = (prevRect.left + prevRect.right) / 2 - containerRect.left;
          const prevCenterY = (prevRect.top + prevRect.bottom) / 2 - containerRect.top;

          // Spawn sparkles behind previous cloud as new one emerges
          createSparkles(prevCenterX, prevCenterY, 6);

          const currentCloud = cloudsArray[idx];
          currentCloud.style.opacity = '1';
          const duration = getDuration(idx);
          currentCloud.style.animation = `followingCloudEntrance ${duration}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;

          idx++;
          setTimeout(revealNext, 300); // 300ms stagger delay (between 250-350ms)
        };

        revealNext();
      }, 2500); // Wait 2.5s (2.4s slide + 100ms safety)

    }, 50);
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
      
      // Play soft magical chime
      SoundManager.playCorrectChime();

      // Add success styles and animate
      element.classList.add('correct-success');
      const cloudChild = element.querySelector('.option-cloud');
      if (cloudChild) {
        cloudChild.classList.add('correct-success-cloud');
      }

      // Create a subtle expanding halo behind the cloud
      const halo = document.createElement('div');
      halo.className = 'magical-halo';
      element.appendChild(halo);

      // Burst golden sparkles outward from the cloud center
      const rect = element.getBoundingClientRect();
      const parentRect = this.container.getBoundingClientRect();
      const cx = rect.left - parentRect.left + rect.width / 2;
      const cy = rect.top - parentRect.top + rect.height / 2;
      this.createSuccessSparkles(cx, cy);

      // Award Score based on attempt
      let pointsAwarded = 0;
      if (this.attempts === 0) pointsAwarded = 100;
      else if (this.attempts === 1) pointsAwarded = 75;
      else if (this.attempts >= 2) pointsAwarded = 0;

      this.score += pointsAwarded;

      // Hold success animation for 600ms before moving to sentence
      setTimeout(() => {
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
      }, 650);

    } else {
      // Incorrect behavior: transform to gray storm cloud with vibration and lightning
      this.isInputActive = false;
      this.optionsContainer.classList.remove('active');

      this.attempts++;

      // Play soft thunder rumble
      SoundManager.playThunder();

      // Transform to storm cloud
      element.classList.add('storm-cloud-container');
      const cloudChild = element.querySelector('.option-cloud');
      if (cloudChild) {
        // Create tiny lightning flash inside the cloud
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        cloudChild.appendChild(flash);
      }

      // After 550ms: storm cloud begins dissolving and melting downward
      setTimeout(() => {
        element.classList.remove('storm-cloud-container');
        element.classList.add('melting-water');
        
        // Play soft poof sound
        SoundManager.playPoof();

        // Spawn dissolution particles (mist, droplets, sparks, fragments)
        const rect = element.getBoundingClientRect();
        const parentRect = this.container.getBoundingClientRect();
        const particleX = rect.left - parentRect.left + rect.width / 2;
        const particleY = rect.top - parentRect.top + rect.height / 2;
        this.createMeltingParticles(particleX, particleY);

        // When the dissolve/melting finishes (600ms after melt starts, 1150ms total)
        setTimeout(() => {
          const riverContainer = document.querySelector('.river-ganga-container');
          const riverRect = riverContainer.getBoundingClientRect();
          const splashX = (rect.left + rect.width / 2) - riverRect.left;
          const splashY = (rect.top + rect.height / 2) - riverRect.top + 80;

          // Cinematic splash & low-volume splash audio in Ganga
          VisualManager.createCinematicSplash(splashX, splashY);
          SoundManager.playSplash();

          // Smoothly slide the remaining elements into their new positions
          this.repositionRemainingOptions(element);

          // Check if we should auto-complete (at 2 attempts)
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

        }, 600);

      }, 550);
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
        
        // Blank cloud enlarges, glows, reveals original word, and triggers golden success pulse
        blank.classList.add('locked-arrival', 'glowing', 'filled-success-pulse');
        blank.textContent = blank.dataset.originalWord || wordText;
        
        // Play chime sound
        SoundManager.playBell();

        if (callback) callback();

        setTimeout(() => {
          blank.classList.remove('locked-arrival', 'filled-success-pulse');
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

    // Clear any active idle sparkle loops
    if (this.idleSparkleInterval) {
      clearInterval(this.idleSparkleInterval);
      this.idleSparkleInterval = null;
    }
    
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

  // Create magical melting particle effects (updated for storm cloud grey-purple shades)
  createMeltingParticles(x, y) {
    const particleCount = 28;
    const parentContainer = this.container;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'melt-particle';
      
      const rand = Math.random();
      if (rand < 0.35) {
        // Dark blue-grey storm mist
        p.style.width = `${10 + Math.random() * 14}px`;
        p.style.height = `${10 + Math.random() * 14}px`;
        p.style.backgroundColor = 'rgba(75, 85, 110, 0.65)';
        p.style.borderRadius = '50%';
        p.style.filter = 'blur(1.5px)';
      } else if (rand < 0.68) {
        // Blue-purple water droplets
        p.style.width = `${3 + Math.random() * 4}px`;
        p.style.height = `${7 + Math.random() * 7}px`;
        p.style.backgroundColor = 'rgba(100, 110, 180, 0.75)';
        p.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      } else if (rand < 0.85) {
        // Tiny lightning spark
        p.style.width = `${4 + Math.random() * 5}px`;
        p.style.height = `${4 + Math.random() * 5}px`;
        p.style.backgroundColor = '#a2d2ff';
        p.style.borderRadius = '50%';
        p.style.boxShadow = '0 0 6px #a2d2ff, 0 0 2px #fff';
      } else {
        // Grey storm cloud fragments
        p.style.width = `${8 + Math.random() * 10}px`;
        p.style.height = `${6 + Math.random() * 8}px`;
        p.style.backgroundColor = 'rgba(90, 90, 95, 0.6)';
        p.style.borderRadius = '30% 70% 70% 30% / 50% 60% 40% 50%';
      }

      p.style.position = 'absolute';
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.zIndex = '120';
      p.style.willChange = 'transform, opacity';
      
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
        const curY = y + dy * (progress * 12) + (0.5 * 9.8 * Math.pow(progress * 1.4, 2) * 8);

        p.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0) scale(${1 - progress})`;
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

  // Success Sparkles Burst (spawns 20 high-velocity bright golden sparkles)
  createSuccessSparkles(x, y) {
    const parentContainer = this.container;
    for (let i = 0; i < 22; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'magical-sparkle success-sparkle';
      const size = Math.random() * 10 + 6;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      sparkle.style.willChange = 'transform, opacity';
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      sparkle.style.setProperty('--tx', `${tx}px`);
      sparkle.style.setProperty('--ty', `${ty}px`);
      
      parentContainer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 900);
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
