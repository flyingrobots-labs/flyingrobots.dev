import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const statusEl = document.querySelector('.status');
const canvas = document.getElementById('canvas');

// Settings
let wireframe = false;
let autoRotate = false;
let currentDepth = 40;
let textMesh = null;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 300;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(100, 100, 100);
scene.add(directionalLight);

// Convert OpenType path to Three.js shape with holes
function pathToShapeWithHoles(commands) {
    const shapes = [];
    let currentPath = null;
    
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        
        switch (cmd.type) {
            case 'M': // Move to - start new path
                if (currentPath) {
                    shapes.push(currentPath);
                }
                currentPath = new THREE.Path();
                currentPath.moveTo(cmd.x, -cmd.y);
                break;
                
            case 'L': // Line to
                if (currentPath) currentPath.lineTo(cmd.x, -cmd.y);
                break;
                
            case 'Q': // Quadratic bezier
                if (currentPath) currentPath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
                break;
                
            case 'C': // Cubic bezier
                if (currentPath) currentPath.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
                break;
                
            case 'Z': // Close path
                if (currentPath) currentPath.closePath();
                break;
        }
    }
    
    if (currentPath) {
        shapes.push(currentPath);
    }
    
    // First shape is the main outline, rest are holes
    if (shapes.length === 0) return null;
    
    const mainShape = new THREE.Shape(shapes[0].getPoints());
    
    // Add holes
    for (let i = 1; i < shapes.length; i++) {
        mainShape.holes.push(shapes[i]);
    }
    
    return mainShape;
}

// Create 3D text
async function createText() {
    try {
        statusEl.textContent = 'Loading font...';
        
        const fontUrl = '/lib/Rock3D-Regular.ttf';
        const font = await opentype.load(fontUrl);
        
        statusEl.textContent = 'Creating 3D text...';
        
        const text = 'JAMES';
        const fontSize = 80;
        
        // Remove old text if exists
        if (textMesh) {
            scene.remove(textMesh);
            // Dispose of all geometries and materials in the group
            textMesh.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        // Create group for all letters
        textMesh = new THREE.Group();
        
        let xOffset = 0;
        const materials = [];
        
        // Calculate total width for centering
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.charToGlyph(char);
            const advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
            totalWidth += advance * 1.1;
        }
        
        xOffset = -totalWidth / 2;
        
        // Create each letter
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const glyph = font.charToGlyph(char);
            const path = glyph.getPath(0, 0, fontSize);
            const shape = pathToShapeWithHoles(path.commands);
            
            // Extrude settings
            const extrudeSettings = {
                depth: currentDepth,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 2
            };
            
            // Create geometry
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            
            // Create material with rainbow colors
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(`hsl(${270 + i * 30}, 70%, 50%)`),
                wireframe: wireframe,
                side: THREE.DoubleSide
            });
            materials.push(material);
            
            // Create mesh
            const letterMesh = new THREE.Mesh(geometry, material);
            letterMesh.position.x = xOffset;
            letterMesh.position.y = fontSize / 2; // Center vertically
            
            textMesh.add(letterMesh);
            
            // Move to next letter position
            const advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
            xOffset += advance * 1.1;
        }
        
        scene.add(textMesh);
        
        statusEl.textContent = 'Ready! Drag to rotate.';
        
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = `Error: ${error.message}`;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate && textMesh) {
        textMesh.rotation.y += 0.01;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Controls
document.getElementById('toggleWireframe').addEventListener('click', () => {
    wireframe = !wireframe;
    if (textMesh) {
        textMesh.traverse(child => {
            if (child.material) {
                child.material.wireframe = wireframe;
            }
        });
    }
});

document.getElementById('toggleRotation').addEventListener('click', () => {
    autoRotate = !autoRotate;
});

document.getElementById('depthSlider').addEventListener('input', (e) => {
    currentDepth = parseInt(e.target.value);
    document.getElementById('depthValue').textContent = currentDepth;
    createText(); // Recreate with new depth
});

// Initialize
createText();
animate();