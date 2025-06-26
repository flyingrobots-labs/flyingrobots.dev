'use client'

import { useState, useEffect } from 'react'

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<'tux' | 'boot-messages' | 'fade' | 'complete'>('tux')
  const [showTux, setShowTux] = useState(false)
  const [bootMessages, setBootMessages] = useState<string[]>([])

  const messages = [
    'Linux version 6.1.0-flyingrobots (james@devbox) (gcc 11.3.0) #1 SMP',
    'Command line: BOOT_IMAGE=/vmlinuz root=/dev/sda1 ro quiet splash',
    'Checking file systems...',
    'fsck from util-linux 2.38.1',
    '/dev/sda1: clean, 127/2097152 files, 1847593/8388608 blocks',
    'Loading kernel modules',
    'Starting systemd-udevd.service - Rule-based Manager for Device Events and Files...',
    'Starting network interfaces',
    'Reached target Network',
    'Starting ssh.service - OpenBSD Secure Shell server...',
    'Starting portfolio.service - James Ross Portfolio Terminal...',
    'portfolio.service: Main process exited, code=exited, status=0/SUCCESS',
    'Started portfolio.service - James Ross Portfolio Terminal.',
    'Reached target Multi-User System.',
    '',
    'Ubuntu 22.04.3 LTS flyingrobots tty1',
    '',
    'flyingrobots login: james',
    'Password: ********',
    'Last login: ' + new Date().toLocaleString() + ' from 127.0.0.1',
    'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 6.1.0-flyingrobots x86_64)',
    '',
    ' * Documentation:  https://help.ubuntu.com',
    ' * Management:     https://landscape.canonical.com',
    ' * Support:        https://ubuntu.com/advantage',
    '',
    'System information as of ' + new Date().toLocaleDateString() + ':',
    '',
    '  System load:  0.12               Processes:               127',
    '  Usage of /:   18.4% of 29.78GB   Users logged in:         1',
    '  Memory usage: 23%                IPv4 address for eth0:   192.168.1.42',
    '  Swap usage:   0%                 IPv4 address for docker0: 172.17.0.1',
    '',
    'Last login: ' + new Date().toLocaleString() + ' on pts/0'
  ]

  const tuxAscii = `
                .88888888:.
                88888888.88888.
              .8888888888888888.
              888888888888888888
              88' _\`88'_  \`88888
              88 88 88 88  88888
              88_88_::_88_:88888
              88:::,::,:::::8888
              88\`::::::::'\`8888
             .88  \`::::'    8:88.
            8888            \`8:888.
          .8888'             \`888888.
         .8888:..  .::.  ...:'8888888:.
        .8888.'     :'     \`::\`88:88888
       .8888        '         \`.888:8888.
      888:8         .           888:88888
    .888:88        .:           888:88888:
    8888888.       ::           88:888888
    \`.::.888.      ::          .88888888
   .::::::.888.    ::         :::\`8888'.:.
  ::::::::::.888   '         .::::::::::::
  ::::::::::::.8    '      .:8::::::::::::.
 .::::::::::::::.        .:888:::::::::::::
 :::::::::::::::88:.__..:88888:::::::::::'
  \`'.:::::::::::88888888888.88:::::::::'
        \`':::_:' -- '' -'-' \`':_:::'\`

        Welcome to james@flyingrobots
           Portfolio Terminal v2.0`

  useEffect(() => {
    const sequence = async () => {
      // Show Tux
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowTux(true)
      
      // Hold Tux for a moment
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show boot messages
      setStage('boot-messages')
      
      // Add messages one by one with faster timing for authenticity
      for (let i = 0; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setBootMessages(prev => [...prev, messages[i]])
      }
      
      // Hold final message
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Start fade
      setStage('fade')
      
      // Complete
      await new Promise(resolve => setTimeout(resolve, 800))
      setStage('complete')
      onComplete()
    }

    sequence()
  }, [onComplete])

  if (stage === 'complete') return null

  return (
    <div className={`fixed inset-0 bg-terminal-bg-primary flex items-center justify-center z-50 transition-opacity duration-800 ${
      stage === 'fade' ? 'opacity-0' : 'opacity-100'
    }`}>
      {stage === 'tux' && (
        <div className={`text-center transition-all duration-500 ${
          showTux ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <pre className="text-terminal-accent-blue text-xs md:text-sm font-mono leading-tight whitespace-pre">
            {tuxAscii}
          </pre>
          <div className="mt-4 text-terminal-text-secondary text-sm">
            Initializing...
          </div>
        </div>
      )}
      
      {stage === 'boot-messages' && (
        <div className="text-left space-y-0 max-w-4xl overflow-y-auto max-h-screen p-4">
          {bootMessages.map((message, index) => (
            <div key={index} className="text-terminal-text-primary font-mono text-xs leading-tight animate-fade-in">
              {message.startsWith('Starting ') || message.startsWith('Started ') || message.startsWith('Reached ') ? (
                <><span className="text-terminal-accent-green">[ OK ]</span> {message}</>
              ) : message.includes('login:') ? (
                <span className="text-terminal-accent-blue">{message}</span>
              ) : message.includes('Password:') ? (
                <span className="text-terminal-accent-blue">{message}</span>
              ) : message.includes('Welcome to Ubuntu') ? (
                <span className="text-terminal-accent-green">{message}</span>
              ) : message.startsWith(' *') ? (
                <span className="text-terminal-text-secondary">{message}</span>
              ) : message.includes('System information') ? (
                <span className="text-terminal-accent-yellow">{message}</span>
              ) : message.includes('System load') || message.includes('Usage of') || message.includes('Memory usage') || message.includes('Swap usage') ? (
                <span className="text-terminal-text-secondary">{message}</span>
              ) : (
                message
              )}
            </div>
          ))}
          <div className="mt-4">
            <span className="text-terminal-accent-blue cursor-blink">█</span>
          </div>
        </div>
      )}
    </div>
  )
}