// Shiva's Wisdom - Ambient Particle & Silhouette System (Transparent Canvas)
// Senior HTML5 Game Developer Implementation

window.addEventListener('load', () => {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Logical coordinate system matching the game scene dimensions
  canvas.width = 1024;
  canvas.height = 571;

  // State & Timing
  let lastTime = 0;
  let time = 0;

  // Lists
  const fireflies = [];
  const dustParticles = [];
  const petals = [];
  const birds = [];
  const leaves = [];
  const butterflies = [];

  // Spawn Controllers
  let petalSpawnTimer = 0;
  let nextPetalSpawn = Math.random() * 7000 + 8000; // Spawn every 8-15 seconds

  let leafSpawnTimer = 0;
  let nextLeafSpawn = Math.random() * 9000 + 12000;

  let butterflySpawnTimer = 0;
  let nextButterflySpawn = Math.random() * 12000 + 15000;

  let birdSpawnTimer = 0;
  let nextBirdSpawn = Math.random() * 10000 + 20000; // Flock every 20-30 seconds

  // 1. Golden Fireflies (15-20 particles maximum)
  class GoldenFirefly {
    constructor() {
      this.reset(true);
    }
    reset(randomY = false) {
      this.x = Math.random() * 1024;
      this.y = randomY ? Math.random() * 571 : 571 + 10;
      this.size = Math.random() * 1.5 + 1.2; // Small glowing circles
      this.speedY = -(Math.random() * 0.2 + 0.1);
      this.speedX = Math.random() * 0.15 - 0.075;
      this.opacity = 0;
      this.targetOpacity = Math.random() * 0.35 + 0.15;
      this.fadeSpeed = Math.random() * 0.006 + 0.002;
      this.fadingOut = false;
      this.seed = Math.random() * 100;
    }
    update(dt) {
      const scale = dt / 16.67;
      this.y += this.speedY * scale;
      this.x += this.speedX * scale;
      this.speedX += Math.sin(time * 0.002 + this.seed) * 0.004 * scale;
      this.speedX = Math.max(-0.15, Math.min(0.15, this.speedX));

      if (!this.fadingOut) {
        this.opacity += this.fadeSpeed * scale;
        if (this.opacity >= this.targetOpacity) {
          this.opacity = this.targetOpacity;
          if (this.y < 80) this.fadingOut = true;
        }
      } else {
        this.opacity -= this.fadeSpeed * 1.3 * scale;
      }

      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(254, 228, 64, ${this.opacity})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#fee440';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 2. Floating Flower Petals (spawn every 8-15 seconds)
  class FlowerPetal {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = -15; // Spawn off-screen left
      this.y = Math.random() * 200 - 20; // Near tree branches
      this.size = Math.random() * 2.0 + 1.6;
      this.speedX = Math.random() * 0.25 + 0.18;
      this.speedY = Math.random() * 0.1 + 0.05;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = Math.random() * 0.012 - 0.006;
      this.opacity = 0;
      this.targetOpacity = Math.random() * 0.4 + 0.15;
      this.fadingOut = false;
    }
    update(dt) {
      const scale = dt / 16.67;
      this.x += this.speedX * scale;
      this.y += this.speedY * scale;
      this.angle += this.spinSpeed * scale;
      this.y += Math.sin(time * 0.0012 + this.angle) * 0.015 * scale; // Curved drift

      if (!this.fadingOut) {
        this.opacity += 0.015 * scale;
        if (this.opacity >= this.targetOpacity) {
          this.opacity = this.targetOpacity;
          if (this.x > 850 || this.y > 330) this.fadingOut = true;
        }
      } else {
        this.opacity -= 0.01 * scale;
      }

      return (this.x > 1035 || this.y > 395 || this.opacity <= 0);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = `rgba(255, 172, 196, ${this.opacity})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.5, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 3. Tiny Distant Birds (silhouettes across mountain tops)
  class DistantBird {
    constructor(yPos, speed) {
      this.x = -15;
      this.y = yPos;
      this.speed = speed;
      this.scale = Math.random() * 0.35 + 0.45;
      this.wingPhase = Math.random() * 100;
      this.wingSpeed = Math.random() * 0.08 + 0.1;
    }
    update(dt) {
      this.x += this.speed * (dt / 16.67);
      this.wingPhase += this.wingSpeed * (dt / 16.67);
      return (this.x > 1040);
    }
    draw() {
      ctx.save();
      ctx.strokeStyle = 'rgba(74, 85, 104, 0.32)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      // Wave motion representing wing flapping V-silhouette on canvas
      const flap = Math.sin(this.wingPhase) * 1.5 * this.scale;
      ctx.moveTo(this.x - 3 * this.scale, this.y - flap);
      ctx.lineTo(this.x, this.y + 1 * this.scale);
      ctx.lineTo(this.x + 3 * this.scale, this.y - flap);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. Drifting Leaves
  class DriftingLeaf {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * 500 + 524; // Start right side
      this.y = -10; // Top
      this.size = Math.random() * 1.5 + 2;
      this.speedY = Math.random() * 0.15 + 0.1;
      this.speedX = -(Math.random() * 0.2 + 0.1);
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.04 - 0.02;
    }
    update(dt) {
      const scale = dt / 16.67;
      this.x += (this.speedX + Math.sin(time * 0.002 + this.angle) * 0.1) * scale;
      this.y += this.speedY * scale;
      this.angle += this.spin * scale;
      return (this.y > 580 || this.x < -20);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = 'rgba(107, 142, 35, 0.6)'; // Olive green
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4b. Butterflies
  class Butterfly {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = -20;
      this.y = Math.random() * 100 + 400; // Near bottom
      this.size = Math.random() * 1.5 + 1.5;
      this.speedX = Math.random() * 0.1 + 0.05;
      this.wingPhase = 0;
      this.wingSpeed = Math.random() * 0.3 + 0.2;
      this.offset = Math.random() * 100;
    }
    update(dt) {
      const scale = dt / 16.67;
      this.x += this.speedX * scale;
      this.y += Math.sin(time * 0.002 + this.offset) * 0.5 * scale;
      this.wingPhase += this.wingSpeed * scale;
      return (this.x > 1040);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = 'rgba(135, 206, 235, 0.8)'; // Light sky blue
      const flap = Math.abs(Math.sin(this.wingPhase));
      
      // Draw two wings
      ctx.beginPath();
      ctx.ellipse(-this.size, 0, this.size * flap, this.size * 1.2, -0.3, 0, Math.PI*2);
      ctx.ellipse(this.size, 0, this.size * flap, this.size * 1.2, 0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 5. Ambient Dust Particles (very tiny, warm golden, slow floating, very low opacity)
  class AmbientDust {
    constructor() {
      this.reset(true);
    }
    reset(randomY = false) {
      this.x = Math.random() * 1024;
      this.y = randomY ? Math.random() * 571 : 571 + 10;
      this.size = Math.random() * 0.6 + 0.6;
      this.speedY = -(Math.random() * 0.08 + 0.04);
      this.speedX = Math.random() * 0.08 - 0.04;
      this.opacity = Math.random() * 0.12 + 0.03;
      this.seed = Math.random() * 100;
    }
    update(dt) {
      const scale = dt / 16.67;
      this.y += this.speedY * scale;
      this.x += this.speedX * scale;
      this.speedX += Math.sin(time * 0.001 + this.seed) * 0.002 * scale;

      if (this.y < -5) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(254, 228, 64, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize Particle Sets
  const maxFireflies = 18; // 15-20 particles max
  for (let i = 0; i < maxFireflies; i++) {
    fireflies.push(new GoldenFirefly());
  }

  const maxDust = 25;
  for (let i = 0; i < maxDust; i++) {
    dustParticles.push(new AmbientDust());
  }

  // Animation Loop
  requestAnimationFrame(tick);

  function tick(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    time += dt;

    // Clear transparent canvas layer (No background image redrawing!)
    ctx.clearRect(0, 0, 1024, 571);

    // Update & Draw Dust Particles
    dustParticles.forEach(d => {
      d.update(dt);
      d.draw();
    });

    // Update & Draw Fireflies
    fireflies.forEach(f => {
      f.update(dt);
      f.draw();
    });

    // Spawning & Updating Flower Petals
    petalSpawnTimer += dt;
    if (petalSpawnTimer > nextPetalSpawn) {
      petalSpawnTimer = 0;
      nextPetalSpawn = Math.random() * 7000 + 8000;
      if (petals.length < 3) {
        petals.push(new FlowerPetal());
      }
    }

    for (let i = petals.length - 1; i >= 0; i--) {
      const isDead = petals[i].update(dt);
      if (isDead) {
        petals.splice(i, 1);
      } else {
        petals[i].draw();
      }
    }

    // Spawning & Updating Distant Silhouette Birds
    birdSpawnTimer += dt;
    if (birdSpawnTimer > nextBirdSpawn) {
      birdSpawnTimer = 0;
      nextBirdSpawn = Math.random() * 10000 + 20000;
      
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 birds
      const baseHeight = Math.random() * 15 + 10;
      const speed = Math.random() * 0.035 + 0.03;

      for (let j = 0; j < count; j++) {
        setTimeout(() => {
          if (!document.getElementById('ambient-canvas')) return;
          birds.push(new DistantBird(baseHeight + (j * 2) - 2, speed));
        }, j * 350);
      }
    }

    for (let i = birds.length - 1; i >= 0; i--) {
      const isDead = birds[i].update(dt);
      if (isDead) {
        birds.splice(i, 1);
      } else {
        birds[i].draw();
      }
    }

    // Leaves
    leafSpawnTimer += dt;
    if (leafSpawnTimer > nextLeafSpawn) {
      leafSpawnTimer = 0;
      nextLeafSpawn = Math.random() * 9000 + 12000;
      leaves.push(new DriftingLeaf());
    }
    for (let i = leaves.length - 1; i >= 0; i--) {
      if (leaves[i].update(dt)) leaves.splice(i, 1);
      else leaves[i].draw();
    }

    // Butterflies
    butterflySpawnTimer += dt;
    if (butterflySpawnTimer > nextButterflySpawn) {
      butterflySpawnTimer = 0;
      nextButterflySpawn = Math.random() * 12000 + 15000;
      butterflies.push(new Butterfly());
    }
    for (let i = butterflies.length - 1; i >= 0; i--) {
      if (butterflies[i].update(dt)) butterflies.splice(i, 1);
      else butterflies[i].draw();
    }

    requestAnimationFrame(tick);
  }
});
