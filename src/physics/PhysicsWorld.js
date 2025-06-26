import * as THREE from 'three';

// Physics body types with mathematical representations
class PhysicsBody {
    constructor(type, position, scale, mass) {
        this.type = type;
        this.position = position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.force = new THREE.Vector3(0, 0, 0);
        this.mass = mass;
        this.scale = scale;
        this.rotation = 0;
        this.rotationVelocity = (Math.random() - 0.5) * 0.02;
        this.impulseTimer = Math.random() * 300;
        this.id = Math.random(); // Unique identifier
    }
    
    applyForce(force) {
        this.force.add(force);
    }
    
    clearForces() {
        this.force.set(0, 0, 0);
    }
    
    update(dt) {
        // Update velocity from forces
        const acceleration = this.force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration.multiplyScalar(dt));
        
        // Update position from velocity
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        
        // Update rotation
        this.rotation += this.rotationVelocity * dt;
    }
}

// Specific physics shapes with mathematical collision detection
class SphereBody extends PhysicsBody {
    constructor(position, radius, mass) {
        super('sphere', position, radius, mass || radius * radius * 2);
        this.radius = radius;
    }
    
    getAABB() {
        return {
            min: new THREE.Vector3(
                this.position.x - this.radius,
                this.position.y - this.radius,
                this.position.z - this.radius
            ),
            max: new THREE.Vector3(
                this.position.x + this.radius,
                this.position.y + this.radius,
                this.position.z + this.radius
            )
        };
    }
    
    intersectsSphere(other) {
        const distance = this.position.distanceTo(other.position);
        return distance < (this.radius + other.radius);
    }
}

class BoxBody extends PhysicsBody {
    constructor(position, size, mass) {
        super('box', position, 1, mass || size.x * size.y * size.z * 1.5);
        this.size = size.clone();
    }
    
    getAABB() {
        const halfSize = this.size.clone().multiplyScalar(0.5);
        return {
            min: this.position.clone().sub(halfSize),
            max: this.position.clone().add(halfSize)
        };
    }
}

// Simplified physics representations for complex shapes
class ConeBody extends BoxBody {
    constructor(position, radius, height, mass) {
        // Approximate cone with box
        const size = new THREE.Vector3(radius * 2, height, radius * 2);
        super(position, size, mass || radius * height * 1.5);
        this.radius = radius;
        this.height = height;
    }
}

class CylinderBody extends BoxBody {
    constructor(position, radius, height, mass) {
        // Approximate cylinder with box
        const size = new THREE.Vector3(radius * 2, height, radius * 2);
        super(position, size, mass || radius * radius * height * 2);
        this.radius = radius;
        this.height = height;
    }
}

class TorusBody extends SphereBody {
    constructor(position, majorRadius, minorRadius, mass) {
        // Approximate torus with sphere
        const outerRadius = majorRadius + minorRadius;
        super(position, outerRadius, mass || majorRadius * minorRadius * 3);
        this.majorRadius = majorRadius;
        this.minorRadius = minorRadius;
    }
}

class OctahedronBody extends SphereBody {
    constructor(position, radius, mass) {
        // Approximate octahedron with sphere
        super(position, radius, mass || radius * radius * 1.8);
    }
}

