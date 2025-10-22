// Enhanced Interactions and Mobile Optimization for Saathi TV

class EnhancedInteractions {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartTime = 0;
        this.longPressTimer = null;
        this.rippleEffects = new Map();
        
        this.init();
    }

    init() {
        this.setupAdvancedHoverEffects();
        this.setupMobileOptimizations();
        this.setupLogoAnimations();
        this.setupParallaxEffects();
        this.setupAdvancedAnimations();
        this.setupGestureControls();
        console.log('✨ Enhanced Interactions initialized');
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    setupAdvancedHoverEffects() {
        // Enhanced card hover effects
        this.setupCardHoverEffects();
        
        // Advanced button interactions
        this.setupButtonEffects();
        
        // Navigation enhancements
        this.setupNavigationEffects();
        
        // Logo hover effects
        this.setupLogoHoverEffects();
        
        // Interactive backgrounds
        this.setupBackgroundEffects();
    }

    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.feature-card, .detail-card, .rule-card, .benefit, .device, .category-card');
        
        cards.forEach((card, index) => {
            // Add data attributes for advanced effects
            card.setAttribute('data-tilt', 'true');
            card.setAttribute('data-hover-lift', 'true');
            
            // Mouse enter effect
            card.addEventListener('mouseenter', (e) => {
                this.createCardHoverEffect(card, e);
            });
            
            // Mouse move for tilt effect
            card.addEventListener('mousemove', (e) => {
                if (!this.isMobile) {
                    this.createTiltEffect(card, e);
                }
            });
            
            // Mouse leave effect
            card.addEventListener('mouseleave', () => {
                this.resetCardEffect(card);
            });
            
            // Touch effects for mobile
            if (this.isMobile) {
                card.addEventListener('touchstart', () => {
                    this.createMobileTouchEffect(card);
                });
            }
        });
    }

    createCardHoverEffect(card, event) {
        // Lift effect
        card.style.transform = 'translateY(-15px) scale(1.03)';
        card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 215, 0, 0.3)';
        card.style.zIndex = '10';
        
        // Glow effect
        card.style.background = card.style.background || 'white';
        card.style.background += ', linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))';
        
        // Create floating particles
        this.createFloatingParticles(card, event);
        
        // Animate child elements
        const icon = card.querySelector('.feature-icon, .device-icon, .category-icon');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            icon.style.filter = 'drop-shadow(0 5px 15px rgba(255, 215, 0, 0.5))';
        }
        
        const title = card.querySelector('h3, h4');
        if (title) {
            title.style.color = '#FF6B35';
            title.style.textShadow = '0 0 10px rgba(255, 107, 53, 0.5)';
        }
    }

    createTiltEffect(card, event) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        
        const rotateX = (mouseY / rect.height) * -10;
        const rotateY = (mouseX / rect.width) * 10;
        
        card.style.transform = `translateY(-15px) scale(1.03) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    resetCardEffect(card) {
        card.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.boxShadow = '';
        card.style.zIndex = '';
        card.style.background = '';
        
        // Reset child elements
        const icon = card.querySelector('.feature-icon, .device-icon, .category-icon');
        if (icon) {
            icon.style.transform = '';
            icon.style.filter = '';
        }
        
        const title = card.querySelector('h3, h4');
        if (title) {
            title.style.color = '';
            title.style.textShadow = '';
        }
        
        // Remove particles
        card.querySelectorAll('.hover-particle').forEach(particle => {
            particle.remove();
        });
    }

    createFloatingParticles(element, event) {
        const rect = element.getBoundingClientRect();
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hover-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #FFD700, #FF6B35);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: floatParticle 2s ease-out forwards;
            `;
            
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            element.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 2000);
        }
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('button, .btn, .start-btn, .cta-btn');
        
        buttons.forEach(button => {
            // Ripple effect on click
            button.addEventListener('click', (e) => {
                this.createRippleEffect(button, e);
            });
            
            // Advanced hover effects
            button.addEventListener('mouseenter', () => {
                this.createButtonHoverEffect(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.resetButtonEffect(button);
            });
        });
    }

    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createButtonHoverEffect(button) {
        button.style.transform = 'translateY(-3px) scale(1.05)';
        button.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.4)';
        
        // Add glow animation
        button.style.animation = 'buttonGlow 1.5s ease-in-out infinite alternate';
    }

    resetButtonEffect(button) {
        button.style.transform = '';
        button.style.boxShadow = '';
        button.style.animation = '';
    }

    setupNavigationEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach((link, index) => {
            link.addEventListener('mouseenter', () => {
                // Slide effect
                link.style.transform = 'translateY(-2px)';
                link.style.color = '#FFD700';
                
                // Create underline animation
                this.createNavUnderline(link);
                
                // Stagger effect for adjacent links
                this.createStaggerEffect(navLinks, index);
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
                link.style.color = '';
                
                // Remove underline
                const underline = link.querySelector('.nav-underline');
                if (underline) {
                    underline.remove();
                }
            });
        });
    }

    createNavUnderline(link) {
        const underline = document.createElement('div');
        underline.className = 'nav-underline';
        underline.style.cssText = `
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #FFD700, #FF6B35);
            animation: expandUnderline 0.3s ease-out forwards;
        `;
        
        link.style.position = 'relative';
        link.appendChild(underline);
    }

    createStaggerEffect(links, currentIndex) {
        links.forEach((link, index) => {
            if (index !== currentIndex) {
                const distance = Math.abs(index - currentIndex);
                const delay = distance * 50;
                const intensity = Math.max(0.3, 1 - distance * 0.2);
                
                setTimeout(() => {
                    link.style.transform = `translateY(-${2 * intensity}px)`;
                    link.style.opacity = intensity.toString();
                }, delay);
                
                setTimeout(() => {
                    link.style.transform = '';
                    link.style.opacity = '';
                }, delay + 200);
            }
        });
    }

    setupLogoAnimations() {
        const logos = document.querySelectorAll('.logo-circle-small, .logo-circle-medium, .logo-circle-large, .nav-logo');
        
        logos.forEach(logo => {
            // 360-degree rotation on page load
            logo.style.animation = 'logoEntrance 2s ease-out';
            
            // Enhanced hover effects
            logo.addEventListener('mouseenter', () => {
                this.createLogoHoverEffect(logo);
            });
            
            logo.addEventListener('mouseleave', () => {
                this.resetLogoEffect(logo);
            });
            
            // Click animation
            logo.addEventListener('click', () => {
                this.createLogoClickEffect(logo);
            });
        });
    }

    createLogoHoverEffect(logo) {
        logo.style.transform = 'scale(1.2) rotate(360deg)';
        logo.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.6)';
        logo.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))';
        
        // Create orbital particles
        this.createOrbitalParticles(logo);
    }

    resetLogoEffect(logo) {
        logo.style.transform = '';
        logo.style.boxShadow = '';
        logo.style.filter = '';
        
        // Remove orbital particles
        logo.querySelectorAll('.orbital-particle').forEach(particle => {
            particle.remove();
        });
    }

    createLogoClickEffect(logo) {
        // Pulse effect
        logo.style.animation = 'logoPulse 0.6s ease-out';
        
        setTimeout(() => {
            logo.style.animation = '';
        }, 600);
    }

    createOrbitalParticles(logo) {
        const particleCount = 6;
        const radius = 40;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'orbital-particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #FFD700, #FF6B35);
                border-radius: 50%;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) translate(${x}px, ${y}px);
                animation: orbit 2s linear infinite;
                animation-delay: ${i * 0.1}s;
                pointer-events: none;
                z-index: 1000;
            `;
            
            logo.style.position = 'relative';
            logo.appendChild(particle);
        }
    }

    setupMobileOptimizations() {
        if (this.isMobile) {
            this.setupTouchGestures();
            this.setupMobileNavigation();
            this.setupMobileVideoControls();
            this.optimizeMobilePerformance();
        }
    }

    setupTouchGestures() {
        // Swipe gestures for mobile
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const touchDuration = Date.now() - this.touchStartTime;
            
            // Swipe detection
            if (Math.abs(deltaX) > 50 && touchDuration < 300) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            
            // Long press detection
            if (touchDuration > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                this.handleLongPress(e.changedTouches[0]);
            }
        });
    }

    handleSwipeRight() {
        // Navigate to previous section or show menu
        const currentSection = this.getCurrentSection();
        if (currentSection) {
            this.navigateToSection('prev');
        }
    }

    handleSwipeLeft() {
        // Navigate to next section
        const currentSection = this.getCurrentSection();
        if (currentSection) {
            this.navigateToSection('next');
        }
    }

    handleLongPress(touch) {
        // Show context menu or additional options
        this.showMobileContextMenu(touch.clientX, touch.clientY);
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            // Enhanced mobile menu animation
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Animate menu items
                const menuItems = navMenu.querySelectorAll('.nav-link');
                menuItems.forEach((item, index) => {
                    if (navMenu.classList.contains('active')) {
                        item.style.animation = `slideInLeft 0.3s ease-out ${index * 0.1}s forwards`;
                    } else {
                        item.style.animation = '';
                    }
                });
            });
        }
    }

    setupMobileVideoControls() {
        const videoControls = document.querySelector('.video-controls');
        if (videoControls && this.isMobile) {
            // Make controls larger for mobile
            videoControls.style.padding = '20px 30px';
            
            const controlBtns = videoControls.querySelectorAll('.control-btn');
            controlBtns.forEach(btn => {
                btn.style.width = '60px';
                btn.style.height = '60px';
                btn.style.fontSize = '1.5rem';
            });
            
            // Add haptic feedback
            controlBtns.forEach(btn => {
                btn.addEventListener('touchstart', () => {
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                });
            });
        }
    }

    optimizeMobilePerformance() {
        // Reduce animations on mobile for better performance
        if (this.isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    * {
                        animation-duration: 0.3s !important;
                        transition-duration: 0.3s !important;
                    }
                    
                    .floating-shape {
                        display: none;
                    }
                    
                    .background-animation {
                        opacity: 0.3;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupParallaxEffects() {
        if (!this.isMobile) {
            window.addEventListener('scroll', () => {
                this.updateParallax();
            });
        }
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-content, .about-image');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    setupAdvancedAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.feature-card, .detail-card, .stat-card, .step').forEach(el => {
            observer.observe(el);
        });
    }

    triggerScrollAnimation(element) {
        element.style.animation = 'slideInUp 0.8s ease-out forwards';
        
        // Add stagger effect for grouped elements
        const siblings = Array.from(element.parentNode.children);
        const index = siblings.indexOf(element);
        
        siblings.forEach((sibling, i) => {
            if (i !== index && sibling.classList.contains(element.className.split(' ')[0])) {
                setTimeout(() => {
                    sibling.style.animation = 'slideInUp 0.8s ease-out forwards';
                }, Math.abs(i - index) * 100);
            }
        });
    }

    createMobileTouchEffect(element) {
        element.style.transform = 'scale(0.95)';
        element.style.background = 'rgba(255, 215, 0, 0.1)';
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.background = '';
        }, 150);
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                return section;
            }
        }
        return null;
    }

    navigateToSection(direction) {
        const sections = Array.from(document.querySelectorAll('section'));
        const currentSection = this.getCurrentSection();
        
        if (!currentSection) return;
        
        const currentIndex = sections.indexOf(currentSection);
        let targetIndex;
        
        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, sections.length - 1);
        } else {
            targetIndex = Math.max(currentIndex - 1, 0);
        }
        
        sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
    }

    showMobileContextMenu(x, y) {
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 10000;
            animation: contextMenuAppear 0.3s ease-out;
        `;
        
        menu.innerHTML = `
            <div class="context-item" onclick="console.log('Refresh disabled')">🚫 Refresh Disabled</div>
    }
}

setupParallaxEffects() {
    if (!this.isMobile) {
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
    }
}

updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content, .about-image');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

setupAdvancedAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.triggerScrollAnimation(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.feature-card, .detail-card, .stat-card, .step').forEach(el => {
        observer.observe(el);
    });
}

triggerScrollAnimation(element) {
    element.style.animation = 'slideInUp 0.8s ease-out forwards';
    
    // Add stagger effect for grouped elements
    const siblings = Array.from(element.parentNode.children);
    const index = siblings.indexOf(element);
    
    siblings.forEach((sibling, i) => {
        if (i !== index && sibling.classList.contains(element.className.split(' ')[0])) {
            setTimeout(() => {
                sibling.style.animation = 'slideInUp 0.8s ease-out forwards';
            }, Math.abs(i - index) * 100);
        }
    });
}

createMobileTouchEffect(element) {
    element.style.transform = 'scale(0.95)';
    element.style.background = 'rgba(255, 215, 0, 0.1)';
    
    setTimeout(() => {
        element.style.transform = '';
        element.style.background = '';
    }, 150);
}

getCurrentSection() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            return section;
        }
    }
    return null;
}

navigateToSection(direction) {
    const sections = Array.from(document.querySelectorAll('section'));
    const currentSection = this.getCurrentSection();
    
    if (!currentSection) return;
    
    const currentIndex = sections.indexOf(currentSection);
    let targetIndex;
    
    if (direction === 'next') {
        targetIndex = Math.min(currentIndex + 1, sections.length - 1);
    } else {
        targetIndex = Math.max(currentIndex - 1, 0);
    }
    
    sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
}

showMobileContextMenu(x, y) {
    const menu = document.createElement('div');
    menu.className = 'mobile-context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 10000;
        animation: contextMenuAppear 0.3s ease-out;
    `;
    
    menu.innerHTML = `
        <div class="context-item" onclick="console.log('Refresh disabled')">🚫 Refresh Disabled</div>
        <div class="context-item" onclick="window.history.back()">⬅️ Back</div>
        <div class="context-item" onclick="window.scrollTo(0,0)">⬆️ Top</div>
    `;
    
    document.body.appendChild(menu);
    // Auto-hide menu after 3 seconds
    setTimeout(() => {
        menu.remove();
    }, 3000);
}

