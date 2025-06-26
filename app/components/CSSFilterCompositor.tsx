'use client'

import { useEffect, useState } from 'react'

interface CSSFilterCompositorProps {
  children: React.ReactNode
}

export function CSSFilterCompositor({ children }: CSSFilterCompositorProps) {
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    // Listen for spacebar to trigger glitch
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 400)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div 
      className={`
        min-h-screen transition-all duration-200
        ${glitchActive ? 'animate-css-glitch' : ''}
      `}
      style={{
        // Base CRT effects using CSS filters
        filter: `
          contrast(1.1)
          brightness(1.05)
          saturate(1.1)
          ${glitchActive ? 'hue-rotate(5deg) contrast(1.3) brightness(1.2)' : ''}
        `,
        // CSS-based scanlines
        background: `
          linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.02) 50%,
            transparent 100%
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,0,0.01) 2px,
            rgba(0,255,0,0.01) 4px
          )
        `,
        // CSS vignette
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.3)',
      }}
    >
      <style jsx>{`
        @keyframes css-glitch {
          0% { 
            filter: contrast(1.1) brightness(1.05) saturate(1.1);
            transform: translateX(0);
          }
          10% { 
            filter: contrast(1.4) brightness(1.3) saturate(1.3) hue-rotate(5deg);
            transform: translateX(-2px);
          }
          20% { 
            filter: contrast(1.2) brightness(1.1) saturate(1.4) hue-rotate(-3deg);
            transform: translateX(2px);
          }
          30% { 
            filter: contrast(1.5) brightness(1.4) saturate(1.1) hue-rotate(8deg);
            transform: translateX(-1px);
          }
          40% { 
            filter: contrast(1.3) brightness(1.2) saturate(1.2) hue-rotate(-2deg);
            transform: translateX(1px);
          }
          50% { 
            filter: contrast(1.1) brightness(1.05) saturate(1.1);
            transform: translateX(0);
          }
          100% { 
            filter: contrast(1.1) brightness(1.05) saturate(1.1);
            transform: translateX(0);
          }
        }
        
        .animate-css-glitch {
          animation: css-glitch 0.4s ease-in-out;
        }
        
        /* RGB separation effect during glitch */
        .animate-css-glitch::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          filter: sepia(1) hue-rotate(0deg) saturate(3);
          mix-blend-mode: screen;
          opacity: 0.3;
          animation: rgb-offset 0.4s ease-in-out;
        }
        
        .animate-css-glitch::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          filter: sepia(1) hue-rotate(180deg) saturate(3);
          mix-blend-mode: screen;
          opacity: 0.3;
          animation: rgb-offset-reverse 0.4s ease-in-out;
        }
        
        @keyframes rgb-offset {
          0%, 100% { transform: translateX(0); opacity: 0; }
          50% { transform: translateX(-3px); opacity: 0.3; }
        }
        
        @keyframes rgb-offset-reverse {
          0%, 100% { transform: translateX(0); opacity: 0; }
          50% { transform: translateX(3px); opacity: 0.3; }
        }
      `}</style>
      
      {children}
    </div>
  )
}