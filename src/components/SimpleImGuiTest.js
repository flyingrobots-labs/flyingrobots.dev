import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';

export class SimpleImGuiTest {
    constructor() {
        this.time = 0;
        this.showDemo = true;
    }
    
    async init() {
        console.log('SimpleImGuiTest: Starting init...');
        
        try {
            // Load ImGui
            await ImGui.default();
            console.log('SimpleImGuiTest: ImGui loaded');
            
            // Create context
            ImGui.CreateContext();
            console.log('SimpleImGuiTest: Context created');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.zIndex = '1000';
            document.body.appendChild(this.canvas);
            console.log('SimpleImGuiTest: Canvas created');
            
            // Initialize
            ImGui_Impl.Init(this.canvas);
            console.log('SimpleImGuiTest: ImGui initialized');
            
            return true;
        } catch (error) {
            console.error('SimpleImGuiTest: Init error:', error);
            return false;
        }
    }
    
    render(deltaTime) {
        try {
            this.time += deltaTime * 1000;
            
            ImGui_Impl.NewFrame(this.time);
            ImGui.NewFrame();
            
            // Simple test window
            ImGui.Begin("Hello ImGui!");
            ImGui.Text("This is a test!");
            ImGui.Text(`Time: ${this.time.toFixed(0)}ms`);
            ImGui.Checkbox("Show Demo", (value = this.showDemo) => this.showDemo = value);
            ImGui.End();
            
            // Show demo window
            if (this.showDemo) {
                ImGui.ShowDemoWindow();
            }
            
            ImGui.EndFrame();
            ImGui.Render();
            
            const gl = ImGui_Impl.gl;
            if (gl) {
                gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            
            ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
        } catch (error) {
            console.error('SimpleImGuiTest: Render error:', error);
        }
    }
}