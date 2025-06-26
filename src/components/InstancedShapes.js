import * as THREE from 'three';

// Shared geometries - create once, reuse many times
const geometries = {
    sphere: new THREE.SphereGeometry(1, 32, 24),
    cone: new THREE.ConeGeometry(1, 1, 16, 8),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 16, 8),
    torus: new THREE.TorusGeometry(1, 0.3, 16, 32),
    octahedron: new THREE.OctahedronGeometry(1)
};

// Color palette
const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];

export class InstancedShapeManager {
    constructor(scene, physicsWorld, maxInstancesPerType = 1000) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.maxInstancesPerType = maxInstancesPerType;
        this.instancedMeshes = {};
        this.shapeCounts = {};
        this.shapeData = {}; // Initialize shapeData object
        this.bodyToInstance = new Map(); // Map physics bodies to instance info
        
        // Initialize instanced meshes for each shape type
        this.initializeInstancedMeshes();
    }
    
    initializeInstancedMeshes() {
        Object.keys(geometries).forEach(shapeType => {
            // Create material that supports per-instance colors
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,  // Base color
                emissive: 0x404040,  // Reduced emissive color
                emissiveIntensity: 0.3,
                shininess: 100,
                side: THREE.DoubleSide  // Render both sides
            });
            
            // Create instanced mesh
            const instancedMesh = new THREE.InstancedMesh(
                geometries[shapeType],
                material,
                this.maxInstancesPerType
            );
            
            // Initialize instance color buffer
            const colorArray = new Float32Array(this.maxInstancesPerType * 3);
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
            
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;
            instancedMesh.frustumCulled = false; // Important for physics updates
            
            // Hide all instances initially
            instancedMesh.count = 0;
            
            this.instancedMeshes[shapeType] = instancedMesh;
            this.shapeCounts[shapeType] = 0;
            this.shapeData[shapeType] = [];
            
            // Add to scene
            this.scene.add(instancedMesh);
            console.log(`Initialized InstancedMesh for ${shapeType}`);
        });
    }
    
    addShape(type, x, y, z, scale = 1, specificColor = null) {
        if (!this.instancedMeshes[type]) {
            console.error(`Unknown shape type: ${type}`);
            return null;
        }
        
        const count = this.shapeCounts[type];
        if (count >= this.maxInstancesPerType) {
            console.warn(`Maximum instances reached for ${type}`);
            return null;
        }
        
        // Create physics body first
        const position = new THREE.Vector3(x, y, z);
        const baseScale = this.getBaseScale(type, scale);
        let physicsBody;
        
        switch(type) {
            case 'sphere':
                physicsBody = this.physicsWorld.createBody('sphere', position, baseScale);
                break;
            case 'cone':
                physicsBody = this.physicsWorld.createBody('cone', position, baseScale * 0.5, baseScale * 2);
                break;
            case 'cylinder':
                physicsBody = this.physicsWorld.createBody('cylinder', position, baseScale * 0.4, baseScale * 2.5);
                break;
            case 'torus':
                physicsBody = this.physicsWorld.createBody('torus', position, baseScale, baseScale * 0.3);
                break;
            case 'octahedron':
                physicsBody = this.physicsWorld.createBody('octahedron', position, baseScale);
                break;
        }
        
        const instancedMesh = this.instancedMeshes[type];
        const index = count;
        
        // Set initial visual state
        const matrix = new THREE.Matrix4();
        const rotation = new THREE.Quaternion();
        rotation.setFromEuler(new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        ));
        const scaleVec = new THREE.Vector3(baseScale, baseScale, baseScale);
        
        matrix.compose(position, rotation, scaleVec);
        instancedMesh.setMatrixAt(index, matrix);
        
        // Set color
        const color = new THREE.Color(specificColor || colors[Math.floor(Math.random() * colors.length)]);
        instancedMesh.setColorAt(index, color);
        
        // Map physics body to visual instance
        this.bodyToInstance.set(physicsBody, {
            type: type,
            index: index,
            color: color,
            scale: baseScale,
            visualRotation: rotation
        });
        
        // Update instance count
        this.shapeCounts[type]++;
        instancedMesh.count = this.shapeCounts[type];
        
        // Update matrices
        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }
        
        console.log(`Added ${type} shape at index ${index}, total count: ${instancedMesh.count}`);
        
        return physicsBody;
    }
    
    getBaseScale(type, scale) {
        // Different base scales for different shapes
        const baseScales = {
            sphere: 3 + Math.random() * 5,
            cone: 3 + Math.random() * 4,
            cylinder: 2 + Math.random() * 3,
            torus: 4 + Math.random() * 4,
            octahedron: 3 + Math.random() * 5
        };
        
        return (baseScales[type] || 1) * scale;
    }
    
    
    getPhysicsBodies() {
        return this.physicsWorld.bodies;
    }
    
    getTotalShapeCount() {
        return Object.values(this.shapeCounts).reduce((sum, count) => sum + count, 0);
    }
    
    getShapeBreakdown() {
        return { ...this.shapeCounts };
    }
    
    updateFromPhysics() {
        // Update all visual instances from their physics bodies
        this.bodyToInstance.forEach((instanceInfo, body) => {
            const { type, index, scale, visualRotation } = instanceInfo;
            const instancedMesh = this.instancedMeshes[type];
            
            // Update rotation
            const euler = new THREE.Euler(0, body.rotation, 0);
            visualRotation.setFromEuler(euler);
            
            // Update transform matrix
            const matrix = new THREE.Matrix4();
            const scaleVec = new THREE.Vector3(scale, scale, scale);
            matrix.compose(body.position, visualRotation, scaleVec);
            
            instancedMesh.setMatrixAt(index, matrix);
            
            // Update color based on velocity (emissive effect)
            const velocityFactor = Math.min(body.velocity.length() * 0.1, 1);
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 2 + index * 0.5) * 0.1 + 0.2;
            const emissiveIntensity = pulse + velocityFactor * 0.3;
            const brightnessFactor = 1 + emissiveIntensity * 0.5;
            
            const brightColor = instanceInfo.color.clone().multiplyScalar(brightnessFactor);
            instancedMesh.setColorAt(index, brightColor);
        });
        
        // Mark all matrices as needing update
        Object.values(this.instancedMeshes).forEach(mesh => {
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
        });
    }
    
    getTotalShapeCount() {
        return Object.values(this.shapeCounts).reduce((sum, count) => sum + count, 0);
    }
    
    removeBody(physicsBody) {
        const instanceInfo = this.bodyToInstance.get(physicsBody);
        if (instanceInfo) {
            const { type, index } = instanceInfo;
            
            // Move instance far away
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3(0, -10000, 0);
            const rotation = new THREE.Quaternion();
            const scale = new THREE.Vector3(0.001, 0.001, 0.001);
            matrix.compose(position, rotation, scale);
            
            this.instancedMeshes[type].setMatrixAt(index, matrix);
            this.instancedMeshes[type].instanceMatrix.needsUpdate = true;
            
            // Remove from physics world
            this.physicsWorld.removeBody(physicsBody);
            
            // Remove mapping
            this.bodyToInstance.delete(physicsBody);
        }
    }
    
    createBoundingBoxHelpers() {
        const helpers = [];
        
        // Create helpers for physics bodies
        this.physicsWorld.bodies.forEach(body => {
            const aabb = body.getAABB();
            const box = new THREE.Box3(aabb.min, aabb.max);
            
            const helper = new THREE.Box3Helper(box, 0x00ff00);
            helper.userData.physicsBody = body;
            helpers.push(helper);
        });
        
        return helpers;
    }
    
}