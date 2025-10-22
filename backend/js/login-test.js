// Login Test Script
console.log('🔧 Login Test loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Testing login functionality...');
    
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase is loaded');
        
        // Check if auth is initialized
        if (firebase.auth) {
            console.log('✅ Firebase Auth is available');
            
            // Test auth state listener
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    console.log('✅ User is logged in:', user.email);
                } else {
                    console.log('ℹ️ User is not logged in');
                }
            });
        } else {
            console.error('❌ Firebase Auth not initialized');
        }
    } else {
        console.error('❌ Firebase not loaded');
    }
    
    // Check login button
    const loginBtn = document.querySelector('#loginBtn, .login-btn, [data-action="login"]');
    if (loginBtn) {
        console.log('✅ Login button found:', loginBtn);
    } else {
        console.warn('⚠️ Login button not found');
    }
    
    // Check login modal
    const loginModal = document.querySelector('#loginModal, .login-modal, .modal');
    if (loginModal) {
        console.log('✅ Login modal found:', loginModal);
    } else {
        console.warn('⚠️ Login modal not found');
    }
});

console.log('🔍 Login Test ready');
