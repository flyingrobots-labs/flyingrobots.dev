'use client'

import { useEffect, useState, useCallback } from 'react'

export function GlitchScanline() {
  const [glitches, setGlitches] = useState<Array<{ id: number; position: number }>>([])

  const createGlitch = useCallback(() => {
    const id = Date.now()
    const position = Math.random() * 100 // Random Y position
    
    setGlitches(prev => [...prev, { id, position }])
    
    // Remove glitch after animation completes
    setTimeout(() => {
      setGlitches(prev => prev.filter(g => g.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    const scheduleNextGlitch = () => {
      // Random interval between 45-120 seconds (rare glitches)
      const delay = Math.random() * 75000 + 45000
      setTimeout(() => {
        createGlitch()
        scheduleNextGlitch()
      }, delay)
    }

    // Keyboard listener for spacebar
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        createGlitch()
      }
    }

    // Start the automatic cycle
    scheduleNextGlitch()
    
    // Add keyboard listener
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [createGlitch])

  return (
    <div className="fixed inset-0 pointer-events-none z-25 overflow-hidden">
      {glitches.map(({ id, position }) => (
        <div
          key={id}
          className="absolute w-full"
          style={{
            top: `${position}%`,
            height: '12px',
            background: 'transparent',
          }}
        >
          {/* Diagonal RGB distortion bands - like in the image */}
          <div 
            className="absolute w-full h-full animate-glitch-sweep"
            style={{
              background: 'repeating-linear-gradient(45deg, rgba(255,0,0,0.8) 0px, rgba(255,0,0,0.8) 1px, transparent 1px, transparent 3px)',
              transform: 'translateX(-3px) skewX(-15deg)',
              mixBlendMode: 'screen'
            }}
          />
          <div 
            className="absolute w-full h-full animate-glitch-sweep"
            style={{
              background: 'repeating-linear-gradient(45deg, rgba(0,255,0,0.8) 0px, rgba(0,255,0,0.8) 1px, transparent 1px, transparent 3px)',
              transform: 'translateX(0px) skewX(-15deg)',
              mixBlendMode: 'screen',
              animationDelay: '0.05s'
            }}
          />
          <div 
            className="absolute w-full h-full animate-glitch-sweep"
            style={{
              background: 'repeating-linear-gradient(45deg, rgba(0,0,255,0.8) 0px, rgba(0,0,255,0.8) 1px, transparent 1px, transparent 3px)',
              transform: 'translateX(3px) skewX(-15deg)',
              mixBlendMode: 'screen',
              animationDelay: '0.1s'
            }}
          />
          
          {/* Additional horizontal bands for that scan line effect */}
          <div 
            className="absolute w-full h-full animate-glitch-sweep"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 2px)',
              transform: 'translateY(1px)',
              mixBlendMode: 'overlay',
              animationDelay: '0.15s'
            }}
          />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes glitch-sweep {
          0% {
            opacity: 0;
            transform: translateY(-3px) scaleY(0.1) skewX(-15deg);
          }
          10% {
            opacity: 1;
            transform: translateY(0px) scaleY(1.5) skewX(-15deg);
          }
          25% {
            opacity: 0.9;
            transform: translateY(1px) scaleY(2) skewX(-12deg);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-1px) scaleY(1.8) skewX(-18deg);
          }
          75% {
            opacity: 0.4;
            transform: translateY(2px) scaleY(1.2) skewX(-10deg);
          }
          90% {
            opacity: 0.2;
            transform: translateY(0px) scaleY(0.8) skewX(-15deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-1px) scaleY(0.2) skewX(-15deg);
          }
        }
        
        .animate-glitch-sweep {
          animation: glitch-sweep 4s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}