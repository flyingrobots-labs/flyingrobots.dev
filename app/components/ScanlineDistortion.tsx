'use client'

import { useEffect, useState } from 'react'

export function ScanlineDistortion() {
  const [distortions, setDistortions] = useState<Array<{ id: number; startTime: number }>>([])

  useEffect(() => {
    const createDistortion = () => {
      const id = Date.now()
      setDistortions(prev => [...prev, { id, startTime: Date.now() }])
      
      // Remove distortion after animation completes
      setTimeout(() => {
        setDistortions(prev => prev.filter(d => d.id !== id))
      }, 2000)
    }

    const scheduleNextDistortion = () => {
      // Random interval between 30-90 seconds (much less frequent)
      const delay = Math.random() * 60000 + 30000
      setTimeout(() => {
        createDistortion()
        scheduleNextDistortion()
      }, delay)
    }

    // Start the cycle
    scheduleNextDistortion()

    // No cleanup needed for timeouts in this pattern
    return () => {}
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-25 overflow-hidden">
      {distortions.map(({ id }) => (
        <div
          key={id}
          className="absolute w-full h-2 animate-scanline-sweep"
          style={{
            background: 'transparent',
            filter: 'drop-shadow(0 0 2px rgba(255,0,0,0.8)) drop-shadow(0 1px 0px rgba(0,255,0,0.8)) drop-shadow(0 -1px 0px rgba(0,0,255,0.8))',
            mixBlendMode: 'overlay'
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes scanline-sweep {
          0% {
            top: -1rem;
            transform: scaleX(1);
          }
          100% {
            top: 100vh;
            transform: scaleX(1);
          }
        }
        
        .animate-scanline-sweep {
          animation: scanline-sweep 3s linear forwards;
        }
      `}</style>
    </div>
  )
}