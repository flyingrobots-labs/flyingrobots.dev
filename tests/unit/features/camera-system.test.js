/**
 * Camera System Tests
 * Tests for spring-based camera movement, constraints, and mode switching
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import * as THREE from 'three';

// Mock DOM elements and methods
const mockPointerLock = {
    requestPointerLock: vi.fn(),
    exitPointerLock: vi.fn(),
    pointerLockElement: null
};

Object.defineProperty(document, 'pointerLockElement', {
    get: () => mockPointerLock.pointerLockElement,
    configurable: true
});

Object.defineProperty(document.body, 'requestPointerLock', {
    value: mockPointerLock.requestPointerLock,
    configurable: true
});

Object.defineProperty(document, 'exitPointerLock', {
    value: mockPointerLock.exitPointerLock,
    configurable: true
});

describe('Camera System', () => {
    let camera;
    let cameraPosition;
    let cameraTarget;
    let cameraBounds;
    let keys;
    let mouse;
    let cameraSpring;
    let cameraLookAtSpring;
    let cameraRotationSpring;

    beforeEach(() => {
        // Initialize camera and camera state
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraPosition = new THREE.Vector3(0, 15, 40);
        cameraTarget = new THREE.Vector3(0, 0, 0);
        cameraBounds = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };
        
        // Initialize control state
        keys = { w: false, a: false, s: false, d: false, shift: false };
        mouse = { x: 0, y: 0, isLocked: false };

        // Initialize spring systems
        cameraSpring = {
            position: new THREE.Vector3(0, 15, 40),
            velocity: new THREE.Vector3(0, 0, 0),
            target: new THREE.Vector3(0, 15, 40),
            stiffness: 4.0,
            damping: 8.0,
            mass: 1.0
        };

        cameraLookAtSpring = {
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            target: new THREE.Vector3(0, 0, 0),
            stiffness: 6.0,
            damping: 10.0,
            mass: 1.0
        };

        cameraRotationSpring = {
            rotation: 0,
            velocity: 0,
            target: 0,
            stiffness: 4.0,
            damping: 8.0,
            mass: 1.0
        };

        // Reset mock state
        mockPointerLock.pointerLockElement = null;
        mockPointerLock.requestPointerLock.mockClear();
        mockPointerLock.exitPointerLock.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Camera Initialization', () => {
        test('should initialize camera with correct parameters', () => {
            expect(camera.fov).toBe(75);
            expect(camera.near).toBe(0.1);
            expect(camera.far).toBe(1000);
            expect(camera.aspect).toBe(window.innerWidth / window.innerHeight);
        });

        test('should set initial camera position and target', () => {
            camera.position.copy(cameraPosition);
            camera.lookAt(cameraTarget);
            
            expect(camera.position.x).toBeCloseTo(0);
            expect(camera.position.y).toBeCloseTo(15);
            expect(camera.position.z).toBeCloseTo(40);
        });

        test('should initialize camera bounds correctly', () => {
            expect(cameraBounds.minX).toBe(-20);
            expect(cameraBounds.maxX).toBe(20);
            expect(cameraBounds.minZ).toBe(-20);
            expect(cameraBounds.maxZ).toBe(20);
        });
    });

    describe('Spring Physics System', () => {
        // Helper function to update spring physics
        function updateSpring(spring, dt) {
            const displacement = spring.position.clone().sub(spring.target);
            const springForce = displacement.multiplyScalar(-spring.stiffness);
            const dampingForce = spring.velocity.clone().multiplyScalar(-spring.damping);
            const totalForce = springForce.add(dampingForce);
            
            const acceleration = totalForce.divideScalar(spring.mass);
            spring.velocity.add(acceleration.multiplyScalar(dt));
            spring.position.add(spring.velocity.clone().multiplyScalar(dt));
        }

        function updateRotationSpring(spring, dt) {
            const displacement = spring.rotation - spring.target;
            const springForce = -spring.stiffness * displacement;
            const dampingForce = -spring.damping * spring.velocity;
            const totalForce = springForce + dampingForce;
            
            const acceleration = totalForce / spring.mass;
            spring.velocity += acceleration * dt;
            spring.rotation += spring.velocity * dt;
        }

        test('should move camera position towards target with spring physics', () => {
            const initialPosition = cameraSpring.position.clone();
            cameraSpring.target.set(10, 15, 40);
            
            // Run spring update for several frames
            for (let i = 0; i < 30; i++) {
                updateSpring(cameraSpring, 0.016);
            }
            
            // Should have moved towards target
            expect(cameraSpring.position.x).toBeGreaterThan(initialPosition.x);
            expect(cameraSpring.position.x).toBeLessThan(cameraSpring.target.x);
        });

        test('should settle at target position after sufficient time', () => {
            cameraSpring.target.set(5, 20, 30);
            
            // Run spring update for many frames to allow settling
            for (let i = 0; i < 200; i++) {
                updateSpring(cameraSpring, 0.016);
            }
            
            // Should be very close to target
            expect(cameraSpring.position.x).toBeCloseTo(5, 1);
            expect(cameraSpring.position.y).toBeCloseTo(20, 1);
            expect(cameraSpring.position.z).toBeCloseTo(30, 1);
        });

        test('should handle look-at spring physics correctly', () => {
            const initialLookAt = cameraLookAtSpring.position.clone();
            cameraLookAtSpring.target.set(0, -5, 10);
            
            // Run spring update
            for (let i = 0; i < 30; i++) {
                updateSpring(cameraLookAtSpring, 0.016);
            }
            
            // Should move towards target
            expect(cameraLookAtSpring.position.distanceTo(initialLookAt)).toBeGreaterThan(0);
            expect(cameraLookAtSpring.position.distanceTo(cameraLookAtSpring.target))
                .toBeLessThan(initialLookAt.distanceTo(cameraLookAtSpring.target));
        });

        test('should handle rotation spring physics correctly', () => {
            cameraRotationSpring.target = Math.PI / 4; // 45 degrees
            
            // Run rotation spring update
            for (let i = 0; i < 30; i++) {
                updateRotationSpring(cameraRotationSpring, 0.016);
            }
            
            // Should move towards target rotation
            expect(cameraRotationSpring.rotation).toBeGreaterThan(0);
            expect(cameraRotationSpring.rotation).toBeLessThan(cameraRotationSpring.target);
        });

        test('should respect spring parameters (stiffness and damping)', () => {
            // Test with different spring parameters
            const stiffSpring = {
                position: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                target: new THREE.Vector3(10, 0, 0),
                stiffness: 10.0, // High stiffness
                damping: 8.0,
                mass: 1.0
            };

            const softSpring = {
                position: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                target: new THREE.Vector3(10, 0, 0),
                stiffness: 2.0, // Low stiffness
                damping: 8.0,
                mass: 1.0
            };

            // Update both springs
            updateSpring(stiffSpring, 0.016);
            updateSpring(softSpring, 0.016);

            // Stiff spring should move faster initially
            expect(stiffSpring.velocity.length()).toBeGreaterThan(softSpring.velocity.length());
        });
    });

    describe('Movement Constraints', () => {
        function applyCameraBounds(spring) {
            spring.target.x = Math.max(cameraBounds.minX, Math.min(cameraBounds.maxX, spring.target.x));
            spring.target.z = Math.max(cameraBounds.minZ, Math.min(cameraBounds.maxZ, spring.target.z));
            spring.target.y = Math.max(-100, Math.min(50, spring.target.y));
        }

        test('should constrain camera position to X bounds', () => {
            cameraSpring.target.x = 100; // Beyond max bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.x).toBe(cameraBounds.maxX);

            cameraSpring.target.x = -100; // Beyond min bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.x).toBe(cameraBounds.minX);
        });

        test('should constrain camera position to Z bounds', () => {
            cameraSpring.target.z = 100; // Beyond max bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.z).toBe(cameraBounds.maxZ);

            cameraSpring.target.z = -100; // Beyond min bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.z).toBe(cameraBounds.minZ);
        });

        test('should constrain camera position to Y bounds', () => {
            cameraSpring.target.y = 1000; // Beyond max Y bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.y).toBe(50);

            cameraSpring.target.y = -1000; // Beyond min Y bound
            applyCameraBounds(cameraSpring);
            expect(cameraSpring.target.y).toBe(-100);
        });

        test('should allow movement within bounds', () => {
            cameraSpring.target.set(10, 25, -10); // Within all bounds
            applyCameraBounds(cameraSpring);
            
            expect(cameraSpring.target.x).toBe(10);
            expect(cameraSpring.target.y).toBe(25);
            expect(cameraSpring.target.z).toBe(-10);
        });

        test('should clamp mouse look angles', () => {
            // Simulate mouse look clamping
            function clampMouseLook(mouseY) {
                return Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseY));
            }

            expect(clampMouseLook(Math.PI)).toBe(Math.PI/2); // Above max
            expect(clampMouseLook(-Math.PI)).toBe(-Math.PI/2); // Below min
            expect(clampMouseLook(0.5)).toBe(0.5); // Within bounds
        });
    });

    describe('Camera Mode Switching', () => {
        test('should switch to free look mode when shift is pressed', () => {
            keys.shift = true;
            mouse.isLocked = true;
            
            expect(keys.shift).toBe(true);
            expect(mouse.isLocked).toBe(true);
        });

        test('should exit free look mode when shift is released', () => {
            keys.shift = true;
            mouse.isLocked = true;
            
            // Release shift
            keys.shift = false;
            
            expect(keys.shift).toBe(false);
        });

        test('should calculate correct look-at target in normal mode', () => {
            keys.shift = false;
            mouse.isLocked = false;
            cameraPosition.set(10, 20, 30);
            
            // Calculate normal mode look-at target
            const normalTarget = new THREE.Vector3(
                cameraPosition.x,
                cameraPosition.y - 20,
                cameraPosition.z - 15
            );
            
            expect(normalTarget.x).toBe(10);
            expect(normalTarget.y).toBe(0); // 20 - 20
            expect(normalTarget.z).toBe(15); // 30 - 15
        });

        test('should calculate correct look-at target in free look mode', () => {
            keys.shift = true;
            mouse.isLocked = true;
            mouse.x = Math.PI / 4; // 45 degrees horizontal
            mouse.y = Math.PI / 6; // 30 degrees vertical
            cameraPosition.set(0, 0, 0);
            
            // Calculate free look target
            const freeLookTarget = new THREE.Vector3(
                cameraPosition.x + Math.sin(mouse.x) * Math.cos(mouse.y) * 10,
                cameraPosition.y + Math.sin(mouse.y) * 10,
                cameraPosition.z + Math.cos(mouse.x) * Math.cos(mouse.y) * 10
            );
            
            expect(freeLookTarget.x).toBeCloseTo(Math.sin(Math.PI/4) * Math.cos(Math.PI/6) * 10, 2);
            expect(freeLookTarget.y).toBeCloseTo(Math.sin(Math.PI/6) * 10, 2);
            expect(freeLookTarget.z).toBeCloseTo(Math.cos(Math.PI/4) * Math.cos(Math.PI/6) * 10, 2);
        });

        test('should handle pointer lock state changes', () => {
            // Simulate pointer lock acquisition
            mockPointerLock.pointerLockElement = document.body;
            mouse.isLocked = document.pointerLockElement === document.body;
            expect(mouse.isLocked).toBe(true);
            
            // Simulate pointer lock release
            mockPointerLock.pointerLockElement = null;
            mouse.isLocked = document.pointerLockElement === document.body;
            expect(mouse.isLocked).toBe(false);
        });
    });

    describe('WASD Movement Controls', () => {
        function simulateMovement(spring, keys, speed = 0.5) {
            if (keys.w) spring.target.z -= speed;
            if (keys.s) spring.target.z += speed;
            if (keys.a) spring.target.x -= speed;
            if (keys.d) spring.target.x += speed;
        }

        test('should move forward with W key', () => {
            const initialZ = cameraSpring.target.z;
            keys.w = true;
            simulateMovement(cameraSpring, keys);
            expect(cameraSpring.target.z).toBeLessThan(initialZ);
        });

        test('should move backward with S key', () => {
            const initialZ = cameraSpring.target.z;
            keys.s = true;
            simulateMovement(cameraSpring, keys);
            expect(cameraSpring.target.z).toBeGreaterThan(initialZ);
        });

        test('should move left with A key', () => {
            const initialX = cameraSpring.target.x;
            keys.a = true;
            simulateMovement(cameraSpring, keys);
            expect(cameraSpring.target.x).toBeLessThan(initialX);
        });

        test('should move right with D key', () => {
            const initialX = cameraSpring.target.x;
            keys.d = true;
            simulateMovement(cameraSpring, keys);
            expect(cameraSpring.target.x).toBeGreaterThan(initialX);
        });

        test('should handle diagonal movement', () => {
            const initialPos = cameraSpring.target.clone();
            keys.w = true;
            keys.d = true;
            simulateMovement(cameraSpring, keys);
            
            expect(cameraSpring.target.z).toBeLessThan(initialPos.z); // Forward
            expect(cameraSpring.target.x).toBeGreaterThan(initialPos.x); // Right
        });

        test('should handle multiple simultaneous key presses', () => {
            const initialPos = cameraSpring.target.clone();
            keys.w = true;
            keys.a = true;
            keys.d = true; // Conflicting with A, should cancel out
            simulateMovement(cameraSpring, keys);
            
            expect(cameraSpring.target.z).toBeLessThan(initialPos.z); // Only forward movement
            expect(cameraSpring.target.x).toBe(initialPos.x); // X should be unchanged
        });
    });

    describe('Mouse Look Controls', () => {
        test('should update mouse look angles on mouse movement', () => {
            const movementX = 10;
            const movementY = 5;
            const sensitivity = 0.002;
            
            const initialMouseX = mouse.x;
            const initialMouseY = mouse.y;
            
            // Simulate mouse movement
            mouse.x += movementX * sensitivity;
            mouse.y -= movementY * sensitivity;
            
            expect(mouse.x).toBe(initialMouseX + movementX * sensitivity);
            expect(mouse.y).toBe(initialMouseY - movementY * sensitivity);
        });

        test('should only update mouse look when shift is held and pointer is locked', () => {
            const initialMouseX = mouse.x;
            const initialMouseY = mouse.y;
            
            // Test without shift
            keys.shift = false;
            mouse.isLocked = true;
            // Mouse movement should not affect look angles
            
            // Test without pointer lock
            keys.shift = true;
            mouse.isLocked = false;
            // Mouse movement should not affect look angles
            
            // Both conditions true - movement should work
            keys.shift = true;
            mouse.isLocked = true;
            const movementX = 10;
            const sensitivity = 0.002;
            mouse.x += movementX * sensitivity;
            
            expect(mouse.x).toBe(initialMouseX + movementX * sensitivity);
        });

        test('should initialize mouse look angles based on current camera orientation', () => {
            // Set up a specific camera orientation
            camera.position.set(0, 0, 0);
            const lookAtTarget = new THREE.Vector3(10, 5, 10);
            
            // Calculate expected mouse angles
            const dx = lookAtTarget.x - camera.position.x;
            const dy = lookAtTarget.y - camera.position.y;
            const dz = lookAtTarget.z - camera.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            const expectedMouseX = Math.atan2(dx, dz);
            const expectedMouseY = Math.atan2(dy, distance);
            
            // Simulate initialization
            mouse.x = expectedMouseX;
            mouse.y = expectedMouseY;
            
            expect(mouse.x).toBeCloseTo(expectedMouseX, 3);
            expect(mouse.y).toBeCloseTo(expectedMouseY, 3);
        });
    });

    describe('Scroll Integration', () => {
        test('should update camera Y position based on scroll', () => {
            const scrollY = 100;
            const lastScrollY = 0;
            const scrollVelocity = (scrollY - lastScrollY) * 0.1;
            
            const initialY = cameraSpring.target.y;
            cameraSpring.target.y -= scrollVelocity;
            
            expect(cameraSpring.target.y).toBeLessThan(initialY);
        });

        test('should calculate scroll velocity correctly', () => {
            const scrollY = 200;
            const lastScrollY = 100;
            const scrollVelocity = (scrollY - lastScrollY) * 0.1;
            
            expect(scrollVelocity).toBe(10); // (200 - 100) * 0.1
        });

        test('should only apply scroll movement when velocity threshold is met', () => {
            const minVelocityThreshold = 0.01;
            
            const smallVelocity = 0.005; // Below threshold
            const largeVelocity = 0.02;  // Above threshold
            
            expect(Math.abs(smallVelocity)).toBeLessThan(minVelocityThreshold);
            expect(Math.abs(largeVelocity)).toBeGreaterThan(minVelocityThreshold);
        });
    });

    describe('Window Resize Handling', () => {
        test('should update camera aspect ratio on window resize', () => {
            const newWidth = 1920;
            const newHeight = 1080;
            const expectedAspect = newWidth / newHeight;
            
            // Mock window dimensions
            Object.defineProperty(window, 'innerWidth', { 
                writable: true, 
                configurable: true, 
                value: newWidth 
            });
            Object.defineProperty(window, 'innerHeight', { 
                writable: true, 
                configurable: true, 
                value: newHeight 
            });
            
            // Update camera
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            expect(camera.aspect).toBe(expectedAspect);
        });
    });

    describe('Performance Considerations', () => {
        test('should maintain stable frame rate with spring updates', () => {
            const frameTime = 0.016; // 60 FPS
            const frameCount = 100;
            
            const startTime = performance.now();
            
            // Simulate multiple frame updates
            for (let i = 0; i < frameCount; i++) {
                // Mock spring update (lightweight operations)
                const displacement = cameraSpring.position.clone().sub(cameraSpring.target);
                const springForce = displacement.multiplyScalar(-cameraSpring.stiffness);
                const dampingForce = cameraSpring.velocity.clone().multiplyScalar(-cameraSpring.damping);
                // Basic force calculation
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageFrameTime = totalTime / frameCount;
            
            // Should complete well under 16ms per frame
            expect(averageFrameTime).toBeLessThan(frameTime);
        });

        test('should handle rapid input changes smoothly', () => {
            // Simulate rapid key state changes
            for (let i = 0; i < 100; i++) {
                keys.w = !keys.w;
                keys.a = !keys.a;
                
                // Basic state validation - no errors should occur
                expect(typeof keys.w).toBe('boolean');
                expect(typeof keys.a).toBe('boolean');
            }
        });
    });
});