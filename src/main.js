import './styles/main.css';
import { init } from './scene.js';

// Collapsible section functionality
window.toggleSection = function(titleElement) {
    const section = titleElement.closest('.section');
    section.classList.toggle('collapsed');
}

window.toggleAllSections = function() {
    const sections = document.querySelectorAll('.section');
    const anyExpanded = Array.from(sections).some(section => !section.classList.contains('collapsed'));
    
    sections.forEach(section => {
        if (anyExpanded) {
            section.classList.add('collapsed');
        } else {
            section.classList.remove('collapsed');
        }
    });
}

// Toggle main content area
window.toggleMainContent = function() {
    const container = document.querySelector('.container');
    container.classList.toggle('content-collapsed');
}

// Initialize achievement list interactivity
function initAchievements() {
    document.addEventListener('click', function(e) {
        // Check if clicked element is an achievement list item
        if (e.target.tagName === 'LI' && e.target.closest('.achievement-list')) {
            e.target.classList.toggle('expanded');
        }
    });
}

// Terminal functionality removed - using ImGui interface

// Initialize when the page loads
window.addEventListener('load', () => {
    try {
        console.log('Window loaded, initializing scene...');
        init();
        initAchievements();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
        console.error('Stack trace:', error.stack);
    }
});

// Also try DOMContentLoaded as a fallback
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
});