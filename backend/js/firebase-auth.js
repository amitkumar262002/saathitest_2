// Firebase Authentication System for Saathi TV

class FirebaseLoginSystem {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.loginCallbacks = [];
        this.logoutCallbacks = [];
        this.securityFeatures = {
            encryption: true,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxLoginAttempts: 5
        };
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Firebase Login System...');
        
        // Wait for Firebase to be loaded
        await this.waitForFirebase();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check existing session
        this.checkExistingSession();
        
        // Initialize security features
        this.initializeSecurity();
        
        this.isInitialized = true;
        console.log('✅ Firebase Login System initialized');
    }

    // Wait for Firebase to be loaded
    waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseAuth) {
                    // Listen for Firebase auth state changes
                    window.firebaseAuth.onLogin((user) => {
                        this.handleSuccessfulLogin(user);
                    });
                    
                    window.firebaseAuth.onLogout(() => {
                        this.handleLogout();
                    });
                    
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    setupEventListeners() {
        // Google Login Button
        const googleLoginBtn = document.getElementById('googleLogin');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.googleLogin();
            });
        }

        // Email Login Form
        const emailLoginForm = document.getElementById('emailLoginForm');
        if (emailLoginForm) {
            emailLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.emailLogin();
            });
        }

        // Email Signup Form
        const emailSignupForm = document.getElementById('emailSignupForm');
        if (emailSignupForm) {
            emailSignupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.emailSignup();
            });
        }

        // Logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, [onclick*="logout"]')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // Google Login
    async googleLogin() {
        try {
            this.showLoadingState('Signing in with Google...');
            
            const result = await window.firebaseAuth.signInWithGoogle();
            
            if (result.success) {
                this.showNotification('Successfully signed in with Google!', 'success');
                this.redirectAfterLogin();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Google sign-in failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Email Login
    async emailLogin() {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            this.showNotification('Please enter both email and password.', 'error');
            return;
        }

        try {
            this.showLoadingState('Signing in...');
            
            const result = await window.firebaseAuth.signInWithEmail(email, password);
            
            if (result.success) {
                this.showNotification('Successfully signed in!', 'success');
                this.redirectAfterLogin();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Email login error:', error);
            this.showNotification('Sign-in failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Email Signup
    async emailSignup() {
        const name = document.getElementById('signupName')?.value;
        const email = document.getElementById('signupEmail')?.value;
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const gender = document.getElementById('signupGender')?.value;
        const country = document.getElementById('signupCountry')?.value;

        // Validation
        if (!name || !email || !password || !confirmPassword || !gender) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long.', 'error');
            return;
        }

        try {
            this.showLoadingState('Creating account...');
            
            const result = await window.firebaseAuth.signUpWithEmail(email, password, name);
            
            if (result.success) {
                this.showNotification('Account created successfully!', 'success');
                this.redirectAfterLogin();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Email signup error:', error);
            this.showNotification('Account creation failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    // Logout
    async logout() {
        try {
            const result = await window.firebaseAuth.signOutUser();
            
            if (result.success) {
                this.showNotification('Successfully logged out!', 'success');
                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                this.showNotification('Logout failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    // Handle successful login
    handleSuccessfulLogin(user) {
        this.currentUser = user;
        
        // Store user data
        localStorage.setItem('saathi_current_user', JSON.stringify(user));
        
        // Call login callbacks
        this.loginCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Login callback error:', error);
            }
        });
        
        // Update UI
        this.updateUIForLoggedInUser();
    }

    // Handle logout
    handleLogout() {
        this.currentUser = null;
        
        // Clear stored data
        localStorage.removeItem('saathi_current_user');
        sessionStorage.clear();
        
        // Call logout callbacks
        this.logoutCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Logout callback error:', error);
            }
        });
        
        // Update UI
        this.updateUIForLoggedOutUser();
    }

    // Check existing session
    checkExistingSession() {
        try {
            const savedUser = localStorage.getItem('saathi_current_user');
            if (savedUser && window.firebaseAuth?.isUserLoggedIn()) {
                const user = JSON.parse(savedUser);
                this.handleSuccessfulLogin(user);
            }
        } catch (error) {
            console.error('Session check error:', error);
            // Clear invalid session data
            localStorage.removeItem('saathi_current_user');
        }
    }

    // Initialize security features
    initializeSecurity() {
        // Session timeout
        if (this.securityFeatures.sessionTimeout > 0) {
            this.setupSessionTimeout();
        }
        
        // Security headers and CSRF protection would go here
        this.setupSecurityHeaders();
    }

    // Setup session timeout
    setupSessionTimeout() {
        setInterval(() => {
            if (this.currentUser) {
                const loginTime = new Date(this.currentUser.lastLogin).getTime();
                const currentTime = Date.now();
                
                if (currentTime - loginTime > this.securityFeatures.sessionTimeout) {
                    this.showNotification('Session expired. Please log in again.', 'warning');
                    this.logout();
                }
            }
        }, 60000); // Check every minute
    }

    // Setup security headers
    setupSecurityHeaders() {
        // Add security-related meta tags if not present
        if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', 'X-Content-Type-Options');
            meta.setAttribute('content', 'nosniff');
            document.head.appendChild(meta);
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        // Hide login forms
        const loginForms = document.querySelectorAll('.login-form, .signup-form');
        loginForms.forEach(form => form.style.display = 'none');
        
        // Show user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo && this.currentUser) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">${this.currentUser.avatar}</div>
                    <span class="user-name">${this.currentUser.name}</span>
                    <button class="logout-btn">Logout</button>
                </div>
            `;
        }
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        // Show login forms
        const loginForms = document.querySelectorAll('.login-form');
        loginForms.forEach(form => form.style.display = 'block');
        
        // Hide user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }

    // Redirect after login
    redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return');
        
        if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
        } else {
            // Default redirect to main page
            window.location.href = 'index.html';
        }
    }

    // Show loading state
    showLoadingState(message = 'Loading...') {
        const loadingEl = document.getElementById('loadingState');
        if (loadingEl) {
            loadingEl.textContent = message;
            loadingEl.style.display = 'block';
        }
        
        // Disable form buttons
        const buttons = document.querySelectorAll('.login-btn, .signup-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.textContent = message;
        });
    }

    // Hide loading state
    hideLoadingState() {
        const loadingEl = document.getElementById('loadingState');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        // Re-enable form buttons
        const buttons = document.querySelectorAll('.login-btn, .signup-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
        });
        
        // Restore button text
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) loginBtn.textContent = 'Sign In';
        
        const signupBtn = document.querySelector('.signup-btn');
        if (signupBtn) signupBtn.textContent = 'Create Account';
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }

    // Public methods for external use
    onLogin(callback) {
        this.loginCallbacks.push(callback);
    }

    onLogout(callback) {
        this.logoutCallbacks.push(callback);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return !!this.currentUser && window.firebaseAuth?.isUserLoggedIn();
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseLoginSystem = new FirebaseLoginSystem();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseLoginSystem;
}
