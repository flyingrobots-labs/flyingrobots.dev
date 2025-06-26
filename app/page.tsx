'use client'

import { useState } from 'react'
import { Terminal } from './components/Terminal'
import { BackgroundCanvas } from './components/BackgroundCanvas'
import { BootSequence } from './components/BootSequence'
import { CRTPowerOn } from './components/CRTPowerOn'
import { GlitchScanline } from './components/GlitchScanline'
import { WebGLCompositor } from './components/WebGLCompositor'
import { CSSFilterCompositor } from './components/CSSFilterCompositor'

export default function Home() {
  const [powerOnComplete, setPowerOnComplete] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)
  const [useWebGL, setUseWebGL] = useState(false)

  const content = (
    <main className="min-h-screen p-4 md:p-8 relative">
      <BackgroundCanvas />
      
      {!powerOnComplete && (
        <CRTPowerOn onComplete={() => setPowerOnComplete(true)} />
      )}
      
      {powerOnComplete && !bootComplete && (
        <BootSequence onComplete={() => setBootComplete(true)} />
      )}
      
      {bootComplete && (
        <div className="relative z-10">
          <Terminal />
        </div>
      )}
    </main>
  )

  return content
}