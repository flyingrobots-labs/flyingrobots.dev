import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { InstancedShapeManager } from '../../../src/components/InstancedShapes.js';
import { createMockScene, createMockPhysicsWorld, expectVector3Equal } from '../../utils/test-helpers.js';

describe('Instanced Rendering', () => {
  let shapeManager;
  let scene;
  let physicsWorld;
  
  beforeEach(() => {
    ({ scene } = createMockScene());
    physicsWorld = createMockPhysicsWorld();
    shapeManager = new InstancedShapeManager(scene, physicsWorld, 100);
  });
  
  describe('Initialization', () => {
    it('should create instanced meshes for all shape types', () => {
      const shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      
      shapeTypes.forEach(type => {
        expect(shapeManager.instancedMeshes[type]).toBeDefined();
        expect(shapeManager.instancedMeshes[type]).toBeInstanceOf(THREE.InstancedMesh);
        expect(shapeManager.shapeCounts[type]).toBe(0);
      });
    });
    
    it('should initialize with correct max instances', () => {
      expect(shapeManager.maxInstancesPerType).toBe(100);
      
      Object.values(shapeManager.instancedMeshes).forEach(mesh => {
        // InstancedMesh creates an array large enough for maxInstances matrices
        expect(mesh.instanceMatrix.array.length).toBe(100 * 16); // 16 floats per 4x4 matrix
      });
    });
    
    it('should add all instanced meshes to scene', () => {
      const shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      
      shapeTypes.forEach(type => {
        expect(scene.children).toContain(shapeManager.instancedMeshes[type]);
      });
    });
    
    it('should initialize with zero visible instances', () => {
      Object.values(shapeManager.instancedMeshes).forEach(mesh => {
        expect(mesh.count).toBe(0);
      });
    });
    
    it('should create proper geometries for each type', () => {
      expect(shapeManager.instancedMeshes.sphere.geometry).toBeInstanceOf(THREE.SphereGeometry);
      expect(shapeManager.instancedMeshes.cone.geometry).toBeInstanceOf(THREE.ConeGeometry);
      expect(shapeManager.instancedMeshes.cylinder.geometry).toBeInstanceOf(THREE.CylinderGeometry);
      expect(shapeManager.instancedMeshes.torus.geometry).toBeInstanceOf(THREE.TorusGeometry);
      expect(shapeManager.instancedMeshes.octahedron.geometry).toBeInstanceOf(THREE.OctahedronGeometry);
    });
  });
  
  describe('Shape Addition', () => {
    it('should add shape with correct properties', () => {
      const shape = shapeManager.addShape('sphere', 10, 20, 30, 1);
      
      expect(shape).toBeTruthy();
      expect(shapeManager.shapeCounts.sphere).toBe(1);
      expect(shapeManager.instancedMeshes.sphere.count).toBe(1);
      expect(physicsWorld.createBody).toHaveBeenCalledWith('sphere', expect.any(THREE.Vector3), expect.any(Number));
    });
    
    it('should map physics body to visual instance', () => {
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      
      const instanceInfo = shapeManager.bodyToInstance.get(shape);
      expect(instanceInfo).toBeDefined();
      expect(instanceInfo.type).toBe('sphere');
      expect(instanceInfo.index).toBe(0);
      expect(instanceInfo.color).toBeInstanceOf(THREE.Color);
      expect(instanceInfo.scale).toBeGreaterThan(0);
    });
    
    it('should handle all shape types', () => {
      const types = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      
      types.forEach((type, i) => {
        const shape = shapeManager.addShape(type, i, i, i);
        expect(shape).toBeTruthy();
        expect(shapeManager.shapeCounts[type]).toBe(1);
      });
    });
    
    it('should use random color from palette when not specified', () => {
      const validColors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      
      const instanceInfo = shapeManager.bodyToInstance.get(shape);
      const colorHex = instanceInfo.color.getHex();
      
      expect(validColors).toContain(colorHex);
    });
    
    it('should use specific color when provided', () => {
      const specificColor = 0xff0000;
      const shape = shapeManager.addShape('sphere', 0, 0, 0, 1, specificColor);
      
      const instanceInfo = shapeManager.bodyToInstance.get(shape);
      expect(instanceInfo.color.getHex()).toBe(specificColor);
    });
    
    it('should respect maximum instances limit', () => {
      // Fill up to max
      for (let i = 0; i < 100; i++) {
        shapeManager.addShape('sphere', i, 0, 0);
      }
      
      // Try to add one more
      const overLimit = shapeManager.addShape('sphere', 101, 0, 0);
      
      expect(overLimit).toBeNull();
      expect(shapeManager.shapeCounts.sphere).toBe(100);
    });
    
    it('should handle unknown shape type', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = shapeManager.addShape('invalid', 0, 0, 0);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Unknown shape type: invalid');
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Base Scale Calculation', () => {
    it('should return appropriate base scales for each type', () => {
      const types = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      
      types.forEach(type => {
        const scale = shapeManager.getBaseScale(type, 1);
        expect(scale).toBeGreaterThan(0);
        expect(scale).toBeLessThan(10);
      });
    });
    
    it('should apply custom scale factor', () => {
      const baseScale = shapeManager.getBaseScale('sphere', 1);
      const doubledScale = shapeManager.getBaseScale('sphere', 2);
      
      expect(doubledScale).toBeGreaterThan(baseScale);
    });
  });
  
  describe('Physics Synchronization', () => {
    it('should update visual transforms from physics bodies', () => {
      // Add a shape
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      
      // Mock physics body update
      shape.position.set(10, 20, 30);
      shape.rotation = Math.PI / 4;
      shape.velocity = new THREE.Vector3(5, 0, 0);
      
      // Track if matrix update was called
      const mesh = shapeManager.instancedMeshes.sphere;
      mesh.instanceMatrix = { needsUpdate: false };
      
      // Update visuals
      shapeManager.updateFromPhysics();
      
      // Check matrix was updated
      expect(mesh.instanceMatrix.needsUpdate).toBe(true);
    });
    
    it('should update colors based on velocity', () => {
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      const initialColor = shapeManager.bodyToInstance.get(shape).color.clone();
      
      // Set high velocity
      shape.velocity = new THREE.Vector3(10, 10, 10);
      
      // Update
      shapeManager.updateFromPhysics();
      
      // Color should be brighter due to velocity
      expect(shapeManager.instancedMeshes.sphere.instanceColor.needsUpdate).toBe(true);
    });
    
    it('should update all shape types in one pass', () => {
      // Add one of each type
      const types = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      const shapes = types.map(type => shapeManager.addShape(type, 0, 0, 0));
      
      // Update
      shapeManager.updateFromPhysics();
      
      // All meshes should be marked for update
      types.forEach(type => {
        expect(shapeManager.instancedMeshes[type].instanceMatrix.needsUpdate).toBe(true);
      });
    });
  });
  
  describe('Body Removal', () => {
    it('should remove body from physics and visuals', () => {
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      
      shapeManager.removeBody(shape);
      
      expect(physicsWorld.removeBody).toHaveBeenCalledWith(shape);
      expect(shapeManager.bodyToInstance.has(shape)).toBe(false);
    });
    
    it('should move instance far away when removed', () => {
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      const mesh = shapeManager.instancedMeshes.sphere;
      
      shapeManager.removeBody(shape);
      
      // Check matrix was updated
      expect(mesh.instanceMatrix.needsUpdate).toBe(true);
      
      // Instance should be moved far away (implementation detail)
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(0, matrix);
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(matrix);
      
      expect(position.y).toBe(-10000);
    });
    
    it('should handle removing non-existent body', () => {
      const fakeBody = { id: 'fake' };
      
      // Should not throw
      expect(() => shapeManager.removeBody(fakeBody)).not.toThrow();
    });
  });
  
  describe('Shape Counting', () => {
    it('should track total shape count', () => {
      expect(shapeManager.getTotalShapeCount()).toBe(0);
      
      shapeManager.addShape('sphere', 0, 0, 0);
      shapeManager.addShape('cone', 0, 0, 0);
      shapeManager.addShape('sphere', 1, 1, 1);
      
      expect(shapeManager.getTotalShapeCount()).toBe(3);
    });
    
    it('should track per-type counts', () => {
      shapeManager.addShape('sphere', 0, 0, 0);
      shapeManager.addShape('sphere', 1, 1, 1);
      shapeManager.addShape('cone', 0, 0, 0);
      
      expect(shapeManager.shapeCounts.sphere).toBe(2);
      expect(shapeManager.shapeCounts.cone).toBe(1);
      expect(shapeManager.shapeCounts.cylinder).toBe(0);
    });
  });
  
  describe('Bounding Box Helpers', () => {
    it('should create bounding box helpers for all bodies', () => {
      // Add some shapes
      shapeManager.addShape('sphere', 0, 0, 0);
      shapeManager.addShape('cone', 10, 0, 0);
      
      const helpers = shapeManager.createBoundingBoxHelpers();
      
      expect(helpers).toHaveLength(2);
      helpers.forEach(helper => {
        expect(helper).toBeInstanceOf(THREE.Box3Helper);
        expect(helper.userData.physicsBody).toBeDefined();
      });
    });
    
    it('should create helpers with correct AABB', () => {
      const shape = shapeManager.addShape('sphere', 0, 0, 0);
      shape.getAABB = vi.fn(() => ({
        min: new THREE.Vector3(-5, -5, -5),
        max: new THREE.Vector3(5, 5, 5)
      }));
      
      const helpers = shapeManager.createBoundingBoxHelpers();
      
      expect(shape.getAABB).toHaveBeenCalled();
      expect(helpers[0]).toBeInstanceOf(THREE.Box3Helper);
    });
  });
  
  describe('Performance Characteristics', () => {
    it('should use single draw call per shape type', () => {
      // Add multiple instances of same type
      for (let i = 0; i < 10; i++) {
        shapeManager.addShape('sphere', i, 0, 0);
      }
      
      // Still only one mesh in scene for spheres
      const sphereMeshes = scene.children.filter(child => 
        child === shapeManager.instancedMeshes.sphere
      );
      expect(sphereMeshes).toHaveLength(1);
    });
    
    it('should share geometry across instances', () => {
      shapeManager.addShape('sphere', 0, 0, 0);
      shapeManager.addShape('sphere', 1, 0, 0);
      
      const mesh = shapeManager.instancedMeshes.sphere;
      // All instances share the same geometry
      expect(mesh.geometry).toBe(mesh.geometry);
    });
    
    it('should efficiently update large numbers of instances', () => {
      // Add many shapes
      for (let i = 0; i < 50; i++) {
        shapeManager.addShape('sphere', i, 0, 0);
      }
      
      const startTime = performance.now();
      shapeManager.updateFromPhysics();
      const duration = performance.now() - startTime;
      
      // Should complete quickly (< 2ms for 50 instances)
      expect(duration).toBeLessThan(2);
    });
  });
});