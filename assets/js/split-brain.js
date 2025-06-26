// Split Brain Interface Functionality

document.addEventListener('DOMContentLoaded', () => {
    const splitContainer = document.getElementById('splitContainer');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const gitSide = document.querySelector('.git-side');
    const minimalSide = document.querySelector('.minimal-side');
    
    // Mode switching functionality
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            
            // Update active button
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update display
            splitContainer.className = 'split-container';
            gitSide.classList.remove('active');
            minimalSide.classList.remove('active');
            
            switch(mode) {
                case 'split':
                    gitSide.classList.add('active');
                    minimalSide.classList.add('active');
                    break;
                case 'git':
                    splitContainer.classList.add('single-mode');
                    gitSide.classList.add('active');
                    break;
                case 'minimal':
                    splitContainer.classList.add('single-mode');
                    minimalSide.classList.add('active');
                    break;
            }
            
            // Save preference
            localStorage.setItem('preferredView', mode);
        });
    });
    
    // Restore saved preference
    const savedMode = localStorage.getItem('preferredView');
    if (savedMode) {
        const savedButton = document.querySelector(`[data-mode="${savedMode}"]`);
        if (savedButton) {
            savedButton.click();
        }
    }
    
    // Synchronized scrolling in split view
    let isScrolling = false;
    
    function syncScroll(source, target) {
        if (isScrolling) return;
        isScrolling = true;
        
        const sourceHeight = source.scrollHeight - source.clientHeight;
        const targetHeight = target.scrollHeight - target.clientHeight;
        const scrollPercent = source.scrollTop / sourceHeight;
        
        target.scrollTop = scrollPercent * targetHeight;
        
        setTimeout(() => {
            isScrolling = false;
        }, 10);
    }
    
    gitSide?.addEventListener('scroll', () => {
        if (splitContainer.classList.contains('single-mode')) return;
        syncScroll(gitSide, minimalSide);
    });
    
    minimalSide?.addEventListener('scroll', () => {
        if (splitContainer.classList.contains('single-mode')) return;
        syncScroll(minimalSide, gitSide);
    });
    
    // Terminal typing animation for narrative
    const narrativeElements = document.querySelectorAll('.narrative-text');
    
    narrativeElements.forEach((element, index) => {
        const text = element.textContent;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        setTimeout(() => {
            typeText(element, text, 30);
        }, index * 500);
    });
    
    function typeText(element, text, speed) {
        let index = 0;
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '▋';
        element.appendChild(cursor);
        
        const interval = setInterval(() => {
            if (index < text.length) {
                element.insertBefore(
                    document.createTextNode(text[index]),
                    cursor
                );
                index++;
            } else {
                clearInterval(interval);
                cursor.style.display = 'none';
            }
        }, speed);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + 1/2/3 for mode switching
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    document.querySelector('[data-mode="split"]').click();
                    break;
                case '2':
                    document.querySelector('[data-mode="git"]').click();
                    break;
                case '3':
                    document.querySelector('[data-mode="minimal"]').click();
                    break;
            }
        }
        
        // Escape to return to split view
        if (e.key === 'Escape' && splitContainer.classList.contains('single-mode')) {
            document.querySelector('[data-mode="split"]').click();
        }
    });
    
    // Add hover effect to experience items
    const experienceItems = document.querySelectorAll('.experience-item');
    
    experienceItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            item.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
    
    // Animate metrics on view
    const metricsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const metrics = entry.target.querySelectorAll('.metric-number, .highlight-number');
                metrics.forEach(metric => {
                    animateMetric(metric);
                });
                metricsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.metrics-section, .achievement-highlights').forEach(section => {
        metricsObserver.observe(section);
    });
    
    function animateMetric(element) {
        const value = element.textContent;
        const isPercentage = value.includes('%');
        const isPlus = value.includes('+');
        const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
        
        if (isNaN(numericValue)) return;
        
        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                element.textContent = value;
                clearInterval(timer);
            } else {
                let display = Math.floor(current);
                if (isPercentage) display += '%';
                if (isPlus) display += '+';
                element.textContent = display;
            }
        }, 20);
    }
});

// Typing cursor style
const style = document.createElement('style');
style.textContent = `
    .typing-cursor {
        animation: blink 1s infinite;
        color: #c9d1d9;
        font-weight: normal;
    }
    
    @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
    }
`;
document.head.appendChild(style);