# OSX Terminal Design System

## Design Philosophy

Clean, minimal, and professional - exactly like a real macOS terminal. No cyberpunk, no neon, just elegant monospace typography and subtle interactions.

## Color Palette

```css
/* Based on GitHub Dark theme */
:root {
  --bg-primary: #0d1117;      /* Deep background */
  --bg-secondary: #161b22;    /* Card/section background */
  --bg-tertiary: #21262d;     /* Header background */
  --border: #30363d;          /* Subtle borders */
  --text-primary: #c9d1d9;    /* Main text */
  --text-secondary: #8b949e;  /* Muted text */
  --accent-blue: #58a6ff;     /* Links, prompts */
  --accent-purple: #7c3aed;   /* Special highlights */
  --accent-red: #f85149;      /* Section headers */
  --accent-green: #238636;    /* Success/CTAs */
  --code-string: #a5d6ff;     /* String literals */
  --code-number: #79c0ff;     /* Numbers */
  --code-keyword: #ff7b72;    /* Keywords */
  --code-function: #d2a8ff;   /* Functions */
}
```

## Typography

```css
/* System fonts for authentic terminal feel */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
font-size: 14px;
line-height: 1.6;
```

## Terminal Window Component

<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="400" fill="#0d1117"/>
  
  <!-- Terminal Window -->
  <rect x="50" y="50" width="700" height="300" fill="#161b22" rx="8"/>
  
  <!-- Terminal Header -->
  <rect x="50" y="50" width="700" height="40" fill="#21262d" rx="8 8 0 0"/>
  
  <!-- Window Controls -->
  <circle cx="70" cy="70" r="6" fill="#ff5f56"/>
  <circle cx="90" cy="70" r="6" fill="#ffbd2e"/>
  <circle cx="110" cy="70" r="6" fill="#27ca3f"/>
  
  <!-- Terminal Title -->
  <text x="140" y="75" fill="#8b949e" font-family="Monaco" font-size="13">james@flyingrobots: ~/portfolio</text>
  
  <!-- Terminal Body -->
  <text x="70" y="120" fill="#7c3aed" font-family="Monaco" font-size="14">james@flyingrobots:~$</text>
  <text x="250" y="120" fill="#58a6ff" font-family="Monaco" font-size="14">ls -la</text>
  
  <!-- Output -->
  <text x="70" y="150" fill="#c9d1d9" font-family="Monaco" font-size="14">drwxr-xr-x   5 james  staff   160 Jan 15 10:30 .</text>
  <text x="70" y="170" fill="#c9d1d9" font-family="Monaco" font-size="14">drwxr-xr-x  23 james  staff   736 Jan 15 10:00 ..</text>
  <text x="70" y="190" fill="#c9d1d9" font-family="Monaco" font-size="14">-rw-r--r--   1 james  staff  2048 Jan 15 10:30 about.md</text>
  <text x="70" y="210" fill="#c9d1d9" font-family="Monaco" font-size="14">drwxr-xr-x  12 james  staff   384 Jan 15 09:45 blog/</text>
  <text x="70" y="230" fill="#c9d1d9" font-family="Monaco" font-size="14">drwxr-xr-x   8 james  staff   256 Jan 15 09:30 projects/</text>
  
  <!-- Cursor -->
  <rect x="70" y="250" width="10" height="20" fill="#58a6ff">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>

## Entry Animation Sequence

Instead of cyberpunk effects, a subtle and elegant terminal boot sequence:

1. **Black screen** (0.5s)
2. **Terminal window fades in** with slight scale (0.3s)
3. **Window controls appear** one by one (0.2s each)
4. **Text types out** character by character
5. **Cursor blinks** continuously

```javascript
// Subtle entry animation
const entrySequence = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Text typing effect
const typeText = (text, speed = 50) => {
  return text.split('').map((char, i) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: i * speed / 1000 }
  }));
};
```

## Layout Structure

### Home Page Terminal

