'use client'

import { useState, useEffect } from 'react'

interface UseTypingAnimationOptions {
  speed?: number
  startDelay?: number
  mistakeChance?: number
}

export function useTypingAnimation(
  text: string,
  options: UseTypingAnimationOptions = {}
) {
  const { speed = 50, startDelay = 0, mistakeChance = 0 } = options
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        setIsTyping(true)
      }, startDelay)
      return () => clearTimeout(delayTimer)
    }
  }, [startDelay])

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (currentIndex >= text.length) {
        setIsTyping(false)
      }
      return
    }

    const timer = setTimeout(() => {
      // Simulate occasional typos for realism
      if (Math.random() < mistakeChance) {
        const wrongChar = String.fromCharCode(
          text.charCodeAt(currentIndex) + Math.floor(Math.random() * 3) - 1
        )
        setDisplayText(prev => prev + wrongChar)
        
        // Correct the mistake after a short delay
        setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1) + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, 100)
      } else {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }
    }, speed + (Math.random() - 0.5) * 20) // Add variance to typing speed

    return () => clearTimeout(timer)
  }, [currentIndex, text, speed, mistakeChance, isTyping])

  return { displayText, isTyping }
}