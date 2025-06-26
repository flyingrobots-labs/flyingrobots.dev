# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website featuring an interactive Three.js cyberpunk demo with physics simulation and an interactive terminal interface. The website displays a resume superimposed over a 3D scene.

## Technology Stack

- **Vite** - Lightning-fast build tool and dev server
- **Three.js** - 3D graphics library with instanced rendering
- **Custom Physics Engine** - Decoupled physics simulation (not using Cannon-ES)
- **ES Modules** - Modern JavaScript module system
- **NPM** - Package management

## Key Features

1. **3D Scene**: Cyberpunk-themed environment with animated shapes and physics
2. **Interactive Terminal**: Command-line interface for scene manipulation
3. **Physics System**: Decoupled physics simulation with mathematical collision detection
4. **Instanced Rendering**: Optimized rendering using Three.js InstancedMesh for performance
5. **Spring-based Camera**: Smooth camera movement using critically damped springs

## Architecture Decisions

### Physics-Graphics Separation
The physics simulation is completely decoupled from the graphics rendering:
- Physics bodies use mathematical representations (spheres, boxes)
- Graphics use complex meshes with instanced rendering
- Physics world updates independently, then graphics sync from physics state
- Located in `src/physics/PhysicsWorld.js`

### Instanced Rendering
All shapes use Three.js InstancedMesh for optimal performance:
- Shared geometries across all instances
- Per-instance transforms and colors
- Can handle 1000+ shapes efficiently
- Managed by `src/components/InstancedShapes.js`

## Project Structure

```
src/
├── index.html              # Entry point
├── main.js                 # Application initialization
├── scene.js                # Main Three.js scene setup
├── physics/
│   └── PhysicsWorld.js     # Decoupled physics simulation
├── components/
│   ├── InstancedShapes.js  # Instanced mesh manager
│   ├── TronGrid.js         # Grid floor effect
│   ├── CyberStructures.js  # Shape creation utilities
│   ├── PostProcessing.js   # Visual effects
│   └── interactive/
│       └── Terminal.js     # Interactive terminal
└── styles/
    ├── main.css            # Main styles
    └── terminal.css        # Terminal-specific styles
```

## Terminal Commands

- `help` - Show available commands
- `shapes` - Display shape count and breakdown by type
- `spawn [type]` - Spawn a new shape (sphere, cone, cylinder, torus, octahedron)
- `aabb` - Toggle AABB (Axis-Aligned Bounding Box) visualization
- `fps` - Toggle FPS counter
- `clear` - Clear terminal
- `about`, `skills`, `projects`, `contact` - Portfolio information

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Performance Considerations

- Instanced rendering reduces draw calls dramatically
- Physics calculations use simplified AABB collision detection
- Visual effects update only when needed
- Terminal renders on-demand
- Camera uses spring physics for smooth movement

## Recent Architecture Changes

### Instanced Rendering Implementation
- Converted from individual meshes to instanced rendering
- All shapes now use `InstancedMesh` for better performance
- Physics bodies are separate from visual instances
- Visual state syncs from physics each frame

### Physics Decoupling
- Physics uses simple mathematical shapes (sphere, box approximations)
- Graphics can have complex geometries
- Collision detection uses AABB (Axis-Aligned Bounding Boxes)
- Forces include gravity, repulsion, and attraction

## Important Notes

- This is a client-side only application with no server communication
- All Three.js models and assets should be optimized for web delivery
- Keep physics calculations performant for smooth user experience
- The camera is decoupled from scroll position to avoid browser notification issues