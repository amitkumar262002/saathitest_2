// Force Mobile Controls Positioning - Ultimate Fix
console.log('🔧 Force Mobile Controls loaded');

class ForceMobileControls {
    constructor() {
        this.forceInterval = null;
        this.init();
    }
    
    init() {
        console.log('💪 Forcing mobile controls positioning...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startForcing());
        } else {
            this.startForcing();
        }
    }
    
    startForcing() {
        // Force positioning immediately
        this.forceControlsPosition();
        
        // Keep forcing every 2 seconds to override any other scripts (reduced frequency)
        this.forceInterval = setInterval(() => {
            this.forceControlsPosition();
        }, 2000);
        
        // Also force on various events
        window.addEventListener('resize', () => this.forceControlsPosition());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.forceControlsPosition(), 100);
        });
        
        // Force when video chat starts
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('premium-chat-btn') || 
                e.target.closest('.premium-chat-btn')) {
                setTimeout(() => this.forceControlsPosition(), 1000);
            }
        });
        
        console.log('✅ Mobile controls forcing started');
    }
    
    forceControlsPosition() {
        const controls = document.querySelector('.video-controls') || 
                        document.querySelector('.control-group.video-controls') ||
                        document.querySelector('div[class*="video-controls"]');
        
        if (controls) {
            // Remove any conflicting classes
            controls.classList.remove('bottom-controls', 'fixed-bottom');
            
            // Add our mobile class
            controls.classList.add('mobile-enhanced', 'force-positioned');
            
            // Force CSS properties directly
            const forcedStyles = {
                'position': 'fixed',
                'bottom': '100px',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'z-index': '99999',
                'display': 'flex',
                'background': 'rgba(0, 0, 0, 0.9)',
                'border-radius': '50px',
                'padding': '15px 25px',
                'gap': '12px',
                'box-shadow': '0 10px 40px rgba(0, 0, 0, 0.6)',
                'backdrop-filter': 'blur(20px)',
                'border': '2px solid rgba(255, 255, 255, 0.2)',
                'max-width': '90vw',
                'width': 'auto',
                'height': 'auto',
                'margin': '0',
                'top': 'auto',
                'right': 'auto'
            };
            
            // Apply each style with !important
            Object.entries(forcedStyles).forEach(([property, value]) => {
                controls.style.setProperty(property, value, 'important');
            });
            
            // Force button styles too
            const buttons = controls.querySelectorAll('.video-control-btn, button');
            buttons.forEach(button => {
                button.style.setProperty('flex-shrink', '0', 'important');
                button.style.setProperty('min-width', '44px', 'important');
                button.style.setProperty('min-height', '44px', 'important');
                button.style.setProperty('border-radius', '50%', 'important');
                button.style.setProperty('background', 'rgba(255, 255, 255, 0.15)', 'important');
                button.style.setProperty('border', 'none', 'important');
                button.style.setProperty('color', 'white', 'important');
            });
            
            console.log('🎯 Controls positioned at bottom: 100px');
        }
        
        // Also check for any other video control elements
        const allControls = document.querySelectorAll('[class*="video-control"], [class*="control-group"]');
        allControls.forEach(control => {
            if (control.innerHTML.includes('video-control-btn') || 
                control.innerHTML.includes('countryBtn') ||
                control.innerHTML.includes('genderBtn')) {
                
                control.style.setProperty('position', 'fixed', 'important');
                control.style.setProperty('bottom', '100px', 'important');
                control.style.setProperty('left', '50%', 'important');
                control.style.setProperty('transform', 'translateX(-50%)', 'important');
                control.style.setProperty('z-index', '99999', 'important');
            }
        });
    }
    
    // Method to manually trigger positioning
    forceNow() {
        this.forceControlsPosition();
        console.log('🔧 Manual force applied');
    }
}

// Create global instance
window.forceMobileControls = new ForceMobileControls();

// Add manual trigger function
window.fixMobileControls = () => {
    if (window.forceMobileControls) {
        window.forceMobileControls.forceNow();
    }
};

// Also add CSS override directly via JavaScript
const ultimateCSS = `
    /* ULTIMATE MOBILE CONTROLS OVERRIDE */
    .video-controls,
    .control-group.video-controls,
    div.control-group.video-controls,
    .video-controls.mobile-enhanced,
    .force-positioned {
        position: fixed !important;
        bottom: 100px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 99999 !important;
        display: flex !important;
        background: rgba(0, 0, 0, 0.9) !important;
        border-radius: 50px !important;
        padding: 15px 25px !important;
        gap: 12px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(20px) !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
        max-width: 90vw !important;
        width: auto !important;
        height: auto !important;
        margin: 0 !important;
        top: auto !important;
        right: auto !important;
    }
    
    @media (max-width: 768px) {
        .video-controls,
        .control-group.video-controls {
            bottom: 80px !important;
            padding: 12px 20px !important;
        }
    }
    
    @media (max-width: 480px) {
        .video-controls,
        .control-group.video-controls {
            bottom: 70px !important;
            padding: 10px 15px !important;
            gap: 8px !important;
        }
    }
    
    /* Force button styles */
    .video-control-btn {
        flex-shrink: 0 !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.15) !important;
        border: none !important;
        color: white !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
`;

// Inject CSS with highest priority
const ultimateStyleSheet = document.createElement('style');
ultimateStyleSheet.textContent = ultimateCSS;
ultimateStyleSheet.id = 'ultimate-mobile-controls';
document.head.appendChild(ultimateStyleSheet);

console.log('💪 Force Mobile Controls ready - controls will be positioned at bottom: 100px');
