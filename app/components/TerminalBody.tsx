'use client'

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { TerminalOutput } from './TerminalOutput'
import { processCommand } from '../lib/commands'
import { GitTimeline } from './GitTimeline'

export function TerminalBody() {
  const [history, setHistory] = useState<Array<{ command: string; output: React.ReactNode }>>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  
  // Removed auto-focus on mount to let users read the timeline first

  useEffect(() => {
    // Scroll to bottom only when new commands are added, not on initial load
    if (bodyRef.current && history.length > 0) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    // Sync contentEditable with state
    if (inputRef.current && inputRef.current.textContent !== currentCommand) {
      inputRef.current.textContent = currentCommand
      // Place cursor at end
      const range = document.createRange()
      const selection = window.getSelection()
      if (inputRef.current.firstChild) {
        range.setStart(inputRef.current.firstChild, currentCommand.length)
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [currentCommand])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      const output = processCommand(currentCommand.trim())
      
      setHistory(prev => [...prev, { command: currentCommand, output }])
      setCommandHistory(prev => [...prev, currentCommand])
      setCurrentCommand('')
      setHistoryIndex(-1)
      // Clear the contentEditable div
      if (inputRef.current) {
        inputRef.current.textContent = ''
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // TODO: Implement tab completion
    }
  }

  return (
    <div 
      ref={bodyRef}
      className="p-5 md:p-6 min-h-[600px] max-h-[80vh] overflow-y-auto"
      onClick={(e) => {
        // Only focus input if clicking on the input area itself or very close to it
        const target = e.target as HTMLElement
        const isInputArea = target === inputRef.current || 
                           target.closest('.terminal-input-line') !== null
        
        if (isInputArea && inputRef.current) {
          inputRef.current.focus()
          // Place cursor at end
          const range = document.createRange()
          const selection = window.getSelection()
          range.selectNodeContents(inputRef.current)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }}
    >
      {/* Git timeline - always shown */}
      <GitTimeline />

      {/* Interactive terminal section */}
      <div className="border-t border-terminal-accent-blue/20 pt-4">
        <div className="mb-4 text-terminal-text-primary">
          <div className="text-terminal-accent-green">Interactive Portfolio Terminal</div>
          <div className="text-terminal-text-secondary mt-1">Type "help" for available commands.</div>
        </div>

        {/* Command history */}
        {history.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center">
              <span className="text-terminal-accent-purple mr-2">james@flyingrobots:~$</span>
              <span className="text-terminal-accent-blue">{item.command}</span>
            </div>
            <TerminalOutput output={item.output} />
          </div>
        ))}

        {/* Current command input */}
        <div className="flex items-center terminal-input-line">
          <span className="text-terminal-accent-purple mr-2">james@flyingrobots:~$</span>
          <div
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={(e) => setCurrentCommand(e.currentTarget.textContent || '')}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-terminal-accent-blue outline-none"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{ minHeight: '1.2em' }}
          />
          {currentCommand && <span className="sr-only">{currentCommand}</span>}
          <span className="cursor-blink ml-1" />
        </div>
      </div>
    </div>
  )
}