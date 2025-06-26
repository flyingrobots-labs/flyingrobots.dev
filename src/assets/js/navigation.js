// Navigation functionality

document.addEventListener('DOMContentLoaded', () => {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update active navigation state
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Add page transition effects
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
                return;
            }
            
            // Add transition effect
            e.preventDefault();
            const href = this.getAttribute('href');
            
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        const currentIndex = navLinks.findIndex(link => link.classList.contains('active'));
        
        let newIndex = currentIndex;
        
        switch(e.key) {
            case 'ArrowLeft':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                newIndex = Math.min(navLinks.length - 1, currentIndex + 1);
                break;
            case '1':
                newIndex = 0;
                break;
            case '2':
                newIndex = 1;
                break;
            case '3':
                newIndex = 2;
                break;
            default:
                return;
        }
        
        if (newIndex !== currentIndex && navLinks[newIndex]) {
            navLinks[newIndex].click();
        }
    });
    
    // Add breadcrumb navigation if exists
    const breadcrumb = document.querySelector('.breadcrumb-nav');
    if (breadcrumb) {
        const pageTitles = {
            'index.html': 'timeline',
            'about.html': 'story',
            'resume.html': 'resume.pdf'
        };
        
        const currentTitle = pageTitles[currentPage] || currentPage;
        breadcrumb.innerHTML = `
            <span>~/career</span>
            <span class="path-separator">/</span>
            <span class="current-path">${currentTitle}</span>
        `;
    }
    
    // Preload other pages for smoother transitions
    const pages = ['index.html', 'about.html', 'resume.html'];
    pages.forEach(page => {
        if (page !== currentPage) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        }
    });
    
    // Add terminal command shortcuts
    let commandBuffer = '';
    document.addEventListener('keypress', (e) => {
        // Only capture if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        commandBuffer += e.key;
        
        // Check for navigation commands
        if (commandBuffer.endsWith('cd timeline')) {
            window.location.href = 'index.html';
            commandBuffer = '';
        } else if (commandBuffer.endsWith('cd story')) {
            window.location.href = 'about.html';
            commandBuffer = '';
        } else if (commandBuffer.endsWith('open resume')) {
            window.location.href = 'resume.html';
            commandBuffer = '';
        }
        
        // Clear buffer after 2 seconds
        setTimeout(() => {
            commandBuffer = '';
        }, 2000);
    });
});

// Page visibility API for animations
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.querySelectorAll('.typing-effect').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when page is visible
        document.querySelectorAll('.typing-effect').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});