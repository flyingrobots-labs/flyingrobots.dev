'use client'

import { useState, useEffect } from 'react'

interface TerminalHeaderProps {
  isMaximized: boolean
  onMaximize: () => void
  bootStage: 'hidden' | 'window' | 'header' | 'ready'
}

export function TerminalHeader({ isMaximized, onMaximize, bootStage }: TerminalHeaderProps) {
  const [visibleButtons, setVisibleButtons] = useState(0)
  const [showTitle, setShowTitle] = useState(false)

  useEffect(() => {
    if (bootStage === 'header') {
      // Show buttons one by one
      const buttonTimers = [
        setTimeout(() => setVisibleButtons(1), 100),
        setTimeout(() => setVisibleButtons(2), 200),
        setTimeout(() => setVisibleButtons(3), 300),
        setTimeout(() => setShowTitle(true), 500),
      ]

      return () => buttonTimers.forEach(clearTimeout)
    }
  }, [bootStage])

  if (bootStage === 'hidden') return null

  return (
    <div className="bg-terminal-bg-tertiary px-4 md:px-5 py-3 flex items-center gap-2 border-b border-terminal-border">
      <div className="flex gap-2">
        <button 
          className={`w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-all duration-200 ${
            visibleButtons >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          onClick={() => window.close()}
          aria-label="Close"
        />
        <button 
          className={`w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-all duration-200 ${
            visibleButtons >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          aria-label="Minimize"
        />
        <button 
          className={`w-3 h-3 rounded-full bg-[#27ca3f] hover:opacity-80 transition-all duration-200 ${
            visibleButtons >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          onClick={onMaximize}
          aria-label="Maximize"
        />
      </div>
      <div className={`ml-3 text-terminal-text-secondary text-sm transition-all duration-300 ${
        showTitle ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
      }`}>
        james@flyingrobots: ~
      </div>
    </div>
  )
}