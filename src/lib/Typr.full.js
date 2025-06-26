// Typr.js bundled with Typr.U.js
// From https://github.com/photopea/Typr.js

(function(window) {
    // First, create the Typr object
    window.Typr = {};
    
    // Load the main Typr.js content
    fetch('/lib/Typr.js').then(r => r.text()).then(typrCode => {
        eval(typrCode);
        
        // Then load Typr.U.js content
        return fetch('/lib/Typr.U.js').then(r => r.text());
    }).then(typrUCode => {
        eval(typrUCode);
        
        // Dispatch event to signal Typr is ready
        window.dispatchEvent(new Event('typr-loaded'));
    });
})(window);