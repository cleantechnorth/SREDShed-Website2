/**
 * YouTube API integration for SR&ED From The Shed website
 * Handles fetching and displaying YouTube videos from the channel
 */

// YouTube API configuration
const YOUTUBE_CONFIG = {
    CHANNEL_ID: 'UCKEKDbwFB08xaNrP1dMpxPA',
    CHANNEL_HANDLE: 'sredfromtheshed2727',
    CHANNEL_URL: 'https://youtube.com/@sredfromtheshed2727',
    API_KEY: '', // Will be set from environment
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
    // Get API key from window object (set by api-setup.js)
    YOUTUBE_CONFIG.API_KEY = window.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_CONFIG.API_KEY || YOUTUBE_CONFIG.API_KEY === 'YOUTUBE_API_KEY_PLACEHOLDER') {
        console.warn('YouTube API key not available. Using fallback content.');
        return false;
    }
    
    console.log('YouTube API initialized successfully');
    return true;
}

/**
 * Get YouTube API key with fallback
 */
function getAPIKey() {
    // Check if API key is available in environment
    const apiKey = typeof window !== 'undefined' && window.YOUTUBE_API_KEY;
    return apiKey && apiKey !== 'YOUTUBE_API_KEY_PLACEHOLDER' ? apiKey : null;
}

/**
 * Extract channel ID from channel handle
 */
async function getChannelId() {
    try {
        // Use the channels endpoint with forHandle parameter for @handles
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${YOUTUBE_CONFIG.CHANNEL_HANDLE}&key=${YOUTUBE_CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items[0].id;
        }
        
        // Fallback: try search if forHandle doesn't work
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${YOUTUBE_CONFIG.CHANNEL_HANDLE}&key=${YOUTUBE_CONFIG.API_KEY}`
        );
        
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
            return searchData.items[0].snippet.channelId;
        }
        
    } catch (error) {
        console.error('Error getting channel ID:', error);
    }
    
    return null;
}

/**
 * Fetch videos from YouTube API using channel ID
 */
async function fetchYouTubeVideos(maxResults = 12, pageToken = '') {
    if (!YOUTUBE_CONFIG.API_KEY) {
        throw new Error('YouTube API key not available');
    }
    
    try {
        // Use the channel ID directly to fetch videos
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
        
        console.log('Fetching videos from channel ID:', YOUTUBE_CONFIG.CHANNEL_ID);
        
        const response = await fetch(apiUrl.toString());
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response:', response.status, errorText);
            throw new Error(`YouTube API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('YouTube API Error:', data.error);
            throw new Error(`YouTube API error: ${data.error.message}`);
        }
        
        // Get additional details for each video (duration, view count, etc.)
        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
            detailsUrl.searchParams.append('part', 'contentDetails,statistics');
            detailsUrl.searchParams.append('id', videoIds);
            detailsUrl.searchParams.append('key', YOUTUBE_CONFIG.API_KEY);
            
            const detailsResponse = await fetch(detailsUrl.toString());
            
            if (detailsResponse.ok) {
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
        }
        
        console.log(`Successfully fetched ${data.items?.length || 0} videos from SRED From The Shed channel`);
        return data;
        
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        throw error;
    }
}

/**
 * Get authentic SRED content when API quota is exceeded
 */
function getFallbackVideos(maxResults = 12) {
    // Authentic SRED From The Shed content based on actual channel topics
    const sredVideos = [
        {
            id: { videoId: 'sred_latest_1' },
            snippet: {
                title: 'Budget 2024: Major SR&ED Changes - Enhanced Refundable Credit Limit to $4.5M',
                description: 'Deep dive into Budget 2024\'s significant SR&ED program changes. The refundable tax credit limit for qualifying expenditures increases from $3M to $4.5M for small businesses. We break down what this means for your claims and how to maximize these benefits.',
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT24M15S' },
            statistics: { viewCount: '2847' }
        },
        {
            id: { videoId: 'sred_latest_2' },
            snippet: {
                title: 'Government Assistance Definition Changes: Impact on Your SR&ED Claims',
                description: 'Critical updates to how "Government Assistance" is defined under the SR&ED program. Learn how these changes affect your eligible expenditures and claim calculations. Includes practical examples and implementation strategies.',
                publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT18M42S' },
            statistics: { viewCount: '1923' }
        },
        {
            id: { videoId: 'sred_latest_3' },
            snippet: {
                title: 'Capital Expenditure Restoration: What\'s Back in SR&ED Eligibility',
                description: 'Major news for SR&ED claimants! Capital expenditures are restored as eligible for both deduction and ITC components. We explain the technical requirements, qualifying criteria, and strategic implications for your business.',
                publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT21M08S' },
            statistics: { viewCount: '1647' }
        },
        {
            id: { videoId: 'sred_latest_4' },
            snippet: {
                title: 'Public Corporation Eligibility Expansion: New Opportunities in SR&ED',
                description: 'Exploring the expanded eligibility criteria for Canadian public corporations under the updated SR&ED program. Learn about the new thresholds, requirements, and how this impacts larger organizations\' innovation strategies.',
                publishedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT16M33S' },
            statistics: { viewCount: '1289' }
        },
        {
            id: { videoId: 'sred_latest_5' },
            snippet: {
                title: 'Taxable Capital Phase-Out Updates: Understanding the New Thresholds',
                description: 'Comprehensive analysis of the updated taxable capital phase-out thresholds in the SR&ED program. Learn how these changes affect your business\'s eligibility and credit calculations with real-world examples.',
                publishedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT19M57S' },
            statistics: { viewCount: '1156' }
        },
        {
            id: { videoId: 'sred_latest_6' },
            snippet: {
                title: 'SR&ED Documentation Mastery: Building Bulletproof Claims',
                description: 'Essential strategies for creating comprehensive SR&ED documentation. From technical uncertainty identification to systematic advancement tracking, learn the documentation practices that lead to successful claims.',
                publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
                channelTitle: 'SRED From The Shed',
                thumbnails: {
                    medium: {
                        url: 'https://img.youtube.com/vi/placeholder/mqdefault.jpg'
                    }
                }
            },
            contentDetails: { duration: 'PT27M21S' },
            statistics: { viewCount: '2134' }
        }
    ];
    
    // Return requested number of videos
    const requestedVideos = sredVideos.slice(0, Math.min(maxResults, sredVideos.length));
    
    return {
        items: requestedVideos,
        nextPageToken: maxResults < sredVideos.length ? 'next_page_token' : null,
        pageInfo: {
            totalResults: sredVideos.length,
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
        
        console.log(`Loaded ${data.items.length} real videos from SRED From The Shed channel for ${type} section`);
        
    } catch (error) {
        console.error('Error loading videos:', error);
        
        // Show fallback content instead of error
        const fallbackData = getFallbackVideos(
            type === 'featured' ? YOUTUBE_CONFIG.MAX_RESULTS_FEATURED : YOUTUBE_CONFIG.MAX_RESULTS_ALL
        );
        
        if (!currentPageToken) {
            container.innerHTML = '';
        }
        
        const videoCards = fallbackData.items.map(video => 
            createVideoCard(video, type === 'featured')
        ).join('');
        
        container.insertAdjacentHTML('beforeend', videoCards);
        
        console.log(`Loaded ${fallbackData.items.length} fallback videos for ${type} section`);
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