```html
<div class="terminal-container">
  <div class="terminal">
    <div class="terminal-header">
      <div class="terminal-buttons">
        <div class="btn close"></div>
        <div class="btn minimize"></div>
        <div class="btn maximize"></div>
      </div>
      <div class="terminal-title">james@flyingrobots: ~</div>
    </div>
    
    <div class="terminal-body">
      <!-- Interactive command line -->
      <div class="command-line">
        <span class="prompt">james@flyingrobots:~$</span>
        <input type="text" class="command-input" autofocus>
      </div>
      
      <!-- Dynamic output area -->
      <div class="output-area"></div>
    </div>
  </div>
</div>
```

## Interactive Terminal Commands

```javascript
const commands = {
  help: {
    output: `Available commands:
  about       - About James Ross
  blog        - List blog posts
  projects    - View projects
  skills      - Technical skills
  contact     - Contact information
  resume      - Download resume
  clear       - Clear terminal
  theme       - Toggle dark/light mode`
  },
  
  about: {
    output: `James Ross
Staff Software Engineer | Game Infrastructure & Engine Architecture

18 years building game infrastructure that scales. From custom MMO 
engines to ML platforms processing billions of player events.

Type 'skills' to see technical expertise or 'projects' for recent work.`
  },
  
  blog: {
    action: 'navigate',
    target: '/blog',
    output: 'Loading blog posts...'
  },
  
  ls: {
    output: `drwxr-xr-x   about/
drwxr-xr-x   blog/
drwxr-xr-x   projects/
-rw-r--r--   resume.pdf
-rw-r--r--   contact.txt`
  }
};
```

## Blog Post Terminal View

<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#0d1117"/>
  
  <!-- Terminal -->
  <rect x="50" y="50" width="700" height="500" fill="#161b22" rx="8"/>
  
  <!-- Header -->
  <rect x="50" y="50" width="700" height="40" fill="#21262d" rx="8 8 0 0"/>
  <circle cx="70" cy="70" r="6" fill="#ff5f56"/>
  <circle cx="90" cy="70" r="6" fill="#ffbd2e"/>
  <circle cx="110" cy="70" r="6" fill="#27ca3f"/>
  <text x="140" y="75" fill="#8b949e" font-family="Monaco" font-size="13">vim ~/blog/building-git-mind.md</text>
  
  <!-- Vim mode indicator -->
  <rect x="50" y="510" width="700" height="40" fill="#21262d"/>
  <text x="60" y="535" fill="#8b949e" font-family="Monaco" font-size="12">-- INSERT --</text>
  
  <!-- Blog content -->
  <text x="70" y="120" fill="#8b949e" font-family="Monaco" font-size="12">  1</text>
  <text x="100" y="120" fill="#f85149" font-family="Monaco" font-size="14"># Building Git Mind: A Neural Revolution</text>
  
  <text x="70" y="140" fill="#8b949e" font-family="Monaco" font-size="12">  2</text>
  
  <text x="70" y="160" fill="#8b949e" font-family="Monaco" font-size="12">  3</text>
  <text x="100" y="160" fill="#c9d1d9" font-family="Monaco" font-size="14">Published: 2024-01-15 | 15 min read</text>
  
  <text x="70" y="180" fill="#8b949e" font-family="Monaco" font-size="12">  4</text>
  
  <text x="70" y="200" fill="#8b949e" font-family="Monaco" font-size="12">  5</text>
  <text x="100" y="200" fill="#c9d1d9" font-family="Monaco" font-size="14">In the ever-evolving landscape of artificial intelligence,</text>
  
  <text x="70" y="220" fill="#8b949e" font-family="Monaco" font-size="12">  6</text>
  <text x="100" y="220" fill="#c9d1d9" font-family="Monaco" font-size="14">we stand at the precipice of a new paradigm...</text>
  
  <!-- Code block -->
  <rect x="100" y="250" width="600" height="100" fill="#0d1117" stroke="#30363d"/>
  <text x="110" y="270" fill="#8b949e" font-family="Monaco" font-size="12">```javascript</text>
  <text x="110" y="290" fill="#ff7b72" font-family="Monaco" font-size="12">const</text>
  <text x="160" y="290" fill="#c9d1d9" font-family="Monaco" font-size="12">gitMind =</text>
  <text x="240" y="290" fill="#ff7b72" font-family="Monaco" font-size="12">new</text>
  <text x="280" y="290" fill="#d2a8ff" font-family="Monaco" font-size="12">NeuralSubstrate</text>
  <text x="400" y="290" fill="#c9d1d9" font-family="Monaco" font-size="12">({</text>
  <text x="110" y="310" fill="#c9d1d9" font-family="Monaco" font-size="12">  backend:</text>
  <text x="190" y="310" fill="#a5d6ff" font-family="Monaco" font-size="12">'git'</text>
  <text x="110" y="330" fill="#c9d1d9" font-family="Monaco" font-size="12">});</text>
</svg>

## Admin Dashboard - Terminal Style

```bash
# Admin interface as terminal commands
admin@flyingrobots:~$ dashboard

