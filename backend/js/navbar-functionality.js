// Enhanced Navbar Functionality with Dark Mode

class NavbarManager {
    constructor() {
        this.isMenuOpen = false;
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        console.log('🧭 Initializing Enhanced Navbar...');
        
        // Setup mobile menu toggle
        this.setupMobileMenu();
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        // Load saved theme
        this.loadSavedTheme();
        
        // Setup responsive handlers
        this.setupResponsiveHandlers();
        
        console.log('✅ Enhanced Navbar initialized');
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking on links
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            this.isMenuOpen = !this.isMenuOpen;
            
            navToggle.classList.toggle('active', this.isMenuOpen);
            navMenu.classList.toggle('active', this.isMenuOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
            
            // Add animation class
            navMenu.style.transition = 'left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            console.log(`📱 Mobile menu ${this.isMenuOpen ? 'opened' : 'closed'}`);
        }
    }

    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.isMenuOpen = false;
            
            const navToggle = document.getElementById('navToggle');
            const navMenu = document.getElementById('navMenu');
            
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Global function for onclick - disabled to prevent conflicts
        // window.toggleTheme = () => this.toggleTheme();
    }

    toggleTheme() {
        const themeToggle = document.getElementById('themeToggle');
        
        // Add loading animation
        if (themeToggle) {
            themeToggle.classList.add('loading');
        }
        
        // Toggle theme
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply theme
        this.applyTheme(this.currentTheme);
        
        // Save theme preference
        this.saveTheme(this.currentTheme);
        
        // Remove loading animation
        setTimeout(() => {
            if (themeToggle) {
                themeToggle.classList.remove('loading');
            }
        }, 500);
        
        console.log(`🌓 Theme switched to ${this.currentTheme} mode`);
        
        // Show notification
        this.showThemeNotification(this.currentTheme);
    }

    applyTheme(theme) {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        // Set theme attribute
        body.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
            }
        }
        
        // Update meta theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a2e' : '#FF6B35';
        }
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme }
        }));
    }

    loadSavedTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('saathi_theme');
        
        // Check for system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Determine initial theme
        let initialTheme = 'light';
        
        if (savedTheme) {
            initialTheme = savedTheme;
        } else if (systemPrefersDark) {
            initialTheme = 'dark';
        }
        
        this.currentTheme = initialTheme;
        this.applyTheme(initialTheme);
        
        console.log(`🎨 Loaded ${initialTheme} theme`);
    }

    saveTheme(theme) {
        localStorage.setItem('saathi_theme', theme);
    }

    setupResponsiveHandlers() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    handleResize() {
        const windowWidth = window.innerWidth;
        
        // Close mobile menu on desktop
        if (windowWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Adjust navbar height for mobile browsers
        if (windowWidth <= 768) {
            this.adjustMobileNavbar();
        }
    }

    adjustMobileNavbar() {
        const navbar = document.querySelector('.navbar');
        const navMenu = document.getElementById('navMenu');
        
        if (navbar && navMenu) {
            // Get actual navbar height
            const navbarHeight = navbar.offsetHeight;
            
            // Update menu position
            navMenu.style.top = `${navbarHeight}px`;
            navMenu.style.height = `calc(100vh - ${navbarHeight}px)`;
        }
    }

    showThemeNotification(theme) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${theme === 'dark' ? 'moon' : 'sun'}"></i>
                <span>${theme === 'dark' ? 'Dark' : 'Light'} mode activated</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    // Public methods for external use
    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme(theme);
        }
    }

    isMobileMenuOpen() {
        return this.isMenuOpen;
    }
}

// Enhanced CSS for theme notifications
const navbarEnhancedCSS = `
    .theme-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 10002;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .theme-notification.show {
        transform: translateX(0);
    }

    .theme-notification.hide {
        transform: translateX(100%);
        opacity: 0;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
    }

    .notification-content i {
        font-size: 16px;
        color: #FFD700;
    }

    [data-theme="dark"] .theme-notification {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border-color: rgba(0, 0, 0, 0.2);
    }

    /* Enhanced mobile menu animations */
    .nav-menu {
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .nav-menu.active {
        animation: slideInFromLeft 0.3s ease-out;
    }

    @keyframes slideInFromLeft {
        from {
            left: -100%;
            opacity: 0;
        }
        to {
            left: 0;
            opacity: 1;
        }
    }

    /* Enhanced nav toggle animation */
    .nav-toggle {
        transition: all 0.3s ease;
    }

    .nav-toggle:hover {
        transform: scale(1.05);
    }

    .nav-toggle.active {
        transform: scale(1.1);
    }

    /* Smooth scrolling for mobile menu */
    .nav-menu {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    /* Mobile menu backdrop */
    .nav-menu.active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Mobile optimizations */
    @media (max-width: 480px) {
        .theme-notification {
            top: 65px;
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
        }

        .theme-notification.show {
            transform: translateY(0);
        }

        .theme-notification.hide {
            transform: translateY(-100%);
        }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        .nav-menu,
        .theme-notification,
        .nav-toggle {
            transition: none !important;
            animation: none !important;
        }
    }

    /* Focus indicators */
    .nav-link:focus {
        outline: 2px solid var(--accent-color);
        outline-offset: 2px;
        border-radius: 4px;
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .theme-toggle,
        .nav-toggle {
            border: 2px solid currentColor;
        }
    }
`;

// Apply enhanced CSS
const navbarStyleElement = document.createElement('style');
navbarStyleElement.textContent = navbarEnhancedCSS;
document.head.appendChild(navbarStyleElement);

// Initialize navbar manager
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
    console.log('🧭 Navbar Manager loaded');
});

// Export for global use
window.NavbarManager = NavbarManager;
