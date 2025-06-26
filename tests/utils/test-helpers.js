import { vi } from 'vitest';
import * as THREE from 'three';

/**
 * Creates a mock Three.js scene with basic setup
 */
export function createMockScene() {
  const scene = {
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    background: null,
    fog: null
  };
  
  // Override add to update children array
  scene.add.mockImplementation(function(...objects) {
    objects.forEach(obj => {
      if (!this.children.includes(obj)) {
        this.children.push(obj);
      }
    });
  }.bind(scene));
  
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = {
    setSize: vi.fn(),
    render: vi.fn(),
    shadowMap: { enabled: false, type: THREE.PCFSoftShadowMap },
    setAnimationLoop: vi.fn(),
    domElement: document.createElement('canvas')
  };
  
  return { scene, camera, renderer };
}

/**
 * Creates a mock physics world
 */
export function createMockPhysicsWorld() {
  return {
    bodies: [],
    addBody: vi.fn(function(body) {
      this.bodies.push(body);
      return body;
    }),
    removeBody: vi.fn(function(body) {
      const index = this.bodies.indexOf(body);
      if (index > -1) this.bodies.splice(index, 1);
    }),
    createBody: vi.fn(function(type, position, ...args) {
      const body = {
        type,
        position: position.clone(),
        velocity: new THREE.Vector3(),
        mass: 1,
        id: Math.random(),
        getAABB: vi.fn(() => ({
          min: new THREE.Vector3(-1, -1, -1),
          max: new THREE.Vector3(1, 1, 1)
        }))
      };
      this.addBody(body);
      return body;
    }),
    update: vi.fn()
  };
}

/**
 * Creates a mock scene manager
 */
export function createMockSceneManager() {
  return {
    getShapeCount: vi.fn(() => 42),
    getShapeManager: vi.fn(() => ({
      shapeCounts: {
        sphere: 10,
        cube: 8,
        cone: 7,
        cylinder: 9,
        torus: 8
      }
    })),
    spawnShape: vi.fn(),
    toggleAABB: vi.fn(),
    toggleGrid: vi.fn(),
    toggleVisualMeshes: vi.fn(),
    togglePhysicsWireframes: vi.fn()
  };
}

/**
 * Waits for requestAnimationFrame
 */
export function waitForFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Simulates time passage for animations
 */
export async function advanceTime(ms) {
  const frames = Math.ceil(ms / 16);
  for (let i = 0; i < frames; i++) {
    await waitForFrame();
  }
}

/**
 * Creates a mock DOM container
 */
export function createContainer(id = 'test-container') {
  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

/**
 * Cleans up DOM after tests
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
}

/**
 * Asserts vector equality with tolerance
 */
export function expectVector3Equal(actual, expected, tolerance = 0.001) {
  expect(actual.x).toBeCloseTo(expected.x, tolerance);
  expect(actual.y).toBeCloseTo(expected.y, tolerance);
  expect(actual.z).toBeCloseTo(expected.z, tolerance);
}

/**
 * Creates a spy that tracks calls with formatted output
 */
export function createTrackedSpy(name) {
  const spy = vi.fn();
  spy.mockName(name);
  spy.getCallsString = () => {
    return spy.mock.calls.map((args, i) => 
      `  Call ${i + 1}: ${JSON.stringify(args)}`
    ).join('\n');
  };
  return spy;
}