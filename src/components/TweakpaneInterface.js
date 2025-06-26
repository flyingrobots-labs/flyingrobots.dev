import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { sceneManager } from '../scene.js';

export class TweakpaneInterface {
    constructor() {
        this.pane = null;
        this.params = {
            // Shape spawning
            shapeType: 'sphere',
            
            // Debug options
            showFPS: false,
            showAABB: false,
            
            // Info
            shapeCount: 0,
            fps: 0
        };
        
        this.shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
        this.fpsMonitor = null;
    }
    
    init() {
        // Create main pane
        this.pane = new Pane({
            title: 'Scene Controls',
            expanded: true
        });
        
        // Register essentials plugin for FPS monitor
        this.pane.registerPlugin(EssentialsPlugin);
        
        // Shape Spawning folder
        const shapeFolder = this.pane.addFolder({
            title: 'Shape Spawning',
            expanded: true
        });
        
        // Shape type dropdown
        shapeFolder.addBinding(this.params, 'shapeType', {
            options: {
                'Sphere': 'sphere',
                'Cone': 'cone',
                'Cylinder': 'cylinder',
                'Torus': 'torus',
                'Octahedron': 'octahedron'
            }
        });
        
        // Spawn button
        shapeFolder.addButton({
            title: 'Spawn Shape'
        }).on('click', () => {
            sceneManager.spawnShape(this.params.shapeType);
            this.updateShapeCount();
        });
        
        // Shape count monitor
        shapeFolder.addBinding(this.params, 'shapeCount', {
            readonly: true,
            view: 'graph',
            min: 0,
            max: 100,
            interval: 1000
        });
        
        // Debug Options folder
        const debugFolder = this.pane.addFolder({
            title: 'Debug Options',
            expanded: true
        });
        
        // FPS toggle with graph
        const fpsInput = debugFolder.addBinding(this.params, 'showFPS', {
            label: 'Show FPS'
        });
        
        fpsInput.on('change', (ev) => {
            if (ev.value) {
                // Create FPS monitor
                this.fpsMonitor = debugFolder.addBlade({
                    view: 'fpsgraph',
                    label: 'FPS',
                    lineCount: 1,
                    maxValue: 120,
                    minValue: 0
                });
            } else {
                // Remove FPS monitor
                if (this.fpsMonitor) {
                    debugFolder.remove(this.fpsMonitor);
                    this.fpsMonitor = null;
                }
            }
        });
        
        // AABB toggle
        debugFolder.addBinding(this.params, 'showAABB', {
            label: 'Show AABB'
        }).on('change', (ev) => {
            sceneManager.toggleAABB(ev.value);
        });
        
        // Info folder
        const infoFolder = this.pane.addFolder({
            title: 'Info',
            expanded: false
        });
        
        // About text
        infoFolder.addBlade({
            view: 'text',
            label: 'About',
            parse: (v) => String(v),
            value: 'Flying Robots Portfolio\nThree.js + Custom Physics\nFPS Camera Controls',
            multiline: true,
            rows: 3
        });
        
        // Camera controls info
        infoFolder.addBlade({
            view: 'text',
            label: 'Controls',
            parse: (v) => String(v),
            value: 'Click: Capture mouse\nWASD: Move\nMouse: Look\nSpace: Up\nShift: Down\nESC: Release',
            multiline: true,
            rows: 6
        });
        
        // Position the pane
        const container = this.pane.element;
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '10000'; // Higher than other UI elements
        
        // Make it draggable
        this.makeDraggable(container);
        
        // Initial update
        this.updateShapeCount();
    }
    
    makeDraggable(container) {
        const titleBar = container.querySelector('.tp-rotv_t');
        if (!titleBar) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        titleBar.style.cursor = 'move';
        
        const dragStart = (e) => {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === titleBar || titleBar.contains(e.target)) {
                isDragging = true;
            }
        };
        
        const dragEnd = (e) => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        };
        
        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                xOffset = currentX;
                yOffset = currentY;
                
                container.style.transform = `translate(${currentX}px, ${currentY}px)`;
                container.style.right = 'auto';
                container.style.top = '10px';
            }
        };
        
        titleBar.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        titleBar.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }
    
    update(deltaTime) {
        // Update FPS
        if (this.fpsMonitor) {
            this.fpsMonitor.begin();
            this.fpsMonitor.end();
        }
        
        // Update shape count periodically
        if (Math.random() < 0.1) { // Update ~10% of frames to avoid constant updates
            this.updateShapeCount();
        }
    }
    
    updateShapeCount() {
        const shapeManager = sceneManager.getShapeManager();
        if (shapeManager) {
            this.params.shapeCount = shapeManager.getTotalShapeCount();
        }
    }
    
    dispose() {
        if (this.pane) {
            this.pane.dispose();
        }
    }
}