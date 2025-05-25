/**
 * Configuration file for SR&ED From The Shed website
 * Contains environment variables and API keys
 */

// Make YouTube API key available globally
window.YOUTUBE_API_KEY = 'YOUTUBE_API_KEY_PLACEHOLDER';

// Replace placeholder with actual environment variable in production
if (typeof process !== 'undefined' && process.env && process.env.YOUTUBE_API_KEY) {
    window.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
}