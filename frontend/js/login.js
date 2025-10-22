// Login Page JavaScript for Saathi TV

class LoginManager {
    constructor() {
        this.isLoading = false;
        this.users = JSON.parse(localStorage.getItem('saathi_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('saathi_current_user')) || null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAutoLogin();
        console.log('🔐 Login Manager initialized');
    }

    setupEventListeners() {
        // Form validation on input
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });

        // Enter key handling
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                const activeModal = document.querySelector('.modal[style*="block"]');
                if (activeModal) {
                    const form = activeModal.querySelector('form');
                    if (form) form.dispatchEvent(new Event('submit'));
                } else {
                    document.querySelector('.login-form').dispatchEvent(new Event('submit'));
                }
            }
        });

        // Prevent form submission on Enter in input fields
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const form = input.closest('form');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            });
        });
    }

    validateInput(input) {
        const container = input.closest('.input-container');
        const value = input.value.trim();
        
        // Remove existing error states
        container.classList.remove('error', 'success');
        
        if (input.type === 'email') {
            if (value && this.isValidEmail(value)) {
                container.classList.add('success');
            } else if (value) {
                container.classList.add('error');
            }
        } else if (input.type === 'password') {
            if (value && value.length >= 6) {
                container.classList.add('success');
            } else if (value) {
                container.classList.add('error');
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkAutoLogin() {
        // Check if user should be auto-logged in
        if (this.currentUser && localStorage.getItem('saathi_remember_me')) {
            this.showAutoLoginMessage();
        }
    }

    showAutoLoginMessage() {
        const message = document.createElement('div');
        message.className = 'auto-login-message';
        message.innerHTML = `
            <div class="auto-login-content">
                <div class="auto-login-avatar">👤</div>
                <p>Welcome back, ${this.currentUser.name || this.currentUser.email}!</p>
                <div class="auto-login-buttons">
                    <button onclick="loginManager.continueWithSavedAccount()" class="continue-btn">Continue</button>
                    <button onclick="loginManager.switchAccount()" class="switch-btn">Switch Account</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-continue after 3 seconds
        setTimeout(() => {
            if (document.body.contains(message)) {
                this.continueWithSavedAccount();
            }
        }, 3000);
    }

    continueWithSavedAccount() {
        const message = document.querySelector('.auto-login-message');
        if (message) message.remove();
        
        this.showSuccessAnimation('Welcome back!');
        setTimeout(() => {
            this.redirectToApp();
        }, 1500);
    }

    switchAccount() {
        const message = document.querySelector('.auto-login-message');
        if (message) message.remove();
        
        localStorage.removeItem('saathi_current_user');
        localStorage.removeItem('saathi_remember_me');
        this.currentUser = null;
    }
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    if (window.loginManager.isLoading) return;
    
    const formData = new FormData(event.target);
    const email = formData.get('email').trim();
    const password = formData.get('password').trim();
    const remember = formData.get('remember') === 'on';
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!window.loginManager.isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    loginBtn.disabled = true;
    window.loginManager.isLoading = true;
    
    // Simulate login process
    setTimeout(() => {
        const success = authenticateUser(email, password, remember);
        
        // Reset button state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
        window.loginManager.isLoading = false;
        
        if (success) {
            showSuccessAnimation('Login successful!');
            setTimeout(() => {
                redirectToApp();
            }, 1500);
        } else {
            showNotification('Invalid email or password', 'error');
        }
    }, 2000);
}

function authenticateUser(email, password, remember) {
    // Demo authentication - in real app, this would be server-side
    const users = JSON.parse(localStorage.getItem('saathi_users')) || [];
    
    // Check if user exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
        // Create new user for demo
        user = {
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0],
            password: btoa(password), // Simple encoding for demo
            createdAt: Date.now(),
            lastLogin: Date.now()
        };
        
        users.push(user);
        localStorage.setItem('saathi_users', JSON.stringify(users));
        showNotification('Account created successfully!', 'success');
    } else {
        // Verify password
        if (atob(user.password) !== password) {
            return false;
        }
        
        // Update last login
        user.lastLogin = Date.now();
        localStorage.setItem('saathi_users', JSON.stringify(users));
    }
    
    // Set current user
    const userSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        loginTime: Date.now()
    };
    
    localStorage.setItem('saathi_current_user', JSON.stringify(userSession));
    
    if (remember) {
        localStorage.setItem('saathi_remember_me', 'true');
    }
    
    return true;
}

// Social login functions
function loginWithGoogle() {
    showNotification('Google login coming soon!', 'info');
    
    // Simulate Google login
    setTimeout(() => {
        const user = {
            id: 'google_' + Date.now(),
            email: 'user@gmail.com',
            name: 'Google User',
            provider: 'google',
            loginTime: Date.now()
        };
        
        localStorage.setItem('saathi_current_user', JSON.stringify(user));
        showSuccessAnimation('Google login successful!');
        
        setTimeout(() => {
            redirectToApp();
        }, 1500);
    }, 1500);
}

function loginWithFacebook() {
    showNotification('Facebook login coming soon!', 'info');
    
    // Simulate Facebook login
    setTimeout(() => {
        const user = {
            id: 'facebook_' + Date.now(),
            email: 'user@facebook.com',
            name: 'Facebook User',
            provider: 'facebook',
            loginTime: Date.now()
        };
        
        localStorage.setItem('saathi_current_user', JSON.stringify(user));
        showSuccessAnimation('Facebook login successful!');
        
        setTimeout(() => {
            redirectToApp();
        }, 1500);
    }, 1500);
}


// Password toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Forgot password functions
function showForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email || !window.loginManager.isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate sending reset email
    showNotification('Password reset link sent to your email!', 'success');
    closeForgotPassword();
    
    // Clear form
    document.getElementById('resetEmail').value = '';
}

function showSignup() {
    showNotification('Sign up feature coming soon!', 'info');
}

// Utility functions
function showSuccessAnimation(message) {
    const animation = document.createElement('div');
    animation.className = 'success-animation';
    animation.innerHTML = `
        <div class="success-icon">✅</div>
        <h3>${message}</h3>
        <p>Redirecting to Saathi TV...</p>
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        if (document.body.contains(animation)) {
            animation.remove();
        }
    }, 3000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });

    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#f44336'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function redirectToApp() {
    // Use encrypted URL
    if (window.urlEncryption) {
        const encryptedUrl = window.urlEncryption.encrypt('index.html');
        window.location.href = encryptedUrl;
    } else {
        window.location.href = 'index.html';
    }
}

// Add CSS for validation states
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .input-container.error input {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
    }
    
    .input-container.success input {
        border-color: #4CAF50 !important;
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1) !important;
    }
    
    .input-container.error .input-icon {
        color: #f44336 !important;
    }
    
    .input-container.success .input-icon {
        color: #4CAF50 !important;
    }
    
    .auto-login-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease-out;
    }
    
    .auto-login-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        animation: slideUp 0.5s ease-out;
    }
    
    .auto-login-avatar {
        font-size: 4rem;
        margin-bottom: 20px;
    }
    
    .auto-login-buttons {
        display: flex;
        gap: 15px;
        margin-top: 25px;
    }
    
    .continue-btn, .switch-btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .continue-btn {
        background: #FF6B35;
        color: white;
    }
    
    .switch-btn {
        background: #f5f5f5;
        color: #333;
    }
    
    .continue-btn:hover {
        background: #e55a2b;
        transform: translateY(-2px);
    }
    
    .switch-btn:hover {
        background: #e0e0e0;
        transform: translateY(-2px);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

document.head.appendChild(validationStyles);

// Initialize login manager
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
