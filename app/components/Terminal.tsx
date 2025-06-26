'use client'

import { useState, useRef, useEffect } from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalBody } from './TerminalBody'

interface TerminalProps {
  onBootComplete?: () => void
}

export function Terminal({ onBootComplete }: TerminalProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [bootStage, setBootStage] = useState<'hidden' | 'window' | 'header' | 'ready'>('hidden')
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bootSequence = async () => {
      // Stage 1: Show terminal window (0.5s delay, then 0.6s animation)
      await new Promise(resolve => setTimeout(resolve, 500))
      setBootStage('window')
      
      // Stage 2: Show header elements one by one (0.6s after window)
      await new Promise(resolve => setTimeout(resolve, 600))
      setBootStage('header')
      
      // Stage 3: Ready for content (0.3s after header)
      await new Promise(resolve => setTimeout(resolve, 300))
      setBootStage('ready')
      onBootComplete?.()
    }

    bootSequence()
  }, [onBootComplete])

  return (
    <div 
      ref={terminalRef}
      className={`
        ${isMaximized ? 'fixed inset-0 m-0' : 'max-w-5xl mx-auto my-5 md:my-10'}
        bg-terminal-bg-secondary rounded-lg shadow-2xl overflow-hidden
        transition-all duration-300 crt-screen
        ${bootStage === 'hidden' ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
      `}
      style={{
        transition: bootStage === 'hidden' 
          ? 'none' 
          : 'opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <TerminalHeader 
        isMaximized={isMaximized}
        onMaximize={() => setIsMaximized(!isMaximized)}
        bootStage={bootStage}
      />
      {bootStage === 'ready' && <TerminalBody />}
    </div>
  )
}