setupLogoHoverEffects() {
    const logos = document.querySelectorAll('.nav-logo, .logo-circle-small, .logo-circle-medium');
    
    logos.forEach(logo => {
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.1) rotate(5deg)';
            logo.style.transition = 'all 0.3s ease';
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

setupBackgroundEffects() {
    // Add subtle background animations
    const hero = document.querySelector('.hero');
    if (hero && !this.isMobile) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            hero.style.background = `linear-gradient(${x}deg, #667eea ${y}%, #764ba2 100%)`;
        });
    }
}

setupGestureControls() {
    if (this.isMobile) {
        // Add gesture controls for mobile
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Swipe up - scroll to next section
                    this.scrollToNextSection();
                } else {
                    // Swipe down - scroll to previous section
                    this.scrollToPreviousSection();
                }
            }
        });
    }
}

scrollToNextSection() {
    const currentSection = this.getCurrentSection();
    const nextSection = currentSection?.nextElementSibling;
    if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
    }
}

scrollToPreviousSection() {
    const currentSection = this.getCurrentSection();
    const prevSection = currentSection?.previousElementSibling;
    if (prevSection) {
        prevSection.scrollIntoView({ behavior: 'smooth' });
    }
}
}

// Add enhanced CSS animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* Enhanced Animations */
    @keyframes logoEntrance {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
    
    @keyframes logoPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    @keyframes buttonGlow {
        0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
        100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 35px rgba(255, 165, 0, 0.6); }
    }
    
    @keyframes floatParticle {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-50px) scale(0); opacity: 0; }
    }
    
    @keyframes orbit {
        0% { transform: translate(-50%, -50%) rotate(0deg) translateX(40px) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg) translateX(40px) rotate(-360deg); }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes expandUnderline {
        0% { width: 0; }
        100% { width: 100%; }
    }
    
    @keyframes slideInUp {
        0% { transform: translateY(50px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInLeft {
        0% { transform: translateX(-50px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes contextMenuAppear {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    /* Mobile Navigation */
    .nav-menu.active {
        transform: translateX(0);
        opacity: 1;
    }
    
    .nav-toggle.active .bar:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active .bar:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    /* Context Menu */
    .context-item {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 5px;
        margin: 5px 0;
        transition: background 0.2s ease;
    }
    
    .context-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    /* Enhanced Hover States */
    .feature-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .nav-link {
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    button, .btn {
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    /* Mobile Optimizations */
    @media (max-width: 768px) {
        .feature-card:active {
            transform: scale(0.95);
        }
        
        button:active, .btn:active {
            transform: scale(0.95);
        }
        
        .nav-link:active {
            background: rgba(255, 215, 0, 0.1);
        }
    }
`;

document.head.appendChild(enhancedStyles);

// Initialize Enhanced Interactions
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedInteractions = new EnhancedInteractions();
});

// Export for global use
window.EnhancedInteractions = EnhancedInteractions;
