// Secure Login System for Saathi TV

class SecureLoginSystem {
    constructor() {
        this.isInitialized = false;
        this.users = new Map(); // In-memory user storage (use database in production)
        this.currentUser = null;
        this.securityFeatures = {
            encryption: true,
            twoFactor: false,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxLoginAttempts: 5
        };
        
        this.init();
    }

    init() {
        console.log('🔐 Initializing Secure Login System...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check existing session
        this.checkExistingSession();
        
        // Initialize security features
        this.initializeSecurity();
        
        this.isInitialized = true;
        console.log('✅ Secure Login System initialized');
    }

    setupEventListeners() {
        // Social login buttons
        window.loginWithFacebook = () => this.socialLogin('facebook');
        window.loginWithGoogle = () => this.socialLogin('google');
        window.loginWithVK = () => this.socialLogin('vk');
        
        // Modal functions
        window.showEmailLogin = () => this.showEmailLoginModal();
        window.closeEmailLogin = () => this.closeModal('emailLoginModal');
        window.showSignupModal = () => this.showSignupModal();
        window.closeSignupModal = () => this.closeModal('signupModal');
        
        // Form handlers
        window.handleEmailLogin = (event) => this.handleEmailLogin(event);
        window.handleSignup = (event) => this.handleSignup(event);
        
        // Utility functions
        window.togglePassword = (inputId) => this.togglePasswordVisibility(inputId);
        window.showTerms = () => this.showTermsModal();
        window.showPrivacy = () => this.showPrivacyModal();
        window.showForgotPassword = () => this.showForgotPasswordModal();
        
        // Age confirmation
        this.setupAgeConfirmation();
        
        // Security monitoring
        this.setupSecurityMonitoring();
    }

    checkExistingSession() {
        const savedSession = localStorage.getItem('saathiTV_secure_session');
        const sessionData = sessionStorage.getItem('saathiTV_current_session');
        
        if (savedSession || sessionData) {
            try {
                const session = JSON.parse(savedSession || sessionData);
                if (this.isValidSession(session)) {
                    this.currentUser = session.user;
                    this.redirectToApp();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.error('Session validation error:', error);
                this.clearSession();
            }
        }
    }

    isValidSession(session) {
        if (!session || !session.user || !session.timestamp) return false;
        
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        
        return sessionAge < this.securityFeatures.sessionTimeout;
    }

    // Social Login Methods
    async socialLogin(provider) {
        console.log(`🔐 Initiating ${provider} login...`);
        
        // Check age confirmation
        const ageConfirmed = this.checkAgeConfirmation();
        console.log('🔐 Age confirmation status:', ageConfirmed);
        
        if (!ageConfirmed) {
            this.showError('Please confirm that you are at least 18 years old.');
            return;
        }
        
        this.showLoadingState(provider);
        
        try {
            // Real OAuth flow
            const result = await this.realOAuthFlow(provider);
            
            if (result.success) {
                await this.completeLogin(result.user, provider);
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
            
        } catch (error) {
            console.error(`${provider} login error:`, error);
            this.showError(`Failed to login with ${provider}. Please try again.`);
        } finally {
            this.hideLoadingState();
        }
    }

    async realOAuthFlow(provider) {
        // Mock OAuth implementation for demo purposes
        // In production, replace with real OAuth client IDs and proper implementation
        
        console.log(`🔐 Mock OAuth flow for ${provider}...`);
        
        return new Promise((resolve, reject) => {
            // Simulate OAuth flow with a confirmation dialog
            const confirmed = confirm(`Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}?\n\nThis is a demo login - click OK to proceed.`);
            
            if (confirmed) {
                // Simulate network delay
                setTimeout(() => {
                    // Generate mock user data based on provider
                    const mockUsers = {
                        facebook: {
                            success: true,
                            user: {
                                id: 'fb_' + Date.now(),
                                name: 'Facebook User',
                                email: 'facebook.user@example.com',
                                avatar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>',
                                loginMethod: 'facebook',
                                verified: true,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                securityLevel: 'high'
                            }
                        },
                        google: {
                            success: true,
                            user: {
                                id: 'google_' + Date.now(),
                                name: 'Google User',
                                email: 'google.user@gmail.com',
                                avatar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>',
                                loginMethod: 'google',
                                verified: true,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                securityLevel: 'high'
                            }
                        },
                        vk: {
                            success: true,
                            user: {
                                id: 'vk_' + Date.now(),
                                name: 'VK User',
                                email: 'vk.user@vk.com',
                                avatar: '👤',
                                loginMethod: 'vk',
                                verified: true,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                securityLevel: 'medium'
                            }
                        }
                    };
                    
                    resolve(mockUsers[provider] || {
                        success: false,
                        error: 'Unsupported provider'
                    });
                }, 1500); // Simulate network delay
                
            } else {
                reject(new Error('Authentication cancelled by user'));
            }
        });
    }


    // Email Login
    async handleEmailLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('rememberMe');
        
        console.log('📧 Processing email login...');
        console.log('📧 Email:', email);
        console.log('📧 Password length:', password ? password.length : 0);
        console.log('📧 Remember me:', remember);
        
        this.showFormLoading(event.target);
        
        try {
            // Validate credentials
            const user = await this.validateEmailLogin(email, password);
            
            if (user) {
                await this.completeLogin(user, 'email', remember);
            } else {
                throw new Error('Invalid credentials');
            }
            
        } catch (error) {
            console.error('Email login error:', error);
            this.showError('Invalid email or password. Please try again.');
            this.recordFailedAttempt(email);
        } finally {
            this.hideFormLoading(event.target);
        }
    }

    async validateEmailLogin(email, password) {
        // Simulate server validation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // For demo purposes, accept any email with password length >= 6
                if (email && password && password.length >= 6) {
                    resolve({
                        id: this.generateSecureId(),
                        name: email.split('@')[0],
                        email: email,
                        avatar: '👤',
                        loginMethod: 'email',
                        verified: true,
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        securityLevel: 'medium'
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    }

    // Account Creation
    async handleSignup(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            country: formData.get('country')
        };
        
        console.log('👤 Creating new account...');
        
        // Validate form data
        if (!this.validateSignupData(userData)) {
            return;
        }
        
        this.showFormLoading(event.target);
        
        try {
            const user = await this.createAccount(userData);
            await this.completeLogin(user, 'signup');
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('Failed to create account. Please try again.');
        } finally {
            this.hideFormLoading(event.target);
        }
    }

    validateSignupData(data) {
        // Name validation
        if (!data.name || data.name.length < 2) {
            this.showError('Please enter a valid name (at least 2 characters).');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('Please enter a valid email address.');
            return false;
        }
        
        // Password validation
        if (data.password.length < 8) {
            this.showError('Password must be at least 8 characters long.');
            return false;
        }
        
        if (data.password !== data.confirmPassword) {
            this.showError('Passwords do not match.');
            return false;
        }
        
        // Country validation
        if (!data.country) {
            this.showError('Please select your country.');
            return false;
        }
        
        return true;
    }

    async createAccount(userData) {
        // Simulate account creation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if email already exists (simulate)
                if (this.users.has(userData.email)) {
                    reject(new Error('Email already registered'));
                    return;
                }
                
                const user = {
                    id: this.generateSecureId(),
                    name: userData.name,
                    email: userData.email,
                    country: userData.country,
                    avatar: '👤',
                    loginMethod: 'signup',
                    verified: false,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    securityLevel: 'medium'
                };
                
                // Store user (in production, this would be in a database)
                this.users.set(userData.email, {
                    ...user,
                    passwordHash: this.hashPassword(userData.password)
                });
                
                resolve(user);
            }, 2000);
        });
    }


