# Architecture Documentation - Flying Robots Portfolio

## Overview

This project is a cyberpunk-themed portfolio website featuring an interactive 3D scene with physics simulation, instanced rendering, and a command-line interface. The architecture emphasizes performance through instanced rendering and clean separation between physics simulation and visual representation.

## Core Architecture Principles

### 1. Physics-Graphics Decoupling

The physics simulation is completely separated from the graphics rendering:

```mermaid
graph TB
    subgraph "Physics Layer"
        PW[PhysicsWorld]
        PB[Physics Bodies]
        AABB[AABB Collision]
        PW --> PB
        PB --> AABB
    end
    
    subgraph "Graphics Layer"
        SM[ShapeManager]
        IM[Instanced Meshes]
        VIS[Visual State]
        SM --> IM
        SM --> VIS
    end
    
    subgraph "Sync Layer"
        UP[updateFromPhysics]
        PB -.-> UP
        UP -.-> VIS
        VIS -.-> IM
    end
```

**Benefits:**
- Physics can use simple shapes (spheres, boxes) for efficient collision detection
- Graphics can have complex geometries without affecting physics performance
- Easy to debug by visualizing physics bodies separately

### 2. Instanced Rendering

All shapes use Three.js InstancedMesh for optimal performance:

```mermaid
graph LR
    subgraph "Traditional Rendering"
        M1[Mesh 1] --> DC1[Draw Call 1]
        M2[Mesh 2] --> DC2[Draw Call 2]
        M3[Mesh 3] --> DC3[Draw Call 3]
        MN[Mesh N] --> DCN[Draw Call N]
    end
    
    subgraph "Instanced Rendering"
        GEO[Shared Geometry]
        MAT[Shared Material]
        INST[Instance Data<br/>- Position<br/>- Rotation<br/>- Color]
        GEO --> IM[InstancedMesh]
        MAT --> IM
        INST --> IM
        IM --> DC[Single Draw Call]
    end
```

**Implementation:**
- One geometry per shape type (sphere, cone, cylinder, etc.)
- Shared materials with per-instance colors
- Can handle 1000+ instances efficiently

## System Components

### 1. Scene Management (`scene.js`)

The main scene orchestrator that handles:
- Three.js scene setup
- Camera with spring physics
- Animation loop
- Lighting system
- Scene manager API for terminal commands

```mermaid
sequenceDiagram
    participant Main
    participant Scene
    participant Physics
    participant Graphics
    participant Renderer
    
    Main->>Scene: init()
    Scene->>Physics: new PhysicsWorld()
    Scene->>Graphics: new InstancedShapeManager(physics)
    
    loop Animation Frame
        Scene->>Physics: update(deltaTime)
        Physics->>Physics: Calculate forces & collisions
        Scene->>Graphics: updateFromPhysics()
        Graphics->>Graphics: Sync visual state
        Scene->>Renderer: render()
    end
```

### 2. Physics System (`PhysicsWorld.js`)

Mathematical physics simulation with:
- Body types: Sphere, Box (for cones, cylinders, etc.)
- Forces: Gravity, attraction, repulsion
- AABB collision detection
- Boundary constraints

```mermaid
classDiagram
    class PhysicsWorld {
        +bodies: PhysicsBody[]
        +gravity: Vector3
        +bounds: Object
        +update(dt)
        +createBody(type, position, ...)
        +removeBody(body)
    }
    
    class PhysicsBody {
        +type: string
        +position: Vector3
        +velocity: Vector3
        +force: Vector3
        +mass: number
        +update(dt)
        +applyForce(force)
        +getAABB()
    }
    
    class SphereBody {
        +radius: number
        +intersectsSphere(other)
    }
    
    class BoxBody {
        +size: Vector3
    }
    
    PhysicsWorld --> PhysicsBody
    PhysicsBody <|-- SphereBody
    PhysicsBody <|-- BoxBody
```

### 3. Graphics System (`InstancedShapes.js`)

Manages visual representation using instanced rendering:

```mermaid
graph TB
    subgraph "InstancedShapeManager"
        ISM[Manager]
        IM_S[Sphere Instances]
        IM_C[Cone Instances]
        IM_CY[Cylinder Instances]
        IM_T[Torus Instances]
        IM_O[Octahedron Instances]
        
        ISM --> IM_S
        ISM --> IM_C
        ISM --> IM_CY
        ISM --> IM_T
        ISM --> IM_O
    end
    
    subgraph "Data Mapping"
        MAP[bodyToInstance Map]
        PB[Physics Body] --> MAP
        MAP --> INST[Instance Info<br/>- type<br/>- index<br/>- color<br/>- scale]
    end
```

### 4. Terminal System (`Terminal.js`)

