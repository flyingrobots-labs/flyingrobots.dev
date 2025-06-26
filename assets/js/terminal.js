// Terminal Interactions and Animations

// Typing animation for command line
function typeCommand(element, text, callback) {
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 50);
}

// Initialize terminal animations
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to commit lines
    const commitLines = document.querySelectorAll('.commit-line');
    
    commitLines.forEach(line => {
        line.addEventListener('click', function() {
            // Get commit hash
            const hash = this.dataset.commit || this.querySelector('.commit-hash').textContent;
            
            // Create a subtle flash effect
            this.style.background = 'rgba(88, 166, 255, 0.2)';
            setTimeout(() => {
                this.style.background = '';
            }, 300);
            
            // Could open a modal or navigate to detail page
            console.log(`Viewing commit: ${hash}`);
        });
    });
    
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all stat numbers
    document.querySelectorAll('.stat-number').forEach(stat => {
        observer.observe(stat);
    });
    
    // Terminal button interactions
    document.querySelector('.btn.close')?.addEventListener('click', () => {
        if (confirm('Exit terminal?')) {
            window.close();
        }
    });
    
    document.querySelector('.btn.minimize')?.addEventListener('click', () => {
        document.body.style.opacity = '0.5';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 200);
    });
    
    document.querySelector('.btn.maximize')?.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    });
});

// Animate number counting
function animateValue(element) {
    const finalValue = element.textContent;
    const isInfinity = finalValue === '∞';
    
    if (isInfinity) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease';
            element.style.opacity = '1';
        }, 100);
        return;
    }
    
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    if (isNaN(numericValue)) return;
    
    const duration = 1000;
    const start = 0;
    const increment = numericValue / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (finalValue.includes('+') ? '+' : '');
        }
    }, 16);
}

// Add typing cursor effect
function addTypingCursor(element) {
    element.classList.add('cursor');
}

// Git command simulation
function simulateGitCommand(command, outputElement) {
    const responses = {
        'git status': 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean',
        'git log --oneline': 'Showing commit history...',
        'git remote -v': 'origin  james@flyingrobots.dev (fetch)\norigin  james@flyingrobots.dev (push)'
    };
    
    const response = responses[command] || `Command not found: ${command}`;
    outputElement.textContent = response;
}