    // Complete Login Process
    async completeLogin(user, method, remember = false) {
        console.log('✅ Login successful:', user.name);
        
        this.currentUser = user;
        
        // Create secure session
        const session = {
            user: user,
            timestamp: Date.now(),
            method: method,
            sessionId: this.generateSecureId(),
            securityToken: this.generateSecurityToken()
        };
        
        // Store session
        if (remember) {
            localStorage.setItem('saathiTV_secure_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('saathiTV_current_session', JSON.stringify(session));
        }
        
        // Log security event
        this.logSecurityEvent('login_success', {
            method: method,
            userId: user.id,
            timestamp: new Date().toISOString()
        });
        
        // Show success message
        this.showSuccess(`Welcome ${user.name}! Redirecting to video chat...`);
        
        // Update login status in parent window if available
        try {
            if (window.checkLoginStatus) {
                window.checkLoginStatus();
            }
        } catch (error) {
            console.log('Note: Parent window login status update not available');
        }
        
        // Redirect after delay
        setTimeout(() => {
            this.redirectToApp();
        }, 2000);
    }

    redirectToApp() {
        // Check if we came from a specific page
        const returnUrl = new URLSearchParams(window.location.search).get('return');
        
        if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
        } else {
            window.location.href = 'index.html#videoChat';
        }
    }

