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
  finalScoreVal: document.getElementById('final-score-num'),
  
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
    this.updateScoreboard();
    VisualManager.resetJourney();
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
    const cloudClasses = ['cloud_1', 'cloud_2', 'cloud_3', 'cloud_4'];
    words.forEach((word, idx) => {
      const cloud = document.createElement('div');
      // Use the special cloud for the first word (index 0)
      const bgClass = idx === 0 ? 'cloud_first' : cloudClasses[idx % cloudClasses.length];
      cloud.className = `word-cloud ${bgClass}`;
      cloud.dataset.index = idx;
      cloud.style.opacity = '0';
      cloud.style.pointerEvents = 'none';
      cloud.style.zIndex = words.length - idx; // First word is highest to hide subsequent clouds
      cloud.style.setProperty('--delay', `${idx * 0.3}s`); // 300ms staggering
      
      const textSpan = document.createElement('span');
      textSpan.className = 'cloud-text';
      
      const cleaned = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      
      if (cleaned === teaching.missingWord.toLowerCase()) {
        // Target blank placeholder (empty text but maintains cloud shape)
        cloud.id = 'target-blank';
        cloud.classList.add('target-word', 'blank-placeholder');
        textSpan.textContent = ''; 
        cloud.dataset.originalWord = word; // Store original word (with punctuation)
      } else {
        textSpan.textContent = word;
      }
      
      cloud.appendChild(textSpan);
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

    // Apply staggered CSS animation delay for a cascading reveal effect
    cloudsArray.forEach((cloud, cIdx) => {
      // 80ms to 120ms delay is ideal; 100ms looks natural.
      cloud.style.animation = `wordReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
      cloud.style.animationDelay = `${cIdx * 0.1}s`;
    });

    // Total reveal time = (words * 0.1s delay) + 0.6s animation duration
    const totalRevealTime = (cloudsArray.length * 100) + 600;

    // Transition to Vishnu guides step after the full sentence is gracefully revealed
    setTimeout(() => {
      cloudsArray.forEach((cloud, cIdx) => {
        // Clear initial styles to hand off to CSS idle states
        cloud.style.opacity = '';
        cloud.style.transform = '';
        
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

      this.stepVishnuGuides();
    }, totalRevealTime + 100);
  },

  // Step 2: (Bypassed) Word Falls is no longer used, kept as empty stub
  stepWordFalls() {},

  // Step 3: Vishnu Guides (Contemplating gesture, camera focus, narration)
  stepVishnuGuides() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    
    // Prepare Vishnu behavior
    VisualManager.vishnuContemplate();
    VisualManager.focusCameraOnGanga();

    // Wait a brief 200ms pause before revealing options gracefully
    setTimeout(() => {
      this.stepPlayerRestores();
    }, 200);
  },

  // Step 4: Player Restores Wisdom (Options float in Ganga)
  stepPlayerRestores() {
    const teaching = TEACHINGS[this.currentTeachingIndex];
    
    // Shuffle options
    const shuffledOptions = this.shuffleArray([...teaching.options]);
    this.optionsContainer.innerHTML = '';

    shuffledOptions.forEach((optText, idx) => {
      // Create the OptionContainer wrapper
      const container = document.createElement('div');
      container.className = 'option-container';
      
      // Apply staggered CSS entry animation
      container.style.opacity = '0';
      container.style.animation = 'optionReveal 1.2s ease-out forwards';
      container.style.animationDelay = `${idx * 0.12}s`;
      
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

    // Make options clickable after the animation settles
    const totalOptionRevealTime = (shuffledOptions.length * 120) + 1200;
    setTimeout(() => {
      Array.from(this.optionsContainer.children).forEach(child => {
        child.style.opacity = '';
        child.style.animation = '';
        child.style.animationDelay = '';
      });
      this.optionsContainer.classList.add('active');
      this.isInputActive = true;
    }, totalOptionRevealTime + 100);
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

          // Show encouraging feedback
          const encouragements = ["Wonderful!", "Excellent!", "Great Thinking!", "Shiva Smiles!", "You Chose Wisely!", "Amazing!", "Keep Learning!", "Brilliant!"];
          const encMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
          this.showFeedbackMessage(encMsg, 'success');

          // Show explanation
          if (teaching.explanation) {
            this.showExplanation(teaching.explanation);
          }

          // Advance journey
          VisualManager.advanceJourney(this.currentTeachingIndex);

          // Wait briefly, play narration, then advance
          setTimeout(() => {
            SoundManager.playNarration(teaching.audio, () => {
              // Wait about 800ms after narration finishes before advancing
              setTimeout(() => {
                this.hideFeedbackMessage();
                this.hideExplanation();
                this.nextTeaching();
              }, 800);
            });
          }, 400); // 400ms delay before narration
        });
      }, 650);

    } else {
      // Incorrect behavior: transform to gray storm cloud with vibration and lightning
      this.isInputActive = false;
      this.optionsContainer.classList.remove('active');

      this.attempts++;

      // Play soft poof sound instead of thunder
      SoundManager.playPoof();

      // Transform to storm cloud
      element.classList.add('storm-cloud-container');
      const cloudChild = element.querySelector('.option-cloud');
      if (cloudChild) {
        // Create tiny lightning flash inside the cloud
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        cloudChild.appendChild(flash);
      }

      // Show gentle supportive feedback
      const gentleMsgs = ["Let's Try Again", "Think Carefully", "Almost There", "Wisdom Grows With Practice"];
      const gMsg = gentleMsgs[Math.floor(Math.random() * gentleMsgs.length)];
      this.showFeedbackMessage(gMsg, 'gentle');

      // After 550ms: storm cloud begins dissolving and melting downward
      setTimeout(() => {
        this.hideFeedbackMessage();
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
        const textSpan = blank.querySelector('.cloud-text');
        if (textSpan) textSpan.textContent = blank.dataset.originalWord || wordText;
        else blank.textContent = blank.dataset.originalWord || wordText;
        
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

          // Show encouraging feedback
          const encouragements = ["Wonderful!", "Excellent!", "Great Thinking!", "Shiva Smiles!", "You Chose Wisely!", "Amazing!", "Keep Learning!", "Brilliant!"];
          const encMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
          this.showFeedbackMessage(encMsg, 'success');

          if (teaching.explanation) {
            this.showExplanation(teaching.explanation);
          }

          // Advance journey
          VisualManager.advanceJourney(this.currentTeachingIndex);

          setTimeout(() => {
            SoundManager.playNarration(teaching.audio, () => {
              setTimeout(() => {
                this.hideFeedbackMessage();
                this.hideExplanation();
                this.nextTeaching();
              }, 800);
            });
          }, 400);
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
    
    // Log image path and attach error handler
    const victoryImg = document.getElementById('wisdom-restored-img');
    if (victoryImg) {
      console.log('Loading Victory Image:', victoryImg.src);
      victoryImg.onerror = () => {
        console.error('Failed to load the wisdom restored PNG at', victoryImg.src);
      };
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

    // Generate Wisdom list
    this.generateWisdomList();

    // Display final score
    if (this.finalScoreVal) {
      this.finalScoreVal.textContent = this.score;
    }

    // Audio Sequence: Stop music, play chime, then optionally play narration
    SoundManager.stopMusic();
    SoundManager.playSound('chime'); // Assuming there's a chime sound

    // Trigger visual celebration effects
    if (typeof VisualManager.spawnCelebrationEffects === 'function') {
      VisualManager.spawnCelebrationEffects();
    }

    // Show buttons after 2 seconds
    setTimeout(() => {
      const btns = document.getElementById('ending-buttons');
      if (btns) btns.classList.remove('hidden');
    }, 2000);

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
    VisualManager.resetJourney();
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

  // UI Feedback Overlay Helpers
  showFeedbackMessage(text, type) {
    const box = document.getElementById('feedback-message');
    const textEl = document.getElementById('feedback-text');
    if (box && textEl) {
      box.className = `feedback-message ${type}`;
      textEl.textContent = text;
      box.classList.remove('hidden');
      // Trigger reflow
      void box.offsetWidth;
      box.classList.add('show');
    }
  },

  hideFeedbackMessage() {
    const box = document.getElementById('feedback-message');
    if (box) {
      box.classList.remove('show');
      setTimeout(() => box.classList.add('hidden'), 500);
    }
  },

  showExplanation(text) {
    const box = document.getElementById('explanation-box');
    const textEl = document.getElementById('explanation-text');
    if (box && textEl) {
      textEl.textContent = text;
      box.classList.remove('hidden');
      void box.offsetWidth;
      box.classList.add('show');
    }
  },

  hideExplanation() {
    const box = document.getElementById('explanation-box');
    if (box) {
      box.classList.remove('show');
      setTimeout(() => box.classList.add('hidden'), 500);
    }
  },

  // Helper: Generate Today's Wisdom List for Ending Screen
  generateWisdomList() {
    const listContainer = document.getElementById('todays-wisdom-list');
    if (!listContainer) return;
    
    // Clear old items except title
    const title = listContainer.querySelector('.todays-wisdom-title');
    listContainer.innerHTML = '';
    if (title) listContainer.appendChild(title);

    TEACHINGS.forEach(t => {
      const item = document.createElement('div');
      item.className = 'wisdom-item';
      
      const sentence = document.createElement('div');
      sentence.className = 'wisdom-sentence';
      // Replace missing word with actual word correctly capitalized
      const finalWord = t.missingWord.charAt(0).toUpperCase() + t.missingWord.slice(1);
      // For simplicity, just use the original sentence (since it's already full)
      sentence.textContent = t.sentence;

      const explanation = document.createElement('div');
      explanation.className = 'wisdom-explanation';
      explanation.textContent = t.explanation;

      item.appendChild(sentence);
      item.appendChild(explanation);
      listContainer.appendChild(item);
    });
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
