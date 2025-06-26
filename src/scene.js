import * as THREE from 'three';
import { createTronGrid } from './components/TronGrid.js';
import { InstancedShapeManager } from './components/InstancedShapes.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { setupPostProcessing } from './components/PostProcessing.js';
// import { ImGuiInterface } from './components/ImGuiInterface.js';
import { TweakpaneInterface } from './components/TweakpaneInterface.js';

// Scene state
let scene, camera, renderer, grid;
let composer, postProcessUpdate;
let clock = new THREE.Clock();
let tracers = [];
let tracerSpawnTimer = 0;
let lights = [];
let shapeManager = null;
let physicsWorld = null;
let aabbHelpers = [];
let showAABB = false;
let physicsWireframes = [];
let showPhysicsWireframes = false;
let tweakpaneInterface = null;

// FPS Camera controls
let keys = { w: false, a: false, s: false, d: false, space: false, shift: false };
let mouse = { x: 0, y: 0, isLocked: false };
let cameraPosition = new THREE.Vector3(0, 10, 40);
let cameraYaw = 0; // Horizontal rotation
let cameraPitch = 0; // Vertical rotation
let moveSpeed = 20; // Units per second
let mouseSensitivity = 0.002;

export async function init() {
    console.log('Scene init() called');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000428);
    scene.fog = new THREE.Fog(0x000428, 50, 300);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(cameraPosition);
    console.log('Camera position:', cameraPosition);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000428, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error('threejs-container not found!');
    } else {
        container.appendChild(renderer.domElement);
        console.log('Renderer attached to container');
    }

    // Create the infinite grid
    grid = createTronGrid();
    scene.add(grid);
    
    // Create physics world
    physicsWorld = new PhysicsWorld();
    console.log('Physics world created');
    
    // Create instanced shape manager with physics world
    shapeManager = new InstancedShapeManager(scene, physicsWorld);
    console.log('Shape manager created');
    
    // Add initial shapes using the instanced system
    // createInitialShapes();
    // console.log('Initial shapes created');
    
    // Removed test shapes - using instanced shapes now
    
    createDynamicLighting();
    
    // Setup controls
    setupControls();
    
    // Setup post-processing
    const postProcessing = setupPostProcessing(renderer, scene, camera);
    composer = postProcessing.composer;
    postProcessUpdate = postProcessing.update;
    
    // Initialize Tweakpane interface
    tweakpaneInterface = new TweakpaneInterface();
    tweakpaneInterface.init();
    console.log('Tweakpane interface initialized');

    // Animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Request pointer lock on click - but only on the canvas, not UI
    renderer.domElement.addEventListener('click', (event) => {
        // Check if clicking on ImGui overlay
        const imguiCanvas = document.getElementById('imgui-overlay');
        if (imguiCanvas && event.target === imguiCanvas) {
            return; // Don't capture mouse when clicking ImGui
        }
        
        if (!mouse.isLocked) {
            document.body.requestPointerLock();
        }
    });
}

function createInitialShapes() {
    // Create the same distribution as before, but with instanced rendering
    const initialBodies = [];
    
    // Spheres
    for (let i = 0; i < 12; i++) {
        const x = (Math.random() - 0.5) * 80;
        const y = 10 + Math.random() * 20;  // Start higher up where they're visible
        const z = (Math.random() - 0.5) * 80;
        const body = shapeManager.addShape('sphere', x, y, z);
        if (body) initialBodies.push(body);
    }
    
    // Cones
    for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 70;
        const y = Math.random() * 30;
        const z = (Math.random() - 0.5) * 70;
        shapeManager.addShape('cone', x, y, z);
    }
    
    // Cylinders
    for (let i = 0; i < 6; i++) {
        const x = (Math.random() - 0.5) * 60;
        const y = 5 + Math.random() * 25;
        const z = (Math.random() - 0.5) * 60;
        shapeManager.addShape('cylinder', x, y, z);
    }
    
    // Torus
    for (let i = 0; i < 4; i++) {
        const x = (Math.random() - 0.5) * 50;
        const y = Math.random() * 20;
        const z = (Math.random() - 0.5) * 50;
        shapeManager.addShape('torus', x, y, z);
    }
    
    // Octahedrons
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = 10 + Math.random() * 20;
        const z = (Math.random() - 0.5) * 40;
        shapeManager.addShape('octahedron', x, y, z);
    }
}