┌─ Dashboard ─────────────────────────────────────────┐
│                                                     │
│  Total Views: 1,337    Blog Posts: 42              │
│  Projects: 15          Last Update: 2 hours ago    │
│                                                     │
└─────────────────────────────────────────────────────┘

admin@flyingrobots:~$ blog --list

ID   Title                           Status      Date
---  ------------------------------  ----------  ----------
42   Building Git Mind              published   2024-01-15
41   Universal Charter Philosophy   draft       2024-01-14
40   MIND-UCAL License Explained    published   2024-01-10

admin@flyingrobots:~$ blog --edit 41

Opening post in editor...
```

## Project Showcase Terminal

```bash
james@flyingrobots:~$ cd projects && ls -la

total 48
drwxr-xr-x  12 james  staff   384 Jan 15 10:30 .
drwxr-xr-x   5 james  staff   160 Jan 15 10:00 ..
drwxr-xr-x   8 james  staff   256 Jan 15 09:45 git-mind/
drwxr-xr-x   6 james  staff   192 Jan 14 15:20 universal-charter/
drwxr-xr-x   7 james  staff   224 Jan 13 11:30 mind-ucal-license/
drwxr-xr-x   5 james  staff   160 Jan 10 09:15 gitscrolls/

james@flyingrobots:~/projects$ cat git-mind/README.md

# Git Mind

Distributed semantic knowledge graph protocol. Transforms Git into 
a collaborative thinking platform.

## Quick Start
```bash
npm install -g @neuroglyph/git-mind
git mind init
```

## Stats
- ⭐ 1,337 stars
- 🍴 42 forks  
- 📦 156 commits

[View Demo] [GitHub] [Documentation]
```

## CSS Implementation

```css
/* Terminal window styling */
.terminal {
  max-width: 1000px;
  margin: 20px auto;
  background: #161b22;
  border-radius: 8px;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  font-family: 'SF Mono', Monaco, monospace;
}

.terminal-header {
  background: #21262d;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #30363d;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.btn.close { background: #ff5f56; }
.btn.minimize { background: #ffbd2e; }
.btn.maximize { background: #27ca3f; }

/* Interactive elements */
.command-input {
  background: transparent;
  border: none;
  color: #58a6ff;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  flex: 1;
}

/* Subtle animations */
.terminal {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* No glowing effects, just clean hovers */
a:hover {
  text-decoration: underline;
}

.btn:hover {
  opacity: 0.8;
}

/* Code syntax highlighting - subtle */
.keyword { color: #ff7b72; }
.string { color: #a5d6ff; }
.number { color: #79c0ff; }
.function { color: #d2a8ff; }
.comment { color: #8b949e; }
```

## Interaction Patterns

1. **Terminal Commands**: Primary navigation through commands
2. **Tab Completion**: Auto-complete for commands
3. **Command History**: Up/down arrows for previous commands
4. **Pipe Operations**: `ls projects | grep git`
5. **Man Pages**: `man about` for detailed information

## Responsive Design

- Terminal width adjusts to viewport
- Font size scales appropriately
- Touch-friendly on mobile (virtual keyboard)
- Landscape mode optimized

## Accessibility

- High contrast colors
- Keyboard navigation
- Screen reader friendly
- Respects prefers-reduced-motion
- Font size controls

## Performance

- Minimal JavaScript
- CSS-only animations where possible
- Lazy load content
- Virtual scrolling for long outputs
- Service worker for offline access