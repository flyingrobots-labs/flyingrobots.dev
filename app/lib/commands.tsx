import React from 'react'
import Link from 'next/link'

type CommandOutput = React.ReactNode

const commands: Record<string, () => CommandOutput> = {
  help: () => (
    <div className="space-y-1">
      <div className="text-terminal-accent-green mb-2">Available commands:</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div><span className="text-terminal-accent-blue">about</span> <span className="text-terminal-text-secondary">- About James Ross</span></div>
        <div><span className="text-terminal-accent-blue">blog</span> <span className="text-terminal-text-secondary">- List blog posts</span></div>
        <div><span className="text-terminal-accent-blue">projects</span> <span className="text-terminal-text-secondary">- View projects</span></div>
        <div><span className="text-terminal-accent-blue">skills</span> <span className="text-terminal-text-secondary">- Technical skills</span></div>
        <div><span className="text-terminal-accent-blue">experience</span> <span className="text-terminal-text-secondary">- Work history</span></div>
        <div><span className="text-terminal-accent-blue">contact</span> <span className="text-terminal-text-secondary">- Contact information</span></div>
        <div><span className="text-terminal-accent-blue">resume</span> <span className="text-terminal-text-secondary">- Download resume</span></div>
        <div><span className="text-terminal-accent-blue">stats</span> <span className="text-terminal-text-secondary">- Career statistics</span></div>
        <div><span className="text-terminal-accent-blue">clear</span> <span className="text-terminal-text-secondary">- Clear terminal</span></div>
        <div><span className="text-terminal-accent-blue">theme</span> <span className="text-terminal-text-secondary">- Toggle dark/light mode</span></div>
      </div>
      <div className="mt-4 text-terminal-text-secondary text-xs">
        <div>💡 Pro tip: Press <span className="text-terminal-accent-purple">SPACE</span> for CRT glitch effect</div>
      </div>
    </div>
  ),

  about: () => (
    <div className="space-y-4">
      <div className="text-2xl md:text-3xl font-bold text-terminal-accent-blue">James Ross</div>
      <div className="text-terminal-accent-red">Staff Software Engineer | Game Infrastructure & Engine Architecture</div>
      <div className="text-terminal-text-primary leading-relaxed">
        18 years building game infrastructure that scales. From custom MMO engines to ML platforms 
        processing billions of player events. I solve the complex technical problems so game teams 
        can focus on creating great player experiences.
      </div>
      <div className="text-terminal-text-secondary">
        Type <span className="text-terminal-accent-blue">skills</span> to see technical expertise or{' '}
        <span className="text-terminal-accent-blue">projects</span> for recent work.
      </div>
    </div>
  ),

  skills: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="text-terminal-accent-green font-bold"># Game Engines</div>
        <ul className="space-y-1">
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Unity & Quantum</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Custom C++ Engines</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> ECS Architecture</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Physics Systems</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Cross-platform Dev</li>
        </ul>
      </div>
      <div className="space-y-2">
        <div className="text-terminal-accent-green font-bold"># Infrastructure</div>
        <ul className="space-y-1">
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> AWS Game Services</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Docker & CI/CD</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Redis & Job Queues</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Load Balancing</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Cost Optimization</li>
        </ul>
      </div>
      <div className="space-y-2">
        <div className="text-terminal-accent-green font-bold"># Live Operations</div>
        <ul className="space-y-1">
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Player Analytics</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> ML Churn Prediction</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> A/B Testing</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Real-time Telemetry</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> GDPR Compliance</li>
        </ul>
      </div>
      <div className="space-y-2">
        <div className="text-terminal-accent-green font-bold"># Languages</div>
        <ul className="space-y-1">
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> C#, JavaScript, Python</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> C++, Lua</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> SQL, NoSQL</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> TypeScript</li>
          <li className="flex items-center"><span className="text-terminal-accent-purple mr-2">▸</span> Rust (learning)</li>
        </ul>
      </div>
    </div>
  ),

  stats: () => (
    <div className="space-y-4">
      <div className="bg-terminal-bg-primary border border-terminal-border rounded p-4">
        <pre className="text-sm">
{`{
  "experience_years": 18,
  "games_shipped": "15+",
  "ml_accuracy": "87%",
  "player_events_processed": "billions",
  "retention_improvement": "34%",
  "studios_worked": 6,
  "team_size_led": 4,
  "infrastructure_cost_saved": "$1000s/month"
}`}
        </pre>
      </div>
    </div>
  ),

  contact: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-terminal-text-secondary">Email:</span>
        <a href="mailto:james@flyingrobots.dev" className="text-terminal-accent-blue hover:underline">
          james@flyingrobots.dev
        </a>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-terminal-text-secondary">Phone:</span>
        <a href="tel:+14254050593" className="text-terminal-accent-blue hover:underline">
          (425) 405-0593
        </a>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-terminal-text-secondary">LinkedIn:</span>
        <a href="https://linkedin.com/in/flyingrobots" target="_blank" rel="noopener noreferrer" className="text-terminal-accent-blue hover:underline">
          linkedin.com/in/flyingrobots
        </a>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-terminal-text-secondary">GitHub:</span>
        <a href="https://github.com/flyingrobots" target="_blank" rel="noopener noreferrer" className="text-terminal-accent-blue hover:underline">
          github.com/flyingrobots
        </a>
      </div>
    </div>
  ),

  projects: () => {
    const projects = [
      {
        name: 'git-mind/',
        desc: 'Distributed semantic knowledge graph protocol. Transforms Git into collaborative thinking platform.',
        link: 'github.com/neuroglyph/git-mind'
      },
      {
        name: 'universal-charter/',
        desc: 'Ethical framework for coexistence across biological, artificial, and hybrid intelligences.',
        link: 'universalcharter.org'
      },
      {
        name: 'mind-ucal-license/',
        desc: 'Ethical software license restricting violent applications of AI.',
        link: 'github.com/universalcharter/mind-ucal'
      },
      {
        name: 'gitscrolls/',
        desc: 'Technical storytelling through mythology. Knowledge preservation system.',
        link: 'github.com/flyingrobots/gitscrolls'
      }
    ]

    return (
      <div className="space-y-4">
        <div className="text-terminal-accent-green mb-2">ls projects/</div>
        {projects.map((project, index) => (
          <div key={index} className="border border-terminal-border rounded p-4 bg-terminal-bg-primary hover:border-terminal-accent-blue transition-colors">
            <div className="text-terminal-accent-blue mb-1">drwxr-xr-x {project.name}</div>
            <div className="text-terminal-text-primary mb-2">{project.desc}</div>
            <a href={`https://${project.link}`} target="_blank" rel="noopener noreferrer" className="text-terminal-accent-purple hover:underline text-sm">
              → {project.link}
            </a>
          </div>
        ))}
      </div>
    )
  },

  blog: () => (
    <div className="space-y-4">
      <div className="text-terminal-text-secondary">Loading blog posts...</div>
      <div className="text-terminal-accent-green">Redirecting to blog in 2 seconds...</div>
      {/* TODO: Implement actual navigation */}
    </div>
  ),

  resume: () => {
    // Trigger download
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '/api/resume'
      link.download = 'james-ross-resume.txt'
      link.click()
    }, 500)

    return (
      <div className="space-y-2">
        <div className="text-terminal-accent-green">Downloading resume.txt...</div>
        <div className="text-terminal-text-secondary">File will be saved to your Downloads folder</div>
      </div>
    )
  },

  clear: () => {
    // This is handled specially in the processCommand function
    return ''
  },

  ls: () => (
    <div className="font-mono">
      <div>drwxr-xr-x   about/</div>
      <div>drwxr-xr-x   blog/</div>
      <div>drwxr-xr-x   projects/</div>
      <div>drwxr-xr-x   experience/</div>
      <div>-rw-r--r--   resume.pdf</div>
      <div>-rw-r--r--   contact.txt</div>
    </div>
  ),

  experience: () => {
    const experiences = [
      {
        dir: 'independent_rd/',
        date: 'May 2025 - Present',
        role: 'Principal Engineer',
        desc: 'Building open source innovations: Git Mind, Universal Charter, MIND-UCAL License, GitScrolls.'
      },
      {
        dir: 'smilebreak/',
        date: 'Jun 2024 - May 2025', 
        role: 'Senior Software Engineer',
        desc: 'Unity & Quantum systems for hybrid strategy/action RPG.'
      },
      {
        dir: 'gala_games/',
        date: 'Feb 2022 - Apr 2024',
        role: 'Senior Software Engineer', 
        desc: 'Custom MMO engine for The Walking Dead: Empires.'
      },
      {
        dir: 'ember_entertainment/',
        date: 'Dec 2014 - Feb 2022',
        role: 'Core Tech Lead & Platform Engineer',
        desc: 'Built shared infrastructure for 15+ mobile games.'
      }
    ]

    return (
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="border border-terminal-border rounded p-4 bg-terminal-bg-primary">
            <div className="text-terminal-accent-blue mb-1">drwxr-xr-x {exp.dir}</div>
            <div className="text-terminal-text-secondary text-sm mb-2">{exp.date} | {exp.role}</div>
            <div className="text-terminal-text-primary">{exp.desc}</div>
          </div>
        ))}
        <div className="text-terminal-text-secondary mt-4">
          Type <span className="text-terminal-accent-blue">cd experience/[company]</span> for more details.
        </div>
      </div>
    )
  },

  pwd: () => '/home/james/portfolio',

  whoami: () => 'james',

  date: () => new Date().toString(),

  echo: () => 'Echo command requires arguments',
}

export function processCommand(input: string): CommandOutput {
  const [command, ...args] = input.toLowerCase().trim().split(' ')

  if (command === 'clear') {
    // Special handling for clear command
    window.location.reload()
    return 'Clearing terminal...'
  }

  if (command === 'echo' && args.length > 0) {
    return input.substring(5) // Return everything after 'echo '
  }

  const handler = commands[command]
  
  if (handler) {
    return handler()
  }

  return (
    <div className="text-terminal-accent-red">
      Command not found: {command}
      <div className="text-terminal-text-secondary mt-1">
        Type <span className="text-terminal-accent-blue">help</span> for available commands.
      </div>
    </div>
  )
}