function createDynamicLighting() {
    // Hemisphere light for natural ambient lighting (sky/ground colors)
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x222244, 0.4);
    scene.add(hemisphereLight);
    
    // Subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Main directional light (key light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Fill light (opposite side, dimmer)
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-10, 15, -10);
    scene.add(fillLight);
    
    // Rim/back light for edge highlighting
    const rimLight = new THREE.DirectionalLight(0xff6600, 0.4);
    rimLight.position.set(0, 10, -20);
    scene.add(rimLight);
    
    // Strategic point lights for color accents (static positions)
    const pointLightPositions = [
        { pos: [30, 10, 30], color: 0x00ffff, intensity: 1.5 },
        { pos: [-30, 10, 30], color: 0xff6600, intensity: 1.5 },
        { pos: [30, 10, -30], color: 0x9966ff, intensity: 1.5 },
        { pos: [-30, 10, -30], color: 0xff00ff, intensity: 1.5 }
    ];
    
    pointLightPositions.forEach(config => {
        const light = new THREE.PointLight(config.color, config.intensity, 80);
        light.position.set(...config.pos);
        scene.add(light);
        lights.push(light);
    });
}

function setupControls() {
    // Keyboard events
    window.addEventListener('keydown', (event) => {
        // Prevent key repeat
        if (event.repeat) return;
        
        switch(event.code) {
            case 'KeyW': keys.w = true; break;
            case 'KeyA': keys.a = true; break;
            case 'KeyS': keys.s = true; break;
            case 'KeyD': keys.d = true; break;
            case 'Space': keys.space = true; break;
            case 'ShiftLeft':
            case 'ShiftRight': keys.shift = true; break;
            case 'Escape':
                if (mouse.isLocked) {
                    document.exitPointerLock();
                }
                break;
        }
    });

    window.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyW': keys.w = false; break;
            case 'KeyA': keys.a = false; break;
            case 'KeyS': keys.s = false; break;
            case 'KeyD': keys.d = false; break;
            case 'Space': keys.space = false; break;
            case 'ShiftLeft':
            case 'ShiftRight': keys.shift = false; break;
        }
    });

    // Mouse events
    document.addEventListener('pointerlockchange', () => {
        mouse.isLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (event) => {
        if (mouse.isLocked) {
            cameraYaw -= event.movementX * mouseSensitivity;
            cameraPitch -= event.movementY * mouseSensitivity;
            
            // Clamp pitch
            cameraPitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, cameraPitch));
        }
    });
}


function updateCamera(deltaTime) {
    if (!mouse.isLocked) return;
    
    // Calculate movement vector based on camera direction
    const moveVector = new THREE.Vector3();
    const speed = moveSpeed * deltaTime;
    const fastSpeed = speed * 2; // Sprint speed
    const currentSpeed = keys.shift ? fastSpeed : speed;
    
    // Create quaternions for yaw and pitch
    const yawQuaternion = new THREE.Quaternion();
    const pitchQuaternion = new THREE.Quaternion();
    
    // Set quaternions from axis angles
    yawQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    pitchQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), cameraPitch);
    
    // Combine rotations (yaw first, then pitch)
    const combinedQuaternion = new THREE.Quaternion();
    combinedQuaternion.multiplyQuaternions(yawQuaternion, pitchQuaternion);
    
    // Apply quaternion to camera
    camera.quaternion.copy(combinedQuaternion);
    
    // Get camera direction vectors from the quaternion
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yawQuaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(yawQuaternion);
    
    // Calculate movement based on input
    if (keys.w) moveVector.add(forward);
    if (keys.s) moveVector.sub(forward);
    if (keys.a) moveVector.sub(right);
    if (keys.d) moveVector.add(right);
    
    // Normalize diagonal movement
    if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(currentSpeed);
    }
    
    // Apply movement
    camera.position.add(moveVector);
    
    // Vertical movement
    if (keys.space) camera.position.y += currentSpeed;
    if (keys.shift && !keys.w && !keys.s && !keys.a && !keys.d) camera.position.y -= currentSpeed;
    
    // Update stored position
    cameraPosition.copy(camera.position);
}

