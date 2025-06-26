import * as THREE from 'three';

export function createCyberStructures() {
    const structureGroup = new THREE.Group();

    // Create wireframe spheres (like 90s raycasting)
    for (let i = 0; i < 12; i++) {
        const x = (Math.random() - 0.5) * 80;
        const y = -20 - Math.random() * 100;
        const z = (Math.random() - 0.5) * 80;
        const radius = 3 + Math.random() * 8;
        
        createWireframeSphere(x, y, z, radius, structureGroup);
    }

    // Create wireframe cones
    for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 70;
        const y = -10 - Math.random() * 80;
        const z = (Math.random() - 0.5) * 70;
        const radius = 2 + Math.random() * 6;
        const height = 8 + Math.random() * 15;
        
        createWireframeCone(x, y, z, radius, height, structureGroup);
    }

    // Create wireframe cylinders
    for (let i = 0; i < 6; i++) {
        const x = (Math.random() - 0.5) * 60;
        const y = -Math.random() * 60;
        const z = (Math.random() - 0.5) * 60;
        const radius = 1 + Math.random() * 3;
        const height = 15 + Math.random() * 25;
        
        createWireframeCylinder(x, y, z, radius, height, structureGroup);
    }

    // Create wireframe torus (donuts!)
    for (let i = 0; i < 4; i++) {
        const x = (Math.random() - 0.5) * 50;
        const y = -20 - Math.random() * 40;
        const z = (Math.random() - 0.5) * 50;
        const radius = 4 + Math.random() * 6;
        const tube = 1 + Math.random() * 2;
        
        createWireframeTorus(x, y, z, radius, tube, structureGroup);
    }

    // Create wireframe octahedrons (classic 90s shape)
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = -Math.random() * 80;
        const z = (Math.random() - 0.5) * 40;
        const radius = 3 + Math.random() * 5;
        
        createWireframeOctahedron(x, y, z, radius, structureGroup);
    }

    return structureGroup;
}

export function createWireframeSphere(x, y, z, radius, parent) {
    const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
    const geometry = new THREE.SphereGeometry(radius, 32, 24);
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100,
        transparent: false,
        opacity: 1.0
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    
    // Add physics properties
    sphere.userData = {
        mass: radius * radius * 2, // Mass based on size
        velocity: new THREE.Vector3(0, 0, 0),
        force: new THREE.Vector3(0, 0, 0),
        size: radius * 2, // AABB size
        rotSpeed: (Math.random() - 0.5) * 0.02,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        impulseTimer: Math.random() * 300, // Random impulse timing
        type: 'sphere'
    };
    
    parent.add(sphere);
}

export function createWireframeCone(x, y, z, radius, height, parent) {
    const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
    const geometry = new THREE.ConeGeometry(radius, height, 16, 8);
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100,
        transparent: false,
        opacity: 1.0
    });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.set(x, y, z);
    cone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    cone.castShadow = true;
    cone.receiveShadow = true;
    
    // Add physics properties
    cone.userData = {
        mass: radius * height * 1.5,
        velocity: new THREE.Vector3(0, 0, 0),
        force: new THREE.Vector3(0, 0, 0),
        size: Math.max(radius * 2, height),
        rotSpeed: (Math.random() - 0.5) * 0.015,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        impulseTimer: Math.random() * 300,
        type: 'cone'
    };
    
    parent.add(cone);
}

export function createWireframeCylinder(x, y, z, radius, height, parent) {
    const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 16, 8);
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100,
        transparent: false,
        opacity: 1.0
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(x, y, z);
    cylinder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    
    // Add physics properties
    cylinder.userData = {
        mass: radius * height * 2,
        velocity: new THREE.Vector3(0, 0, 0),
        force: new THREE.Vector3(0, 0, 0),
        size: Math.max(radius * 2, height),
        rotSpeed: (Math.random() - 0.5) * 0.01,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        impulseTimer: Math.random() * 300,
        type: 'cylinder'
    };
    
    parent.add(cylinder);
}

export function createWireframeTorus(x, y, z, radius, tube, parent) {
    const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
    const geometry = new THREE.TorusGeometry(radius, tube, 16, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100,
        transparent: false,
        opacity: 1.0
    });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(x, y, z);
    torus.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    torus.castShadow = true;
    torus.receiveShadow = true;
    
    // Add physics properties
    torus.userData = {
        mass: (radius + tube) * tube * 3,
        velocity: new THREE.Vector3(0, 0, 0),
        force: new THREE.Vector3(0, 0, 0),
        size: (radius + tube) * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        impulseTimer: Math.random() * 300,
        type: 'torus'
    };
    
    parent.add(torus);
}

export function createWireframeOctahedron(x, y, z, radius, parent) {
    const colors = [0x00ffff, 0xff6600, 0x9966ff, 0xff00ff, 0x00ff00];
    const geometry = new THREE.OctahedronGeometry(radius);
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 0.2,
        shininess: 100,
        transparent: false,
        opacity: 1.0
    });
    const octahedron = new THREE.Mesh(geometry, material);
    octahedron.position.set(x, y, z);
    octahedron.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    octahedron.castShadow = true;
    octahedron.receiveShadow = true;
    
    // Add physics properties
    octahedron.userData = {
        mass: radius * radius * 1.8,
        velocity: new THREE.Vector3(0, 0, 0),
        force: new THREE.Vector3(0, 0, 0),
        size: radius * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        impulseTimer: Math.random() * 300,
        type: 'octahedron'
    };
    
    parent.add(octahedron);
}