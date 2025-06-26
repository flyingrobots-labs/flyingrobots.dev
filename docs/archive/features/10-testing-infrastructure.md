# Feature: Testing Infrastructure

## Overview
A comprehensive testing framework for ensuring code quality, preventing regressions, and enabling confident refactoring. The infrastructure will cover unit tests, integration tests, visual regression tests, and performance benchmarks.

## Status
- **Current State**: Planned
- **Version**: 0.1.0 (Design Phase)
- **Last Updated**: 2025-01-06
- **Priority**: High

## Design Goals

### Primary Objectives
1. **Comprehensive Coverage**: Test all critical paths
2. **Fast Feedback**: Quick test execution
3. **Reliable Results**: Consistent, deterministic tests
4. **Developer Experience**: Easy to write and debug tests
5. **CI/CD Integration**: Automated testing pipeline

### Testing Philosophy
- **Test Pyramid**: More unit tests, fewer E2E tests
- **Behavior-Driven**: Test behavior, not implementation
- **Isolation**: Tests should not depend on each other
- **Documentation**: Tests serve as living documentation

## Technical Architecture

### Build & Deployment Pipeline
![Build Pipeline](../images/build-pipeline.svg)

### Testing Stack
```
Testing Infrastructure
├── Test Runners
│   ├── Vitest (Unit/Integration)
│   ├── Playwright (E2E)
│   └── Jest (Alternative)
├── Test Types
│   ├── Unit Tests
│   ├── Integration Tests
│   ├── Visual Regression
│   ├── Performance Tests
│   └── E2E Tests
├── Utilities
│   ├── Mocks & Stubs
│   ├── Test Factories
│   ├── Custom Matchers
│   └── Test Helpers
└── CI/CD
    ├── Pre-commit Hooks
    ├── GitHub Actions
    └── Coverage Reports
```

### Framework Selection

#### Vitest Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'test/',
                '**/*.d.ts',
                '**/*.config.js'
            ],
            threshold: {
                lines: 80,
                branches: 80,
                functions: 80,
                statements: 80
            }
        },
        mockReset: true,
        restoreMocks: true
    },
    resolve: {
        alias: {
            '@': '/src',
            '@physics': '/src/physics',
            '@components': '/src/components'
        }
    }
});
```

## Test Categories

### Unit Tests

#### Physics System
```javascript
// test/physics/PhysicsWorld.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsWorld } from '@physics/PhysicsWorld';
import { Vector3 } from 'three';

describe('PhysicsWorld', () => {
    let world;
    
    beforeEach(() => {
        world = new PhysicsWorld();
    });
    
    describe('gravity', () => {
        it('should apply gravity to bodies', () => {
            const body = world.addBody({
                type: 'sphere',
                radius: 1,
                position: new Vector3(0, 10, 0),
                mass: 1
            });
            
            world.step(1/60);
            
            expect(body.position.y).toBeLessThan(10);
            expect(body.velocity.y).toBeLessThan(0);
        });
        
        it('should respect custom gravity', () => {
            world.setGravity(new Vector3(1, 0, 0));
            
            const body = world.addBody({
                type: 'sphere',
                radius: 1,
                position: new Vector3(0, 0, 0),
                mass: 1
            });
            
            world.step(1/60);
            
            expect(body.velocity.x).toBeGreaterThan(0);
            expect(body.velocity.y).toBe(0);
        });
    });
    
    describe('collisions', () => {
        it('should detect sphere-sphere collisions', () => {
            const body1 = world.addBody({
                type: 'sphere',
                radius: 1,
                position: new Vector3(0, 0, 0)
            });
            
            const body2 = world.addBody({
                type: 'sphere',
                radius: 1,
                position: new Vector3(1.5, 0, 0)
            });
            
            const collisions = world.detectCollisions();
            
            expect(collisions).toHaveLength(1);
            expect(collisions[0]).toMatchObject({
                bodyA: body1,
                bodyB: body2,
                overlap: expect.any(Number)
            });
        });
    });
});
```

#### Shape Management
```javascript
// test/components/InstancedShapes.test.js
import { describe, it, expect, vi } from 'vitest';
import { InstancedShapes } from '@components/InstancedShapes';
import * as THREE from 'three';

