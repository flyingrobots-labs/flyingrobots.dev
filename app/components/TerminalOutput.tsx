'use client'

import React from 'react'

interface TerminalOutputProps {
  output: React.ReactNode
}

export function TerminalOutput({ output }: TerminalOutputProps) {
  return (
    <div className="mt-2 text-terminal-text-primary">
      {output}
    </div>
  )
}