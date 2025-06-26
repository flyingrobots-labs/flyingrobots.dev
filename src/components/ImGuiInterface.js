import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';
import { sceneManager } from '../scene.js';

export class ImGuiInterface {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.showAboutWindow = false;
        this.showMetricsWindow = false;
        this.showShapeControls = true;
        this.fpsDisplay = false;
        this.aabbDisplay = false;
        this.shapeToSpawn = 0; // Index for shape selection
        this.shapeTypes = ['sphere', 'cone', 'cylinder', 'torus', 'octahedron'];
        this.isInitialized = false;
        this.time = 0;
        this.hasWarnedNotInit = false;
    }
    
    async init() {
        try {
            console.log('ImGuiInterface: Starting init...');
            
            // Load ImGui
            await ImGui.default();
            console.log('ImGuiInterface: ImGui module loaded');
            
            // Create ImGui context
            ImGui.CreateContext();
            console.log('ImGuiInterface: Context created');
            
            // Style configuration
            ImGui.StyleColorsDark();
            const style = ImGui.GetStyle();
            style.WindowRounding = 5.0;
            style.FrameRounding = 3.0;
            style.GrabRounding = 3.0;
            // style.Colors[ImGui.Col.WindowBg].w = 0.94; // Commented out - might be causing the error
            
            // Create overlay canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'imgui-overlay';
            this.canvas.style.position = 'fixed'; // Use fixed instead of absolute
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.zIndex = '1000';
            this.canvas.style.margin = '0';
            this.canvas.style.padding = '0';
            document.body.appendChild(this.canvas);
            console.log('ImGuiInterface: Canvas created');
            
            // Create WebGL context with alpha enabled for transparency
            const gl = this.canvas.getContext('webgl2', { 
                alpha: true,
                premultipliedAlpha: false 
            });
            
            if (!gl) {
                throw new Error('Failed to create WebGL2 context');
            }
            
            // Initialize ImGui with our transparent context
            ImGui_Impl.Init(gl);
            console.log('ImGuiInterface: ImGui_Impl initialized with transparent context');
            
            const io = ImGui.GetIO();
            io.ConfigFlags |= ImGui.ConfigFlags.NavEnableKeyboard;
            // io.ConfigFlags |= ImGui.ConfigFlags.DockingEnable; // Not supported in this version
            // io.IniFilename = null; // Commented out - causing string conversion error
            
            // Setup fonts
            // const fonts = io.Fonts;
            // fonts.AddFontDefault(); // Commented out - might also cause issues
            
            this.isInitialized = true;
            console.log('ImGuiInterface: Init complete');
            return true;
        } catch (error) {
            console.error('ImGuiInterface: Init error:', error);
            this.isInitialized = false;
            return false;
        }
    }
    
    newFrame(deltaTime) {
        this.time += deltaTime * 1000; // Convert to ms
        ImGui_Impl.NewFrame(this.time);
        ImGui.NewFrame();
    }
    
    render(deltaTime) {
        if (!this.isInitialized) {
            if (!this.hasWarnedNotInit) {
                console.warn('ImGuiInterface: Not initialized yet');
                this.hasWarnedNotInit = true;
            }
            return;
        }
        
        this.newFrame(deltaTime);
        
        // Main control window
        if (this.showShapeControls) {
            ImGui.SetNextWindowPos(new ImGui.ImVec2(10, 10), ImGui.Cond.FirstUseEver);
            ImGui.SetNextWindowSize(new ImGui.ImVec2(300, 0), ImGui.Cond.FirstUseEver);
            
            ImGui.Begin("Scene Controls");
            
            // Shape spawning section
            ImGui.Text("Shape Spawning");
            ImGui.Separator();
            
            // Shape type selector
            const items = this.shapeTypes.join('\0');
            ImGui.Combo("Shape Type", 
                (value = this.shapeToSpawn) => this.shapeToSpawn = value, 
                items);
            
            if (ImGui.Button("Spawn Shape", new ImGui.ImVec2(-1, 0))) {
                sceneManager.spawnShape(this.shapeTypes[this.shapeToSpawn]);
            }
            
            ImGui.Spacing();
            
            // Shape info
            const shapeManager = sceneManager.getShapeManager();
            if (shapeManager) {
                const shapeCount = shapeManager.getTotalShapeCount();
                ImGui.Text(`Total Shapes: ${shapeCount}`);
                
                if (ImGui.TreeNode("Shape Breakdown")) {
                    const breakdown = shapeManager.getShapeBreakdown();
                    for (const [type, count] of Object.entries(breakdown)) {
                        ImGui.BulletText(`${type}: ${count}`);
                    }
                    ImGui.TreePop();
                }
            }
            
            ImGui.Spacing();
            ImGui.Separator();
            ImGui.Text("Debug Options");
            ImGui.Separator();
            
            // Debug toggles
            if (ImGui.Checkbox("Show FPS", (value = this.fpsDisplay) => this.fpsDisplay = value)) {
                // FPS display will be handled below
            }
            
            if (ImGui.Checkbox("Show AABB", (value = this.aabbDisplay) => this.aabbDisplay = value)) {
                sceneManager.toggleAABB(this.aabbDisplay);
            }
            
            ImGui.Spacing();
            ImGui.Separator();
            ImGui.Text("Windows");
            ImGui.Separator();
            
            ImGui.Checkbox("About", (value = this.showAboutWindow) => this.showAboutWindow = value);
            ImGui.Checkbox("Metrics", (value = this.showMetricsWindow) => this.showMetricsWindow = value);
            
            ImGui.End();
        }
        
        // About window
        if (this.showAboutWindow) {
            ImGui.SetNextWindowPos(new ImGui.ImVec2(320, 10), ImGui.Cond.FirstUseEver);
            ImGui.Begin("About", (value = this.showAboutWindow) => this.showAboutWindow = value);
            
            ImGui.Text("Flying Robots Portfolio");
            ImGui.Separator();
            ImGui.Text("A cyberpunk-themed 3D portfolio experience");
            ImGui.Text("Built with Three.js and custom physics");
            ImGui.Spacing();
            ImGui.Text("Camera Controls:");
            ImGui.BulletText("Click to capture mouse");
            ImGui.BulletText("WASD to move");
            ImGui.BulletText("Mouse to look around");
            ImGui.BulletText("Space to go up");
            ImGui.BulletText("Shift to go down/sprint");
            ImGui.BulletText("ESC to release mouse");
            
            ImGui.Spacing();
            ImGui.Text("Scene Commands:");
            ImGui.BulletText("Spawn shapes from the controls");
            ImGui.BulletText("Toggle debug visualizations");
            ImGui.BulletText("View performance metrics");
            
            ImGui.End();
        }
        
        // Metrics window
        if (this.showMetricsWindow) {
            ImGui.SetNextWindowPos(new ImGui.ImVec2(320, 300), ImGui.Cond.FirstUseEver);
            ImGui.ShowMetricsWindow((value = this.showMetricsWindow) => this.showMetricsWindow = value);
        }
        
        // FPS overlay
        if (this.fpsDisplay) {
            const io = ImGui.GetIO();
            const fps = 1000 / io.DeltaTime;
            
            const flags = ImGui.WindowFlags.NoDecoration | 
                         ImGui.WindowFlags.AlwaysAutoResize | 
                         ImGui.WindowFlags.NoFocusOnAppearing |
                         ImGui.WindowFlags.NoNav |
                         ImGui.WindowFlags.NoMove;
            
            const canvasHeight = ImGui_Impl.canvas ? ImGui_Impl.canvas.height : window.innerHeight;
            ImGui.SetNextWindowPos(new ImGui.ImVec2(10, canvasHeight - 40));
            ImGui.SetNextWindowBgAlpha(0.5);
            
            ImGui.Begin("FPS", null, flags);
            ImGui.Text(`FPS: ${fps.toFixed(1)}`);
            ImGui.End();
        }
        
        // Render ImGui
        ImGui.EndFrame();
        ImGui.Render();
        
        const gl = ImGui_Impl.gl;
        if (gl) {
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.clearColor(0, 0, 0, 0); // Transparent background
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
    }
    
    shutdown() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }
}