function createTracer(startPos, endPos, color = 0x00ffff) {
    // Create a small glowing sphere for the tracer
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0
    });
    const tracer = new THREE.Mesh(geometry, material);
    
    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(1, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    tracer.add(glow);
    
    scene.add(tracer);
    
    // Store tracer data
    const tracerData = {
        mesh: tracer,
        glow: glow,
        startPos: startPos.clone(),
        endPos: endPos.clone(),
        progress: 0,
        fadeIn: true,
        speed: 0.008 + Math.random() * 0.012,
        color: color
    };
    
    tracers.push(tracerData);
}

function spawnRandomTracer() {
    const tracerType = Math.random();
    
    if (tracerType < 0.4) {
        // Horizontal tracer
        const z = -50 + Math.random() * 100;
        const y = -Math.random() * 120;
        const startPos = new THREE.Vector3(-50, y, z);
        const endPos = new THREE.Vector3(50, y, z);
        createTracer(startPos, endPos, 0x00ffff);
    } else if (tracerType < 0.8) {
        // Vertical tracer
        const x = -50 + Math.random() * 100;
        const z = -50 + Math.random() * 100;
        const startPos = new THREE.Vector3(x, 60, z);
        const endPos = new THREE.Vector3(x, -180, z);
        createTracer(startPos, endPos, 0x00ffff);
    } else {
        // Depth tracer (orange)
        const x = -50 + Math.random() * 100;
        const y = -Math.random() * 120;
        const startPos = new THREE.Vector3(x, y, -50);
        const endPos = new THREE.Vector3(x, y, 50);
        createTracer(startPos, endPos, 0xff6600);
    }
}

function updateTracers() {
    for (let i = tracers.length - 1; i >= 0; i--) {
        const tracer = tracers[i];
        
        // Update progress
        tracer.progress += tracer.speed;
        
        // Update position
        const currentPos = tracer.startPos.clone().lerp(tracer.endPos, tracer.progress);
        tracer.mesh.position.copy(currentPos);
        
        // Handle fade in/out
        if (tracer.fadeIn && tracer.progress < 0.1) {
            const opacity = tracer.progress * 10;
            tracer.mesh.material.opacity = opacity;
            tracer.glow.material.opacity = opacity * 0.3;
        } else if (tracer.progress > 0.9) {
            const opacity = (1 - tracer.progress) * 10;
            tracer.mesh.material.opacity = opacity;
            tracer.glow.material.opacity = opacity * 0.3;
            tracer.fadeIn = false;
        } else {
            tracer.mesh.material.opacity = 1;
            tracer.glow.material.opacity = 0.3;
        }
        
        // Add subtle pulsing
        const pulse = Math.sin(Date.now() * 0.01 + i) * 0.2 + 0.8;
        tracer.mesh.scale.setScalar(pulse);
        tracer.glow.scale.setScalar(pulse * 1.5);
        
        // Remove tracer when it reaches the end
        if (tracer.progress >= 1) {
            scene.remove(tracer.mesh);
            tracers.splice(i, 1);
        }
    }
}

function updateLights() {
    // Lights are now static - no animation
    // This provides a stable, professional lighting environment
}