    // Modal Management
    showEmailLoginModal() {
        const modal = document.getElementById('emailLoginModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    showSignupModal() {
        this.closeModal('emailLoginModal');
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Utility Functions
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const toggle = input.parentElement.querySelector('.password-toggle i');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            toggle.className = 'fas fa-eye';
        }
    }

    checkAgeConfirmation() {
        const ageConfirm = document.getElementById('ageConfirm');
        return ageConfirm && ageConfirm.checked;
    }

    setupAgeConfirmation() {
        const ageConfirm = document.getElementById('ageConfirm');
        if (ageConfirm) {
            ageConfirm.addEventListener('change', (e) => {
                const socialBtns = document.querySelectorAll('.social-btn');
                socialBtns.forEach(btn => {
                    btn.disabled = !e.target.checked;
                    btn.style.opacity = e.target.checked ? '1' : '0.5';
                });
            });
            
            // Initial state
            ageConfirm.dispatchEvent(new Event('change'));
        }
    }

    // Security Features
    initializeSecurity() {
        // Setup CSRF protection
        this.setupCSRFProtection();
        
        // Setup session monitoring
        this.setupSessionMonitoring();
        
        // Setup security headers
        this.setupSecurityHeaders();
        
        console.log('🛡️ Security features initialized');
    }

    setupCSRFProtection() {
        // Generate CSRF token
        const csrfToken = this.generateSecurityToken();
        sessionStorage.setItem('csrf_token', csrfToken);
        
        // Add to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        });
    }

    setupSessionMonitoring() {
        // Monitor for session timeout
        setInterval(() => {
            if (this.currentUser) {
                const session = JSON.parse(
                    localStorage.getItem('saathiTV_secure_session') ||
                    sessionStorage.getItem('saathiTV_current_session') ||
                    '{}'
                );
                
                if (!this.isValidSession(session)) {
                    this.handleSessionTimeout();
                }
            }
        }, 60000); // Check every minute
    }

