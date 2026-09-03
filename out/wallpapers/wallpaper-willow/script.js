/**
 * Willow Particle Core - Interactive Web Wallpaper for Wallpaper Engine
 * Features: Hard-Hitting Peak Bass Shockwave Explosions!
 * Heavy bass drops trigger a transient sonic impact blast that explodes the word's shapes
 * across space, which then make a slow, majestic journey floating back home!
 */

(function () {
  'use strict';

  // --- Configuration Defaults ---
  const config = {
    text: "willow",
    primaryColor: "#06b6d4",
    accentColor: "#a855f7",
    shapeStyle: "all",           // "all", "circles", "squares", "polygons"
    particleStep: 5,             // Grid sampling step
    maxParticles: 900,           // Clean typography density
    particleSizeMultiplier: 0.9, // Uniform, crisp particle size
    repulsionRadius: 220,        // Mouse interaction range (px)
    repulsionRadiusSq: 220 * 220,
    repulsionForce: 28,          // Mouse blast force
    audioSensitivity: 1.5,       // Audio reactivity multiplier
    bassBlastThreshold: 0.55,    // Peak bass threshold required to trigger explosive shockwave
    formationMode: "repel_return", // Formed text, glides across screen, slow journey home
    glowIntensity: 0.8,          // Bloom glow intensity
    showAura: true,              // Core energy aura behind typography
    spring: 0.012,               // Slow floaty return
    friction: 0.96,              // High momentum gliding physics
    dpr: Math.min(window.devicePixelRatio || 1, 1.5)
  };

  // State
  let audioData = new Array(64).fill(0);
  let bassLevel = 0;
  let lastBassLevel = 0;
  let midLevel = 0;
  let trebleLevel = 0;
  let lastShockwaveTime = 0;
  let shockwaveFlash = 0;
  let mouse = { x: -1000, y: -1000, active: false };
  let isWE = false;

  // Canvases
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d', { alpha: false });
  const mainCanvas = document.getElementById('particle-canvas');
  const mainCtx = mainCanvas.getContext('2d');

  // Collections
  let particles = [];
  let stars = [];
  let textMetrics = { textX: 0, textY: 0, width: 0, height: 0 };
  let textBounds = { x: 0, y: 0, w: 0, h: 0 };

  // --- Sprite Pre-rendering Cache ---
  const spriteCache = {};

  function parseColor(val) {
    if (!val) return config.primaryColor;
    if (typeof val === 'string') {
      const parts = val.trim().split(/\s+/);
      if (parts.length >= 3 && !isNaN(parts[0]) && !val.startsWith('#') && !val.startsWith('rgb')) {
        const r = Math.round(parseFloat(parts[0]) * 255);
        const g = Math.round(parseFloat(parts[1]) * 255);
        const b = Math.round(parseFloat(parts[2]) * 255);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return val;
    }
    return config.primaryColor;
  }

  function getParticleSprite(shape, color, size, alpha) {
    const roundedSize = Math.max(1.8, Math.round(size * 2) / 2);
    const roundedAlpha = Math.max(0.1, Math.round(alpha * 10) / 10);
    const key = `${shape}_${color}_${roundedSize}_${roundedAlpha}`;
    if (spriteCache[key]) return spriteCache[key];

    const canvas = document.createElement('canvas');
    const d = Math.ceil(roundedSize * 2) + 6;
    canvas.width = d;
    canvas.height = d;
    const ctx = canvas.getContext('2d');
    const center = d / 2;

    ctx.globalAlpha = roundedAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();

    if (shape === 'square') {
      ctx.fillRect(center - roundedSize / 2, center - roundedSize / 2, roundedSize, roundedSize);
    } else if (shape === 'circle') {
      ctx.arc(center, center, roundedSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'triangle') {
      ctx.moveTo(center, center - roundedSize * 0.8);
      ctx.lineTo(center - roundedSize * 0.8, center + roundedSize * 0.8);
      ctx.lineTo(center + roundedSize * 0.8, center + roundedSize * 0.8);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'diamond') {
      ctx.moveTo(center, center - roundedSize * 0.9);
      ctx.lineTo(center + roundedSize * 0.9, center);
      ctx.lineTo(center, center + roundedSize * 0.9);
      ctx.lineTo(center - roundedSize * 0.9, center);
      ctx.closePath();
      ctx.fill();
    }

    spriteCache[key] = canvas;
    return canvas;
  }

  function clearSpriteCache() {
    for (let k in spriteCache) delete spriteCache[k];
  }

  // --- Background Starfield ---
  class BackgroundStar {
    constructor(w, h) {
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.4;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.08;
      this.speedY = (Math.random() - 0.5) * 0.08;
    }

    update(w, h) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    }
  }

  function initStarfield(w, h) {
    stars = [];
    const count = Math.min(260, Math.floor((w * h) / 11000));
    for (let i = 0; i < count; i++) {
      stars.push(new BackgroundStar(w, h));
    }
  }

  function drawBackground(w, h) {
    const pulseRadius = Math.max(w, h) * (0.85 + bassLevel * 0.12 * config.audioSensitivity);
    const bgGradient = bgCtx.createRadialGradient(
      w / 2 + (mouse.x - w / 2) * 0.02,
      h / 2 + (mouse.y - h / 2) * 0.02,
      20,
      w / 2,
      h / 2,
      pulseRadius
    );
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#090d16');
    bgGradient.addColorStop(1, '#04060a');

    bgCtx.fillStyle = bgGradient;
    bgCtx.fillRect(0, 0, w, h);

    if (config.showAura && textMetrics.width > 0) {
      const auraRadius = Math.max(textMetrics.width * 0.7, 200) * (1 + (bassLevel + shockwaveFlash * 0.5) * 0.25 * config.audioSensitivity);
      const auraGradient = bgCtx.createRadialGradient(
        textMetrics.textX,
        textMetrics.textY,
        10,
        textMetrics.textX,
        textMetrics.textY,
        auraRadius
      );

      const auraAlpha = (0.06 + (bassLevel + shockwaveFlash * 0.8) * 0.1 * config.audioSensitivity).toFixed(3);
      auraGradient.addColorStop(0, config.primaryColor);
      auraGradient.addColorStop(0.6, config.accentColor);
      auraGradient.addColorStop(1, 'transparent');

      bgCtx.globalAlpha = Math.min(0.6, parseFloat(auraAlpha));
      bgCtx.fillStyle = auraGradient;
      bgCtx.beginPath();
      bgCtx.arc(textMetrics.textX, textMetrics.textY, auraRadius, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.globalAlpha = 1.0;
    }

    const starAlpha = Math.min(0.85, 0.4 + bassLevel * 0.25 + trebleLevel * 0.2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${starAlpha.toFixed(2)})`;
    bgCtx.beginPath();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.update(w, h);
      const dynamicSize = s.size * (1 + trebleLevel * 0.3 * config.audioSensitivity);
      bgCtx.moveTo(s.x + dynamicSize, s.y);
      bgCtx.arc(s.x, s.y, dynamicSize, 0, Math.PI * 2);
    }
    bgCtx.fill();
  }

  // --- Main Particle Class ---
  class Particle {
    constructor(targetX, targetY, shape, bounds, responsiveBaseSize) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.shape = shape;

      this.x = targetX + (Math.random() - 0.5) * 20;
      this.y = targetY + (Math.random() - 0.5) * 20;

      this.vx = 0;
      this.vy = 0;
      this.baseSize = (Math.random() * 0.3 + 0.85) * responsiveBaseSize;
      this.size = this.baseSize;
      this.useAccent = Math.random() < 0.22;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.015;
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatSpeed = Math.random() * 0.008 + 0.003;
    }

    update(now) {
      this.floatPhase += this.floatSpeed;
      const floatX = Math.sin(this.floatPhase) * 1.0;
      const floatY = Math.cos(this.floatPhase * 0.8) * 1.0;

      // Whole-Word Gentle Beat Thump
      let bassOffsetX = 0;
      let bassOffsetY = 0;

      if (bassLevel > 0.15 && config.audioSensitivity > 0) {
        bassOffsetY = -bassLevel * 4.0 * config.audioSensitivity;
        bassOffsetX = (Math.random() - 0.5) * bassLevel * 2.5 * config.audioSensitivity;
      }

      let destX = this.targetX + floatX + bassOffsetX;
      let destY = this.targetY + floatY + bassOffsetY;

      // Mouse impulse pushing shapes across the screen
      if (mouse.active && config.formationMode !== 'static') {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < config.repulsionRadiusSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / config.repulsionRadius) * config.repulsionForce;
          const invDist = 1 / dist;
          this.vx += dx * invDist * force;
          this.vy += dy * invDist * force;
        }
      }

      // Micro treble shimmer
      if (trebleLevel > 0.25 && config.audioSensitivity > 0) {
        this.vx += (Math.random() - 0.5) * trebleLevel * 0.8 * config.audioSensitivity;
        this.vy += (Math.random() - 0.5) * trebleLevel * 0.8 * config.audioSensitivity;
      }

      // Slow floaty return physics
      this.vx += (destX - this.x) * config.spring;
      this.vy += (destY - this.y) * config.spring;
      this.vx *= config.friction;
      this.vy *= config.friction;

      this.x += this.vx;
      this.y += this.vy;

      this.rotation += this.rotSpeed + midLevel * 0.02 * config.audioSensitivity;
      this.size = this.baseSize * (1 + bassLevel * 0.35 * config.audioSensitivity);
    }

    draw(ctx) {
      const color = (this.useAccent || trebleLevel > 0.4 || shockwaveFlash > 0.3) ? config.accentColor : config.primaryColor;
      const alpha = Math.min(1.0, 0.90 + bassLevel * 0.1);
      const sprite = getParticleSprite(this.shape, color, this.size, alpha);
      const halfSize = sprite.width / 2;

      if (this.shape === 'circle' || this.shape === 'square') {
        ctx.drawImage(sprite, this.x - halfSize, this.y - halfSize);
      } else {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, -halfSize, -halfSize);
        ctx.restore();
      }
    }
  }

  // --- Hard Bass Peak Impact Shockwave Trigger ---
  function checkBassShockwave(now) {
    if (config.audioSensitivity <= 0) return;

    // Detect sharp bass kick drops / impact peaks
    const deltaBass = bassLevel - lastBassLevel;
    const isPeakDrop = (deltaBass > 0.28 || bassLevel > config.bassBlastThreshold);

    if (isPeakDrop && (now - lastShockwaveTime > 300)) {
      lastShockwaveTime = now;
      shockwaveFlash = 1.0;

      // Blast power scaled by bass intensity
      const blastPower = Math.min(32, bassLevel * 18 * config.audioSensitivity);

      // Trigger transient sonic explosion from center of word!
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - textMetrics.textX;
        const dy = p.y - textMetrics.textY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Radial explosion force vector
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Angle jitter for dynamic scattering
        const angleJitter = (Math.random() - 0.5) * 0.5;
        const cosJ = Math.cos(angleJitter);
        const sinJ = Math.sin(angleJitter);

        const vx = (dirX * cosJ - dirY * sinJ) * blastPower * (0.6 + Math.random() * 0.8);
        const vy = (dirX * sinJ + dirY * cosJ) * blastPower * (0.6 + Math.random() * 0.8);

        p.vx += vx;
        p.vy += vy;
      }
    }

    lastBassLevel = bassLevel;
    if (shockwaveFlash > 0) {
      shockwaveFlash *= 0.90; // Decay flash glow
    }
  }

  // --- Off-Screen Canvas Text Sampler ---
  function sampleTextCoordinates(width, height) {
    const rawParticles = [];

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    let fontSize = Math.min(width * 0.15, height * 0.32);
    if (fontSize < 36) fontSize = 36;

    const responsiveBaseSize = Math.max(2.2, (fontSize / 45) * config.particleSizeMultiplier * 1.1);

    tempCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';

    textMetrics.textX = width / 2;
    textMetrics.textY = height / 2;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillText(config.text, textMetrics.textX, textMetrics.textY);

    const metrics = tempCtx.measureText(config.text);
    textMetrics.width = metrics.width;
    textMetrics.height = fontSize;

    const boxMargin = 80;

    textBounds = {
      x: textMetrics.textX - textMetrics.width / 2 - boxMargin,
      y: textMetrics.textY - fontSize / 2 - boxMargin,
      w: textMetrics.width + boxMargin * 2,
      h: fontSize + boxMargin * 2
    };

    const imgData = tempCtx.getImageData(0, 0, width, height).data;

    let availableShapes = ['square', 'circle', 'triangle', 'diamond'];
    if (config.shapeStyle === 'circles') availableShapes = ['circle'];
    else if (config.shapeStyle === 'squares') availableShapes = ['square'];
    else if (config.shapeStyle === 'polygons') availableShapes = ['triangle', 'diamond'];

    const step = Math.max(3, Math.floor(config.particleStep));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        if (imgData[index + 3] > 128) {
          const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
          rawParticles.push(new Particle(x, y, shape, textBounds, responsiveBaseSize));
        }
      }
    }

    const screenPixels = width * height;
    const adaptiveCap = Math.min(1500, Math.max(config.maxParticles, Math.floor(screenPixels / 3000)));

    if (rawParticles.length > adaptiveCap) {
      particles = [];
      const ratio = rawParticles.length / adaptiveCap;
      for (let i = 0; i < adaptiveCap; i++) {
        const idx = Math.floor(i * ratio);
        particles.push(rawParticles[idx]);
      }
    } else {
      particles = rawParticles;
    }
  }

  // --- Resize Handling ---
  function handleResize() {
    config.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;

    bgCanvas.width = width * config.dpr;
    bgCanvas.height = height * config.dpr;
    mainCanvas.width = width * config.dpr;
    mainCanvas.height = height * config.dpr;

    bgCtx.scale(config.dpr, config.dpr);
    mainCtx.scale(config.dpr, config.dpr);

    clearSpriteCache();
    initStarfield(width, height);
    sampleTextCoordinates(width, height);
  }

  // --- Audio Analysis Engine ---
  function updateAudioAnalysis() {
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < 8; i++) bassSum += audioData[i] || 0;
    for (let i = 8; i < 24; i++) midSum += audioData[i] || 0;
    for (let i = 24; i < 48; i++) trebleSum += audioData[i] || 0;

    bassLevel = (bassSum / 8) * config.audioSensitivity;
    midLevel = (midSum / 16) * config.audioSensitivity;
    trebleLevel = (trebleSum / 24) * config.audioSensitivity;
  }

  function simulateAudio() {
    if (isWE) return;
    const time = Date.now() * 0.004;

    // Simulate occasional heavy bass drops on beat
    const isDropBeat = (Math.sin(time * 2) > 0.88);
    const beat = isDropBeat ? 0.95 : (Math.sin(time * 3) > 0.7 ? 0.4 : 0.08);
    const hat = (Math.cos(time * 6) > 0.85) ? 0.6 : 0.05;

    for (let i = 0; i < 64; i++) {
      if (i < 8) {
        audioData[i] = beat + Math.sin(time + i) * 0.1;
      } else if (i < 24) {
        audioData[i] = Math.max(0, Math.sin(time * 2 + i * 0.2) * 0.4);
      } else {
        audioData[i] = hat + Math.random() * 0.1;
      }
    }
  }

  // --- Main Loop ---
  function animate(now) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    simulateAudio();
    updateAudioAnalysis();
    checkBassShockwave(now);

    drawBackground(width, height);
    mainCtx.clearRect(0, 0, width, height);

    const dynamicGlow = (config.glowIntensity + shockwaveFlash * 0.6) * (1 + bassLevel * 0.5);
    if (dynamicGlow > 0) {
      mainCtx.globalCompositeOperation = 'lighter';
    } else {
      mainCtx.globalCompositeOperation = 'source-over';
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(now);
      particles[i].draw(mainCtx);
    }

    mainCtx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
  }

  // --- Input Listeners ---
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', function () {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', handleResize);

  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', function () {
    mouse.active = false;
  });

  // --- Wallpaper Engine Property Listener ---
  window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
      if (!properties) return;
      isWE = true;

      let textOrColorChanged = false;

      if (properties.primarycolor) {
        config.primaryColor = parseColor(properties.primarycolor.value);
        document.documentElement.style.setProperty('--primary-color', config.primaryColor);
        textOrColorChanged = true;
      }
      if (properties.accentcolor) {
        config.accentColor = parseColor(properties.accentcolor.value);
        document.documentElement.style.setProperty('--accent-color', config.accentColor);
        textOrColorChanged = true;
      }
      if (properties.text && properties.text.value) {
        config.text = properties.text.value;
        textOrColorChanged = true;
      }
      if (properties.shapestyle) {
        config.shapeStyle = properties.shapestyle.value;
        textOrColorChanged = true;
      }
      if (properties.showaura) {
        config.showAura = properties.showaura.value;
      }
      if (properties.formationmode) {
        config.formationMode = properties.formationmode.value;
      }
      if (properties.particlesize) {
        config.particleSizeMultiplier = parseFloat(properties.particlesize.value);
        textOrColorChanged = true;
      }
      if (properties.maxparticles) {
        config.maxParticles = parseInt(properties.maxparticles.value, 10);
        textOrColorChanged = true;
      }
      if (properties.repulsionradius) {
        config.repulsionRadius = parseFloat(properties.repulsionradius.value);
        config.repulsionRadiusSq = config.repulsionRadius * config.repulsionRadius;
      }
      if (properties.repulsionforce) {
        config.repulsionForce = parseFloat(properties.repulsionforce.value);
      }
      if (properties.audiosensitivity) {
        config.audioSensitivity = parseFloat(properties.audiosensitivity.value);
      }
      if (properties.glowintensity) {
        config.glowIntensity = parseFloat(properties.glowintensity.value);
      }

      if (textOrColorChanged) {
        clearSpriteCache();
        sampleTextCoordinates(window.innerWidth, window.innerHeight);
      }
    }
  };

  if (window.wallpaperRegisterAudioListener) {
    window.wallpaperRegisterAudioListener(function (arr) {
      isWE = true;
      audioData = arr;
    });
  }

  // --- Start ---
  document.fonts.ready.then(function () {
    handleResize();
    requestAnimationFrame(animate);
  });

})();
