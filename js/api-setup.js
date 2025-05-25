/**
 * API Setup for SR&ED From The Shed website
 * Configures environment variables and API keys
 */

// Set up YouTube API key from environment
(function() {
    // This will be replaced with the actual API key during deployment
    const API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw'; // Your provided API key
    
    // Make it available globally
    window.YOUTUBE_API_KEY = API_KEY;
    
    console.log('YouTube API configured successfully');
})();