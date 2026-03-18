import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- YOUR ACTUAL PROJECT CONFIGURATION ---
// IMPORTANT: This uses your provided API keys.
const myFirebaseConfig = {
    apiKey: "AIzaSyDROotS-Ftq3_jBHjTtJG1YeGiWP2eMTH8",
    authDomain: "calc67-7c586.firebaseapp.com",
    projectId: "calc67-7c586",
    storageBucket: "calc67-7c586.firebasestorage.app",
    messagingSenderId: "328006078537",
    appId: "1:328006078537:web:6719f4740cd36018032f98",
    measurementId: "G-32J4S9P5DH"
};
// ----------------------------------------------------

const APP_CONFIG = myFirebaseConfig;
export const appId = APP_CONFIG.projectId;

/**
 * Initializes Firebase services and authenticates the user.
 * @returns {Promise<{db: Firestore|null, userId: string}>}
 */
export async function initializeFirebaseApp() {
    let db = null;
    let auth = null;
    let userId = crypto.randomUUID(); // Start with a random ID fallback

    try {
        if (APP_CONFIG) {
            const app = initializeApp(APP_CONFIG);
            db = getFirestore(app);
            auth = getAuth(app);

            // Use signInAnonymously. This is where your previous 400 error originated.
            // (Requires Anonymous Auth to be enabled in Firebase Console!)
            await signInAnonymously(auth);

            // Wait for the authentication state to settle and get the final user ID.
            await new Promise(resolve => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (user) {
                        userId = user.uid;
                    }
                    unsubscribe();
                    resolve();
                });
            });

            console.log("Firebase initialized successfully. User ID:", userId);
        } else {
            console.error("Firebase config is missing. Database features disabled.");
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        console.error("Please verify your API key and ensure Anonymous Auth is enabled in the Firebase Console.");
        // Ensure the app doesn't crash if auth fails
        db = null; 
    }

    return { db, userId };
}