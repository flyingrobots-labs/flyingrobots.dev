# Feature: State Management

## Overview
A centralized state management system to handle application state, user preferences, scene configuration, and data flow between components. This system will provide a single source of truth and enable features like state persistence, undo/redo, and debugging.

## Status
- **Current State**: Planned
- **Version**: 0.1.0 (Design Phase)
- **Last Updated**: 2025-01-06
- **Priority**: Medium

## Design Goals

### Primary Objectives
1. **Single Source of Truth**: Centralized state container
2. **Predictable Updates**: Immutable state transitions
3. **Performance**: Efficient change detection and updates
4. **Developer Experience**: Clear API and debugging tools
5. **Persistence**: Save and restore application state

### Core Principles
- **Immutability**: State is never directly mutated
- **Unidirectional Flow**: Clear data flow pattern
- **Type Safety**: TypeScript support for state shape
- **Reactivity**: Components auto-update on state changes

## Technical Architecture

### State Structure
```
AppState
├── Scene
│   ├── Camera
│   ├── Lighting
│   ├── PostProcessing
│   └── Environment
├── Physics
│   ├── World
│   ├── Bodies
│   └── Configuration
├── Shapes
│   ├── Instances
│   ├── Materials
│   └── Animations
├── UI
│   ├── Terminal
│   ├── Overlay
│   └── Controls
├── User
│   ├── Preferences
│   ├── Session
│   └── History
└── Performance
    ├── Metrics
    ├── Quality
    └── Throttling
```

### Implementation Design

#### Core Store
```javascript
class StateStore {
    constructor(initialState = {}) {
        this._state = this._deepFreeze(initialState);
        this._subscribers = new Map();
        this._middleware = [];
        this._history = [];
        this._historyIndex = -1;
    }
    
    getState() {
        return this._state;
    }
    
    dispatch(action) {
        // Run middleware
        const finalAction = this._runMiddleware(action);
        
        // Calculate new state
        const newState = this._rootReducer(this._state, finalAction);
        
        // Update if changed
        if (newState !== this._state) {
            this._updateState(newState);
            this._notifySubscribers(finalAction);
        }
        
        return finalAction;
    }
    
    subscribe(path, callback) {
        if (!this._subscribers.has(path)) {
            this._subscribers.set(path, new Set());
        }
        this._subscribers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            this._subscribers.get(path).delete(callback);
        };
    }
}
```

#### State Shape
```typescript
interface AppState {
    scene: {
        camera: {
            position: Vector3;
            rotation: Euler;
            fov: number;
            springConfig: SpringConfig;
        };
        lighting: {
            ambient: Color;
            directional: LightConfig[];
            fog: FogConfig;
        };
        postProcessing: {
            bloom: BloomConfig;
            chromaticAberration: number;
            radialBlur: number;
        };
    };
    
    physics: {
        enabled: boolean;
        gravity: Vector3;
        timeScale: number;
        bodies: PhysicsBody[];
    };
    
    shapes: {
        instances: ShapeInstance[];
        maxCount: number;
        spawnRate: number;
        materials: MaterialConfig[];
    };
    
    ui: {
        terminal: {
            visible: boolean;
            history: string[];
            output: TerminalLine[];
        };
        overlay: {
            fps: boolean;
            debug: boolean;
            stats: boolean;
        };
    };
    
    user: {
        preferences: {
            quality: 'low' | 'medium' | 'high';
            reducedMotion: boolean;
            theme: 'dark' | 'light';
        };
        session: {
            startTime: number;
            interactionCount: number;
            achievements: string[];
        };
    };
}
```

### State Updates

#### Actions
```javascript
// Action types
const ActionTypes = {
    // Scene actions
    CAMERA_MOVE: 'CAMERA_MOVE',
    CAMERA_SET_FOV: 'CAMERA_SET_FOV',
    LIGHTING_UPDATE: 'LIGHTING_UPDATE',
    
    // Shape actions
    SHAPE_SPAWN: 'SHAPE_SPAWN',
    SHAPE_DESTROY: 'SHAPE_DESTROY',
    SHAPE_UPDATE_TRANSFORM: 'SHAPE_UPDATE_TRANSFORM',
    
    // UI actions
    TERMINAL_TOGGLE: 'TERMINAL_TOGGLE',
    TERMINAL_ADD_OUTPUT: 'TERMINAL_ADD_OUTPUT',
    OVERLAY_TOGGLE: 'OVERLAY_TOGGLE',
    
    // User actions
    USER_SET_PREFERENCE: 'USER_SET_PREFERENCE',
    USER_ACHIEVEMENT_UNLOCK: 'USER_ACHIEVEMENT_UNLOCK'
};

// Action creators
const actions = {
    moveCamera: (position) => ({
        type: ActionTypes.CAMERA_MOVE,
        payload: { position }
    }),
    
    spawnShape: (type, position) => ({
        type: ActionTypes.SHAPE_SPAWN,
        payload: { type, position, id: generateId() }
    }),
    
    setUserPreference: (key, value) => ({
        type: ActionTypes.USER_SET_PREFERENCE,
        payload: { key, value }
    })
};
```

