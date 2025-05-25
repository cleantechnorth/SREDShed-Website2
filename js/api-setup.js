/**
 * API Setup for SR&ED From The Shed website
 * Configures environment variables and API keys
 */

// Set up YouTube API key from environment
(function() {
    // Updated API key with fresh quota
    const API_KEY = 'AIzaSyCn13fugHy0xkOubNIkZ9v9wLg-waRt6T0';
    
    // Make it available globally
    window.YOUTUBE_API_KEY = API_KEY;
    
    console.log('YouTube API configured successfully with new key');
})();