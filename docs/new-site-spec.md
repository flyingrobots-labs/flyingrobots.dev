# James Ross Resume Site Specification

## Project Overview

Build a 3-page technical portfolio site that showcases James Ross as a Staff+ Game Infrastructure Engineer through progressive disclosure: Hook → Story → Action.

---

## Site Structure

### 1. Landing Page (`index.html`) - Git Commit Timeline
- **Purpose**: Hook visitors with technical creativity
- **Content**: Git log interface showing career as commits
- **Design**: Full terminal interface with realistic git output
- **Example:**
	- [Sketch](examples/git_timeline_resume.htm)
	![terminal mockup](examples/git_terminal_mockup.svg)

#### Key Elements:

- Terminal header with window controls, path: `james@flyingrobots ~/whoami`
- Git status showing: `main branch, 127 commits, 18 years`
- Repository stats: `127 commits, 15+ releases, 4 branches, ∞ impact`
- Commit log with realistic format:
	* `a7f3c21 feat: Launch independent R&D - Git Mind, Universal Charter`
	* `d4b8e92 fix: Eliminate 70% UI bugs with MVVM at SmileBreak`
	* `8c5d7f1 feat: Complete custom MMO engine for Walking Dead`
	* `e1f8a67 feat: Deploy ML churn prediction - 87% accuracy`
- **Each commit shows tags**: `skills` (`#7c3aed`), `achievements` (`#238636`), `signed` commits (`🔒`)
- **Commit types**: `major` (red border), `feature` (green border), `fix` (orange border)
- **Footer**: `git remote -v` showing contact info
- **Navigation**: Terminal-style commands

---

### 2. About Page (`about.html`) - Split-Brain Interface

- **Purpose**: Tell the story with depth and personality
- **Content**: Left=narrative terminal, Right=clean minimal resume
- **Design**: Split screen with toggle modes

#### Left Brain (Terminal)
- Dark theme (`#0d1117` bg, `#c9d1d9` text)
- Monaco/monospace font
- Narrative storytelling with terminal prompts
- Sections: Journey Begins, Mobile Revolution, MMO Challenge, Innovation Phase
- Typing animations and terminal effects

#### Right Brain (Clean Minimal)

- White background, clean typography
- Apple/Swiss design aesthetic
- Structured resume data
- Experience timeline, skills grid, metrics
- Professional formatting

#### Features:

- Toggle between: Dual-Core, Narrative Only, Data Only
- Animated central divider with pulsing neural connection
- Mobile responsive (stacks vertically)

#### Example

- `/Users/james/git/flyingrobots.dev/docs/examples/hybrid_split_resume.html`

---

### 3. Resume Page (`resume.html`) - Clean Export

- **Purpose**: Provide traditional resume for HR/ATS systems
- **Content**: Standard resume format optimized for printing/PDF
- **Design**: Clean, minimal, print-friendly

#### Requirements

- Single page layout optimized for Letter/A4
- Traditional resume sections: Header, Experience, Skills, Education
- Print-friendly styling (no fancy animations)
- PDF download button
- ATS-friendly text structure
- Professional typography

---

## Navigation Design

### Terminal-Style Navigation

- Consistent across all pages:
- `james@flyingrobots:~$ ls -la career/`
- `drwxr-xr-x  timeline/`     <- Landing (Git log)
- `drwxr-xr-x  story/`        <- About (Split-brain) 
- `-rw-r--r--  resume.pdf`    <- Resume (Clean)

### Header Navigation

- Fixed header with terminal styling
- Breadcrumb: `~/career/[current-page]`
- Links styled as file paths
- Dark theme consistent with git terminal

---

## Content Requirements

###Personal Information

- **Name**: James Ross
- **Title**: Staff Software Engineer | Game Infrastructure & Engine Architecture
- **Location**: Seattle, WA • Remote OK
- **Phone**: (425) 405-0593
- **Email**: james@flyingrobots.dev
- **LinkedIn**: https://linkedin.com/in/flyingrobots
- **GitHub**: https://github.com/flyingrobots

