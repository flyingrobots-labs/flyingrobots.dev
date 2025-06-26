'use client'

import { useEffect, useRef, useState } from 'react'

interface WebGLCompositorProps {
  children: React.ReactNode
}

export function WebGLCompositor({ children }: WebGLCompositorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const textureRef = useRef<WebGLTexture | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef(Date.now())
  const [domReady, setDomReady] = useState(false)
  const [webglError, setWebglError] = useState(false)

  const vertexShaderSource = `
    attribute vec2 position;
    attribute vec2 texCoord;
    varying vec2 vTexCoord;
    
    void main() {
      vTexCoord = texCoord;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D domTexture;
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vTexCoord;
    
    // Random noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    // TV static noise
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 uv = vTexCoord;
      
      // CRT curvature (very subtle)
      vec2 cc = uv - 0.5;
      float dist = dot(cc, cc) * 0.02;
      uv = uv + cc * dist;
      
      // Sample the DOM texture
      vec3 color = texture2D(domTexture, uv).rgb;
      
      // Apply CRT effects to the actual content
      
      // Keep original content mostly intact
      // Very subtle scanlines (barely visible)
      float scanline = sin(uv.y * 800.0) * 0.01;
      color += scanline * 0.1;
      
      // Minimal chromatic aberration (just a hint)
      if (length(color) > 0.1) { // Only apply to visible content
        float aberration = 0.0003;
        color.r = texture2D(domTexture, uv + vec2(aberration, 0.0)).r;
        color.b = texture2D(domTexture, uv - vec2(aberration, 0.0)).b;
      }
      
      // Tiny amount of static only on dark areas
      float staticNoise = noise(uv * 150.0 + time * 3.0) * 0.005;
      color += staticNoise * (1.0 - length(color));
      
      // No vignette - it was making everything too dark
      
      // Preserve brightness and contrast
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    
    return shader
  }

  const createProgram = (gl: WebGLRenderingContext) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return null
    
    const program = gl.createProgram()
    if (!program) return null
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }
    
    return program
  }

  const captureDOM = () => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const gl = glRef.current
    
    if (!container || !canvas || !gl) return

    // Use html2canvas to capture DOM
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(container, {
        allowTaint: true,
        useCORS: true,
        scale: 1,
        logging: false
      } as any).then(domCanvas => {
        // Create texture from DOM canvas
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, domCanvas)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        
        textureRef.current = texture
        console.log('DOM captured and texture created:', domCanvas.width, 'x', domCanvas.height)
      }).catch(error => {
        console.error('html2canvas failed:', error)
        setWebglError(true)
      })
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: false
    })
    if (!gl) {
      console.error('WebGL not supported')
      setWebglError(true)
      return
    }

    glRef.current = gl
    const program = createProgram(gl)
    if (!program) {
      console.error('Failed to create WebGL program')
      setWebglError(true)
      return
    }
    
    programRef.current = program

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create geometry
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    const texCoordLocation = gl.getAttribLocation(program, 'texCoord')
    
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)
    
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'time')
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const textureLocation = gl.getUniformLocation(program, 'domTexture')

    const render = () => {
      if (!gl || !program || !textureRef.current) {
        // If we can't render, keep trying
        animationRef.current = requestAnimationFrame(render)
        return
      }
      
      try {
        const currentTime = (Date.now() - startTimeRef.current) / 1000

        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        gl.useProgram(program)
        
        gl.uniform1f(timeLocation, currentTime)
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
        
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current)
        gl.uniform1i(textureLocation, 0)
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        
        animationRef.current = requestAnimationFrame(render)
      } catch (error) {
        console.error('WebGL render error:', error)
        setWebglError(true)
      }
    }

    // Start rendering when DOM is ready
    if (domReady) {
      setTimeout(() => {
        captureDOM()
        setTimeout(render, 100) // Give time for texture creation
      }, 100)
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [domReady])

  useEffect(() => {
    // Wait for DOM to be ready
    setTimeout(() => setDomReady(true), 1000)
  }, [])

  useEffect(() => {
    // Recapture DOM periodically for dynamic content
    if (domReady) {
      const interval = setInterval(captureDOM, 1000)
      return () => clearInterval(interval)
    }
  }, [domReady])

  return (
    <div className="relative">
      {/* DOM content - fallback to visible if WebGL fails */}
      <div 
        ref={containerRef}
        className={`${(domReady && !webglError) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      >
        {children}
      </div>
      
      {/* WebGL canvas that processes the DOM - only show if no errors */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none ${(domReady && !webglError) ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{ zIndex: 100 }}
      />
      
      {/* Error message */}
      {webglError && (
        <div className="fixed top-4 left-4 bg-red-500/20 border border-red-500 text-red-500 px-3 py-1 text-xs font-mono">
          WebGL Error - Fallback to DOM
        </div>
      )}
    </div>
  )
}