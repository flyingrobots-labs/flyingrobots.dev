export interface Experience {
  id: string
  company: string
  date: string
  role: string
  description: string
  achievements?: {
    label: string
    value: string
  }[]
}

export const experiences: Experience[] = [
  {
    id: 'independent',
    company: 'Independent R&D',
    date: 'May 2025 - Present',
    role: 'Principal Engineer',
    description: 'Building open source innovations: Git Mind (distributed semantic knowledge graphs), Universal Charter (AI ethics framework), MIND-UCAL License (ethical software licensing), GitScrolls (technical storytelling through mythology).',
  },
  {
    id: 'smilebreak',
    company: 'SmileBreak',
    date: 'Jun 2024 - May 2025',
    role: 'Senior Software Engineer',
    description: 'Unity & Quantum systems for hybrid strategy/action RPG. Reactive MVVM architecture, allocation-free input systems, cross-platform development.',
    achievements: [
      { label: 'UI bugs eliminated', value: '70%' },
      { label: 'allocations/frame', value: '0' },
    ],
  },
  {
    id: 'gala',
    company: 'Gala Games',
    date: 'Feb 2022 - Apr 2024',
    role: 'Senior Software Engineer',
    description: 'Custom MMO engine for The Walking Dead: Empires. Built from scratch: 2D physics, networking, collision detection, pathfinding, ECS architecture. Persistent world simulation supporting thousands of concurrent players.',
    achievements: [
      { label: 'concurrent players', value: '1000s' },
      { label: 'zone size', value: '1km²' },
    ],
  },
  {
    id: 'ember',
    company: 'Ember Entertainment',
    date: 'Dec 2014 - Feb 2022',
    role: 'Core Tech Lead & Platform Engineer',
    description: 'Built shared infrastructure for 15+ mobile games. ML churn prediction, A/B testing platform, real-time analytics, GDPR compliance, CI/CD automation. Led team of 4 engineers.',
    achievements: [
      { label: 'ML accuracy', value: '87%' },
      { label: 'retention boost', value: '34%' },
      { label: 'games served', value: '15+' },
      { label: 'monthly savings', value: '$1000s' },
    ],
  },
]