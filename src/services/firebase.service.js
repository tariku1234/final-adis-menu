import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { firebaseConfig } from "../config/firebase.config.js"

// Pre-declare exports at module level
let app
let auth
let db

// Initialize Firebase
try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.warn("⚠️ Firebase initialization failed:", error.message)
  // Provide mock objects for development/preview
  app = { name: "[DEFAULT]" }
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => cb(null),
  }
  db = { type: "firestore" }
}

// Named exports
export { auth, db }

// Default export
export default app
