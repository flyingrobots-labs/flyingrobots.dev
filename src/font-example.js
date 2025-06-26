import Zdog from './zdog-wrapper.js';
import { create3DText } from './font-to-zdog.js';

// Wait for Typr.js to load (you'll need to add this to your HTML)
// <script src="https://cdn.jsdelivr.net/npm/typr@0.3.0/dist/Typr.min.js"></script>

const canvas = document.querySelector('.zdog-canvas');

const illo = new Zdog.Illustration({
    element: canvas,
    zoom: 0.5,
    dragRotate: true
});

// Create 3D text when font loads
async function init() {
    try {
        // Replace with your font URL
        const fontUrl = '/fonts/YourFont.ttf';
        
        const letters = await create3DText('JAMES', fontUrl, {
            fontSize: 80,
            depth: 30,
            color: '#636',
            letterSpacing: 1.1,
            addTo: illo
        });
        
        // Center the text
        const group = new Zdog.Group({
            addTo: illo,
            translate: { x: -200 } // Adjust based on text width
        });
        
        letters.forEach(letter => {
            letter.remove();
            letter.addTo = group;
            group.children.push(letter);
        });
        
        // Animation
        function animate() {
            group.rotate.y += 0.01;
            illo.updateRenderGraph();
            requestAnimationFrame(animate);
        }
        animate();
        
    } catch (error) {
        console.error('Failed to load font:', error);
    }
}

// Make sure Typr is loaded
if (typeof Typr !== 'undefined') {
    init();
} else {
    window.addEventListener('load', init);
}