let frameCount = 0;
function animate() {
    requestAnimationFrame(animate);
    
    if (frameCount % 60 === 0) {
        console.log('Animate frame:', frameCount);
    }
    frameCount++;
    
    const deltaTime = clock.getDelta();
    
    // Update camera controls
    updateCamera(deltaTime);
    
    // Subtle grid animation
    if (grid) {
        grid.rotation.y += 0.0005;
        
        // Pulse effect on some grid lines
        grid.children.forEach((child, index) => {
            if (child.material && child.material.opacity !== undefined) {
                const time = Date.now() * 0.001;
                child.material.opacity = Math.abs(Math.sin(time + index * 0.1)) * 0.4 + 0.1;
            }
        });
    }
    
    // Update physics simulation
    if (physicsWorld) {
        physicsWorld.update(deltaTime);
    }
    
    // Update visual representation from physics
    if (shapeManager) {
        shapeManager.updateFromPhysics();
    }
    
    // Update AABB helpers if visible
    if (showAABB) {
        updateAABBHelpers();
    }
    
    // Update physics wireframes if visible
    updatePhysicsWireframes();
    
    // Update dynamic lighting
    updateLights();
    
    // Update tracers
    updateTracers();
    
    // Spawn new tracers occasionally
    tracerSpawnTimer++;
    if (tracerSpawnTimer > 40 + Math.random() * 80) {
        spawnRandomTracer();
        tracerSpawnTimer = 0;
    }
    
    // Update post-processing
    if (postProcessUpdate) {
        postProcessUpdate(deltaTime);
    }
    
    // Render Three.js scene
    renderer.render(scene, camera);
    
    // Update Tweakpane
    if (tweakpaneInterface) {
        tweakpaneInterface.update(deltaTime);
    }
    /*
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    */
}

function updateAABBHelpers() {
    if (!physicsWorld) return;
    
    aabbHelpers.forEach(helper => {
        if (helper.userData.physicsBody) {
            const aabb = helper.userData.physicsBody.getAABB();
            helper.box.set(aabb.min, aabb.max);
            helper.updateMatrixWorld(true);
        }
    });
}

function createPhysicsWireframe(body) {
    let geometry;
    let material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    switch(body.type) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(body.radius, 16, 12);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(body.radius, body.height, 12, 1);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(body.radius, body.radius, body.height, 12, 1);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(body.majorRadius, body.minorRadius, 8, 16);
            break;
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(body.radius);
            break;
        default:
            // Default to box
            const size = body.size || new THREE.Vector3(1, 1, 1);
            geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.physicsBody = body;
    return mesh;
}

function updatePhysicsWireframes() {
    if (!showPhysicsWireframes || !physicsWorld) return;
    
    physicsWireframes.forEach(wireframe => {
        const body = wireframe.userData.physicsBody;
        if (body) {
            wireframe.position.copy(body.position);
            wireframe.rotation.y = body.rotation;
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update composer size too
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Scene manager for terminal commands
export const sceneManager = {
    getShapeManager: () => shapeManager,
    
    spawnShape: (type) => {
        if (!shapeManager) return;
        
        const x = (Math.random() - 0.5) * 40;
        const y = Math.random() * 20 - 10;
        const z = (Math.random() - 0.5) * 40;
        
        const physicsBody = shapeManager.addShape(type, x, y, z);
        
        // If physics wireframes are visible, add one for the new body
        if (showPhysicsWireframes && physicsBody) {
            const wireframe = createPhysicsWireframe(physicsBody);
            physicsWireframes.push(wireframe);
            scene.add(wireframe);
        }
    },
    
    toggleAABB: (show) => {
        if (!shapeManager) return;
        
        showAABB = show;
        
        // Remove existing AABB helpers
        aabbHelpers.forEach(helper => scene.remove(helper));
        aabbHelpers = [];
        
        if (show) {
            aabbHelpers = shapeManager.createBoundingBoxHelpers();
            aabbHelpers.forEach(helper => scene.add(helper));
        }
    },
    
    getShapeCount: () => {
        if (!shapeManager) return 0;
        return shapeManager.getTotalShapeCount();
    },
    
    toggleVisualMeshes: (show) => {
        if (!shapeManager) return;
        
        // Toggle visibility of all instanced meshes
        Object.values(shapeManager.instancedMeshes).forEach(mesh => {
            mesh.visible = show;
        });
    },
    
    togglePhysicsWireframes: (show) => {
        if (!physicsWorld) return;
        
        showPhysicsWireframes = show;
        
        // Remove existing wireframes
        physicsWireframes.forEach(wireframe => scene.remove(wireframe));
        physicsWireframes = [];
        
        if (show) {
            // Create wireframes for all physics bodies
            physicsWorld.bodies.forEach(body => {
                const wireframe = createPhysicsWireframe(body);
                physicsWireframes.push(wireframe);
                scene.add(wireframe);
            });
        }
    },
    
    toggleGrid: (show) => {
        if (grid) {
            grid.visible = show;
        }
    }
};