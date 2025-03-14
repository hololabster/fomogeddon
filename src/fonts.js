// src/fonts.js - Font setup for Cyberpunk theme

// Add this code to import the cyberpunk fonts
const loadFonts = () => {
    // Create a style element
    const style = document.createElement('style');
    
    // Add font imports
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
    `;
    
    // Append to document head
    document.head.appendChild(style);
  };
  
  // Load fonts
  loadFonts();
  
  // Export font family variables for use in other components
  export const fonts = {
    cyber: "'Rajdhani', 'Orbitron', sans-serif",
    terminal: "'Share Tech Mono', 'Courier New', monospace"
  };
  
  export default fonts;