### Key Metrics

- 18 years experience
- 15+ games shipped
- 87% ML accuracy achieved
- 4 major studios
- Billions of player events processed
- 34% retention improvement
- 70% UI bugs eliminated
- 1000s concurrent players supported

### Experience Timeline

1. **Independent R&D** (May 2025 - Present)
	Git Mind, Universal Charter, MIND-UCAL License, GitScrolls
2. **SmileBreak** (Jun 2024 - May 2025) - Senior Software Engineer
	Unity & Quantum systems, MVVM architecture, 70% bug reduction
3. **Gala Games** (Feb 2022 - Apr 2024) - Senior Software Engineer
	Custom MMO engine, 1000s concurrent players, 1km² zones
4. Ember Entertainment (Dec 2014 - Feb 2022) - Core Tech Lead
	15+ mobile games, 87% ML accuracy, 34% retention improvement
5. Earlier Career (2007-2014)
	Z2Live, Warner Bros/Snowblind, Lord of the Rings: War in the North

### Technical Skills

- **Game Engines**: Unity & Quantum, Custom C++ Engines, ECS Architecture
- **Infrastructure**: AWS Game Services, Docker & CI/CD, Redis & Job Processing
- **Live Operations**: Player Analytics, ML Churn Prediction, A/B Testing
- **Languages**: C#, JavaScript, Python, C++, Lua, SQL, NoSQL

### Projects

- **Git Mind**: Distributed semantic knowledge graph protocol
- **Universal Charter**: AI ethics framework for consciousness coexistence
- **MIND-UCAL License**: Ethical software license restricting violent AI
- **GitScrolls**: Technical storytelling through mythology

---

## Technical Requirements

### File Structure

```
resume-site/
├── index.html          # Landing - Git timeline
├── about.html           # About - Split brain  
├── resume.html          # Resume - Clean export
├── assets/
│   ├── css/
│   │   ├── terminal.css    # Terminal styling
│   │   ├── minimal.css     # Clean resume styling  
│   │   └── navigation.css  # Shared navigation
│   ├── js/
│   │   ├── terminal.js     # Terminal animations
│   │   ├── split-brain.js  # Split screen logic
│   │   └── navigation.js   # Site navigation
│   └── resume.pdf          # Downloadable PDF
├── README.md
└── package.json         # If using build tools
```

---

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Styling**: CSS Grid/Flexbox, CSS animations, custom properties
- **Typography**: Monaco/Menlo for terminal, system fonts for clean sections
- **Responsive**: Mobile-first approach with breakpoints
- **Performance**: Optimized for fast loading, minimal dependencies

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Graceful degradation for older browsers
- Print-friendly CSS for resume page

---

## Color Scheme

- Terminal Dark: `#0d1117` background, `#c9d1d9` text, `#58a6ff` links
- Minimal Clean: `#ffffff` background, `#333` text, professional grays
- Accents: `#00ffff` (cyan), `#7c3aed` (purple), `#238636` (green), `#f85149` (red)

---

## Animations

- Typing effects for terminal
- Smooth transitions between modes
- Hover effects on interactive elements
- Pulsing neural connection in split-brain
- Subtle fade-ins on scroll

---

## SEO Requirements

- Semantic HTML structure
- Meta tags for social sharing
- Structured data for person/professional
- Descriptive page titles
- Alt text for any images

---

## Success Criteria

- **Memorable**: Visitors bookmark and share the git timeline
- **Professional**: Resume page suitable for HR/ATS systems
- **Functional**: All navigation and interactions work smoothly
- **Responsive**: Excellent experience on desktop and mobile
- **Fast**: Quick loading times across all pages
- **Accessible**: Screen reader compatible, good contrast ratios

---

## Deployment

- Host on static hosting (Netlify, Vercel, GitHub Pages)
- Custom domain: `flyingrobots.dev` or similar
- HTTPS enabled
- Performance monitoring
