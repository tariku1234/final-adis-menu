// Utility script to create the first Super Admin
// This file should be used only once to bootstrap the system

import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../services/firebase.service.js"

/**
 * Creates the first super admin account
 * Usage: Call this function from browser console or a temporary admin setup page
 *
 * @param {string} email - Super admin email
 * @param {string} password - Super admin password
 * @param {string} fullName - Super admin full name
 */
export const createFirstSuperAdmin = async (email, password, fullName) => {
  try {
    console.log("[v0] Creating super admin account...")

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    console.log("[v0] Firebase user created with UID:", uid)

    // Create super admin document in Firestore
   await setDoc(doc(db, "users", uid), {
      email,
      fullName,
      role: "super_admin", // Ensure this field exists and is "super_admin"
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("[v0] Super admin document created in Firestore")
    console.log("[v0] ✅ Super Admin created successfully!")
    console.log("[v0] Email:", email)
    console.log("[v0] You can now login at /login")

    return { success: true, uid }
  } catch (error) {
    console.error("[v0] ❌ Error creating super admin:", error.message)
    return { success: false, error: error.message }
  }
}

// For direct browser console usage
if (typeof window !== "undefined") {
  window.createFirstSuperAdmin = createFirstSuperAdmin
}