// Mock Three.js
vi.mock('three', () => ({
    InstancedMesh: vi.fn(),
    Matrix4: vi.fn(),
    Color: vi.fn(),
    // ... other mocks
}));

describe('InstancedShapes', () => {
    let shapes;
    let mockScene;
    
    beforeEach(() => {
        mockScene = {
            add: vi.fn(),
            remove: vi.fn()
        };
        shapes = new InstancedShapes(mockScene);
    });
    
    describe('spawn', () => {
        it('should add shapes within limits', () => {
            const id = shapes.spawn('sphere', { x: 0, y: 0, z: 0 });
            
            expect(id).toBeTruthy();
            expect(shapes.getActiveCount()).toBe(1);
            expect(mockScene.add).toHaveBeenCalled();
        });
        
        it('should reject spawns at max capacity', () => {
            // Fill to capacity
            for (let i = 0; i < shapes.maxInstances; i++) {
                shapes.spawn('sphere', { x: i, y: 0, z: 0 });
            }
            
            const id = shapes.spawn('sphere', { x: 0, y: 0, z: 0 });
            
            expect(id).toBeNull();
            expect(shapes.getActiveCount()).toBe(shapes.maxInstances);
        });
    });
});
```

### Integration Tests

#### Scene Integration
```javascript
// test/integration/scene.test.js
import { describe, it, expect } from 'vitest';
import { createScene } from '@/scene';
import { PhysicsWorld } from '@physics/PhysicsWorld';

describe('Scene Integration', () => {
    it('should synchronize physics and graphics', async () => {
        const { scene, camera, shapes, physics } = await createScene();
        
        // Add a shape through the system
        const shapeId = shapes.spawn('sphere', { x: 0, y: 10, z: 0 });
        const physicsBody = physics.getBodyById(shapeId);
        
        // Run physics simulation
        physics.step(1/60);
        
        // Update graphics from physics
        shapes.syncWithPhysics(physics);
        
        // Verify synchronization
        const shapeTransform = shapes.getTransform(shapeId);
        expect(shapeTransform.position).toEqual(physicsBody.position);
    });
});
```

### Visual Regression Tests

#### Screenshot Testing
```javascript
// test/visual/scene-visual.test.js
import { describe, it, expect } from 'vitest';
import { setupVisualTest, compareScreenshots } from './visual-helpers';

describe('Visual Regression', () => {
    it('should render default scene correctly', async () => {
        const { page, cleanup } = await setupVisualTest();
        
        // Wait for scene to stabilize
        await page.waitForTimeout(2000);
        
        // Take screenshot
        const screenshot = await page.screenshot({
            clip: { x: 0, y: 0, width: 800, height: 600 }
        });
        
        // Compare with baseline
        const diff = await compareScreenshots(
            screenshot,
            'baseline/default-scene.png'
        );
        
        expect(diff.percentage).toBeLessThan(0.01); // 1% threshold
        
        await cleanup();
    });
    
    it('should render post-processing effects', async () => {
        const { page, cleanup } = await setupVisualTest();
        
        // Enable all effects
        await page.evaluate(() => {
            window.APP.postProcessing.enable();
        });
        
        await page.waitForTimeout(1000);
        
        const screenshot = await page.screenshot();
        const diff = await compareScreenshots(
            screenshot,
            'baseline/post-processing.png'
        );
        
        expect(diff.percentage).toBeLessThan(0.02);
        
        await cleanup();
    });
});
```

### Performance Tests

#### Benchmark Suite
```javascript
// test/performance/physics-bench.test.js
import { describe, it, expect, bench } from 'vitest';
import { PhysicsWorld } from '@physics/PhysicsWorld';