// Main physics world
export class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.gravity = new THREE.Vector3(0, -0.1, 0);
        this.bounds = {
            min: new THREE.Vector3(-45, -120, -45),
            max: new THREE.Vector3(45, 30, 45)
        };
        this.damping = 0.98;
        this.G = 2.0; // Gravitational constant for attraction
    }
    
    addBody(body) {
        this.bodies.push(body);
        return body;
    }
    
    createBody(type, position, ...args) {
        let body;
        switch(type) {
            case 'sphere':
                body = new SphereBody(position, ...args);
                break;
            case 'cone':
                body = new ConeBody(position, ...args);
                break;
            case 'cylinder':
                body = new CylinderBody(position, ...args);
                break;
            case 'torus':
                body = new TorusBody(position, ...args);
                break;
            case 'octahedron':
                body = new OctahedronBody(position, ...args);
                break;
            default:
                throw new Error(`Unknown body type: ${type}`);
        }
        
        this.addBody(body);
        return body;
    }
    
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }
    
    update(dt = 0.016) {
        // Clear forces
        this.bodies.forEach(body => body.clearForces());
        
        // Apply gravity
        this.bodies.forEach(body => {
            body.applyForce(this.gravity.clone().multiplyScalar(body.mass));
        });
        
        // Calculate inter-body forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                const distance = body1.position.distanceTo(body2.position);
                
                // Check for collision using AABBs
                const aabb1 = body1.getAABB();
                const aabb2 = body2.getAABB();
                
                if (this.aabbIntersects(aabb1, aabb2)) {
                    // Repulsion force
                    const direction = new THREE.Vector3()
                        .subVectors(body1.position, body2.position)
                        .normalize();
                    
                    const repulsionForce = 50 / (distance + 0.1);
                    
                    body1.applyForce(direction.clone().multiplyScalar(repulsionForce));
                    body2.applyForce(direction.clone().multiplyScalar(-repulsionForce));
                } else if (distance < 30) {
                    // Gravitational attraction
                    const force = this.G * body1.mass * body2.mass / (distance * distance + 1);
                    const direction = new THREE.Vector3()
                        .subVectors(body2.position, body1.position)
                        .normalize()
                        .multiplyScalar(force);
                    
                    body1.applyForce(direction.clone());
                    body2.applyForce(direction.clone().negate());
                }
            }
        }
        
        // Update each body
        this.bodies.forEach(body => {
            // Random impulses
            body.impulseTimer--;
            if (body.impulseTimer <= 0) {
                const impulse = new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 10
                );
                body.applyForce(impulse);
                body.impulseTimer = 200 + Math.random() * 400;
            }
            
            // Update physics
            body.update(dt);
            
            // Apply damping
            body.velocity.multiplyScalar(this.damping);
            
            // Boundary checking
            this.constrainToBounds(body);
        });
    }
    
    aabbIntersects(aabb1, aabb2) {
        return aabb1.max.x > aabb2.min.x && aabb1.min.x < aabb2.max.x &&
               aabb1.max.y > aabb2.min.y && aabb1.min.y < aabb2.max.y &&
               aabb1.max.z > aabb2.min.z && aabb1.min.z < aabb2.max.z;
    }
    
    constrainToBounds(body) {
        const aabb = body.getAABB();
        
        // X bounds
        if (aabb.min.x < this.bounds.min.x) {
            body.position.x += this.bounds.min.x - aabb.min.x;
            body.velocity.x *= -0.7;
        } else if (aabb.max.x > this.bounds.max.x) {
            body.position.x -= aabb.max.x - this.bounds.max.x;
            body.velocity.x *= -0.7;
        }
        
        // Y bounds
        if (aabb.min.y < this.bounds.min.y) {
            body.position.y += this.bounds.min.y - aabb.min.y;
            body.velocity.y *= -0.7;
        } else if (aabb.max.y > this.bounds.max.y) {
            body.position.y -= aabb.max.y - this.bounds.max.y;
            body.velocity.y *= -0.7;
        }
        
        // Z bounds
        if (aabb.min.z < this.bounds.min.z) {
            body.position.z += this.bounds.min.z - aabb.min.z;
            body.velocity.z *= -0.7;
        } else if (aabb.max.z > this.bounds.max.z) {
            body.position.z -= aabb.max.z - this.bounds.max.z;
            body.velocity.z *= -0.7;
        }
    }
    
    getBodyAt(position, radius = 5) {
        // Find body near position
        for (const body of this.bodies) {
            if (body.position.distanceTo(position) < radius) {
                return body;
            }
        }
        return null;
    }
}