Interactive command-line interface with:

```mermaid
stateDiagram-v2
    [*] --> Hidden
    Hidden --> Visible: Toggle Terminal
    Visible --> Hidden: Toggle Terminal
    
    Visible --> Command_Input
    Command_Input --> Parse_Command: Enter
    Parse_Command --> Execute_Command
    Execute_Command --> Update_Scene: Scene Commands
    Execute_Command --> Show_Info: Info Commands
    Execute_Command --> Error: Invalid Command
    
    Update_Scene --> Command_Input
    Show_Info --> Command_Input
    Error --> Command_Input
```

**Available Commands:**
- `help` - Show available commands
- `shapes` - Display shape count with breakdown
- `spawn [type]` - Spawn new shape
- `aabb` - Toggle AABB visualization
- `fps` - Toggle FPS counter
- `visuals` - Toggle visual meshes
- `physics` - Toggle physics wireframes
- `grid` - Toggle grid floor
- `ui` - Toggle HTML UI elements

## Camera System

The camera uses a critically damped spring system for smooth movement:

```mermaid
graph LR
    subgraph "Spring Physics"
        TARGET[Target Position]
        SPRING[Spring Force]
        DAMP[Damping Force]
        VEL[Velocity]
        POS[Position]
        
        TARGET --> SPRING
        SPRING --> VEL
        DAMP --> VEL
        VEL --> POS
    end
    
    subgraph "Inputs"
        WASD[WASD Keys]
        SCROLL[Scroll]
        MOUSE[Mouse Look]
        
        WASD --> TARGET
        SCROLL --> TARGET
        MOUSE --> TARGET
    end
```

**Spring Parameters:**
- Stiffness: 4.0 (how quickly it responds)
- Damping: 8.0 (prevents oscillation)
- Mass: 1.0 (inertia)

## Performance Optimizations

### 1. Instanced Rendering
- Reduces draw calls from N to 1 per shape type
- Shared geometries and materials
- Per-instance data only for transforms and colors

### 2. Physics Optimizations
- Simple collision shapes (AABB)
- Spatial bounds to limit calculations
- No complex mesh collisions

### 3. Rendering Pipeline
- Frustum culling disabled for physics objects
- Optional post-processing effects
- On-demand UI updates

## Data Flow

```mermaid
graph TD
    subgraph "User Input"
        TERM[Terminal Commands]
        KEYS[Keyboard Input]
        MOUSE[Mouse Input]
    end
    
    subgraph "Core Systems"
        SCENE[Scene Manager]
        PHYS[Physics World]
        GRAPH[Graphics Manager]
    end
    
    subgraph "Output"
        RENDER[WebGL Renderer]
        UI[HTML UI]
    end
    
    TERM --> SCENE
    KEYS --> SCENE
    MOUSE --> SCENE
    
    SCENE --> PHYS
    PHYS --> GRAPH
    GRAPH --> RENDER
    SCENE --> UI
```

## Build System

The project uses Vite for:
- ES Module support
- Hot Module Replacement (development)
- Optimized production builds
- Asset handling

```mermaid
graph LR
    subgraph "Development"
        SRC[Source Files]
        VITE[Vite Dev Server]
        HMR[Hot Module Replacement]
        BROWSER[Browser]
        
        SRC --> VITE
        VITE --> HMR
        HMR --> BROWSER
    end
    
    subgraph "Production"
        SRC2[Source Files]
        BUILD[Vite Build]
        BUNDLE[Optimized Bundle]
        DIST[Distribution]
        
        SRC2 --> BUILD
        BUILD --> BUNDLE
        BUNDLE --> DIST
    end
```

## File Structure

```
src/
├── index.html              # Entry point
├── main.js                 # Application initialization
├── scene.js                # Three.js scene management
├── physics/
│   └── PhysicsWorld.js     # Decoupled physics engine
├── components/
│   ├── InstancedShapes.js  # Instanced mesh manager
│   ├── TronGrid.js         # Grid floor effect
│   ├── PostProcessing.js   # Visual effects
│   └── interactive/
│       └── Terminal.js     # Command-line interface
└── styles/
    ├── main.css            # Main styles
    └── terminal.css        # Terminal styles
```

## Future Enhancements

1. **Spatial Partitioning**
   - Implement octree/quadtree for physics
   - Further optimize collision detection

2. **Level of Detail (LOD)**
   - Reduce complexity for distant objects
   - Dynamic quality adjustments

3. **WebWorkers**
   - Move physics to separate thread
   - Parallel processing for large simulations

4. **Advanced Terminal**
   - Command history persistence
   - Scripting support
   - Batch operations

5. **Visual Enhancements**
   - Particle effects
   - Advanced shaders
   - Dynamic lighting effects