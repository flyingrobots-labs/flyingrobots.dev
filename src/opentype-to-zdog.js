import Zdog from './zdog-wrapper.js';

// Convert OpenType path commands to Zdog path
export function opentypePathToZdog(commands) {
    const zdogPath = [];
    let currentX = 0;
    let currentY = 0;
    let firstX = 0;
    let firstY = 0;
    
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        
        switch (cmd.type) {
            case 'M': // Move to
                currentX = cmd.x;
                currentY = cmd.y;
                firstX = cmd.x;
                firstY = cmd.y;
                zdogPath.push({ x: cmd.x, y: cmd.y });
                break;
                
            case 'L': // Line to
                zdogPath.push({ x: cmd.x, y: cmd.y });
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
                        { x: cp1x, y: cp1y },
                        { x: cp2x, y: cp2y },
                        { x: cmd.x, y: cmd.y }
                    ]
                });
                currentX = cmd.x;
                currentY = cmd.y;
                break;
                
            case 'C': // Cubic bezier
                zdogPath.push({
                    bezier: [
                        { x: cmd.x1, y: cmd.y1 },
                        { x: cmd.x2, y: cmd.y2 },
                        { x: cmd.x, y: cmd.y }
                    ]
                });
                currentX = cmd.x;
                currentY = cmd.y;
                break;
                
            case 'Z': // Close path
                if (currentX !== firstX || currentY !== firstY) {
                    zdogPath.push({ x: firstX, y: firstY });
                }
                break;
        }
    }
    
    return zdogPath;
}