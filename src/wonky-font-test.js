import Zdog from './zdog-wrapper.js';
import { opentypePathToZdog } from './opentype-to-zdog.js';

const statusEl = document.querySelector('.status');
const canvas = document.querySelector('.zdog-canvas');

const illo = new Zdog.Illustration({
    element: canvas,
    zoom: 0.3,
    dragRotate: true,
    rotate: { x: 0, y: 0 }
});

// Settings
let showDepth = true;
let wireframe = false;
let currentDepth = 40;
let autoRotate = false;
let currentFont = null;
let textGroup = null;

// Create enhanced extruded letter with multiple perspective points
function createWonkyExtrudedLetter(path, options = {}) {
    const {
        depth = 40,
        color = '#636',
        translate = { x: 0, y: 0, z: 0 },
        scale = 1,
        addTo,
        letterIndex = 0,
        totalLetters = 1
    } = options;
    
    const group = new Zdog.Group({
        addTo: addTo,
        translate: translate
    });
    
    // Scale the path
    const scaledPath = path.map(point => {
        if (point.bezier) {
            return {
                bezier: point.bezier.map(p => ({
                    x: p.x * scale,
                    y: p.y * scale
                }))
            };
        }
        return {
            x: point.x * scale,
            y: point.y * scale
        };
    });
    
    // Calculate perspective distortion based on letter position
    const perspectiveFactor = 1 + (letterIndex - totalLetters/2) * 0.1;
    const skewAngle = (letterIndex - totalLetters/2) * 0.05;
    
    // Apply wonky transformations to path
    const wonkyPath = scaledPath.map(point => {
        if (point.bezier) {
            return {
                bezier: point.bezier.map(p => {
                    // Apply perspective and rotation
                    const x = p.x * perspectiveFactor;
                    const y = p.y + (p.x * Math.sin(skewAngle));
                    return { x, y };
                })
            };
        }
        const x = point.x * perspectiveFactor;
        const y = point.y + (point.x * Math.sin(skewAngle));
        return { x, y };
    });
    
    if (showDepth) {
        if (wireframe) {
            // Wireframe mode - show structure
            // Front face
            new Zdog.Shape({
                addTo: group,
                path: wonkyPath,
                fill: false,
                stroke: 3,
                color: color,
                translate: { z: depth / 2 }
            });
            
            // Back face
            new Zdog.Shape({
                addTo: group,
                path: wonkyPath,
                fill: false,
                stroke: 3,
                color: adjustColor(color, -40),
                translate: { z: -depth / 2 }
            });
            
            // Sample connecting lines
            for (let i = 0; i < wonkyPath.length; i += 5) {
                const point = wonkyPath[i];
                if (point && !point.bezier) {
                    new Zdog.Shape({
                        addTo: group,
                        path: [
                            { x: point.x, y: point.y, z: depth / 2 },
                            { x: point.x, y: point.y, z: -depth / 2 }
                        ],
                        stroke: 2,
                        color: adjustColor(color, -20)
                    });
                }
            }
        } else {
            // Solid mode - filled shapes
            // Front face
            new Zdog.Shape({
                addTo: group,
                path: wonkyPath,
                fill: true,
                stroke: false,
                color: color,
                translate: { z: depth / 2 }
            });
            
            // Back face
            new Zdog.Shape({
                addTo: group,
                path: wonkyPath,
                fill: true,
                stroke: false,
                color: adjustColor(color, -40),
                translate: { z: -depth / 2 }
            });
            
            // Remove the thick stroke - just show front and back faces
        }
    } else {
        // Flat version - no depth
        new Zdog.Shape({
            addTo: group,
            path: wonkyPath,
            fill: false,
            stroke: 5,
            color: color
        });
    }
    
    // Add some random rotation for extra wonkiness
    group.rotate.z = (Math.random() - 0.5) * 0.1;
    
    return group;
}

// Calculate point on cubic bezier curve
function getBezierPoint(p0, p1, p2, p3, t) {
    const x = Math.pow(1 - t, 3) * p0.x + 
              3 * Math.pow(1 - t, 2) * t * p1.x + 
              3 * (1 - t) * Math.pow(t, 2) * p2.x + 
              Math.pow(t, 3) * p3.x;
    
    const y = Math.pow(1 - t, 3) * p0.y + 
              3 * Math.pow(1 - t, 2) * t * p1.y + 
              3 * (1 - t) * Math.pow(t, 2) * p2.y + 
              Math.pow(t, 3) * p3.y;
    
    return { x, y };
}

