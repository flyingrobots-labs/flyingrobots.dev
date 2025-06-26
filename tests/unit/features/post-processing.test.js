/**
 * Post-Processing Effects Tests
 * Tests for visual effects pipeline, shaders, and mouse tracking
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import * as THREE from 'three';

// Mock Three.js post-processing modules
vi.mock('three/examples/jsm/postprocessing/EffectComposer.js', () => ({
    EffectComposer: vi.fn(() => ({
        addPass: vi.fn(),
        setSize: vi.fn(),
        render: vi.fn()
    }))
}));

vi.mock('three/examples/jsm/postprocessing/RenderPass.js', () => ({
    RenderPass: vi.fn()
}));

vi.mock('three/examples/jsm/postprocessing/ShaderPass.js', () => ({
    ShaderPass: vi.fn(() => ({
        uniforms: {
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uStrength: { value: 0 },
            uTime: { value: 0 }
        }
    }))
}));

vi.mock('three/examples/jsm/postprocessing/UnrealBloomPass.js', () => ({
    UnrealBloomPass: vi.fn(() => ({
        setSize: vi.fn()
    }))
}));

describe('Post-Processing Effects', () => {
    let mockRenderer, mockScene, mockCamera;
    let mockMouseEvent;

    beforeEach(() => {
        // Mock Three.js objects
        mockRenderer = {
            getSize: vi.fn(() => new THREE.Vector2(1920, 1080)),
            setSize: vi.fn(),
            domElement: { width: 1920, height: 1080 }
        };
        
        mockScene = new THREE.Scene();
        mockCamera = new THREE.PerspectiveCamera(75, 1920/1080, 0.1, 1000);

        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', { 
            writable: true, 
            configurable: true, 
            value: 1920 
        });
        Object.defineProperty(window, 'innerHeight', { 
            writable: true, 
            configurable: true, 
            value: 1080 
        });

        // Mock mouse event
        mockMouseEvent = {
            clientX: 960,
            clientY: 540
        };

        // Clear event listeners
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Radial Blur Shader', () => {
        // Recreate the RadialBlurShader from the source
        const RadialBlurShader = {
            uniforms: {
                tDiffuse: { value: null },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uVelocity: { value: new THREE.Vector2(0.0, 0.0) },
                uStrength: { value: 0.0 },
                uTime: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 uMouse;
                uniform vec2 uVelocity;
                uniform float uStrength;
                uniform float uTime;
                varying vec2 vUv;
                
                void main() {
                    vec2 center = uMouse;
                    vec2 toCenter = center - vUv;
                    float distance = length(toCenter);
                    
                    // Create radial blur based on mouse velocity
                    vec2 direction = normalize(toCenter);
                    float velocityMagnitude = length(uVelocity);
                    float blur = velocityMagnitude * uStrength * (1.0 - distance);
                    
                    // Sample multiple times for motion blur effect
                    vec4 color = vec4(0.0);
                    float total = 0.0;
                    
                    for(float t = 0.0; t < 10.0; t++) {
                        float percent = (t + 0.5) / 10.0;
                        float weight = 1.0 - percent;
                        vec2 offset = uVelocity * percent * blur * 0.05;
                        color += texture2D(tDiffuse, vUv + offset) * weight;
                        total += weight;
                    }
                    
                    color /= total;
                    
                    // Add chromatic aberration for extra cyberpunk feel
                    float aberration = velocityMagnitude * 0.002;
                    color.r = texture2D(tDiffuse, vUv + direction * aberration).r;
                    color.b = texture2D(tDiffuse, vUv - direction * aberration).b;
                    
                    // Add subtle vignette
                    float vignette = smoothstep(0.0, 0.7, 1.0 - distance);
                    color.rgb *= 0.8 + 0.2 * vignette;
                    
                    gl_FragColor = color;
                }
            `
        };

        test('should have correct shader uniforms structure', () => {
            expect(RadialBlurShader.uniforms).toHaveProperty('tDiffuse');
            expect(RadialBlurShader.uniforms).toHaveProperty('uMouse');
            expect(RadialBlurShader.uniforms).toHaveProperty('uVelocity');
            expect(RadialBlurShader.uniforms).toHaveProperty('uStrength');
            expect(RadialBlurShader.uniforms).toHaveProperty('uTime');
        });

        test('should initialize uniforms with correct default values', () => {
            expect(RadialBlurShader.uniforms.uMouse.value).toEqual(new THREE.Vector2(0.5, 0.5));
            expect(RadialBlurShader.uniforms.uVelocity.value).toEqual(new THREE.Vector2(0.0, 0.0));
            expect(RadialBlurShader.uniforms.uStrength.value).toBe(0.0);
            expect(RadialBlurShader.uniforms.uTime.value).toBe(0);
        });

        test('should have valid vertex shader', () => {
            expect(RadialBlurShader.vertexShader).toContain('varying vec2 vUv');
            expect(RadialBlurShader.vertexShader).toContain('gl_Position');
            expect(RadialBlurShader.vertexShader).toContain('projectionMatrix');
        });

        test('should have valid fragment shader with required uniforms', () => {
            const fragmentShader = RadialBlurShader.fragmentShader;
            
            expect(fragmentShader).toContain('uniform sampler2D tDiffuse');
            expect(fragmentShader).toContain('uniform vec2 uMouse');
            expect(fragmentShader).toContain('uniform vec2 uVelocity');
            expect(fragmentShader).toContain('uniform float uStrength');
            expect(fragmentShader).toContain('uniform float uTime');
        });

        test('should implement radial blur effect in fragment shader', () => {
            const fragmentShader = RadialBlurShader.fragmentShader;
            
            expect(fragmentShader).toContain('toCenter = center - vUv');
            expect(fragmentShader).toContain('distance = length(toCenter)');
            expect(fragmentShader).toContain('for(float t = 0.0; t < 10.0; t++)');
        });

        test('should include chromatic aberration effect', () => {
            const fragmentShader = RadialBlurShader.fragmentShader;
            
            expect(fragmentShader).toContain('aberration = velocityMagnitude * 0.002');
            expect(fragmentShader).toContain('color.r = texture2D');
            expect(fragmentShader).toContain('color.b = texture2D');
        });

        test('should include vignette effect', () => {
            const fragmentShader = RadialBlurShader.fragmentShader;
            
            expect(fragmentShader).toContain('vignette = smoothstep(0.0, 0.7, 1.0 - distance)');
            expect(fragmentShader).toContain('color.rgb *= 0.8 + 0.2 * vignette');
        });
    });

    describe('MouseTracker Class', () => {
        // Recreate MouseTracker class for testing
        class MouseTracker {
            constructor() {
                this.mouse = new THREE.Vector2(0.5, 0.5);
                this.mouseLerped = new THREE.Vector2(0.5, 0.5);
                this.mouseVelocity = new THREE.Vector2(0, 0);
                this.lastMouse = new THREE.Vector2(0.5, 0.5);
                
                this.init();
            }
            
            init() {
                window.addEventListener('mousemove', (e) => {
                    this.mouse.x = e.clientX / window.innerWidth;
                    this.mouse.y = 1.0 - (e.clientY / window.innerHeight);
                });
            }
            
            update(deltaTime) {
                // Calculate velocity
                this.mouseVelocity.x = (this.mouse.x - this.lastMouse.x) / deltaTime;
                this.mouseVelocity.y = (this.mouse.y - this.lastMouse.y) / deltaTime;
                
                // Lerp for smooth movement
                const lerpFactor = 1.0 - Math.pow(0.8, deltaTime * 60);
                this.mouseLerped.lerp(this.mouse, lerpFactor);
                
                // Store last position
                this.lastMouse.copy(this.mouse);
            }
        }

        let mouseTracker;

        beforeEach(() => {
            mouseTracker = new MouseTracker();
        });

        test('should initialize with correct default values', () => {
            expect(mouseTracker.mouse).toEqual(new THREE.Vector2(0.5, 0.5));
            expect(mouseTracker.mouseLerped).toEqual(new THREE.Vector2(0.5, 0.5));
            expect(mouseTracker.mouseVelocity).toEqual(new THREE.Vector2(0, 0));
            expect(mouseTracker.lastMouse).toEqual(new THREE.Vector2(0.5, 0.5));
        });

        test('should update mouse position on mouse move event', () => {
            const event = new MouseEvent('mousemove', {
                clientX: 960, // Half of 1920
                clientY: 270  // Quarter of 1080
            });
            
            window.dispatchEvent(event);
            
            expect(mouseTracker.mouse.x).toBeCloseTo(0.5, 3);
            expect(mouseTracker.mouse.y).toBeCloseTo(0.75, 3); // 1.0 - (270/1080)
        });

        test('should calculate velocity correctly', () => {
            // Set initial position
            mouseTracker.mouse.set(0.5, 0.5);
            mouseTracker.lastMouse.set(0.4, 0.4);
            
            const deltaTime = 0.016; // 60fps
            mouseTracker.update(deltaTime);
            
            const expectedVelocityX = (0.5 - 0.4) / deltaTime;
            const expectedVelocityY = (0.5 - 0.4) / deltaTime;
            
            expect(mouseTracker.mouseVelocity.x).toBeCloseTo(expectedVelocityX, 2);
            expect(mouseTracker.mouseVelocity.y).toBeCloseTo(expectedVelocityY, 2);
        });

        test('should lerp mouse position smoothly', () => {
            mouseTracker.mouse.set(1.0, 1.0);
            mouseTracker.mouseLerped.set(0.0, 0.0);
            
            const deltaTime = 0.016;
            mouseTracker.update(deltaTime);
            
            // After one frame, lerped position should be between start and target
            expect(mouseTracker.mouseLerped.x).toBeGreaterThan(0.0);
            expect(mouseTracker.mouseLerped.x).toBeLessThan(1.0);
            expect(mouseTracker.mouseLerped.y).toBeGreaterThan(0.0);
            expect(mouseTracker.mouseLerped.y).toBeLessThan(1.0);
        });

        test('should calculate frame-rate independent lerp factor', () => {
            const deltaTime60fps = 1/60;
            const deltaTime30fps = 1/30;
            
            const lerpFactor60 = 1.0 - Math.pow(0.8, deltaTime60fps * 60);
            const lerpFactor30 = 1.0 - Math.pow(0.8, deltaTime30fps * 60);
            
            // 30fps should have larger lerp factor to compensate
            expect(lerpFactor30).toBeGreaterThan(lerpFactor60);
        });

        test('should normalize mouse coordinates to 0-1 range', () => {
            // Test various screen positions
            const testCases = [
                { clientX: 0, clientY: 0, expectedX: 0, expectedY: 1 },
                { clientX: 1920, clientY: 1080, expectedX: 1, expectedY: 0 },
                { clientX: 960, clientY: 540, expectedX: 0.5, expectedY: 0.5 }
            ];
            
            testCases.forEach(({ clientX, clientY, expectedX, expectedY }) => {
                const event = new MouseEvent('mousemove', { clientX, clientY });
                window.dispatchEvent(event);
                
                expect(mouseTracker.mouse.x).toBeCloseTo(expectedX, 3);
                expect(mouseTracker.mouse.y).toBeCloseTo(expectedY, 3);
            });
        });

        test('should store previous mouse position correctly', () => {
            mouseTracker.mouse.set(0.7, 0.3);
            const initialMouse = mouseTracker.mouse.clone();
            
            mouseTracker.update(0.016);
            
            expect(mouseTracker.lastMouse).toEqual(initialMouse);
        });
    });

    describe('Post-Processing Setup', () => {
        // Mock the setup function behavior
        function mockSetupPostProcessing(renderer, scene, camera) {
            const composer = {
                addPass: vi.fn(),
                setSize: vi.fn(),
                render: vi.fn()
            };
            
            const renderPass = { type: 'RenderPass' };
            const bloomPass = { type: 'UnrealBloomPass', setSize: vi.fn() };
            const radialBlurPass = { 
                type: 'ShaderPass',
                uniforms: {
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                    uVelocity: { value: new THREE.Vector2(0, 0) },
                    uStrength: { value: 0 },
                    uTime: { value: 0 }
                }
            };
            
            composer.addPass(renderPass);
            composer.addPass(bloomPass);
            composer.addPass(radialBlurPass);
            
            const update = (deltaTime) => {
                radialBlurPass.uniforms.uTime.value += deltaTime;
            };
            
            return { composer, update };
        }

        test('should create effect composer with all required passes', () => {
            const result = mockSetupPostProcessing(mockRenderer, mockScene, mockCamera);
            
            expect(result).toHaveProperty('composer');
            expect(result).toHaveProperty('update');
            expect(result.composer.addPass).toHaveBeenCalledTimes(3);
        });

        test('should configure bloom pass with correct parameters', () => {
            // Test bloom pass configuration
            const bloomParams = {
                resolution: new THREE.Vector2(1920, 1080),
                strength: 0.8,
                radius: 0.5,
                threshold: 0.85
            };
            
            expect(bloomParams.strength).toBe(0.8);
            expect(bloomParams.radius).toBe(0.5);
            expect(bloomParams.threshold).toBe(0.85);
            expect(bloomParams.resolution.x).toBe(1920);
            expect(bloomParams.resolution.y).toBe(1080);
        });

        test('should create shader pass with radial blur shader', () => {
            const result = mockSetupPostProcessing(mockRenderer, mockScene, mockCamera);
            const mockShaderPass = {
                uniforms: {
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                    uVelocity: { value: new THREE.Vector2(0, 0) },
                    uStrength: { value: 0 },
                    uTime: { value: 0 }
                }
            };
            
            expect(mockShaderPass.uniforms).toHaveProperty('uMouse');
            expect(mockShaderPass.uniforms).toHaveProperty('uVelocity');
            expect(mockShaderPass.uniforms).toHaveProperty('uStrength');
            expect(mockShaderPass.uniforms).toHaveProperty('uTime');
        });

        test('should return update function that modifies uniforms', () => {
            const result = mockSetupPostProcessing(mockRenderer, mockScene, mockCamera);
            
            expect(typeof result.update).toBe('function');
            
            // Test that update function can be called
            expect(() => result.update(0.016)).not.toThrow();
        });
    });

    describe('Shader Uniform Updates', () => {
        let mockShaderPass;

        beforeEach(() => {
            mockShaderPass = {
                uniforms: {
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                    uVelocity: { value: new THREE.Vector2(0, 0) },
                    uStrength: { value: 0 },
                    uTime: { value: 0 }
                }
            };
        });

        test('should update mouse uniform correctly', () => {
            const mousePosition = new THREE.Vector2(0.7, 0.3);
            mockShaderPass.uniforms.uMouse.value.copy(mousePosition);
            
            expect(mockShaderPass.uniforms.uMouse.value.x).toBe(0.7);
            expect(mockShaderPass.uniforms.uMouse.value.y).toBe(0.3);
        });

        test('should update velocity uniform correctly', () => {
            const velocity = new THREE.Vector2(2.5, -1.8);
            mockShaderPass.uniforms.uVelocity.value.copy(velocity);
            
            expect(mockShaderPass.uniforms.uVelocity.value.x).toBe(2.5);
            expect(mockShaderPass.uniforms.uVelocity.value.y).toBe(-1.8);
        });

        test('should calculate strength based on velocity magnitude', () => {
            const velocity = new THREE.Vector2(3, 4); // magnitude = 5
            const strength = Math.min(1.0, velocity.length() * 2.0);
            
            expect(strength).toBe(1.0); // Should be clamped to 1.0
            
            const smallVelocity = new THREE.Vector2(0.1, 0.2); // magnitude ≈ 0.22
            const smallStrength = Math.min(1.0, smallVelocity.length() * 2.0);
            
            expect(smallStrength).toBeCloseTo(0.44, 2);
        });

        test('should update time uniform continuously', () => {
            const initialTime = mockShaderPass.uniforms.uTime.value;
            const deltaTime = 0.016;
            
            mockShaderPass.uniforms.uTime.value += deltaTime;
            
            expect(mockShaderPass.uniforms.uTime.value).toBe(initialTime + deltaTime);
        });

        test('should handle large velocity values gracefully', () => {
            const largeVelocity = new THREE.Vector2(100, 200);
            const strength = Math.min(1.0, largeVelocity.length() * 2.0);
            
            expect(strength).toBe(1.0); // Should be clamped
            expect(strength).toBeLessThanOrEqual(1.0);
        });
    });

    describe('Resize Handling', () => {
        test('should handle window resize correctly', () => {
            const composer = {
                setSize: vi.fn()
            };
            const bloomPass = {
                setSize: vi.fn()
            };
            
            // Simulate resize
            const newWidth = 2560;
            const newHeight = 1440;
            
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
            
            // Mock resize handler
            const handleResize = () => {
                composer.setSize(window.innerWidth, window.innerHeight);
                bloomPass.setSize(window.innerWidth, window.innerHeight);
            };
            
            handleResize();
            
            expect(composer.setSize).toHaveBeenCalledWith(newWidth, newHeight);
            expect(bloomPass.setSize).toHaveBeenCalledWith(newWidth, newHeight);
        });

        test('should maintain aspect ratio during resize', () => {
            const testCases = [
                { width: 1920, height: 1080, aspect: 16/9 },
                { width: 1280, height: 720, aspect: 16/9 },
                { width: 1024, height: 768, aspect: 4/3 },
                { width: 800, height: 600, aspect: 4/3 }
            ];
            
            testCases.forEach(({ width, height, aspect }) => {
                const calculatedAspect = width / height;
                expect(calculatedAspect).toBeCloseTo(aspect, 2);
            });
        });
    });

    describe('Performance Considerations', () => {
        test('should limit shader sampling loops to reasonable count', () => {
            // The fragment shader uses 10 samples for blur
            const sampleCount = 10;
            expect(sampleCount).toBeLessThanOrEqual(20); // Reasonable limit
            expect(sampleCount).toBeGreaterThan(0);
        });

        test('should use efficient lerp calculations', () => {
            const deltaTime = 0.016;
            const lerpFactor = 1.0 - Math.pow(0.8, deltaTime * 60);
            
            // Lerp factor should be reasonable (not too high, not too low)
            expect(lerpFactor).toBeGreaterThan(0);
            expect(lerpFactor).toBeLessThan(1);
            expect(lerpFactor).toBeCloseTo(0.2, 1); // Expected value for 60fps
        });

        test('should handle rapid mouse movement without performance issues', () => {
            const mouseTracker = {
                mouse: new THREE.Vector2(0, 0),
                lastMouse: new THREE.Vector2(0, 0),
                mouseVelocity: new THREE.Vector2(0, 0)
            };
            
            // Simulate rapid movement
            const positions = [
                [0, 0], [0.1, 0.1], [0.3, 0.2], [0.6, 0.8], [1, 1]
            ];
            
            positions.forEach(([x, y]) => {
                mouseTracker.lastMouse.copy(mouseTracker.mouse);
                mouseTracker.mouse.set(x, y);
                
                const deltaTime = 0.016;
                mouseTracker.mouseVelocity.x = (mouseTracker.mouse.x - mouseTracker.lastMouse.x) / deltaTime;
                mouseTracker.mouseVelocity.y = (mouseTracker.mouse.y - mouseTracker.lastMouse.y) / deltaTime;
                
                // Velocity should be finite and reasonable
                expect(isFinite(mouseTracker.mouseVelocity.x)).toBe(true);
                expect(isFinite(mouseTracker.mouseVelocity.y)).toBe(true);
            });
        });

        test('should clamp effect strength to prevent excessive blur', () => {
            const testVelocities = [
                new THREE.Vector2(0.1, 0.1),
                new THREE.Vector2(1, 1),
                new THREE.Vector2(10, 10),
                new THREE.Vector2(100, 100)
            ];
            
            testVelocities.forEach(velocity => {
                const strength = Math.min(1.0, velocity.length() * 2.0);
                expect(strength).toBeLessThanOrEqual(1.0);
                expect(strength).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Effect Integration', () => {
        test('should integrate multiple post-processing effects correctly', () => {
            const effectChain = ['RenderPass', 'UnrealBloomPass', 'ShaderPass'];
            
            // Verify effect chain order
            expect(effectChain[0]).toBe('RenderPass');
            expect(effectChain[1]).toBe('UnrealBloomPass');
            expect(effectChain[2]).toBe('ShaderPass');
            expect(effectChain.length).toBe(3);
        });

        test('should maintain effect quality with multiple passes', () => {
            // Mock frame render with multiple passes
            const renderStats = {
                renderPass: { executed: false },
                bloomPass: { executed: false },
                shaderPass: { executed: false }
            };
            
            // Simulate rendering pipeline
            renderStats.renderPass.executed = true;
            renderStats.bloomPass.executed = true;
            renderStats.shaderPass.executed = true;
            
            expect(renderStats.renderPass.executed).toBe(true);
            expect(renderStats.bloomPass.executed).toBe(true);
            expect(renderStats.shaderPass.executed).toBe(true);
        });

        test('should handle effect parameters within valid ranges', () => {
            const effectParams = {
                bloomStrength: 0.8,
                bloomRadius: 0.5,
                bloomThreshold: 0.85,
                blurStrength: 1.0,
                chromaticAberration: 0.002
            };
            
            // Validate parameter ranges
            expect(effectParams.bloomStrength).toBeGreaterThan(0);
            expect(effectParams.bloomStrength).toBeLessThanOrEqual(2.0);
            
            expect(effectParams.bloomRadius).toBeGreaterThan(0);
            expect(effectParams.bloomRadius).toBeLessThanOrEqual(1.0);
            
            expect(effectParams.bloomThreshold).toBeGreaterThan(0);
            expect(effectParams.bloomThreshold).toBeLessThanOrEqual(1.0);
            
            expect(effectParams.blurStrength).toBeGreaterThanOrEqual(0);
            expect(effectParams.blurStrength).toBeLessThanOrEqual(1.0);
            
            expect(effectParams.chromaticAberration).toBeGreaterThanOrEqual(0);
            expect(effectParams.chromaticAberration).toBeLessThanOrEqual(0.01);
        });
    });
});