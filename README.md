# flyingrobots.dev

A terminal-based portfolio website that boots like a Linux system and displays my career as a git log.

## What is this?

It's my portfolio, but make it `chmod +x`. When you visit, you'll experience:

1. **CRT Power On** → Old-school monitor flicker
2. **Linux Boot Sequence** → Complete with Tux and systemd services  
3. **Git Timeline** → 18 years of career commits
4. **Interactive Terminal** → Type commands to explore

## Features

```bash
james@flyingrobots:~$ ls -la features/
drwxr-xr-x  authentic-linux-boot
drwxr-xr-x  career-as-git-commits  
drwxr-xr-x  interactive-terminal
drwxr-xr-x  no-autofill-annoyances
drwxr-xr-x  mobile-responsive
```

## Tech Stack

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling  
- **React Hooks** - State management
- **No external UI libs** - Just good ol' DOM

## Quick Start

```bash
# Clone
git clone https://github.com/jamesrosstwo/flyingrobots.dev.git
cd flyingrobots.dev

# Install
npm install

# Dev
npm run dev

# Build
npm run build
```

## Terminal Commands

Once booted, try these commands:

- `help` - Available commands
- `about` - Who I am
- `skills` - Tech I know
- `projects` - Things I've built
- `experience` - Where I've worked
- `contact` - How to reach me

## The Gimmick

The entire site is designed to feel like you're SSH'ing into my career. Boot messages reference real accomplishments ("127 files" = 127 career commits), and the git log shows actual projects formatted as commits.

## Contact

```bash
james@flyingrobots:~$ cat contact.txt
Email: james@flyingrobots.dev
GitHub: @jamesrosstwo
LinkedIn: /in/flyingrobots
Phone: (425) 405-0593
```

## License

MIT - Do whatever you want with it.

---

*Built with ☕ and a healthy appreciation for terminals*