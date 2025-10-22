// Mobile Video Controls Fix - Enhanced touch handling and positioning
console.log('📱 Mobile Controls Fix loaded');

class MobileControlsManager {
    constructor() {
        this.isTouch = 'ontouchstart' in window;
        this.controlsVisible = true;
        this.hideTimeout = null;
        
        this.init();
    }
    
    init() {
        console.log('📱 Initializing Mobile Controls Manager');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMobileControls());
        } else {
            this.setupMobileControls();
        }
    }
    
    setupMobileControls() {
        // Add mobile-specific classes
        this.addMobileClasses();
        
        // Setup touch handlers
        this.setupTouchHandlers();
        
        // Setup auto-hide functionality
        this.setupAutoHide();
        
        // Fix button positioning
        this.fixButtonPositioning();
        
        // Handle orientation changes
        this.handleOrientationChange();
        
        console.log('✅ Mobile controls setup complete');
    }
    
    addMobileClasses() {
        const controls = document.querySelector('.video-controls');
        if (controls) {
            controls.classList.add('mobile-enhanced');
            
            // Add mobile class to body for CSS targeting
            if (this.isMobile()) {
                document.body.classList.add('mobile-device');
            }
        }
    }
    
    setupTouchHandlers() {
        const controlButtons = document.querySelectorAll('.video-control-btn');
        
        controlButtons.forEach(button => {
            // Enhanced touch feedback
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('touching');
                this.addRippleEffect(button, e);
            }, { passive: false });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('touching');
                
                // Trigger the actual click after a short delay
                setTimeout(() => {
                    const clickEvent = new Event('click', { bubbles: true });
                    button.dispatchEvent(clickEvent);
                }, 50);
            }, { passive: false });
            
            button.addEventListener('touchcancel', () => {
                button.classList.remove('touching');
            });
        });
    }
    
    addRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Get touch position
        const touch = event.touches[0];
        const x = touch.clientX - rect.left - size / 2;
        const y = touch.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    setupAutoHide() {
        const videoContainer = document.querySelector('.video-chat-container');
        const controls = document.querySelector('.video-controls');
        
        if (!videoContainer || !controls) return;
        
        // Show controls on interaction
        const showControls = () => {
            controls.classList.remove('hidden');
            this.controlsVisible = true;
            
            // Clear existing timeout
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
            }
            
            // Hide after 5 seconds of inactivity
            this.hideTimeout = setTimeout(() => {
                if (this.controlsVisible) {
                    controls.classList.add('auto-hidden');
                    this.controlsVisible = false;
                }
            }, 5000);
        };
        
        // Touch/click events to show controls
        videoContainer.addEventListener('touchstart', showControls);
        videoContainer.addEventListener('click', showControls);
        
        // Keep controls visible when interacting with them
        controls.addEventListener('touchstart', () => {
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
            }
        });
        
        // Initial show
        showControls();
    }
    
    fixButtonPositioning() {
        const controls = document.querySelector('.video-controls');
        if (!controls) return;
        
        // Ensure controls are properly positioned
        const updatePosition = () => {
            const viewportHeight = window.innerHeight;
            const safeAreaBottom = this.getSafeAreaBottom();
            
            // Calculate optimal bottom position
            let bottomPosition = 60; // Default
            
            if (viewportHeight < 600) {
                bottomPosition = 40;
            } else if (viewportHeight < 500) {
                bottomPosition = 30;
            }
            
            // Add safe area padding
            bottomPosition += safeAreaBottom;
            
            controls.style.bottom = `${bottomPosition}px`;
        };
        
        // Update on resize and orientation change
        window.addEventListener('resize', updatePosition);
        window.addEventListener('orientationchange', () => {
            setTimeout(updatePosition, 100);
        });
        
        // Initial update
        updatePosition();
    }
    
    getSafeAreaBottom() {
        // Try to get safe area inset
        const safeAreaBottom = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-bottom');
        
        if (safeAreaBottom) {
            return parseInt(safeAreaBottom) || 0;
        }
        
        // Fallback for devices with home indicator
        if (this.hasHomeIndicator()) {
            return 20;
        }
        
        return 0;
    }
    
    hasHomeIndicator() {
        // Detect iPhone X and similar devices
        const isIPhoneX = /iPhone/.test(navigator.userAgent) && 
                         window.screen.height >= 812 && 
                         window.screen.width >= 375;
        
        return isIPhoneX;
    }
    
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustForOrientation();
            }, 200);
        });
    }
    
    adjustForOrientation() {
        const controls = document.querySelector('.video-controls');
        if (!controls) return;
        
        const isLandscape = window.innerHeight < window.innerWidth;
        
        if (isLandscape && window.innerHeight < 500) {
            // Landscape mode on small screens
            controls.classList.add('landscape-mode');
        } else {
            controls.classList.remove('landscape-mode');
        }
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
}

// Add CSS for ripple animation
const rippleCSS = `
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .video-control-btn.touching {
        transform: scale(0.95) !important;
        background: rgba(255, 255, 255, 0.3) !important;
    }
    
    .video-controls.auto-hidden {
        opacity: 0.3 !important;
        transform: translateX(-50%) translateY(20px) !important;
        pointer-events: none !important;
    }
    
    .video-controls.landscape-mode {
        bottom: 15px !important;
        padding: 4px 8px !important;
        gap: 4px !important;
    }
    
    .video-controls.landscape-mode .video-control-btn {
        width: 32px !important;
        height: 32px !important;
        font-size: 12px !important;
    }
    
    .mobile-device .video-controls {
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
    }
    
    /* Safe area support */
    @supports (padding: max(0px)) {
        .video-controls {
            bottom: max(60px, calc(60px + env(safe-area-inset-bottom))) !important;
        }
    }
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = rippleCSS;
document.head.appendChild(styleSheet);

// Initialize Mobile Controls Manager
document.addEventListener('DOMContentLoaded', () => {
    window.mobileControlsManager = new MobileControlsManager();
});

// Export for global access
window.MobileControlsManager = MobileControlsManager;

console.log('📱 Mobile Controls Fix ready');
