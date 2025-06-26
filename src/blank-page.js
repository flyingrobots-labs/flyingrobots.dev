import Zdog from './zdog-wrapper.js';
// Or if you want explicit control:
// import { zdogReady } from './zdog-wrapper.js';
// const Zdog = await zdogReady;

console.log('Hello from blank page!');
console.log('Zdog loaded:', Zdog);

// Example usage
console.log('hello James');

const h1 = document.querySelector('h1');
h1.addEventListener('click', () => {
    h1.textContent = 'Clicked!';
});

const canvas = document.querySelector('.zdog-canvas');
console.log('Canvas found:', canvas);

// You can use Zdog here
const illo = new Zdog.Illustration({
    element: '.zdog-canvas',
    zoom: 0.8,
});

// Letter spacing
const spacing = 100;
const strokeWidth = 15;
const letterColor = '#636';

// J
const jGroup = new Zdog.Group({
    addTo: illo,
    translate: { x: -spacing * 2 }
});

new Zdog.Shape({
    addTo: jGroup,
    path: [
        { x: 0, y: -40 },
        { x: 0, y: 20 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

new Zdog.Ellipse({
    addTo: jGroup,
    diameter: 40,
    quarters: 2,
    translate: { x: -20, y: 20 },
    rotate: { z: Zdog.TAU/4 },
    stroke: strokeWidth,
    color: letterColor
});

new Zdog.Shape({
    addTo: jGroup,
    path: [
        { x: -30, y: -40 },
        { x: 30, y: -40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// A
const aGroup = new Zdog.Group({
    addTo: illo,
    translate: { x: -spacing }
});

// Left diagonal
new Zdog.Shape({
    addTo: aGroup,
    path: [
        { x: -25, y: 40 },
        { x: 0, y: -40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Right diagonal
new Zdog.Shape({
    addTo: aGroup,
    path: [
        { x: 0, y: -40 },
        { x: 25, y: 40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Crossbar
new Zdog.Shape({
    addTo: aGroup,
    path: [
        { x: -12, y: 10 },
        { x: 12, y: 10 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// M
const mGroup = new Zdog.Group({
    addTo: illo,
    translate: { x: 0 }
});

// Left vertical
new Zdog.Shape({
    addTo: mGroup,
    path: [
        { x: -30, y: 40 },
        { x: -30, y: -40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Left diagonal
new Zdog.Shape({
    addTo: mGroup,
    path: [
        { x: -30, y: -40 },
        { x: 0, y: 0 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Right diagonal
new Zdog.Shape({
    addTo: mGroup,
    path: [
        { x: 0, y: 0 },
        { x: 30, y: -40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Right vertical
new Zdog.Shape({
    addTo: mGroup,
    path: [
        { x: 30, y: -40 },
        { x: 30, y: 40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// E
const eGroup = new Zdog.Group({
    addTo: illo,
    translate: { x: spacing }
});

// Vertical
new Zdog.Shape({
    addTo: eGroup,
    path: [
        { x: -20, y: -40 },
        { x: -20, y: 40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Top horizontal
new Zdog.Shape({
    addTo: eGroup,
    path: [
        { x: -20, y: -40 },
        { x: 20, y: -40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Middle horizontal
new Zdog.Shape({
    addTo: eGroup,
    path: [
        { x: -20, y: 0 },
        { x: 15, y: 0 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// Bottom horizontal
new Zdog.Shape({
    addTo: eGroup,
    path: [
        { x: -20, y: 40 },
        { x: 20, y: 40 }
    ],
    stroke: strokeWidth,
    color: letterColor
});

// S - using many bezier segments for ultra-smooth curves
const sGroup = new Zdog.Group({
    addTo: illo,
    translate: { x: spacing * 2 }
});

new Zdog.Shape({
    addTo: sGroup,
    path: [
        { x: 18, y: -35 },  // Start at top right
        // Top curve (right to left) - 5 segments
        { bezier: [
            { x: 20, y: -38 },
            { x: 20, y: -42 },
            { x: 17, y: -44 }
        ]},
        { bezier: [
            { x: 14, y: -46 },
            { x: 10, y: -47 },
            { x: 5, y: -47 }
        ]},
        { bezier: [
            { x: 0, y: -47 },
            { x: -5, y: -46 },
            { x: -10, y: -44 }
        ]},
        { bezier: [
            { x: -15, y: -42 },
            { x: -18, y: -39 },
            { x: -20, y: -35 }
        ]},
        { bezier: [
            { x: -22, y: -31 },
            { x: -23, y: -27 },
            { x: -23, y: -23 }
        ]},
        // Top to middle transition - 5 segments
        { bezier: [
            { x: -23, y: -19 },
            { x: -22, y: -15 },
            { x: -20, y: -12 }
        ]},
        { bezier: [
            { x: -18, y: -9 },
            { x: -15, y: -6 },
            { x: -10, y: -3 }
        ]},
        { bezier: [
            { x: -5, y: 0 },
            { x: 0, y: 2 },
            { x: 5, y: 4 }
        ]},
        { bezier: [
            { x: 10, y: 6 },
            { x: 15, y: 9 },
            { x: 18, y: 12 }
        ]},
        { bezier: [
            { x: 21, y: 15 },
            { x: 23, y: 19 },
            { x: 23, y: 23 }
        ]},
        // Bottom transition - 5 segments
        { bezier: [
            { x: 23, y: 27 },
            { x: 22, y: 31 },
            { x: 20, y: 35 }
        ]},
        { bezier: [
            { x: 18, y: 39 },
            { x: 15, y: 42 },
            { x: 10, y: 44 }
        ]},
        { bezier: [
            { x: 5, y: 46 },
            { x: 0, y: 47 },
            { x: -5, y: 47 }
        ]},
        { bezier: [
            { x: -10, y: 47 },
            { x: -14, y: 46 },
            { x: -17, y: 44 }
        ]},
        { bezier: [
            { x: -20, y: 42 },
            { x: -20, y: 38 },
            { x: -18, y: 35 }
        ]}
    ],
    closed: false,
    stroke: strokeWidth,
    color: letterColor
});

illo.updateRenderGraph();

function animate() {
    illo.rotate.y += 0.03;
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
}

animate();