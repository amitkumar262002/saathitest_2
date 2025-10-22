// URL Encryption System for Saathi TV

class URLEncryption {
    constructor() {
        this.key = 'SaathiTV2024SecureKey';
        this.routes = new Map();
        this.encryptedRoutes = new Map();
        
        this.init();
    }

    init() {
        this.setupRoutes();
        this.interceptNavigation();
        this.handleCurrentURL();
        console.log('🔐 URL Encryption initialized');
    }

    setupRoutes() {
        // Define all routes and their encrypted versions
        const routes = {
            'index.html': this.generateEncryptedPath('home'),
            'login.html': this.generateEncryptedPath('auth'),
            'splash.html': this.generateEncryptedPath('intro'),
            'test.html': this.generateEncryptedPath('debug'),
            'blocked.html': this.generateEncryptedPath('restricted'),
            'pages/free-video-chat.html': this.generateEncryptedPath('feature-video'),
            'pages/global-community.html': this.generateEncryptedPath('feature-community'),
            'pages/mobile-friendly.html': this.generateEncryptedPath('feature-mobile'),
            'pages/privacy-policy.html': this.generateEncryptedPath('legal-privacy'),
            'pages/terms-of-service.html': this.generateEncryptedPath('legal-terms'),
            'pages/contact.html': this.generateEncryptedPath('support-contact'),
            'pages/support.html': this.generateEncryptedPath('support-help')
        };

        // Store bidirectional mapping
        for (const [original, encrypted] of Object.entries(routes)) {
            this.routes.set(original, encrypted);
            this.encryptedRoutes.set(encrypted, original);
        }
    }

    generateEncryptedPath(identifier) {
        // Create a unique encrypted path based on identifier
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        const hash = this.simpleHash(identifier + this.key);
        
        return `${hash.substring(0, 8)}${timestamp}${random}`.toLowerCase();
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    encrypt(originalPath) {
        // Remove leading slash and query parameters
        const cleanPath = originalPath.replace(/^\//, '').split('?')[0];
        const encryptedPath = this.routes.get(cleanPath);
        
        if (encryptedPath) {
            // Add query parameters to make it look more complex
            const params = this.generateFakeParams();
            return `/${encryptedPath}?${params}`;
        }
        
        return originalPath; // Return original if not found
    }

    decrypt(encryptedPath) {
        // Extract the encrypted part from URL
        const cleanPath = encryptedPath.replace(/^\//, '').split('?')[0];
        const originalPath = this.encryptedRoutes.get(cleanPath);
        
        return originalPath || encryptedPath;
    }

    generateFakeParams() {
        const params = [];
        const paramNames = ['session', 'token', 'ref', 'utm', 'id', 'key', 'auth'];
        const numParams = Math.floor(Math.random() * 3) + 2; // 2-4 parameters
        
        for (let i = 0; i < numParams; i++) {
            const name = paramNames[Math.floor(Math.random() * paramNames.length)];
            const value = Math.random().toString(36).substring(2, 10);
            params.push(`${name}=${value}`);
        }
        
        return params.join('&');
    }

    interceptNavigation() {
        // Intercept all navigation attempts
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = (state, title, url) => {
            const encryptedUrl = this.encrypt(url);
            return originalPushState.call(history, state, title, encryptedUrl);
        };
        
        history.replaceState = (state, title, url) => {
            const encryptedUrl = this.encrypt(url);
            return originalReplaceState.call(history, state, title, encryptedUrl);
        };

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('http') && !link.href.includes('mailto:') && !link.href.includes('tel:')) {
                e.preventDefault();
                this.navigateTo(link.getAttribute('href'));
            }
        });

        // Intercept form submissions that redirect
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const action = form.getAttribute('action');
            if (action && !action.startsWith('http')) {
                e.preventDefault();
                // Handle form submission with encrypted redirect
                this.handleFormSubmission(form);
            }
        });
    }

    navigateTo(path) {
        const encryptedPath = this.encrypt(path);
        window.location.href = encryptedPath;
    }

    handleFormSubmission(form) {
        // Get form data
        const formData = new FormData(form);
        const action = form.getAttribute('action') || 'index.html';
        
        // Process form (you can add actual form handling here)
        console.log('Form submitted:', Object.fromEntries(formData));
        
        // Redirect to encrypted URL
        setTimeout(() => {
            this.navigateTo(action);
        }, 1000);
    }

    handleCurrentURL() {
        // Check if current URL is encrypted and needs decryption
        const currentPath = window.location.pathname + window.location.search;
        const pathWithoutQuery = window.location.pathname.replace(/^\//, '').split('?')[0];
        
        if (this.encryptedRoutes.has(pathWithoutQuery)) {
            // URL is encrypted, get the real file
            const realPath = this.encryptedRoutes.get(pathWithoutQuery);
            
            // Load the actual content without changing URL
            this.loadEncryptedContent(realPath);
        }
    }

    async loadEncryptedContent(realPath) {
        try {
            // Fetch the real content
            const response = await fetch(realPath);
            if (response.ok) {
                const content = await response.text();
                
                // Replace current document content
                document.open();
                document.write(content);
                document.close();
                
                // Re-initialize scripts
                this.reinitializeScripts();
            } else {
                console.error('Failed to load encrypted content:', realPath);
            }
        } catch (error) {
            console.error('Error loading encrypted content:', error);
        }
    }

    reinitializeScripts() {
        // Re-run scripts after content replacement
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = script.async;
            newScript.defer = script.defer;
            document.head.appendChild(newScript);
        });
    }

    // Public methods for manual encryption/decryption
    encryptURL(url) {
        return this.encrypt(url);
    }

    decryptURL(url) {
        return this.decrypt(url);
    }

    // Method to update URL without page reload
    updateURL(newPath) {
        const encryptedPath = this.encrypt(newPath);
        history.pushState({}, '', encryptedPath);
    }

    // Method to get current real path
    getCurrentRealPath() {
        const currentEncrypted = window.location.pathname.replace(/^\//, '').split('?')[0];
        return this.encryptedRoutes.get(currentEncrypted) || window.location.pathname;
    }
}