// Helper to get a point along a path
function getPointOnPath(path, t) {
    if (!path || path.length < 2) return null;
    
    const segmentLength = 1 / (path.length - 1);
    const segmentIndex = Math.floor(t / segmentLength);
    const localT = (t % segmentLength) / segmentLength;
    
    if (segmentIndex >= path.length - 1) {
        return path[path.length - 1];
    }
    
    const p1 = path[segmentIndex];
    const p2 = path[segmentIndex + 1];
    
    // Linear interpolation (simplified)
    return {
        x: p1.x + (p2.x - p1.x) * localT,
        y: p1.y + (p2.y - p1.y) * localT
    };
}

// Color adjustment function
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Load and render the font
async function loadWonkyFont() {
    try {
        statusEl.textContent = 'Note: Using a placeholder font URL. Replace with your wonky font URL.';
        statusEl.className = 'status';
        
        // You'll need to replace this with your actual font URL
        // For testing, we'll use a regular font and apply wonky transformations
        const fontUrl = '/lib/ComicMono.ttf';
        
        // Load font with OpenType.js
        const font = await opentype.load(fontUrl);
        
        statusEl.textContent = 'Font loaded! Rendering...';
        statusEl.className = 'status success';
        
        // Text to render
        const text = 'JAMES';
        const fontSize = 120;
        
        // Clear previous text if exists
        if (textGroup) {
            textGroup.remove();
        }
        
        // Create container group
        textGroup = new Zdog.Group({
            addTo: illo
        });
        
        // Calculate total width first for centering
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.charToGlyph(char);
            const advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
            totalWidth += advance * 1.3;
        }
        
        let xOffset = -totalWidth / 2; // Center the text
        const letters = [];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.charToGlyph(char);
            const path = glyph.getPath(0, 0, fontSize);
            const zdogPath = opentypePathToZdog(path.commands);
            
            // Create wonky extruded letter
            const letter = createWonkyExtrudedLetter(zdogPath, {
                depth: currentDepth,
                color: `hsl(${270 + i * 30}, 70%, 50%)`, // Rainbow colors
                translate: { x: xOffset },
                scale: 1, // Already scaled by fontSize
                addTo: textGroup,
                letterIndex: i,
                totalLetters: text.length
            });
            
            letters.push(letter);
            
            // Calculate next position with extra spacing
            const advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
            xOffset += advance * 1.3;
        }
        
        // Store font for re-rendering
        currentFont = font;
        
        // Start render loop
        animate();
        
        statusEl.textContent = 'Rendering complete! Drag to rotate.';
        
    } catch (error) {
        console.error('Failed to load font:', error);
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = 'status error';
    }
}

// Animation loop
function animate() {
    if (autoRotate && textGroup) {
        textGroup.rotate.y += 0.01;
    }
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
}

// Function to re-render text with current settings
async function reRenderText() {
    if (!currentFont) return;
    
    // Clear and recreate
    if (textGroup) {
        textGroup.remove();
    }
    
    const text = 'JAMES';
    const fontSize = 120;
    
    textGroup = new Zdog.Group({
        addTo: illo
    });
    
    // Calculate total width first for centering
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const glyph = currentFont.charToGlyph(char);
        const advance = glyph.advanceWidth * (fontSize / currentFont.unitsPerEm);
        totalWidth += advance * 1.3;
    }
    
    let xOffset = -totalWidth / 2;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const glyph = currentFont.charToGlyph(char);
        const path = glyph.getPath(0, 0, fontSize);
        const zdogPath = opentypePathToZdog(path.commands);
        
        createWonkyExtrudedLetter(zdogPath, {
            depth: currentDepth,
            color: `hsl(${270 + i * 30}, 70%, 50%)`,
            translate: { x: xOffset },
            scale: 1,
            addTo: textGroup,
            letterIndex: i,
            totalLetters: text.length
        });
        
        const advance = glyph.advanceWidth * (fontSize / currentFont.unitsPerEm);
        xOffset += advance * 1.3;
    }
}

// Controls
document.getElementById('toggleDepth').addEventListener('click', () => {
    showDepth = !showDepth;
    reRenderText();
});

document.getElementById('toggleWireframe').addEventListener('click', () => {
    wireframe = !wireframe;
    reRenderText();
});

document.getElementById('depthSlider').addEventListener('input', (e) => {
    currentDepth = parseInt(e.target.value);
    document.getElementById('depthValue').textContent = currentDepth;
    reRenderText();
});

// Add rotation toggle
document.getElementById('toggleRotation').addEventListener('click', () => {
    autoRotate = !autoRotate;
});

// Add scroll to zoom
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.95 : 1.05;
    illo.zoom *= zoomDelta;
    illo.zoom = Math.max(0.1, Math.min(2, illo.zoom)); // Clamp between 0.1 and 2
});

// Initialize
if (typeof opentype !== 'undefined') {
    loadWonkyFont();
} else {
    window.addEventListener('load', loadWonkyFont);
}