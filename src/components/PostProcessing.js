import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Custom radial blur shader that follows mouse
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

// Mouse tracking with lerp
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
        const lerpFactor = 1.0 - Math.pow(0.8, deltaTime * 60); // Frame-rate independent
        this.mouseLerped.lerp(this.mouse, lerpFactor);
        
        // Store last position
        this.lastMouse.copy(this.mouse);
    }
}

export function setupPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    
    // Regular render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom pass for glow effects
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,  // strength
        0.5,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
    
    // Custom radial blur pass
    const radialBlurPass = new ShaderPass(RadialBlurShader);
    composer.addPass(radialBlurPass);
    
    // Mouse tracker
    const mouseTracker = new MouseTracker();
    
    // Update function
    const update = (deltaTime) => {
        mouseTracker.update(deltaTime);
        
        // Update shader uniforms
        radialBlurPass.uniforms.uMouse.value.copy(mouseTracker.mouseLerped);
        radialBlurPass.uniforms.uVelocity.value.copy(mouseTracker.mouseVelocity);
        radialBlurPass.uniforms.uStrength.value = Math.min(1.0, mouseTracker.mouseVelocity.length() * 2.0);
        radialBlurPass.uniforms.uTime.value += deltaTime;
    };
    
    // Handle resize
    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        composer.setSize(width, height);
        bloomPass.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return { composer, update };
}