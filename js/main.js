/**
 * Main JavaScript file for SR&ED From The Shed website
 * Handles general functionality and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('SR&ED From The Shed website loaded');
    
    // Initialize page-specific functionality
    initializeNavigation();
    initializeModals();
    initializeVideoLoading();
    
    // Add smooth scrolling for anchor links
    initializeSmoothScrolling();
});

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    // Add active class to current page nav item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Handle mobile menu collapse
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close mobile menu when clicking on nav links
        const mobileNavLinks = navbarCollapse.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            });
        });
    }
}

/**
 * Initialize modal functionality
 */
function initializeModals() {
    // Substack modal functionality
    const substackModal = document.getElementById('substackModal');
    if (substackModal) {
        substackModal.addEventListener('shown.bs.modal', function() {
            console.log('Substack subscription modal opened');
        });
    }
    
    // Handle subscribe button clicks
    const subscribeButtons = document.querySelectorAll('[data-bs-target="#substackModal"]');
    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Subscribe button clicked');
        });
    });
}

/**
 * Initialize video loading functionality
 */
function initializeVideoLoading() {
    // Only load videos on pages that need them
    const featuredVideosContainer = document.getElementById('featured-videos');
    const allVideosContainer = document.getElementById('all-videos');
    
    if (featuredVideosContainer || allVideosContainer) {
        // Check if YouTube API is available
        if (typeof loadYouTubeVideos === 'function') {
            console.log('Loading YouTube videos...');
            
            if (featuredVideosContainer) {
                loadYouTubeVideos('featured');
            }
            
            if (allVideosContainer) {
                loadYouTubeVideos('all');
            }
        } else {
            console.warn('YouTube API not available, showing fallback content');
            showVideoLoadError(featuredVideosContainer || allVideosContainer);
        }
    }
}

/**
 * Show error message when videos fail to load
 */
function showVideoLoadError(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-warning text-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Videos temporarily unavailable</strong>
                <p class="mb-2">We're having trouble loading our latest videos. Please try again later or visit our YouTube channel directly.</p>
                <a href="https://youtube.com/@sredfromtheshed2727" target="_blank" class="btn btn-outline-warning">
                    <i class="fab fa-youtube me-2"></i>Visit YouTube Channel
                </a>
            </div>
        </div>
    `;
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or bootstrap modal/collapse triggers
            if (href === '#' || this.hasAttribute('data-bs-toggle')) {
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility function to format dates
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Utility function to format video duration
 */
function formatDuration(duration) {
    // Parse ISO 8601 duration format (PT1H2M10S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) return '';
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Utility function to truncate text
 */
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substr(0, lastSpace) + '...';
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', function() {
    // Update any responsive elements if needed
    console.log('Window resized to:', window.innerWidth);
});

/**
 * Handle scroll events for navbar styling
 */
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

/**
 * Add loading animation for better UX
 */
function showLoadingSpinner(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading content...</p>
        </div>
    `;
}

/**
 * Remove loading animation
 */
function hideLoadingSpinner(container) {
    if (!container) return;
    
    const spinner = container.querySelector('.spinner-border');
    if (spinner) {
        spinner.parentElement.remove();
    }
}

// Export functions for use in other scripts
window.SREDWebsite = {
    formatDate,
    formatDuration,
    truncateText,
    showLoadingSpinner,
    hideLoadingSpinner,
    showVideoLoadError
};