describe('Physics Performance', () => {
    bench('collision detection with 100 bodies', () => {
        const world = new PhysicsWorld();
        
        // Add 100 bodies
        for (let i = 0; i < 100; i++) {
            world.addBody({
                type: 'sphere',
                radius: 1,
                position: {
                    x: Math.random() * 50,
                    y: Math.random() * 50,
                    z: Math.random() * 50
                }
            });
        }
        
        // Run collision detection
        world.detectCollisions();
    }, {
        time: 5000, // Run for 5 seconds
        iterations: 1000
    });
    
    bench('physics step with 500 bodies', () => {
        const world = new PhysicsWorld();
        
        // Add 500 bodies
        for (let i = 0; i < 500; i++) {
            world.addBody({
                type: ['sphere', 'box'][i % 2],
                radius: 1,
                position: {
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    z: Math.random() * 100
                }
            });
        }
        
        // Run physics step
        world.step(1/60);
    });
});
```

### E2E Tests

#### User Interaction Tests
```javascript
// test/e2e/terminal.test.js
import { test, expect } from '@playwright/test';

test.describe('Terminal Interaction', () => {
    test('should execute commands', async ({ page }) => {
        await page.goto('/');
        
        // Open terminal
        await page.keyboard.press('`');
        await expect(page.locator('.terminal')).toBeVisible();
        
        // Type command
        await page.type('.terminal-input', 'spawn sphere');
        await page.keyboard.press('Enter');
        
        // Verify output
        await expect(page.locator('.terminal-output'))
            .toContainText('Spawned sphere');
        
        // Verify shape was created
        const shapeCount = await page.evaluate(() => 
            window.APP.shapes.getActiveCount()
        );
        expect(shapeCount).toBeGreaterThan(0);
    });
    
    test('should show help', async ({ page }) => {
        await page.goto('/');
        
        // Open terminal and get help
        await page.keyboard.press('`');
        await page.type('.terminal-input', 'help');
        await page.keyboard.press('Enter');
        
        // Verify help content
        const helpText = await page.locator('.terminal-output').textContent();
        expect(helpText).toContain('Available commands:');
        expect(helpText).toContain('spawn');
        expect(helpText).toContain('shapes');
    });
});
```

## Test Utilities

### Mock Factories
```javascript
// test/factories/physics.factory.js
export const createMockBody = (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    type: 'sphere',
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    mass: 1,
    radius: 1,
    ...overrides
});

export const createMockWorld = (bodies = []) => ({
    bodies,
    gravity: { x: 0, y: -9.81, z: 0 },
    step: vi.fn(),
    addBody: vi.fn(),
    removeBody: vi.fn(),
    detectCollisions: vi.fn(() => [])
});
```

### Custom Matchers
```javascript
// test/matchers/three-matchers.js
expect.extend({
    toBeNearVector(received, expected, precision = 2) {
        const pass = 
            Math.abs(received.x - expected.x) < Math.pow(10, -precision) &&
            Math.abs(received.y - expected.y) < Math.pow(10, -precision) &&
            Math.abs(received.z - expected.z) < Math.pow(10, -precision);
        
        return {
            pass,
            message: () => pass
                ? `Expected ${received} not to be near ${expected}`
                : `Expected ${received} to be near ${expected}`
        };
    },
    
    toBeValidColor(received) {
        const pass = 
            received.r >= 0 && received.r <= 1 &&
            received.g >= 0 && received.g <= 1 &&
            received.b >= 0 && received.b <= 1;
        
        return {
            pass,
            message: () => pass
                ? `Expected ${received} not to be a valid color`
                : `Expected ${received} to be a valid color`
        };
    }
});
```

### Test Helpers
```javascript
// test/helpers/async-helpers.js
export const waitForFrame = () => 
    new Promise(resolve => requestAnimationFrame(resolve));