#### Reducers
```javascript
// Root reducer composition
function rootReducer(state, action) {
    return {
        scene: sceneReducer(state.scene, action),
        physics: physicsReducer(state.physics, action),
        shapes: shapesReducer(state.shapes, action),
        ui: uiReducer(state.ui, action),
        user: userReducer(state.user, action)
    };
}

// Example reducer
function sceneReducer(state = initialSceneState, action) {
    switch (action.type) {
        case ActionTypes.CAMERA_MOVE:
            return {
                ...state,
                camera: {
                    ...state.camera,
                    position: action.payload.position
                }
            };
            
        case ActionTypes.CAMERA_SET_FOV:
            return {
                ...state,
                camera: {
                    ...state.camera,
                    fov: action.payload.fov
                }
            };
            
        default:
            return state;
    }
}
```

### Change Detection

#### Efficient Updates
```javascript
class StateSelector {
    constructor(store) {
        this.store = store;
        this.cache = new WeakMap();
    }
    
    select(selector) {
        const state = this.store.getState();
        
        // Check cache
        if (this.cache.has(selector)) {
            const cached = this.cache.get(selector);
            if (cached.state === state) {
                return cached.result;
            }
        }
        
        // Calculate and cache
        const result = selector(state);
        this.cache.set(selector, { state, result });
        
        return result;
    }
    
    createMemoizedSelector(...args) {
        const selector = args.pop();
        const dependencies = args;
        
        let lastArgs = [];
        let lastResult = null;
        
        return (state) => {
            const currentArgs = dependencies.map(dep => dep(state));
            
            if (this.shallowEqual(lastArgs, currentArgs)) {
                return lastResult;
            }
            
            lastArgs = currentArgs;
            lastResult = selector(...currentArgs);
            return lastResult;
        };
    }
}
```

### Middleware System

#### Logger Middleware
```javascript
const loggerMiddleware = (store) => (next) => (action) => {
    console.group(action.type);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    
    const result = next(action);
    
    console.log('Next State:', store.getState());
    console.groupEnd();
    
    return result;
};
```

#### Performance Middleware
```javascript
const performanceMiddleware = (store) => (next) => (action) => {
    const start = performance.now();
    const result = next(action);
    const duration = performance.now() - start;
    
    if (duration > 16) { // Longer than one frame
        console.warn(`Slow action ${action.type}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
};
```

### State Persistence

#### Local Storage
```javascript
class StatePersistence {
    constructor(store, config = {}) {
        this.store = store;
        this.config = {
            key: 'app-state',
            version: 1,
            whitelist: ['user', 'ui'],
            blacklist: ['performance'],
            debounce: 1000,
            ...config
        };
        
        this.scheduleSave = debounce(this.save.bind(this), this.config.debounce);
    }
    
    save() {
        const state = this.store.getState();
        const filtered = this.filterState(state);
        
        const data = {
            version: this.config.version,
            timestamp: Date.now(),
            state: filtered
        };
        
        try {
            localStorage.setItem(this.config.key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
    
    load() {
        try {
            const data = localStorage.getItem(this.config.key);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            
            // Version check
            if (parsed.version !== this.config.version) {
                return this.migrate(parsed);
            }
            
            return parsed.state;
        } catch (e) {
            console.error('Failed to load state:', e);
            return null;
        }
    }
}
```

### Time Travel Debugging

#### History Management
```javascript
class StateHistory {
    constructor(store, maxSize = 50) {
        this.store = store;
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
    }
    
    push(state, action) {
        // Remove future history if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Add new entry
        this.history.push({ state, action, timestamp: Date.now() });
        
        // Limit size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }
    
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const { state } = this.history[this.currentIndex];
            this.store.replaceState(state);
        }
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const { state } = this.history[this.currentIndex];
            this.store.replaceState(state);
        }
    }
}
```

## Integration Strategy

### Three.js Integration
```javascript
// Sync Three.js objects with state
class ThreeStateSync {
    constructor(store, scene) {
        this.store = store;
        this.scene = scene;
        
        // Subscribe to relevant state changes
        store.subscribe('scene.camera', this.updateCamera.bind(this));
        store.subscribe('scene.lighting', this.updateLighting.bind(this));
        store.subscribe('shapes.instances', this.updateShapes.bind(this));
    }
    
