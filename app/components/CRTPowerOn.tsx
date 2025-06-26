'use client'

import { useEffect, useState } from 'react'

interface CRTPowerOnProps {
  onComplete: () => void
}

export function CRTPowerOn({ onComplete }: CRTPowerOnProps) {
  const [stage, setStage] = useState<'off' | 'powerOn' | 'complete'>('off')

  useEffect(() => {
    const sequence = async () => {
      // Small delay, then power on
      await new Promise(resolve => setTimeout(resolve, 200))
      setStage('powerOn')
      
      // CRT power-on effect duration
      await new Promise(resolve => setTimeout(resolve, 800))
      setStage('complete')
      onComplete()
    }

    sequence()
  }, [onComplete])

  if (stage === 'complete') return null

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {stage === 'powerOn' && (
        <div className="absolute inset-0 bg-white animate-crt-powerun" 
             style={{
               background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 1%, transparent 2%)',
               animation: 'crt-poweron 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
             }}>
        </div>
      )}
      
      <style jsx>{`
        @keyframes crt-poweron {
          0% {
            transform: scaleY(0.001) scaleX(1);
            filter: brightness(50);
          }
          50% {
            transform: scaleY(0.1) scaleX(1);
            filter: brightness(10);
          }
          100% {
            transform: scaleY(1) scaleX(1);
            filter: brightness(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}