export const waitForFrames = async (count) => {
    for (let i = 0; i < count; i++) {
        await waitForFrame();
    }
};

export const measurePerformance = async (fn, iterations = 100) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        times.push(performance.now() - start);
    }
    
    return {
        min: Math.min(...times),
        max: Math.max(...times),
        avg: times.reduce((a, b) => a + b) / times.length,
        median: times.sort()[Math.floor(times.length / 2)]
    };
};
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
    
  visual:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run visual tests
      run: npm run test:visual
    
    - name: Upload screenshots
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: visual-diff
        path: test/visual/__diff__/
```

### Pre-commit Hooks
```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests for changed files
npm run test:staged

# Run linting
npm run lint:staged

# Check types
npm run typecheck
```

## Test Data Management

### Fixtures
```javascript
// test/fixtures/shapes.json
{
    "testShapes": [
        {
            "type": "sphere",
            "position": { "x": 0, "y": 5, "z": 0 },
            "color": { "r": 1, "g": 0, "b": 0 },
            "scale": 1
        },
        {
            "type": "box",
            "position": { "x": 10, "y": 5, "z": 0 },
            "color": { "r": 0, "g": 1, "b": 0 },
            "scale": 2
        }
    ]
}
```

### Seed Data
```javascript
// test/seeds/scene.seed.js
export const createTestScene = async () => {
    const scene = await createScene();
    
    // Add test shapes
    const shapes = [
        { type: 'sphere', count: 10 },
        { type: 'box', count: 5 },
        { type: 'cone', count: 3 }
    ];
    
    for (const { type, count } of shapes) {
        for (let i = 0; i < count; i++) {
            scene.shapes.spawn(type, {
                x: Math.random() * 20 - 10,
                y: Math.random() * 10 + 5,
                z: Math.random() * 20 - 10
            });
        }
    }
    
    return scene;
};
```

## Coverage Requirements

### Coverage Targets
```javascript
// package.json
{
    "scripts": {
        "test:coverage": "vitest run --coverage",
        "test:coverage:watch": "vitest --coverage"
    },
    "jest": {
        "coverageThreshold": {
            "global": {
                "branches": 80,
                "functions": 80,
                "lines": 80,
                "statements": 80
            },
            "src/physics/**/*.js": {
                "branches": 90,
                "functions": 90,
                "lines": 90,
                "statements": 90
            }
        }
    }
}
```

## Testing Best Practices

### Test Structure
```javascript
// Follow AAA pattern
describe('Feature', () => {
    it('should behave correctly', () => {
        // Arrange
        const input = createTestData();
        
        // Act
        const result = performAction(input);
        
        // Assert
        expect(result).toMatchExpectation();
    });
});
```

### Naming Conventions
- Test files: `*.test.js` or `*.spec.js`
- Test suites: Describe the component/feature
- Test cases: Start with "should"
- Be specific and descriptive

### Isolation Principles
1. No shared state between tests
2. Mock external dependencies
3. Clean up after each test
4. Use beforeEach/afterEach hooks

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Vitest and basic configuration
- Create test structure and helpers
- Write initial unit tests

### Phase 2: Core Tests (Week 3-4)
- Physics system tests
- Shape management tests
- Basic integration tests

### Phase 3: Visual & E2E (Week 5-6)
- Set up Playwright
- Implement visual regression
- Create E2E test suite

### Phase 4: CI/CD & Optimization (Week 7-8)
- GitHub Actions setup
- Coverage reporting
- Performance benchmarks

## Test Status
- **Tests Written**: No
- **Test Coverage**: N/A
- **Status**: This is the testing infrastructure feature itself. It is still in the design phase and has not been implemented yet. Once implemented, it will provide the framework for testing all other features.

## References
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Visual Regression Testing](https://www.browserstack.com/guide/visual-regression-testing)