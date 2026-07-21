// Shiva's Wisdom - Landing Screen Visual Effects (Fireflies, Birds, Dust, Logo Sparkles)
(function() {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('welcome-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tabVisible = true;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Track tab focus to pause animations when tab is inactive
    document.addEventListener('visibilitychange', () => {
      tabVisible = !document.hidden;
    });

    // Resize canvas dynamically to match container size
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas.parentElement || document.body);
    resizeCanvas();

    // Particle Collections
    const fireflies = [];
    const birds = [];
    const dustParticles = [];
    const lakeEmbers = [];
    const lakeEmbers = [];
    const clickSparkles = [];

    const playBtn = document.getElementById('btn-begin-wisdom');
    if (playBtn) {
      // Emit a ring of golden stars when Play is clicked
      playBtn.addEventListener('click', (e) => {
        const rect = playBtn.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const cx = (rect.left + rect.width / 2) - canvasRect.left;
        const cy = (rect.top + rect.height / 2) - canvasRect.top;
        
        // Spawn 32 star sparkles radiating in a circle
        for (let i = 0; i < 32; i++) {
          clickSparkles.push(new ClickSparkle(cx, cy));
        }
      });
    }

    // Helper: Draw a 4-pointed golden star
    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle, opacity) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius)
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#fee440';
      ctx.fill();
      ctx.restore();
    }

    // 1. Tiny Glowing Fireflies (slow random movement, low opacity, natural twinkle)
    class Firefly {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 15;
        this.size = Math.random() * 1.8 + 0.8;
        this.speedY = -(Math.random() * 0.18 + 0.08); // very slow drift up
        this.speedX = Math.random() * 0.1 - 0.05;
        this.maxOpacity = Math.random() * 0.35 + 0.15; // low opacity
        this.opacity = init ? Math.random() * this.maxOpacity : 0;
        this.fadeSpeed = 0.002 + Math.random() * 0.002;
        this.fadingIn = true;
        this.seed = Math.random() * 100;
        this.wobbleSpeed = 0.005 + Math.random() * 0.004;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(Date.now() * this.wobbleSpeed + this.seed) * 0.08;

        if (this.fadingIn) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= this.maxOpacity) {
            this.opacity = this.maxOpacity;
            this.fadingIn = false;
          }
        }

        // Slow fade near top boundary
        if (this.y < canvas.height * 0.1) {
          this.opacity -= this.fadeSpeed * 1.5;
        }

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.fillStyle = `rgba(254, 228, 64, ${this.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fee440';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. Flying Birds (Occasional, slow flight, V-shape)
    class FlyingBird {
      constructor() {
        this.reset();
        // Stagger spawn times
        this.x = -50 - Math.random() * 800;
      }

      reset() {
        this.x = -50;
        this.y = Math.random() * (canvas.height * 0.22) + 50;
        this.speedX = Math.random() * 0.35 + 0.25; // fly slowly
        this.speedY = Math.random() * 0.08 - 0.04;
        this.scale = Math.random() * 0.4 + 0.3; // tiny size
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingSpeed = 0.06 + Math.random() * 0.03;
        
        this.isCircling = false;
        this.circleAngle = 0;
        this.circleSpeed = 0.01;
        this.circleRadius = Math.random() * 30 + 20;
        this.circleCenterX = 0;
        this.circleCenterY = 0;
        
        this.willCircle = Math.random() < 0.2; // 20% circle chance
        this.circleTriggerX = canvas.width * (Math.random() * 0.3 + 0.35);
        this.hasCircled = false;
      }

      update() {
        this.wingPhase += this.wingSpeed;

        if (this.willCircle && !this.hasCircled && this.x >= this.circleTriggerX) {
          this.isCircling = true;
          this.circleCenterX = this.x;
          this.circleCenterY = this.y;
          this.hasCircled = true;
        }

        if (this.isCircling) {
          this.circleAngle += this.circleSpeed;
          this.x = this.circleCenterX + Math.cos(this.circleAngle) * this.circleRadius;
          this.y = this.circleCenterY + Math.sin(this.circleAngle) * this.circleRadius;
          
          if (this.circleAngle >= Math.PI * 2) {
            this.isCircling = false;
          }
        } else {
          this.x += this.speedX;
          this.y += this.speedY;
        }

        if (this.x > canvas.width + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.strokeStyle = 'rgba(74, 52, 35, 0.4)';
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const flap = Math.sin(this.wingPhase) * 3 * this.scale;
        
        ctx.beginPath();
        ctx.moveTo(this.x - 5 * this.scale, this.y - flap);
        ctx.quadraticCurveTo(this.x - 2 * this.scale, this.y - 1.5 * this.scale, this.x, this.y);
        ctx.quadraticCurveTo(this.x + 2 * this.scale, this.y - 1.5 * this.scale, this.x + 5 * this.scale, this.y - flap);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Floating Dust / Light Particles (subtle, illuminated in sky)
    class DustParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * (canvas.height * 0.5) : canvas.height * 0.5;
        this.size = Math.random() * 0.7 + 0.3;
        this.speedY = -(Math.random() * 0.15 + 0.05); // slow float
        this.speedX = Math.random() * 0.06 - 0.03;
        this.maxOpacity = Math.random() * 0.2 + 0.05;
        this.opacity = init ? Math.random() * this.maxOpacity : 0;
        this.fadeSpeed = 0.003 + Math.random() * 0.002;
        this.fadingIn = true;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (this.fadingIn) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= this.maxOpacity) {
            this.opacity = this.maxOpacity;
            this.fadingIn = false;
          }
        }

        if (this.y < 20 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 240, 200, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 3.5. Drifting Lake Embers (slow horizontal drift over lake area)
    class LakeEmber {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        // lake area is bottom 60% to 95% of screen height
        this.y = canvas.height * (0.6 + Math.random() * 0.35);
        this.size = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 0.12 + 0.04; // slow horizontal drift right
        this.speedY = Math.random() * 0.04 - 0.02; // very slight vertical drift
        this.maxOpacity = Math.random() * 0.25 + 0.1;
        this.opacity = init ? Math.random() * this.maxOpacity : 0;
        this.fadeSpeed = 0.001 + Math.random() * 0.002;
        this.fadingIn = true;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.fadingIn) {
          this.opacity += this.fadeSpeed;
          if (this.opacity >= this.maxOpacity) {
            this.opacity = this.maxOpacity;
            this.fadingIn = false;
          }
        } else {
          this.opacity -= this.fadeSpeed * 0.5;
        }

        if (this.x > canvas.width + 10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.fillStyle = `rgba(254, 180, 64, ${this.opacity})`; // Warm golden orange
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#fee440';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Removed LogoSparkle class

    // 5. Exploding Click Sparkles (emitted on PLAY click)
    class ClickSparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.size = Math.random() * 4.5 + 2.0;
        this.maxSize = this.size;
        this.color = '#fee440';
        this.opacity = 1;
        this.decay = 0.015 + Math.random() * 0.015;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.95;
        this.speedY *= 0.95;
        this.opacity -= this.decay;
        this.size = this.maxSize * this.opacity;
        return (this.opacity <= 0);
      }

      draw() {
        drawStar(ctx, this.x, this.y, 4, this.size, this.size * 0.25, this.color, this.opacity);
      }
    }

    // Create Initial Particles
    if (!prefersReducedMotion) {
      // Fireflies
      for (let i = 0; i < 15; i++) fireflies.push(new Firefly());
      // Sky birds
      for (let i = 0; i < 3; i++) birds.push(new FlyingBird());
      // Floating dust
      for (let i = 0; i < 15; i++) dustParticles.push(new DustParticle());
      // Lake embers
      for (let i = 0; i < 10; i++) lakeEmbers.push(new LakeEmber());
    }

    // Render loop running at 60 FPS
    function loop() {
      const parent = document.getElementById('screen-welcome');
      const isWelcomeScreenActive = parent && !parent.classList.contains('hidden');

      if (tabVisible && isWelcomeScreenActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!prefersReducedMotion) {
          // Update & Draw Fireflies
          fireflies.forEach(f => {
            f.update();
            f.draw();
          });

          // Update & Draw Sky Birds
          birds.forEach(b => {
            b.update();
            b.draw();
          });

          // Update & Draw Floating Dust
          dustParticles.forEach(d => {
            d.update();
            d.draw();
          });

          // Update & Draw Lake Embers
          lakeEmbers.forEach(e => {
            e.update();
            e.draw();
          });
        }

        // Update & Draw Click Sparkles (Always run on click, ignoring prefers-reduced-motion)
        for (let i = clickSparkles.length - 1; i >= 0; i--) {
          const isDead = clickSparkles[i].update();
          if (isDead) {
            clickSparkles.splice(i, 1);
          } else {
            clickSparkles[i].draw();
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
  });
})();
