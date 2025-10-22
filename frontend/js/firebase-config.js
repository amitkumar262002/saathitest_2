// Firebase Configuration - Non-module version for direct script loading

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXrbJQJhjfwp4ugkp2dAckoXodtPqH73E",
  authDomain: "saathi-5fa22.firebaseapp.com",
  databaseURL: "https://saathi-5fa22-default-rtdb.firebaseio.com",
  projectId: "saathi-5fa22",
  storageBucket: "saathi-5fa22.firebasestorage.app",
  messagingSenderId: "189814220535",
  appId: "1:189814220535:web:c22305089ff101282b95f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.loginCallbacks = [];
        this.logoutCallbacks = [];
        
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });
    }

    // Google Sign In
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Save user data to Firestore
            await this.saveUserToFirestore(user, 'google');
            
            return {
                success: true,
                user: this.formatUserData(user, 'google')
            };
        } catch (error) {
            console.error('Google sign in error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Email Sign In
    async signInWithEmail(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            
            return {
                success: true,
                user: this.formatUserData(user, 'email')
            };
        } catch (error) {
            console.error('Email sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Email Sign Up
    async signUpWithEmail(email, password, displayName) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            
            // Update user profile with display name
            await user.updateProfile({
                displayName: displayName
            });
            
            // Save user data to Firestore
            await this.saveUserToFirestore(user, 'email', { displayName });
            
            return {
                success: true,
                user: this.formatUserData(user, 'email')
            };
        } catch (error) {
            console.error('Email sign up error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign Out
    async signOutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Save user data to Firestore
    async saveUserToFirestore(user, loginMethod, additionalData = {}) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || additionalData.displayName || 'User',
                photoURL: user.photoURL || null,
                loginMethod: loginMethod,
                lastLogin: new Date().toISOString(),
                verified: user.emailVerified,
                createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
                ...additionalData
            };
            
            await setDoc(userRef, userData, { merge: true });
            return userData;
        } catch (error) {
            console.error('Error saving user to Firestore:', error);
            throw error;
        }
    }

    // Format user data for the app
    formatUserData(user, loginMethod) {
        return {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: user.photoURL || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>',
            loginMethod: loginMethod,
            verified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            lastLogin: new Date().toISOString(),
            securityLevel: user.emailVerified ? 'high' : 'medium'
        };
    }

    // Handle user login
    handleUserLogin(user) {
        this.currentUser = this.formatUserData(user, user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email');
        this.isLoggedIn = true;
        
        // Save to localStorage
        localStorage.setItem('saathi_current_user', JSON.stringify(this.currentUser));
        
        // Call login callbacks
        this.loginCallbacks.forEach(callback => callback(this.currentUser));
    }

    // Handle user logout
    handleUserLogout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Clear localStorage
        localStorage.removeItem('saathi_current_user');
        
        // Call logout callbacks
        this.logoutCallbacks.forEach(callback => callback());
    }

    // Add login callback
    onLogin(callback) {
        this.loginCallbacks.push(callback);
    }

    // Add logout callback
    onLogout(callback) {
        this.logoutCallbacks.push(callback);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    // Get error message
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/popup-blocked': 'Sign-in popup was blocked by the browser.'
        };
        
        return errorMessages[errorCode] || 'An error occurred during authentication.';
    }
}

// Create global instance
window.firebaseAuth = new FirebaseAuthManager();

export default FirebaseAuthManager;
