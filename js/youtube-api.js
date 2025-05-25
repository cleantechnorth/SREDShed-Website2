/**
 * YouTube API integration for SR&ED From The Shed website
 * Handles fetching and displaying YouTube videos from the channel
 */

// YouTube API configuration
const YOUTUBE_CONFIG = {
    CHANNEL_ID: 'UCYourChannelIDHere', // This will be extracted from the channel URL
    CHANNEL_URL: 'https://youtube.com/@sredfromtheshed2727',
    API_KEY: '', // Will be set from environment or fallback
    MAX_RESULTS_FEATURED: 3,
    MAX_RESULTS_ALL: 12,
    VIDEOS_PER_PAGE: 6
};

// State management
let currentPageToken = '';
let isLoading = false;
let allVideosLoaded = false;

/**
 * Initialize YouTube API
 */
function initializeYouTubeAPI() {
    // Try to get API key from environment variables or use a fallback
    YOUTUBE_CONFIG.API_KEY = getAPIKey();
    
    if (!YOUTUBE_CONFIG.API_KEY) {
        console.warn('YouTube API key not available. Using fallback content.');
        return false;
    }
    
    return true;
}

/**
 * Get YouTube API key with fallback
 */
function getAPIKey() {
    // In a real deployment, this would come from environment variables
    // For demo purposes, we'll simulate the API response
    return process?.env?.YOUTUBE_API_KEY || '';
}

/**
 * Extract channel ID from channel URL
 */
async function getChannelId() {
    // For @handle URLs, we need to resolve to channel ID
    // This is a simplified approach - in production, you'd use the YouTube API
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=sredfromtheshed2727&key=${YOUTUBE_CONFIG.API_KEY}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.channelId;
        }
    } catch (error) {
        console.error('Error getting channel ID:', error);
    }
    
    return null;
}

/**
 * Fetch videos from YouTube API
 */
async function fetchYouTubeVideos(maxResults = 12, pageToken = '') {
    if (!YOUTUBE_CONFIG.API_KEY) {
        return getFallbackVideos(maxResults);
    }
    
    try {
        // First get the channel ID if we don't have it
        if (!YOUTUBE_CONFIG.CHANNEL_ID) {
            YOUTUBE_CONFIG.CHANNEL_ID = await getChannelId();
        }
        
        if (!YOUTUBE_CONFIG.CHANNEL_ID) {
            throw new Error('Could not resolve channel ID');
        }
        
        const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        apiUrl.searchParams.append('part', 'snippet');
        apiUrl.searchParams.append('channelId', YOUTUBE_CONFIG.CHANNEL_ID);
        apiUrl.searchParams.append('type', 'video');
        apiUrl.searchParams.append('order', 'date');
        apiUrl.searchParams.append('maxResults', maxResults.toString());
        apiUrl.searchParams.append('key', YOUTUBE_CONFIG.API_KEY);
        
        if (pageToken) {
            apiUrl.searchParams.append('pageToken', pageToken);
        }
        
        const response = await fetch(apiUrl.toString());
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Get additional details for each video (duration, view count, etc.)
        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
            detailsUrl.searchParams.append('part', 'contentDetails,statistics');
            detailsUrl.searchParams.append('id', videoIds);
            detailsUrl.searchParams.append('key', YOUTUBE_CONFIG.API_KEY);
            
            const detailsResponse = await fetch(detailsUrl.toString());
            const detailsData = await detailsResponse.json();
            
            // Merge the data
            data.items.forEach((item, index) => {
                const details = detailsData.items?.find(d => d.id === item.id.videoId);
                if (details) {
                    item.contentDetails = details.contentDetails;
                    item.statistics = details.statistics;
                }
            });
        }
        
        return data;
        
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return getFallbackVideos(maxResults);
    }
}

/**
 * Get fallback video data when API is not available
 */
