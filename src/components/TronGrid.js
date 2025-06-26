import * as THREE from 'three';

export function createTronGrid() {
    const gridGroup = new THREE.Group();

    // Create multiple grid layers for depth
    for (let layer = 0; layer < 25; layer++) {
        const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x004499);
        gridHelper.position.y = -layer * 8;
        
        // Make grids fade with distance
        const material = gridHelper.material;
        material.opacity = Math.max(0.05, 1 - layer * 0.08);
        material.transparent = true;
        
        gridGroup.add(gridHelper);
    }

    // Add some vertical lines for extra effect
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-50 + i * 2, 60, -50),
            new THREE.Vector3(-50 + i * 2, -200, -50)
        ]);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            opacity: 0.3, 
            transparent: true 
        });
        const line = new THREE.Line(geometry, material);
        gridGroup.add(line);
    }

    // Add horizontal depth lines
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-50, -i * 4, -50 + i * 2),
            new THREE.Vector3(50, -i * 4, -50 + i * 2)
        ]);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xff6600, 
            opacity: 0.2, 
            transparent: true 
        });
        const line = new THREE.Line(geometry, material);
        gridGroup.add(line);
    }

    return gridGroup;
}