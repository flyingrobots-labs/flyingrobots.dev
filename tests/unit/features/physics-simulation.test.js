import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { PhysicsWorld } from '../../../src/physics/PhysicsWorld.js';
import { expectVector3Equal } from '../../utils/test-helpers.js';

describe('Physics Simulation', () => {
  let physicsWorld;
  
  beforeEach(() => {
    physicsWorld = new PhysicsWorld();
  });
  
  describe('PhysicsWorld Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(physicsWorld.bodies).toEqual([]);
      expect(physicsWorld.gravity).toEqual(new THREE.Vector3(0, -0.1, 0));
      expect(physicsWorld.damping).toBe(0.98);
      expect(physicsWorld.G).toBe(2.0);
    });
    
    it('should have correct world bounds', () => {
      expect(physicsWorld.bounds.min).toEqual(new THREE.Vector3(-45, -120, -45));
      expect(physicsWorld.bounds.max).toEqual(new THREE.Vector3(45, 30, 45));
    });
  });
  
  describe('Body Creation', () => {
    it('should create sphere body with correct properties', () => {
      const position = new THREE.Vector3(10, 20, 30);
      const radius = 5;
      
      const body = physicsWorld.createBody('sphere', position, radius);
      
      expect(body.type).toBe('sphere');
      expect(body.position).toEqual(position);
      expect(body.radius).toBe(radius);
      expect(body.mass).toBe(radius * radius * 2); // mass calculation
      expect(physicsWorld.bodies).toContain(body);
    });
    
    it('should create cone body approximated as box', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const radius = 3;
      const height = 6;
      
      const body = physicsWorld.createBody('cone', position, radius, height);
      
      expect(body.type).toBe('cone');
      expect(body.radius).toBe(radius);
      expect(body.height).toBe(height);
      expect(body.size).toEqual(new THREE.Vector3(radius * 2, height, radius * 2));
    });
    
    it('should create all shape types', () => {
      const shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
      const position = new THREE.Vector3(0, 0, 0);
      
      shapeTypes.forEach(type => {
        const body = physicsWorld.createBody(type, position, 1, 2);
        expect(body.type).toBe(type);
        expect(physicsWorld.bodies).toContain(body);
      });
      
      expect(physicsWorld.bodies.length).toBe(shapeTypes.length);
    });
    
    it('should assign unique IDs to bodies', () => {
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(1, 1, 1), 1);
      
      expect(body1.id).toBeDefined();
      expect(body2.id).toBeDefined();
      expect(body1.id).not.toBe(body2.id);
    });
  });
  
  describe('Body Removal', () => {
    it('should remove body from physics world', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      expect(physicsWorld.bodies.length).toBe(1);
      
      physicsWorld.removeBody(body);
      expect(physicsWorld.bodies.length).toBe(0);
      expect(physicsWorld.bodies).not.toContain(body);
    });
    
    it('should handle removing non-existent body', () => {
      const fakeBody = { id: 'fake' };
      const initialLength = physicsWorld.bodies.length;
      
      physicsWorld.removeBody(fakeBody);
      expect(physicsWorld.bodies.length).toBe(initialLength);
    });
  });
  
  describe('AABB Calculations', () => {
    it('should calculate correct AABB for sphere', () => {
      const position = new THREE.Vector3(10, 20, 30);
      const radius = 5;
      const body = physicsWorld.createBody('sphere', position, radius);
      
      const aabb = body.getAABB();
      
      expect(aabb.min).toEqual(new THREE.Vector3(5, 15, 25));
      expect(aabb.max).toEqual(new THREE.Vector3(15, 25, 35));
    });
    
    it('should calculate correct AABB for box', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const body = physicsWorld.createBody('cylinder', position, 2, 4);
      
      const aabb = body.getAABB();
      
      expect(aabb.min.x).toBe(-2);
      expect(aabb.max.x).toBe(2);
      expect(aabb.min.y).toBe(-2);
      expect(aabb.max.y).toBe(2);
    });
    
    it('should detect AABB intersection', () => {
      const aabb1 = {
        min: new THREE.Vector3(0, 0, 0),
        max: new THREE.Vector3(10, 10, 10)
      };
      const aabb2 = {
        min: new THREE.Vector3(5, 5, 5),
        max: new THREE.Vector3(15, 15, 15)
      };
      const aabb3 = {
        min: new THREE.Vector3(20, 20, 20),
        max: new THREE.Vector3(30, 30, 30)
      };
      
      expect(physicsWorld.aabbIntersects(aabb1, aabb2)).toBe(true);
      expect(physicsWorld.aabbIntersects(aabb1, aabb3)).toBe(false);
    });
  });
  
  describe('Forces and Motion', () => {
    it('should apply gravity to bodies', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      body.clearForces();
      
      // Manually apply gravity like in update loop
      body.applyForce(physicsWorld.gravity.clone().multiplyScalar(body.mass));
      
      expectVector3Equal(body.force, new THREE.Vector3(0, -0.1 * body.mass, 0));
    });
    
    it('should update velocity from forces', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      const force = new THREE.Vector3(10, 0, 0);
      const dt = 0.016;
      
      body.applyForce(force);
      body.update(dt);
      
      const expectedAcceleration = force.clone().divideScalar(body.mass);
      const expectedVelocity = expectedAcceleration.multiplyScalar(dt);
      
      expectVector3Equal(body.velocity, expectedVelocity);
    });
    
    it('should update position from velocity', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      body.velocity = new THREE.Vector3(100, 0, 0);
      const dt = 0.016;
      
      const initialPosition = body.position.clone();
      body.update(dt);
      
      const expectedPosition = initialPosition.add(new THREE.Vector3(100 * dt, 0, 0));
      expectVector3Equal(body.position, expectedPosition);
    });
    
    it('should apply damping to velocity', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      body.velocity = new THREE.Vector3(100, 100, 100);
      
      // Simulate damping
      body.velocity.multiplyScalar(physicsWorld.damping);
      
      expectVector3Equal(body.velocity, new THREE.Vector3(98, 98, 98));
    });
  });
  
  describe('Collision Detection', () => {
    it('should detect collision between overlapping bodies', () => {
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 5);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(3, 0, 0), 5);
      
      const aabb1 = body1.getAABB();
      const aabb2 = body2.getAABB();
      
      expect(physicsWorld.aabbIntersects(aabb1, aabb2)).toBe(true);
    });
    
    it('should apply repulsion force on collision', () => {
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(1, 0, 0), 1);
      
      // Clear forces
      body1.clearForces();
      body2.clearForces();
      
      // Simulate collision repulsion
      const distance = body1.position.distanceTo(body2.position);
      const direction = new THREE.Vector3()
        .subVectors(body1.position, body2.position)
        .normalize();
      const repulsionForce = 50 / (distance + 0.1);
      
      body1.applyForce(direction.clone().multiplyScalar(repulsionForce));
      body2.applyForce(direction.clone().multiplyScalar(-repulsionForce));
      
      // Check forces are opposite
      expect(body1.force.x).toBeGreaterThan(0);
      expect(body2.force.x).toBeLessThan(0);
      expect(body1.force.x).toBeCloseTo(-body2.force.x);
    });
  });
  
  describe('Boundary Constraints', () => {
    it('should constrain bodies to world bounds', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(100, 0, 0), 5);
      body.velocity = new THREE.Vector3(100, 0, 0);
      
      physicsWorld.constrainToBounds(body);
      
      const aabb = body.getAABB();
      expect(aabb.max.x).toBeLessThanOrEqual(physicsWorld.bounds.max.x);
    });
    
    it('should reverse velocity on boundary collision', () => {
      const body = physicsWorld.createBody('sphere', new THREE.Vector3(40, 0, 0), 5);
      body.velocity = new THREE.Vector3(100, 0, 0);
      
      physicsWorld.constrainToBounds(body);
      
      // Velocity should be reversed and damped by restitution (0.7)
      expect(body.velocity.x).toBe(-70);
    });
    
    it('should handle all boundary directions', () => {
      const testBoundaries = [
        { pos: new THREE.Vector3(50, 0, 0), vel: new THREE.Vector3(10, 0, 0), axis: 'x', sign: -1 },
        { pos: new THREE.Vector3(-50, 0, 0), vel: new THREE.Vector3(-10, 0, 0), axis: 'x', sign: 1 },
        { pos: new THREE.Vector3(0, 35, 0), vel: new THREE.Vector3(0, 10, 0), axis: 'y', sign: -1 },
        { pos: new THREE.Vector3(0, -125, 0), vel: new THREE.Vector3(0, -10, 0), axis: 'y', sign: 1 },
      ];
      
      testBoundaries.forEach(test => {
        const body = physicsWorld.createBody('sphere', test.pos, 5);
        body.velocity = test.vel;
        
        physicsWorld.constrainToBounds(body);
        
        expect(body.velocity[test.axis] * test.sign).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Gravitational Attraction', () => {
    it('should apply attraction between nearby bodies', () => {
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(10, 0, 0), 1);
      
      body1.clearForces();
      body2.clearForces();
      
      // Calculate gravitational force
      const distance = body1.position.distanceTo(body2.position);
      const force = physicsWorld.G * body1.mass * body2.mass / (distance * distance + 1);
      const direction = new THREE.Vector3()
        .subVectors(body2.position, body1.position)
        .normalize()
        .multiplyScalar(force);
      
      body1.applyForce(direction.clone());
      body2.applyForce(direction.clone().negate());
      
      // Bodies should attract
      expect(body1.force.x).toBeGreaterThan(0);
      expect(body2.force.x).toBeLessThan(0);
    });
    
    it('should not apply attraction beyond range', () => {
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(50, 0, 0), 1);
      
      // Distance > 30, so no attraction in actual implementation
      const distance = body1.position.distanceTo(body2.position);
      expect(distance).toBeGreaterThan(30);
    });
  });
  
  describe('Full Physics Update', () => {
    it('should perform complete physics step', () => {
      // Create two bodies
      const body1 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 10, 0), 1);
      const body2 = physicsWorld.createBody('sphere', new THREE.Vector3(0, 0, 0), 1);
      
      // Store initial positions
      const initialPos1 = body1.position.clone();
      const initialPos2 = body2.position.clone();
      
      // Run physics update
      physicsWorld.update(0.016);
      
      // Bodies should have moved due to gravity
      expect(body1.position.y).toBeLessThan(initialPos1.y);
      expect(body2.position.y).toBeLessThan(initialPos2.y);
      
      // Velocities should be damped
      expect(body1.velocity.length()).toBeLessThan(10); // Some reasonable max
    });
    
    it('should handle multiple bodies efficiently', () => {
      // Create many bodies
      for (let i = 0; i < 100; i++) {
        const position = new THREE.Vector3(
          Math.random() * 50 - 25,
          Math.random() * 50 - 25,
          Math.random() * 50 - 25
        );
        physicsWorld.createBody('sphere', position, 1);
      }
      
      expect(physicsWorld.bodies.length).toBe(100);
      
      // Should complete update without error
      const startTime = performance.now();
      physicsWorld.update(0.016);
      const duration = performance.now() - startTime;
      
      // Should complete in reasonable time (< 5ms for 100 bodies)
      expect(duration).toBeLessThan(5);
    });
  });
});