    updateCamera(cameraState) {
        const camera = this.scene.camera;
        camera.position.copy(cameraState.position);
        camera.rotation.copy(cameraState.rotation);
        camera.fov = cameraState.fov;
        camera.updateProjectionMatrix();
    }
}
```

### React Integration (Future)
```javascript
// React hook for state access
function useAppState(selector) {
    const store = useContext(StateContext);
    const [value, setValue] = useState(() => selector(store.getState()));
    
    useEffect(() => {
        return store.subscribe(selector, setValue);
    }, [store, selector]);
    
    return value;
}

// Usage
function ShapeCounter() {
    const shapeCount = useAppState(state => state.shapes.instances.length);
    return <div>Shapes: {shapeCount}</div>;
}
```

## Performance Optimizations

### Batch Updates
```javascript
class BatchedStore extends StateStore {
    constructor(initialState) {
        super(initialState);
        this.pendingActions = [];
        this.isBatching = false;
    }
    
    startBatch() {
        this.isBatching = true;
    }
    
    endBatch() {
        this.isBatching = false;
        this.processPendingActions();
    }
    
    dispatch(action) {
        if (this.isBatching) {
            this.pendingActions.push(action);
            return action;
        }
        
        return super.dispatch(action);
    }
}
```

### Selective Updates
```javascript
// Only update components that care about specific state
class SelectiveSubscriber {
    constructor(store) {
        this.store = store;
        this.subscriptions = new Map();
    }
    
    subscribe(path, callback) {
        const selector = this.createPathSelector(path);
        let previousValue = selector(this.store.getState());
        
        return this.store.subscribe(() => {
            const currentValue = selector(this.store.getState());
            
            if (currentValue !== previousValue) {
                previousValue = currentValue;
                callback(currentValue);
            }
        });
    }
}
```

## Developer Tools

### State Inspector
```javascript
class StateInspector {
    constructor(store) {
        this.store = store;
        
        // Expose to window for debugging
        window.__APP_STATE__ = {
            getState: () => store.getState(),
            dispatch: (action) => store.dispatch(action),
            subscribe: (path, cb) => store.subscribe(path, cb),
            history: store.history
        };
    }
    
    createDevToolsExtension() {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            return window.__REDUX_DEVTOOLS_EXTENSION__.connect({
                name: 'FlyingRobots State'
            });
        }
    }
}
```

### Terminal Commands
```bash
state                  # Show current state tree
state.scene           # Show scene state
state.dispatch ACTION # Dispatch an action
state.history         # Show action history
state.undo           # Undo last action
state.redo           # Redo action
state.export         # Export current state
state.import FILE    # Import state from file
```

## Testing Strategy

### Unit Tests
```javascript
describe('StateStore', () => {
    it('should update state immutably', () => {
        const store = new StateStore({ count: 0 });
        const initialState = store.getState();
        
        store.dispatch({ type: 'INCREMENT' });
        
        expect(store.getState()).not.toBe(initialState);
        expect(store.getState().count).toBe(1);
    });
    
    it('should notify subscribers on change', () => {
        const store = new StateStore({ value: 'initial' });
        const callback = jest.fn();
        
        store.subscribe('value', callback);
        store.dispatch({ type: 'UPDATE', payload: 'new' });
        
        expect(callback).toHaveBeenCalledWith('new');
    });
});
```

## Implementation Phases

### Phase 1: Core State System (Week 1-2)
- Basic store implementation
- Action/reducer pattern
- Simple subscriptions

### Phase 2: Integration (Week 3-4)
- Three.js synchronization
- Terminal command support
- Basic persistence

### Phase 3: Advanced Features (Week 5-6)
- Time travel debugging
- Middleware system
- Performance optimizations

### Phase 4: Developer Tools (Week 7-8)
- State inspector
- DevTools extension
- Documentation and examples

## Migration Plan

### Current State Locations
1. **Camera State**: In scene.js closure
2. **Shape State**: In InstancedShapes class
3. **Physics State**: In PhysicsWorld class
4. **UI State**: In DOM and Terminal class

### Migration Strategy
1. Create initial state shape
2. Implement store with existing structure
3. Gradually move state management
4. Remove old state handling
5. Add new features

## Future Enhancements

### Planned Features
1. **State Machines**: For complex UI flows
2. **Computed State**: Derived values with memoization
3. **Remote Sync**: Multi-device state sync
4. **State Validation**: Runtime type checking

### Advanced Patterns
1. **Event Sourcing**: Store events, not state
2. **CQRS**: Separate read/write models
3. **Sagas**: Complex async flows
4. **State Charts**: Visual state modeling

## Test Status
- **Tests Written**: No
- **Test Coverage**: 0%
- **Status**: Tests need to be written. This feature is still in the design phase and has not been implemented yet.

## References
- [Redux Documentation](https://redux.js.org/)
- [MobX State Tree](https://mobx-state-tree.js.org/)
- [XState](https://xstate.js.org/)
- [Immer](https://immerjs.github.io/)