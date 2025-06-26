// Load Zdog as a script tag instead of ES module to preserve UMD behavior
const script = document.createElement('script');
script.src = '/lib/zdog.dist.min.js';
document.head.appendChild(script);

// Export the loading promise
export const zdogReady = new Promise((resolve) => {
  script.onload = () => resolve(window.Zdog);
});

// Also export Zdog directly (requires top-level await)
export default await zdogReady;