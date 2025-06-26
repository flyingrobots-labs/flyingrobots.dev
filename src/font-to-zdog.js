import Zdog from './zdog-wrapper.js';

// Convert Typr path commands to Zdog path
function typrPathToZdog(cmds) {
    const zdogPath = [];
    let currentX = 0;
    let currentY = 0;
    let firstX = 0;
    let firstY = 0;
    
    for (let i = 0; i < cmds.length; i++) {
        const cmd = cmds[i];
        
        switch (cmd.type) {
            case 'M': // Move to
                currentX = cmd.x;
                currentY = cmd.y;
                firstX = cmd.x;
                firstY = cmd.y;
                zdogPath.push({ x: cmd.x, y: -cmd.y }); // Flip Y for screen coords
                break;
                
            case 'L': // Line to
                zdogPath.push({ x: cmd.x, y: -cmd.y });
                currentX = cmd.x;
                currentY = cmd.y;
                break;
                
            case 'Q': // Quadratic bezier
                // Convert quadratic to cubic for Zdog
                const cp1x = currentX + (2/3) * (cmd.x1 - currentX);
                const cp1y = currentY + (2/3) * (cmd.y1 - currentY);
                const cp2x = cmd.x + (2/3) * (cmd.x1 - cmd.x);
                const cp2y = cmd.y + (2/3) * (cmd.y1 - cmd.y);
                
                zdogPath.push({
                    bezier: [
                        { x: cp1x, y: -cp1y },
                        { x: cp2x, y: -cp2y },
                        { x: cmd.x, y: -cmd.y }
                    ]
                });
                currentX = cmd.x;
                currentY = cmd.y;
                break;
                
            case 'C': // Cubic bezier
                zdogPath.push({
                    bezier: [
                        { x: cmd.x1, y: -cmd.y1 },
                        { x: cmd.x2, y: -cmd.y2 },
                        { x: cmd.x, y: -cmd.y }
                    ]
                });
                currentX = cmd.x;
                currentY = cmd.y;
                break;
                
            case 'Z': // Close path
                if (currentX !== firstX || currentY !== firstY) {
                    zdogPath.push({ x: firstX, y: -firstY });
                }
                break;
        }
    }
    
    return zdogPath;
}

// Create extruded letter from path
function createExtrudedLetter(path, options = {}) {
    const {
        depth = 20,
        color = '#636',
        translate = { x: 0, y: 0, z: 0 },
        scale = 1,
        addTo
    } = options;
    
    const group = new Zdog.Group({
        addTo: addTo,
        translate: translate
    });
    
    // Scale the path
    const scaledPath = path.map(point => {
        if (point.bezier) {
            return {
                bezier: point.bezier.map(p => ({
                    x: p.x * scale,
                    y: p.y * scale
                }))
            };
        }
        return {
            x: point.x * scale,
            y: point.y * scale
        };
    });
    
    // Front face
    new Zdog.Shape({
        addTo: group,
        path: scaledPath,
        fill: true,
        stroke: false,
        color: color,
        translate: { z: depth / 2 }
    });
    
    // Back face
    new Zdog.Shape({
        addTo: group,
        path: scaledPath,
        fill: true,
        stroke: false,
        color: color,
        translate: { z: -depth / 2 },
        rotate: { y: Zdog.TAU / 2 } // Flip to face backward
    });
    
    // Create side walls
    // This is simplified - for complex paths you'd need more sophisticated edge detection
    const sideColor = adjustColor(color, -20); // Slightly darker sides
    
    // Add side strokes to simulate depth
    new Zdog.Shape({
        addTo: group,
        path: scaledPath,
        fill: false,
        stroke: depth,
        color: sideColor,
        translate: { z: 0 }
    });
    
    return group;
}

// Darken/lighten color
function adjustColor(color, amount) {
    // Simple hex color adjustment
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Main function to create 3D text from font
export async function create3DText(text, fontUrl, options = {}) {
    const {
        fontSize = 100,
        letterSpacing = 1.2,
        depth = 20,
        color = '#636',
        addTo
    } = options;
    
    // Load font
    const fontData = await fetch(fontUrl).then(r => r.arrayBuffer());
    const font = Typr.parse(fontData);
    
    // Get glyphs
    const glyphs = Typr.U.stringToGlyphs(font, text);
    const scale = fontSize / font.head.unitsPerEm;
    
    let xOffset = 0;
    const letters = [];
    
    glyphs.forEach((glyphId, i) => {
        // Get path for this glyph
        const path = Typr.U.glyphToPath(font, glyphId);
        const zdogPath = typrPathToZdog(path.cmds);
        
        // Create extruded letter
        const letter = createExtrudedLetter(zdogPath, {
            depth: depth,
            color: color,
            translate: { x: xOffset },
            scale: scale,
            addTo: addTo
        });
        
        letters.push(letter);
        
        // Calculate next position
        const advance = font.hmtx.aWidth[glyphId] * scale;
        xOffset += advance * letterSpacing;
    });
    
    return letters;
}

export { typrPathToZdog, createExtrudedLetter };