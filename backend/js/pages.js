// Pages JavaScript for Saathi TV

// Navigation functions
function goHome() {
    window.location.href = '../index.html';
}

function startChat() {
    window.location.href = '../index.html?start=true';
}

// Logo click handler
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler to logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', goHome);
    }

    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.detail-card, .step, .region, .stat-card, .benefit, .device, .feature-item, .privacy-section').forEach(el => {
        observer.observe(el);
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .detail-card, .step, .region, .stat-card, .benefit, .device, .feature-item, .privacy-section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
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

// Handle page-specific functionality
function handlePageSpecificFeatures() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('privacy-policy')) {
        // Add privacy-specific features
        addPrivacyFeatures();
    } else if (currentPage.includes('mobile-friendly')) {
        // Add mobile-specific features
        addMobileFeatures();
    }
}

function addPrivacyFeatures() {
    // Add copy to clipboard functionality for contact emails
    document.querySelectorAll('.contact-item').forEach(item => {
        if (item.textContent.includes('@')) {
            item.style.cursor = 'pointer';
            item.title = 'Click to copy email';
            
            item.addEventListener('click', function() {
                const email = this.textContent.match(/[\w.-]+@[\w.-]+\.\w+/);
                if (email) {
                    navigator.clipboard.writeText(email[0]).then(() => {
                        showNotification('Email copied to clipboard!', 'success');
                    }).catch(() => {
                        showNotification('Failed to copy email', 'error');
                    });
                }
            });
        }
    });
}

function addMobileFeatures() {
    // Add device detection display
    const deviceInfo = document.createElement('div');
    deviceInfo.className = 'device-info';
    deviceInfo.innerHTML = `
        <div style="background: rgba(255, 107, 53, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h4>Your Device Information</h4>
            <p><strong>Screen:</strong> ${screen.width}x${screen.height}</p>
            <p><strong>Window:</strong> ${window.innerWidth}x${window.innerHeight}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
            <p><strong>Touch Support:</strong> ${'ontouchstart' in window ? 'Yes' : 'No'}</p>
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(deviceInfo);
    }
}

// Initialize page features
document.addEventListener('DOMContentLoaded', handlePageSpecificFeatures);

// Handle window resize for responsive features
window.addEventListener('resize', function() {
    if (window.location.pathname.includes('mobile-friendly')) {
        // Update device info on resize
        const deviceInfo = document.querySelector('.device-info');
        if (deviceInfo) {
            deviceInfo.querySelector('p:nth-child(3)').innerHTML = 
                `<strong>Window:</strong> ${window.innerWidth}x${window.innerHeight}`;
        }
    }
});

// Export functions for global use
window.goHome = goHome;
window.startChat = startChat;
window.showNotification = showNotification;
