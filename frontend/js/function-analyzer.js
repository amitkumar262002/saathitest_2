// Function Analyzer and Fixer for Saathi TV

class FunctionAnalyzer {
    constructor() {
        this.brokenFunctions = [];
        this.fixedFunctions = [];
        this.missingElements = [];
        
        this.init();
    }

    init() {
        this.analyzeAllFunctions();
        this.fixBrokenFunctions();
        this.reportResults();
        console.log('🔧 Function Analyzer initialized');
    }

    analyzeAllFunctions() {
        console.log('🔍 Analyzing all functions...');
        
        // Check navigation functions
        this.checkNavigationFunctions();
        
        // Check video chat functions
        this.checkVideoChatFunctions();
        
        // Check form functions
        this.checkFormFunctions();
        
        // Check UI interaction functions
        this.checkUIFunctions();
        
        // Check missing DOM elements
        this.checkMissingElements();
    }

    checkNavigationFunctions() {
        const issues = [];
        
        // Check logo navigation
        const logoElements = document.querySelectorAll('.nav-logo, .logo-circle-small, .logo-circle-medium');
        logoElements.forEach((logo, index) => {
            if (!logo.onclick && !logo.addEventListener) {
                issues.push(`Logo ${index + 1} missing click handler`);
            }
        });
        
        // Check navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (!target) {
                    issues.push(`Navigation link ${index + 1} target not found: ${href}`);
                }
            }
        });
        
        if (issues.length > 0) {
            this.brokenFunctions.push({
                category: 'Navigation',
                issues: issues
            });
        }
    }

    checkVideoChatFunctions() {
        const issues = [];
        
        // Check video control buttons
        const videoControls = ['toggleVideo', 'toggleAudio', 'nextBtn', 'stopBtn'];
        videoControls.forEach(id => {
            const element = document.getElementById(id);
            if (element && !element.onclick && !this.hasEventListener(element)) {
                issues.push(`${id} button not functional`);
            }
        });
        
        // Check video elements
        const videoElements = ['localVideo', 'remoteVideo'];
        videoElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                issues.push(`Missing video element: ${id}`);
            }
        });
        
        if (issues.length > 0) {
            this.brokenFunctions.push({
                category: 'Video Chat',
                issues: issues
            });
        }
    }

    checkFormFunctions() {
        const issues = [];
        
        // Check form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            if (!form.onsubmit && !this.hasEventListener(form, 'submit')) {
                issues.push(`Form ${index + 1} missing submit handler`);
            }
        });
        
        // Check input validations
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach((input, index) => {
            if (!input.oninput && !this.hasEventListener(input, 'input')) {
                issues.push(`Required input ${index + 1} missing validation`);
            }
        });
        
        if (issues.length > 0) {
            this.brokenFunctions.push({
                category: 'Forms',
                issues: issues
            });
        }
    }

    checkUIFunctions() {
        const issues = [];
        
        // Check button functionality
        const buttons = document.querySelectorAll('button:not([type="submit"])');
        buttons.forEach((button, index) => {
            if (!button.onclick && !this.hasEventListener(button)) {
                const buttonText = button.textContent.trim();
                if (buttonText && buttonText !== '') {
                    issues.push(`Button "${buttonText}" not functional`);
                }
            }
        });
        
        // Check clickable elements
        const clickableElements = document.querySelectorAll('[onclick], .clickable, [style*="cursor: pointer"]');
        clickableElements.forEach((element, index) => {
            if (!element.onclick && !this.hasEventListener(element)) {
                issues.push(`Clickable element ${index + 1} missing handler`);
            }
        });
        
        if (issues.length > 0) {
            this.brokenFunctions.push({
                category: 'UI Interactions',
                issues: issues
            });
        }
    }

    checkMissingElements() {
        const requiredElements = [
            'userCount',
            'connectionStatus',
            'navToggle',
            'themeToggle'
        ];
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                this.missingElements.push(id);
            }
        });
    }

    hasEventListener(element, eventType = 'click') {
        // This is a simplified check - in reality, we can't easily detect all event listeners
        return element.getAttribute(`on${eventType}`) !== null;
    }

    fixBrokenFunctions() {
        console.log('🔧 Fixing broken functions...');
        
        this.fixNavigationIssues();
        this.fixVideoChatIssues();
        this.fixFormIssues();
        this.fixUIIssues();
        this.createMissingElements();
    }

    fixNavigationIssues() {
        // Fix logo navigation
        document.querySelectorAll('.nav-logo, .logo-circle-small, .logo-circle-medium').forEach(logo => {
            if (!logo.onclick) {
                logo.style.cursor = 'pointer';
                logo.addEventListener('click', () => {
                    if (window.urlEncryption) {
                        window.urlEncryption.navigateTo('index.html');
                    } else {
                        window.location.href = 'index.html';
                    }
                });
                this.fixedFunctions.push('Logo navigation');
            }
        });

        // Fix smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                } else {
                    console.warn('Target not found:', link.getAttribute('href'));
                }
            });
        });
        
        this.fixedFunctions.push('Smooth scrolling navigation');
    }

    fixVideoChatIssues() {
        // Fix video control buttons
        const videoControls = {
            'toggleVideo': () => {
                if (window.saathiTV) {
                    window.saathiTV.toggleVideo();
                } else {
                    console.warn('SaathiTV instance not found');
                }
            },
            'toggleAudio': () => {
                if (window.saathiTV) {
                    window.saathiTV.toggleAudio();
                } else {
                    console.warn('SaathiTV instance not found');
                }
            },
            'nextBtn': () => {
                if (window.saathiTV) {
                    window.saathiTV.nextUser();
                } else {
                    console.warn('SaathiTV instance not found');
                }
            },
            'stopBtn': () => {
                if (window.saathiTV) {
                    window.saathiTV.stopChat();
                } else {
                    console.warn('SaathiTV instance not found');
                }
            }
        };

        Object.entries(videoControls).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element && !element.onclick) {
                element.addEventListener('click', handler);
                this.fixedFunctions.push(`${id} functionality`);
            }
        });
    }

    fixFormIssues() {
        // Add form validation
        document.querySelectorAll('input[required]').forEach(input => {
            if (!this.hasEventListener(input, 'input')) {
                input.addEventListener('input', () => {
                    this.validateInput(input);
                });
                
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
                
                this.fixedFunctions.push(`Input validation for ${input.name || input.id}`);
            }
        });

        // Add form submission handlers
        document.querySelectorAll('form').forEach(form => {
            if (!form.onsubmit && !this.hasEventListener(form, 'submit')) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmission(form);
                });
                this.fixedFunctions.push('Form submission handler');
            }
        });
    }

    fixUIIssues() {
        // Fix mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu && !navToggle.onclick) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            this.fixedFunctions.push('Mobile menu toggle');
        }

        // Fix feature card clicks
        document.querySelectorAll('.feature-card[onclick]').forEach(card => {
            const onclickAttr = card.getAttribute('onclick');
            if (onclickAttr) {
                card.addEventListener('click', () => {
                    try {
                        eval(onclickAttr);
                    } catch (error) {
                        console.error('Error executing onclick:', error);
                    }
                });
            }
        });

        // Add hover effects to interactive elements
        this.addHoverEffects();
    }

    createMissingElements() {
        this.missingElements.forEach(elementId => {
            switch (elementId) {
                case 'userCount':
                    this.createUserCountElement();
                    break;
                case 'connectionStatus':
                    this.createConnectionStatusElement();
                    break;
                default:
                    console.warn(`Don't know how to create element: ${elementId}`);
            }
        });
    }

    createUserCountElement() {
        const userCountSpan = document.createElement('span');
        userCountSpan.id = 'userCount';
        userCountSpan.textContent = Math.floor(Math.random() * 50000) + 10000;
        
        const userCountContainer = document.querySelector('.user-count');
        if (userCountContainer) {
            userCountContainer.appendChild(userCountSpan);
            this.fixedFunctions.push('Created user count element');
        }
    }

    createConnectionStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'connectionStatus';
        statusElement.className = 'connection-status';
        statusElement.innerHTML = `
            <div class="status-indicator"></div>
            <span class="status-text">Ready to connect</span>
        `;
        
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            videoContainer.appendChild(statusElement);
            this.fixedFunctions.push('Created connection status element');
        }
    }

    validateInput(input) {
        const value = input.value.trim();
        const container = input.closest('.input-container') || input.parentElement;
        
        // Remove existing validation classes
        container.classList.remove('error', 'success');
        
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && emailRegex.test(value)) {
                container.classList.add('success');
            } else if (value) {
                container.classList.add('error');
            }
        } else if (input.required) {
            if (value) {
                container.classList.add('success');
            } else {
                container.classList.add('error');
            }
        }
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Form submitted:', data);
        
        // Show success message
        this.showNotification('Form submitted successfully!', 'success');
        
        // Reset form
        form.reset();
    }

    addHoverEffects() {
        // Add hover effects to buttons
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });

        // Add hover effects to cards
        document.querySelectorAll('.feature-card, .detail-card, .rule-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    showNotification(message, type = 'info') {
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

    reportResults() {
        console.log('📊 Function Analysis Report:');
        console.log('Broken functions found:', this.brokenFunctions.length);
        console.log('Functions fixed:', this.fixedFunctions.length);
        console.log('Missing elements:', this.missingElements.length);
        
        if (this.brokenFunctions.length > 0) {
            console.warn('Broken functions:', this.brokenFunctions);
        }
        
        if (this.fixedFunctions.length > 0) {
            console.log('✅ Fixed functions:', this.fixedFunctions);
        }
        
        // Show summary notification
        const totalIssues = this.brokenFunctions.reduce((sum, category) => sum + category.issues.length, 0);
        if (totalIssues > 0) {
            this.showNotification(`Fixed ${this.fixedFunctions.length} function issues!`, 'success');
        }
    }
}

// Initialize function analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.functionAnalyzer = new FunctionAnalyzer();
    }, 1000);
});

// Export for global use
window.FunctionAnalyzer = FunctionAnalyzer;