// Enhanced navigation functions
function navigateToEncrypted(path) {
    if (window.urlEncryption) {
        window.urlEncryption.navigateTo(path);
    } else {
        window.location.href = path;
    }
}

// Override window.location.href for automatic encryption
const originalLocationHref = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
if (originalLocationHref && originalLocationHref.get) {
    Object.defineProperty(Location.prototype, 'href', {
        get: originalLocationHref.get,
        set: function(value) {
            if (window.urlEncryption && !value.startsWith('http') && !value.includes('mailto:') && !value.includes('tel:')) {
                const encrypted = window.urlEncryption.encrypt(value);
                originalLocationHref.set.call(this, encrypted);
            } else {
                originalLocationHref.set.call(this, value);
            }
        }
    });
}

// Initialize URL encryption when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.urlEncryption = new URLEncryption();
});

// Add hover effects to all interactive elements
function addHoverEffects() {
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced Hover Effects */
        .feature-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .feature-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .nav-link {
            position: relative;
            transition: all 0.3s ease;
        }
        
        .nav-link:hover {
            color: #FF6B35;
            transform: translateY(-2px);
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -5px;
            left: 50%;
            background: #FF6B35;
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .start-btn {
            position: relative;
            overflow: hidden;
        }
        
        .start-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .start-btn:hover::before {
            left: 100%;
        }
        
        .control-btn {
            transition: all 0.3s ease;
        }
        
        .control-btn:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .logo-circle-small:hover,
        .logo-circle-medium:hover,
        .logo-circle-large:hover {
            transform: scale(1.1) rotate(360deg);
            transition: all 0.8s ease;
        }
        
        .download-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
        }
        
        .social-link:hover {
            transform: translateY(-2px) scale(1.1);
            background: rgba(255, 107, 53, 0.3);
        }
        
        .rule-card:hover,
        .detail-card:hover,
        .step:hover {
            transform: translateY(-5px) rotateX(5deg);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        /* Animated background for buttons */
        .cta-btn,
        .submit-btn,
        .support-btn {
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Ripple effect for buttons */
        .ripple {
            position: relative;
            overflow: hidden;
        }
        
        .ripple::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .ripple:active::after {
            width: 300px;
            height: 300px;
        }
        
        /* Glowing text effect */
        .glow-text {
            animation: textGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes textGlow {
            from { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
            to { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.6); }
        }
        
        /* Floating animation for cards */
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        /* Pulse effect for important elements */
        .pulse-effect {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
        }
        
        /* Shake animation for errors */
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Zoom effect for images */
        img:hover {
            transform: scale(1.05);
            transition: transform 0.3s ease;
        }
        
        /* Tilt effect for cards */
        .tilt-effect:hover {
            transform: perspective(1000px) rotateX(10deg) rotateY(10deg);
            transition: transform 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
    
    // Add ripple effect to buttons
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.classList.add('ripple');
    });
    
    // Add float animation to feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('float-animation');
        }, index * 200);
    });
    
    // Add glow effect to titles
    document.querySelectorAll('h1, .hero-title').forEach(title => {
        title.classList.add('glow-text');
    });
    
    // Add tilt effect to cards
    document.querySelectorAll('.detail-card, .rule-card, .benefit').forEach(card => {
        card.classList.add('tilt-effect');
    });
}

// Initialize hover effects when DOM is loaded
document.addEventListener('DOMContentLoaded', addHoverEffects);

// Export for global use
window.navigateToEncrypted = navigateToEncrypted;
window.addHoverEffects = addHoverEffects;
