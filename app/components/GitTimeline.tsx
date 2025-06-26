'use client'

interface GitTimelineProps {
  onComplete?: () => void
}

export function GitTimeline({ onComplete }: GitTimelineProps) {
  const commits = [
    { hash: 'a7f3c21', type: 'feat', message: 'Launch independent R&D phase - Git Mind, Universal Charter', tags: ['Innovation', 'Open Source', 'AI Ethics'], color: 'major' },
    { hash: 'd4b8e92', type: 'fix', message: 'Eliminate 70% of UI bugs with reactive MVVM architecture at SmileBreak', tags: ['70% Bug Reduction', 'Unity', 'Quantum', 'MVVM'], color: 'feature' },
    { hash: 'f2a1c34', type: 'feat', message: 'Join SmileBreak as Senior Software Engineer', tags: ['Career Move', 'Unity', 'Quantum Framework'], color: 'major' },
    { hash: '8c5d7f1', type: 'feat', message: 'Complete custom MMO engine for The Walking Dead: Empires', tags: ['MMO Engine', '1000s Players', 'Custom Engine', 'Networking'], color: 'feature' },
    { hash: 'b9e2f84', type: 'feat', message: 'Implement client-side prediction with server validation', tags: ['Networking', 'Real-time', 'Anti-cheat'], color: 'feature' },
    { hash: '7a3c9b5', type: 'feat', message: 'Join Gala Games as Senior Software Engineer', tags: ['Career Move', 'MMO Development'], color: 'major' },
    { hash: 'e1f8a67', type: 'feat', message: 'Deploy ML churn prediction achieving 87% accuracy', tags: ['87% Accuracy', '34% Retention', 'Machine Learning', 'Python'], color: 'feature' },
    { hash: 'c6b4d28', type: 'feat', message: 'Build player analytics pipeline processing billions of events', tags: ['Billions of Events', 'Analytics', 'AWS', 'Real-time'], color: 'feature' },
    { hash: '9d7e5a3', type: 'feat', message: 'Create A/B testing platform for data-driven game design', tags: ['A/B Testing', 'Statistics', 'Node.js'], color: 'feature' },
    { hash: 'f4c8b19', type: 'fix', message: 'Optimize AWS infrastructure saving thousands monthly', tags: ['Cost Savings', 'AWS', 'Optimization'], color: 'fix' },
    { hash: 'a2b5c78', type: 'feat', message: 'Promoted to Core Tech Lead, leading team of 4 engineers', tags: ['Leadership', 'Team Lead', 'Management'], color: 'major' },
    { hash: '5e9f2d4', type: 'feat', message: 'Join Ember Entertainment as Platform Engineer', tags: ['Career Move', 'Mobile Games', 'Infrastructure'], color: 'major' },
    { hash: 'b8c3e47', type: 'feat', message: 'Build mobile multiplayer systems at Z2Live', tags: ['Multiplayer', 'Mobile', 'Real-time'], color: 'feature' },
    { hash: 'd6a9b52', type: 'feat', message: 'Ship Lord of the Rings: War in the North (Warner Bros)', tags: ['AAA Release', 'Shipped Game', 'Console', 'C++'], color: 'feature' },
    { hash: '3f7c1a8', type: 'feat', message: 'Join Warner Bros/Snowblind Studios as Software Engineer', tags: ['Career Move', 'AAA Games'], color: 'major' },
    { hash: '1a4b8c2', type: 'feat', message: 'First industry role at Snowblind Studios as Junior Programmer', tags: ['Career Start', 'Junior Developer', 'C++'], color: 'major' },
    { hash: '0x0000', type: 'feat', message: 'Graduate from DigiPen Institute - B.S. Computer Science', tags: ['Education', 'Degree', 'Real-time Simulation'], color: 'major' }
  ]

  return (
    <div className="text-terminal-text-primary font-mono text-sm leading-relaxed mb-6">
      {/* Welcome message and contact bar */}
      <div className="mb-6 p-3 bg-terminal-accent-green/10 border border-terminal-accent-green/30 rounded">
        <div className="text-terminal-accent-green mb-3">
          ===============================================================================
          <br />
          Welcome to james@flyingrobots.dev - Portfolio Terminal v2.0
          <br />
          ===============================================================================
        </div>
        <div className="text-terminal-text-secondary text-xs mb-3">
          Last login: {new Date().toLocaleString()} from 127.0.0.1
          <br />
          18 years of commits to game infrastructure and engine development
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/resume.pdf" className="bg-terminal-accent-green text-terminal-bg px-3 py-1 rounded text-xs font-bold hover:bg-terminal-accent-green/80 transition-colors">
            📄 git clone resume.pdf
          </a>
          <a href="mailto:james@flyingrobots.dev" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
            📧 Email
          </a>
          <a href="https://linkedin.com/in/flyingrobots" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
            🔗 LinkedIn
          </a>
          <a href="https://github.com/flyingrobots" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
            💻 GitHub
          </a>
          <a href="tel:+14254050593" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
            📞 (425) 405-0593
          </a>
        </div>
      </div>

      {/* Command header */}
      <div className="mb-4">
        <span className="text-terminal-accent-purple">james@flyingrobots:~/career$</span>
        <span className="text-terminal-accent-blue ml-2">git log --oneline --graph --decorate --all</span>
      </div>

      {/* Repository info */}
      <div className="bg-terminal-accent-purple/10 border border-terminal-accent-purple/30 rounded p-3 mb-4">
        <div className="text-terminal-accent-purple font-bold mb-1">Repository: james-ross/career</div>
        <div className="text-terminal-text-secondary text-xs">18 years of commits to game infrastructure and engine development</div>
        
        <div className="grid grid-cols-4 gap-4 mt-3 text-center">
          <div>
            <div className="text-terminal-accent-purple text-lg font-bold">127</div>
            <div className="text-terminal-text-secondary text-xs">commits</div>
          </div>
          <div>
            <div className="text-terminal-accent-purple text-lg font-bold">15+</div>
            <div className="text-terminal-text-secondary text-xs">releases</div>
          </div>
          <div>
            <div className="text-terminal-accent-purple text-lg font-bold">4</div>
            <div className="text-terminal-text-secondary text-xs">branches</div>
          </div>
          <div>
            <div className="text-terminal-accent-purple text-lg font-bold">∞</div>
            <div className="text-terminal-text-secondary text-xs">impact</div>
          </div>
        </div>
      </div>

      {/* Git log commits */}
      <div className="space-y-2">
        {commits.map((commit, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-2 p-2 rounded transition-all duration-300 hover:bg-terminal-accent-blue/5 cursor-pointer animate-in slide-in-from-left-4 fade-in ${
              commit.color === 'major' ? 'border-l-4 border-terminal-accent-red pl-4' :
              commit.color === 'feature' ? 'border-l-4 border-terminal-accent-green pl-4' :
              commit.color === 'fix' ? 'border-l-4 border-terminal-accent-yellow pl-4' : ''
            }`}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationDuration: '400ms',
              animationFillMode: 'both'
            }}
          >
            <span className="text-terminal-accent-red">*</span>
            <span className="text-terminal-accent-yellow font-bold min-w-[60px]">{commit.hash}</span>
            <span className="text-terminal-text-primary flex-1">{commit.type}: {commit.message}</span>
            <div className="flex flex-wrap gap-1 justify-end ml-4">
              {commit.tags.map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className={`text-xs px-2 py-1 rounded ${
                    tag.includes('%') || tag.includes('Accuracy') || tag.includes('Players') || tag.includes('Events') ? 
                      'bg-terminal-accent-green/20 text-terminal-accent-green' :
                    tag.includes('Leadership') || tag.includes('Team') || tag.includes('Career') ? 
                      'bg-terminal-accent-purple/20 text-terminal-accent-purple' :
                    tag.includes('Unity') || tag.includes('C++') || tag.includes('Python') || tag.includes('Node.js') ? 
                      'bg-terminal-accent-red/20 text-terminal-accent-red' :
                      'bg-terminal-accent-blue/20 text-terminal-accent-blue'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Git remote */}
      <div className="mt-6 pt-4 border-t border-terminal-accent-blue/20">
        <div className="mb-2">
          <span className="text-terminal-accent-purple">james@flyingrobots:~/career$</span>
          <span className="text-terminal-accent-blue ml-2">git remote -v</span>
        </div>
        <div className="text-terminal-accent-blue text-sm space-y-1">
          <div>origin  james@flyingrobots.dev (fetch)</div>
          <div>origin  james@flyingrobots.dev (push)</div>
        </div>
        
        {/* Contact section */}
        <div className="mt-4 p-3 bg-terminal-accent-green/10 border border-terminal-accent-green/30 rounded">
          <div className="flex flex-wrap gap-2">
            <a href="/resume.pdf" className="bg-terminal-accent-green text-terminal-bg px-3 py-1 rounded text-xs font-bold hover:bg-terminal-accent-green/80 transition-colors">
              📄 git clone resume.pdf
            </a>
            <a href="mailto:james@flyingrobots.dev" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
              📧 Email
            </a>
            <a href="https://linkedin.com/in/flyingrobots" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
              🔗 LinkedIn
            </a>
            <a href="https://github.com/flyingrobots" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
              💻 GitHub
            </a>
            <a href="tel:+14254050593" className="bg-terminal-accent-blue/20 text-terminal-accent-blue px-3 py-1 rounded text-xs hover:bg-terminal-accent-blue/30 transition-colors">
              📞 (425) 405-0593
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}