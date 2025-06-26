# Minimal WebGL Effects for OSX Terminal

## Philosophy

Subtle, elegant effects that enhance the terminal experience without overwhelming it. Think Apple's attention to detail, not gaming RGB.

## Core Effects

### 1. Terminal Window Entry

```javascript
// Subtle zoom and fade
const terminalEntry = {
  initial: {
    scale: 0.95,
    opacity: 0,
    y: -20
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] // Apple's easing
    }
  }
};
```

### 2. Text Typing Effect

Real terminal typing with authentic feel:

```javascript
class TerminalTyper {
  constructor(element, options = {}) {
    this.element = element;
    this.speed = options.speed || 40; // ms per character
    this.variance = options.variance || 20; // typing speed variance
    this.mistakeChance = options.mistakeChance || 0.02;
  }
  
  async type(text) {
    for (let i = 0; i < text.length; i++) {
      // Occasional mistakes for realism
      if (Math.random() < this.mistakeChance) {
        await this.typeChar(this.getWrongChar());
        await this.wait(100);
        await this.backspace();
        await this.wait(50);
      }
      
      await this.typeChar(text[i]);
      await this.wait(this.getTypingDelay());
    }
  }
  
  getTypingDelay() {
    return this.speed + (Math.random() - 0.5) * this.variance;
  }
}
```

### 3. Subtle Background Particles

Minimal floating dots that suggest depth:

```glsl
// Vertex shader for background particles
precision mediump float;

attribute vec2 position;
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 pos = position;
  
  // Gentle floating motion
  pos.y += sin(time * 0.5 + position.x * 3.0) * 0.02;
  pos.x += cos(time * 0.3 + position.y * 2.0) * 0.01;
  
  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = 1.0;
}

// Fragment shader
precision mediump float;

void main() {
  // Very subtle white dots
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.05);
}
```

### 4. Smooth Scroll with Inertia

```javascript
class SmoothScroller {
  constructor(container) {
    this.container = container;
    this.targetY = 0;
    this.currentY = 0;
    this.ease = 0.1;
    this.isScrolling = false;
    
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetY += e.deltaY;
      this.targetY = Math.max(0, Math.min(this.targetY, this.maxScroll));
    });
  }
  
  animate() {
    this.currentY += (this.targetY - this.currentY) * this.ease;
    this.container.style.transform = `translateY(${-this.currentY}px)`;
    
    requestAnimationFrame(() => this.animate());
  }
}
```

### 5. Focus Glow (Very Subtle)

When hovering or focusing elements:

```css
.interactive-element {
  position: relative;
  transition: all 0.3s ease;
}

.interactive-element::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #58a6ff, #7c3aed);
  border-radius: inherit;
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.3s ease;
  z-index: -1;
}

.interactive-element:hover::before,
.interactive-element:focus::before {
  opacity: 0.1; /* Very subtle */
}
```

## Page Transition Effects

### Terminal "cd" Navigation

When navigating between pages:

```javascript
async function navigateWithTerminal(fromPath, toPath) {
  const terminal = document.querySelector('.terminal-body');
  
  // Type the cd command
  await typeCommand(`cd ${toPath}`);
  
  // Show loading
  await typeOutput('Loading...');
  
  // Fade out current content
  await fadeOut(terminal, 200);
  
  // Load new content
  const newContent = await fetchContent(toPath);
  
  // Clear and show new prompt
  terminal.innerHTML = '';
  await fadeIn(terminal, 200);
  
  // Type out new content
  await typeOutput(newContent);
}
```

## Mouse Trail Effect (Optional)

Very subtle particle trail that follows the mouse:

```javascript
class SubtleMouseTrail {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    
    this.init();
  }
  
  createParticle(x, y) {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1.0,
      size: Math.random() * 2 + 1
    };
  }
  
  update() {
    // Clear with fade effect
    this.ctx.fillStyle = 'rgba(13, 17, 23, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      
      if (p.life > 0) {
        this.ctx.globalAlpha = p.life * 0.1; // Very transparent
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
        return true;
      }
      return false;
    });
    
    requestAnimationFrame(() => this.update());
  }
}
```

## Performance Considerations

### GPU-Accelerated CSS

```css
/* Use transforms for smooth animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}

/* Reduce paint areas */
.terminal-output {
  contain: layout style paint;
}
```

### Conditional Effects

```javascript
// Detect performance capabilities
const supportsWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
})();

// Reduce effects on low-end devices
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEndDevice = navigator.hardwareConcurrency <= 2;

const effectsLevel = reduceMotion || isLowEndDevice ? 'minimal' : 'full';
```

## Implementation Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Minimal, clean styling */
    body {
      margin: 0;
      background: #0d1117;
      font-family: 'SF Mono', Monaco, monospace;
      overflow: hidden;
    }
    
    /* Subtle WebGL canvas background */
    #bg-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.3;
      pointer-events: none;
    }
    
    /* Terminal on top */
    .terminal-container {
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  
  <div class="terminal-container">
    <div class="terminal">
      <!-- Terminal content -->
    </div>
  </div>
  
  <script>
    // Initialize subtle WebGL background
    if (supportsWebGL && effectsLevel === 'full') {
      const bgEffect = new SubtleBackgroundEffect('#bg-canvas');
      bgEffect.start();
    }
    
    // Initialize terminal
    const terminal = new Terminal('.terminal');
    terminal.boot();
  </script>
</body>
</html>
```

## Effect Toggles

Let users control their experience:

```javascript
const preferences = {
  animations: localStorage.getItem('animations') !== 'false',
  particles: localStorage.getItem('particles') !== 'false',
  sounds: localStorage.getItem('sounds') !== 'false'
};

// Terminal command to toggle effects
commands.effects = {
  action: (args) => {
    if (args[0] === 'off') {
      preferences.animations = false;
      preferences.particles = false;
      savePreferences();
      return 'Visual effects disabled';
    } else if (args[0] === 'on') {
      preferences.animations = true;
      preferences.particles = true;
      savePreferences();
      return 'Visual effects enabled';
    }
    return 'Usage: effects [on|off]';
  }
};
```

## Summary

The key is restraint. Every effect should:
- Enhance usability, not distract
- Feel native to macOS
- Perform smoothly on all devices
- Respect user preferences
- Be optional and degradable

Think "barely there" rather than "look at me". The terminal is the star, effects are supporting actors.