    setupSecurityHeaders() {
        // Add security meta tags
        const securityMetas = [
            { name: 'referrer', content: 'strict-origin-when-cross-origin' },
            { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
            { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
            { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
        ];
        
        securityMetas.forEach(meta => {
            const metaTag = document.createElement('meta');
            Object.keys(meta).forEach(key => {
                metaTag.setAttribute(key, meta[key]);
            });
            document.head.appendChild(metaTag);
        });
    }

    setupSecurityMonitoring() {
        // Monitor for suspicious activity
        let failedAttempts = 0;
        
        window.addEventListener('error', (event) => {
            this.logSecurityEvent('javascript_error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno
            });
        });
        
        // Monitor for multiple failed login attempts
        this.failedAttempts = new Map();
    }

    recordFailedAttempt(email) {
        const attempts = this.failedAttempts.get(email) || 0;
        this.failedAttempts.set(email, attempts + 1);
        
        if (attempts + 1 >= this.securityFeatures.maxLoginAttempts) {
            this.lockAccount(email);
        }
    }

    lockAccount(email) {
        console.warn('🚨 Account locked due to multiple failed attempts:', email);
        this.showError('Account temporarily locked due to multiple failed login attempts. Please try again later.');
        
        // Clear attempts after 15 minutes
        setTimeout(() => {
            this.failedAttempts.delete(email);
        }, 15 * 60 * 1000);
    }

    handleSessionTimeout() {
        console.warn('⏰ Session timeout detected');
        this.clearSession();
        this.showError('Your session has expired. Please login again.');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    clearSession() {
        localStorage.removeItem('saathiTV_secure_session');
        sessionStorage.removeItem('saathiTV_current_session');
        this.currentUser = null;
    }

    // Helper Functions
    generateSecureId() {
        return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSecurityToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    hashPassword(password) {
        // Simple hash for demo (use proper hashing in production)
        return btoa(password + 'saathi_salt_2024');
    }

    logSecurityEvent(event, data) {
        const logEntry = {
            event: event,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: 'client-side', // Would be server-side in production
            data: data
        };
        
        console.log('🔒 Security Event:', logEntry);
        
        // In production, send to security monitoring service
        // this.sendToSecurityService(logEntry);
    }

    // UI Helper Functions
    showLoadingState(provider) {
        const btn = document.querySelector(`.${provider}-btn`);
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Connecting...</span>`;
        }
    }

    hideLoadingState() {
        // Reset all social buttons
        const buttons = {
            facebook: '<i class="fab fa-facebook-f"></i> <span>Continue with FB</span>',
            google: '<i class="fab fa-google"></i> <span>Continue with Google</span>',
            vk: '<i class="fab fa-vk"></i> <span>Continue with VK ID</span>'
        };
        
        Object.keys(buttons).forEach(provider => {
            const btn = document.querySelector(`.${provider}-btn`);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = buttons[provider];
            }
        });
    }

    showFormLoading(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (btnText && btnLoader) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            submitBtn.disabled = true;
        }
    }

    hideFormLoading(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (btnText && btnLoader) {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `secure-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Modal content functions
    showTermsModal() {
        this.showInfoModal('Terms of Service', `
            <h4>Terms of Service</h4>
            <p>By using Saathi TV, you agree to:</p>
            <ul>
                <li>Be respectful to other users</li>
                <li>Not share inappropriate content</li>
                <li>Follow community guidelines</li>
                <li>Report any violations</li>
            </ul>
            <p>Full terms available at saathi.tv/terms</p>
        `);
    }

    showPrivacyModal() {
        this.showInfoModal('Privacy Policy', `
            <h4>Privacy Policy</h4>
            <p>We protect your privacy by:</p>
            <ul>
                <li>End-to-end encrypting all communications</li>
                <li>Not storing personal conversations</li>
                <li>Using secure authentication methods</li>
                <li>Providing anonymous chat options</li>
            </ul>
            <p>Full policy available at saathi.tv/privacy</p>
        `);
    }

    showForgotPasswordModal() {
        this.showInfoModal('Reset Password', `
            <h4>Reset Your Password</h4>
            <p>Enter your email address and we'll send you a reset link:</p>
            <form onsubmit="window.secureLogin.handlePasswordReset(event)">
                <div class="form-group">
                    <input type="email" placeholder="Email Address" required>
                </div>
                <button type="submit" class="submit-btn">Send Reset Link</button>
            </form>
        `);
    }

    showInfoModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="this.closest('.login-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        };
    }

    handlePasswordReset(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        // Simulate password reset
        this.showSuccess('Password reset link sent to ' + email);
        event.target.closest('.login-modal').remove();
        document.body.style.overflow = 'auto';
    }
}

// Notification styles
const notificationStyles = `
    .secure-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #4CAF50;
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 400px;
        min-width: 300px;
    }

    .secure-notification.show {
        transform: translateX(0);
    }

    .secure-notification.error {
        border-left-color: #f44336;
    }

    .secure-notification.success {
        border-left-color: #4CAF50;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px 20px;
    }

    .notification-content i {
        font-size: 18px;
        color: #4CAF50;
    }

    .secure-notification.error .notification-content i {
        color: #f44336;
    }

    .notification-content span {
        flex: 1;
        font-size: 14px;
        color: #333;
        line-height: 1.4;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333;
    }

    @media (max-width: 480px) {
        .secure-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            min-width: auto;
        }
    }
`;

// Apply notification styles
const secureLoginStyleElement = document.createElement('style');
secureLoginStyleElement.textContent = notificationStyles;
document.head.appendChild(secureLoginStyleElement);

// Initialize secure login system
document.addEventListener('DOMContentLoaded', () => {
    window.secureLogin = new SecureLoginSystem();
    console.log('🔐 Secure Login System loaded');
});

// Export for global use
window.SecureLoginSystem = SecureLoginSystem;
