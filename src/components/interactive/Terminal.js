export class InteractiveTerminal {
    constructor(containerId, sceneManager) {
        this.container = document.getElementById(containerId);
        this.sceneManager = sceneManager;
        this.history = [];
        this.historyIndex = -1;
        this.currentInput = '';
        this.showAABB = false;
        this.fpsDisplay = null;
        this.commands = this.initializeCommands();
        
        this.createTerminalUI();
        this.attachEventListeners();
        this.showWelcomeMessage();
    }
    
    initializeCommands() {
        return {
            help: {
                description: 'Show available commands',
                execute: () => this.showHelp()
            },
            clear: {
                description: 'Clear terminal output',
                execute: () => this.clearTerminal()
            },
            about: {
                description: 'About James Ross',
                execute: () => this.showAbout()
            },
            skills: {
                description: 'List technical skills',
                execute: () => this.showSkills()
            },
            contact: {
                description: 'Show contact information',
                execute: () => this.showContact()
            },
            resume: {
                description: 'Download resume',
                execute: () => this.downloadResume()
            },
            projects: {
                description: 'Show notable projects',
                execute: () => this.showProjects()
            },
            matrix: {
                description: 'Enter the matrix',
                execute: () => this.enterMatrix()
            },
            glitch: {
                description: 'Activate glitch mode',
                execute: () => this.activateGlitch()
            },
            shapes: {
                description: 'Display shape count',
                execute: () => this.displayShapeCount()
            },
            spawn: {
                description: 'Spawn a new shape',
                execute: (args) => this.spawnShape(args)
            },
            aabb: {
                description: 'Toggle AABB visibility',
                execute: () => this.toggleAABB()
            },
            fps: {
                description: 'Toggle FPS counter',
                execute: () => this.toggleFPS()
            },
            visuals: {
                description: 'Toggle visual mesh rendering',
                execute: () => this.toggleVisuals()
            },
            physics: {
                description: 'Toggle physics wireframe display',
                execute: () => this.togglePhysicsWireframes()
            },
            grid: {
                description: 'Toggle grid visibility',
                execute: () => this.toggleGrid()
            },
            ui: {
                description: 'Toggle all UI/HTML elements',
                execute: () => this.toggleUI()
            }
        };
    }
    
    createTerminalUI() {
        this.container.innerHTML = `
            <div class="terminal-wrapper">
                <div class="terminal-header">
                    <span class="terminal-title">CYBERSPACE TERMINAL v2.0</span>
                    <div class="terminal-controls">
                        <button class="terminal-btn minimize">_</button>
                        <button class="terminal-btn maximize">□</button>
                        <button class="terminal-btn close">×</button>
                    </div>
                </div>
                <div class="terminal-body">
                    <div class="terminal-output"></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">guest@flyingrobots:~$</span>
                        <input type="text" class="terminal-input" autofocus />
                        <span class="terminal-cursor"></span>
                    </div>
                </div>
            </div>
        `;
        
        this.output = this.container.querySelector('.terminal-output');
        this.input = this.container.querySelector('.terminal-input');
        this.prompt = this.container.querySelector('.terminal-prompt');
    }
    
    attachEventListeners() {
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Terminal controls
        this.container.querySelector('.close').addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        
        this.container.querySelector('.minimize').addEventListener('click', () => {
            this.container.classList.toggle('minimized');
        });
        
        this.container.querySelector('.maximize').addEventListener('click', () => {
            this.container.classList.toggle('maximized');
        });
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'Enter':
                this.executeCommand(this.input.value);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                this.autocomplete();
                break;
            case 'Escape':
                if (this.uiHidden) {
                    this.toggleUI();
                }
                break;
        }
    }
    
    navigateHistory(direction) {
        if (this.history.length === 0) return;
        
        if (this.historyIndex === -1) {
            this.currentInput = this.input.value;
        }
        
        this.historyIndex += direction;
        this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.history.length));
        
        if (this.historyIndex === this.history.length) {
            this.input.value = this.currentInput;
        } else {
            this.input.value = this.history[this.historyIndex];
        }
    }
    
    autocomplete() {
        const inputValue = this.input.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => 
            cmd.startsWith(inputValue)
        );
        
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutput(`Available commands: ${matches.join(', ')}`);
        }
    }
    
    executeCommand(commandLine) {
        const trimmed = commandLine.trim();
        if (!trimmed) return;
        
        // Add to history
        this.history.push(trimmed);
        this.historyIndex = this.history.length;
        
        // Display command
        this.addOutput(`${this.prompt.textContent} ${trimmed}`, 'command');
        
        // Parse command
        const [command, ...args] = trimmed.toLowerCase().split(' ');
        
        // Execute
        if (this.commands[command]) {
            this.commands[command].execute(args);
        } else {
            this.addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
        }
        
        // Clear input
        this.input.value = '';
        
        // Scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    addOutput(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        this.output.appendChild(line);
    }
    
    showWelcomeMessage() {
        this.addOutput(`
╔═══════════════════════════════════════════════════════════╗
║           WELCOME TO THE CYBERSPACE TERMINAL              ║
║                                                           ║
║  Unauthorized access is prohibited. Violators will be     ║
║  prosecuted to the full extent of galactic law.          ║
║                                                           ║
║  Type 'help' to see available commands.                  ║
╚═══════════════════════════════════════════════════════════╝
        `, 'ascii');
    }
    
    showHelp() {
        this.addOutput('\nAvailable commands:\n', 'info');
        Object.entries(this.commands).forEach(([cmd, info]) => {
            this.addOutput(`  <span class="command">${cmd}</span> - ${info.description}`);
        });
    }
    
    clearTerminal() {
        this.output.innerHTML = '';
        this.showWelcomeMessage();
    }
    
    showAbout() {
        this.addOutput(`
<span class="highlight">James Ross - Cyber Architect</span>

I am a distributed systems engineer who builds the impossible.
From MMO backends supporting thousands of concurrent users to
enterprise data platforms processing billions of events.

15+ years architecting systems that transcend conventional limits.

Current Focus: Real-time distributed systems, reactive architectures,
and pushing the boundaries of what's possible in cyberspace.
        `, 'info');
    }
    
    showSkills() {
        this.addOutput(`
<span class="highlight">Technical Arsenal:</span>

Languages:    JavaScript/TypeScript, Python, Go, Rust
Platforms:    Node.js, AWS, GCP, Kubernetes
Databases:    PostgreSQL, Redis, MongoDB, Cassandra
Frameworks:   React, Vue, Three.js, WebGL
Specialties:  Distributed Systems, Real-time Processing,
              Event-Driven Architecture, WebSockets,
              Performance Optimization
        `, 'info');
    }
    
    showContact() {
        this.addOutput(`
<span class="highlight">Contact Protocols:</span>

Email:     james@example.com
LinkedIn:  linkedin.com/in/jamesross
GitHub:    github.com/jamesross
Location:  Seattle, WA

<span class="warning">⚡ Response time: &lt; 24 hours ⚡</span>
        `, 'info');
    }
    
    downloadResume() {
        this.addOutput('Initiating resume download...', 'info');
        setTimeout(() => {
            this.addOutput('ERROR: Resume download blocked by firewall', 'error');
            this.addOutput('Just kidding! Check your downloads folder.', 'success');
            // In real implementation, trigger actual download
        }, 1000);
    }
    
    showProjects() {
        this.addOutput(`
<span class="highlight">Notable Projects:</span>

1. <span class="project">Distributed MMO Backend</span>
   - Real-time game state synchronization
   - 5000+ concurrent users
   - Sub-100ms latency worldwide

2. <span class="project">Enterprise Analytics Platform</span>
   - 10B+ events processed daily
   - Real-time dashboards
   - ML-powered insights

3. <span class="project">Reactive UI Framework</span>
   - Event-driven architecture
   - Zero UI/business logic coupling
   - 60fps performance guarantee
        `, 'info');
    }
    
    enterMatrix() {
        this.addOutput('Entering the matrix...', 'matrix');
        
        // Create matrix rain effect
        const matrixChars = '01';
        let matrixInterval = setInterval(() => {
            let line = '';
            for (let i = 0; i < 60; i++) {
                line += matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
            this.addOutput(line, 'matrix-rain');
            
            if (this.output.children.length > 50) {
                clearInterval(matrixInterval);
                this.addOutput('\nYou have seen the code. Welcome back to reality.', 'success');
            }
        }, 50);
    }
    
    activateGlitch() {
        this.container.classList.add('glitch');
        this.addOutput('G̸L̴I̵T̶C̷H̸ ̵M̶O̴D̵E̸ ̴A̵C̷T̶I̸V̴A̶T̷E̵D̶', 'glitch');
        
        setTimeout(() => {
            this.container.classList.remove('glitch');
            this.addOutput('System stabilized.', 'success');
        }, 3000);
    }
    
    displayShapeCount() {
        if (!this.sceneManager || !this.sceneManager.getShapeCount) {
            this.addOutput('ERROR: Scene manager not available', 'error');
            return;
        }
        
        const count = this.sceneManager.getShapeCount();
        const shapeManager = this.sceneManager.getShapeManager();
        
        let breakdown = '';
        if (shapeManager && shapeManager.shapeCounts) {
            breakdown = '\n\nBreakdown by type:';
            Object.entries(shapeManager.shapeCounts).forEach(([type, typeCount]) => {
                if (typeCount > 0) {
                    breakdown += `\n  ${type}: ${typeCount}`;
                }
            });
        }
        
        this.addOutput(`
<span class="highlight">Scene Statistics:</span>

Total shapes: ${count}
Physics enabled: Yes (decoupled simulation)
Gravity simulation: Active
Rendering: Instanced meshes${breakdown}
        `, 'info');
    }
    
    spawnShape(args) {
        if (!this.sceneManager || !this.sceneManager.spawnShape) {
            this.addOutput('ERROR: Cannot spawn shapes - scene manager not available', 'error');
            return;
        }
        
        const shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
        const type = args[0] || shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        if (!shapeTypes.includes(type)) {
            this.addOutput(`ERROR: Unknown shape type '${type}'`, 'error');
            this.addOutput(`Available types: ${shapeTypes.join(', ')}`, 'info');
            return;
        }
        
        this.sceneManager.spawnShape(type);
        this.addOutput(`Spawned new ${type} at random position`, 'success');
    }
    
    toggleAABB() {
        if (!this.sceneManager || !this.sceneManager.toggleAABB) {
            this.addOutput('ERROR: Cannot toggle AABB - scene manager not available', 'error');
            return;
        }
        
        this.showAABB = !this.showAABB;
        this.sceneManager.toggleAABB(this.showAABB);
        this.addOutput(`AABB visualization: ${this.showAABB ? 'ENABLED' : 'DISABLED'}`, 'success');
    }
    
    toggleFPS() {
        if (!this.fpsDisplay) {
            // Create FPS display
            this.fpsDisplay = document.createElement('div');
            this.fpsDisplay.className = 'fps-counter';
            this.fpsDisplay.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #00ffff;
                padding: 10px;
                color: #00ffff;
                font-family: 'Orbitron', monospace;
                font-size: 14px;
                z-index: 1000;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            `;
            document.body.appendChild(this.fpsDisplay);
            
            // Start FPS monitoring
            this.startFPSMonitoring();
            this.addOutput('FPS counter: ENABLED', 'success');
        } else {
            // Remove FPS display
            this.stopFPSMonitoring();
            this.fpsDisplay.remove();
            this.fpsDisplay = null;
            this.addOutput('FPS counter: DISABLED', 'success');
        }
    }
    
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;
        
        const updateFPS = () => {
            if (!this.fpsDisplay) return;
            
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                this.fpsDisplay.innerHTML = `
                    FPS: ${fps}<br>
                    Frame time: ${(1000/fps).toFixed(1)}ms
                `;
            }
            
            this.fpsAnimationId = requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }
    
    stopFPSMonitoring() {
        if (this.fpsAnimationId) {
            cancelAnimationFrame(this.fpsAnimationId);
            this.fpsAnimationId = null;
        }
    }
    
    toggleVisuals() {
        if (!this.sceneManager || !this.sceneManager.toggleVisualMeshes) {
            this.addOutput('ERROR: Cannot toggle visuals - scene manager not available', 'error');
            return;
        }
        
        this.showVisuals = this.showVisuals !== undefined ? !this.showVisuals : false;
        this.sceneManager.toggleVisualMeshes(!this.showVisuals);
        this.addOutput(`Visual meshes: ${!this.showVisuals ? 'HIDDEN' : 'VISIBLE'}`, 'success');
    }
    
    togglePhysicsWireframes() {
        if (!this.sceneManager || !this.sceneManager.togglePhysicsWireframes) {
            this.addOutput('ERROR: Cannot toggle physics wireframes - scene manager not available', 'error');
            return;
        }
        
        this.showPhysicsWireframes = !this.showPhysicsWireframes;
        this.sceneManager.togglePhysicsWireframes(this.showPhysicsWireframes);
        this.addOutput(`Physics wireframes: ${this.showPhysicsWireframes ? 'VISIBLE' : 'HIDDEN'}`, 'success');
    }
    
    toggleGrid() {
        if (!this.sceneManager || !this.sceneManager.toggleGrid) {
            this.addOutput('ERROR: Cannot toggle grid - scene manager not available', 'error');
            return;
        }
        
        this.showGrid = this.showGrid !== undefined ? !this.showGrid : false;
        this.sceneManager.toggleGrid(!this.showGrid);
        this.addOutput(`Grid: ${!this.showGrid ? 'HIDDEN' : 'VISIBLE'}`, 'success');
    }
    
    toggleUI() {
        this.uiHidden = !this.uiHidden;
        
        // Get all UI elements to hide
        const container = document.querySelector('.container');
        const collapseAllBtn = document.querySelector('.collapse-all');
        const terminalToggleBtn = document.querySelector('.terminal-toggle');
        
        if (this.uiHidden) {
            // Hide all UI except terminal
            if (container) container.style.display = 'none';
            if (collapseAllBtn) collapseAllBtn.style.display = 'none';
            if (terminalToggleBtn) terminalToggleBtn.style.display = 'none';
            
            // Make sure terminal is visible and positioned properly
            this.container.style.position = 'fixed';
            this.container.style.top = '50%';
            this.container.style.left = '50%';
            this.container.style.transform = 'translate(-50%, -50%)';
            this.container.style.zIndex = '10000';
            
            this.addOutput('UI hidden - Press ESC to restore or type "ui" again', 'success');
        } else {
            // Restore UI
            if (container) container.style.display = '';
            if (collapseAllBtn) collapseAllBtn.style.display = '';
            if (terminalToggleBtn) terminalToggleBtn.style.display = '';
            
            // Reset terminal position
            this.container.style.position = '';
            this.container.style.top = '';
            this.container.style.left = '';
            this.container.style.transform = '';
            
            this.addOutput('UI restored', 'success');
        }
    }
}