function getFallbackVideos(maxResults = 12) {
    // Simulated video data for demonstration
    const fallbackVideos = [
        {
            id: { videoId: 'demo1' },
            snippet: {
                title: 'SR&ED Program Overview: Understanding Canada\'s Innovation Tax Credit',
                description: 'A comprehensive introduction to the SR&ED tax credit program, covering eligibility criteria, application processes, and key benefits for Canadian businesses.',
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                thumbnails: {
                    medium: {
                        url: 'https://pixabay.com/get/g3b04a2efe877e9f864fce84480be4600f8841ff1b823df408a81ca333e7aab70c8e5dd071b06da3f0d3dae415ea258859d21cbd41e61ad281c19e4665551f8ab_1280.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT15M30S' },
            statistics: { viewCount: '1542' }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: 'Recent SR&ED Policy Changes: What You Need to Know',
                description: 'Breaking down the latest policy updates including the increased refundable tax credit limit from $3M to $4.5M and expanded eligibility criteria.',
                publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                thumbnails: {
                    medium: {
                        url: 'https://pixabay.com/get/gb24d19038881965e911bf65b560043eeb3cc0c27d06c050cb5244bd29b43be57c6a878e741043a637f0c4893fc0e08bea7a1bd8fae426e68003a749367aa9c50_1280.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT22M45S' },
            statistics: { viewCount: '987' }
        },
        {
            id: { videoId: 'demo3' },
            snippet: {
                title: 'Strengthening Your SR&ED Claims: Documentation Best Practices',
                description: 'Expert tips and strategies for building stronger SR&ED claims through proper documentation and evidence gathering.',
                publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                thumbnails: {
                    medium: {
                        url: 'https://pixabay.com/get/gd3e259a3f4a5541d1d78849b2a2d20c8bbdb600d7bd19d3efac0fd9e5a4e89a05b639030cd0a65b856d5de491d2d8e9109640481381cfc6e381923fd7c8fb675_1280.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT18M12S' },
            statistics: { viewCount: '756' }
        }
    ];
    
    // Return more videos if requested
    const requestedVideos = fallbackVideos.slice(0, Math.min(maxResults, fallbackVideos.length));
    
    return {
        items: requestedVideos,
        nextPageToken: null,
        pageInfo: {
            totalResults: fallbackVideos.length,
            resultsPerPage: maxResults
        }
    };
}

/**
 * Create HTML for a single video card
 */
function createVideoCard(video, isLarge = false) {
    const videoId = video.id.videoId || video.id;
    const title = video.snippet.title;
    const description = video.snippet.description;
    const publishedAt = new Date(video.snippet.publishedAt);
    const thumbnailUrl = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    
    // Format duration if available
    const duration = video.contentDetails?.duration ? 
        window.SREDWebsite?.formatDuration(video.contentDetails.duration) || '' : '';
    
    // Format view count if available
    const viewCount = video.statistics?.viewCount ? 
        parseInt(video.statistics.viewCount).toLocaleString() + ' views' : '';
    
    const cardSize = isLarge ? 'col-lg-6' : 'col-lg-4';
    const cardClass = isLarge ? 'video-card-large' : 'video-card';
    
    return `
        <div class="${cardSize} col-md-6 mb-4">
            <div class="${cardClass}">
                <div class="video-thumbnail">
                    <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                    <div class="video-play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    ${duration ? `
                        <div class="position-absolute bottom-0 end-0 m-2">
                            <span class="video-duration">${duration}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="video-meta">
                    <div class="video-date">${window.SREDWebsite?.formatDate(publishedAt.toISOString()) || publishedAt.toLocaleDateString()}</div>
                    <h5 class="video-title">${title}</h5>
                    <p class="video-description">${window.SREDWebsite?.truncateText(description, 120) || description.substring(0, 120) + '...'}</p>
                    ${viewCount ? `<small class="text-muted">${viewCount}</small>` : ''}
                    <div class="mt-3">
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="btn btn-primary btn-sm">
                            <i class="fas fa-play me-2"></i>Watch Video
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Load and display YouTube videos
 */
async function loadYouTubeVideos(type = 'featured') {
    const container = type === 'featured' ? 
        document.getElementById('featured-videos') : 
        document.getElementById('all-videos');
    
    if (!container) {
        console.error('Video container not found');
        return;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoading) return;
    isLoading = true;
    
    try {
        const maxResults = type === 'featured' ? 
            YOUTUBE_CONFIG.MAX_RESULTS_FEATURED : 
            YOUTUBE_CONFIG.MAX_RESULTS_ALL;
        
        // Show loading spinner
        if (window.SREDWebsite?.showLoadingSpinner) {
            window.SREDWebsite.showLoadingSpinner(container);
        }
        
        const data = await fetchYouTubeVideos(maxResults, currentPageToken);
        
        if (!data || !data.items || data.items.length === 0) {
            throw new Error('No videos found');
        }
        
        // Clear container if this is a fresh load
        if (!currentPageToken) {
            container.innerHTML = '';
        } else {
            // Remove loading spinner for pagination
            if (window.SREDWebsite?.hideLoadingSpinner) {
                window.SREDWebsite.hideLoadingSpinner(container);
            }
        }
        
        // Create video cards
        const videoCards = data.items.map(video => 
            createVideoCard(video, type === 'featured')
        ).join('');
        
        container.insertAdjacentHTML('beforeend', videoCards);
        
        // Add fade-in animation
        const newCards = container.querySelectorAll('.video-card:not(.fade-in)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
        
        // Handle pagination for 'all' videos
        if (type === 'all') {
            const loadMoreButton = document.getElementById('load-more-videos');
            
            if (data.nextPageToken && loadMoreButton) {
                currentPageToken = data.nextPageToken;
                loadMoreButton.style.display = 'block';
                
                // Add click handler for load more
                loadMoreButton.onclick = () => loadYouTubeVideos('all');
            } else if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
                allVideosLoaded = true;
            }
        }
        
        console.log(`Loaded ${data.items.length} videos for ${type} section`);
        
    } catch (error) {
        console.error('Error loading videos:', error);
        
        if (window.SREDWebsite?.showVideoLoadError) {
            window.SREDWebsite.showVideoLoadError(container);
        }
    } finally {
        isLoading = false;
    }
}

/**
 * Initialize video loading when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize YouTube API
    const apiReady = initializeYouTubeAPI();
    
    if (!apiReady) {
        console.log('YouTube API not available, using fallback content');
    }
    
    // Add click handlers for video cards (for analytics or custom behavior)
    document.addEventListener('click', function(e) {
        const videoCard = e.target.closest('.video-card, .video-card-large');
        if (videoCard) {
            const playButton = e.target.closest('.btn[href*="youtube.com"]');
            if (playButton) {
                console.log('Video play button clicked:', playButton.href);
                // Add analytics tracking here if needed
            }
        }
    });
});

// Export the main function for external use
window.loadYouTubeVideos = loadYouTubeVideos;
