"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../services/firebase.service.js"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile and role from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid) // Point to the 'users' collection
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        // Assuming 'role' field exists in the users document
        setUserRole(data.role || null)
        setUserProfile(data)
      } else {
        // If a user document doesn't exist in 'users' for the authenticated UID
        setUserRole(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setUserRole(null)
      setUserProfile(null)
    }
  }

  // Sign in function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await fetchUserProfile(userCredential.user.uid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Sign up function for restaurant owners
  const signupRestaurantOwner = async (email, password, ownerData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // Create restaurant owner profile directly in 'users' collection
      await setDoc(doc(db, "users", uid), {
        // Write to 'users'
        email,
        fullName: ownerData.fullName,
        phone: ownerData.phone,
        role: "restaurant_owner", // Ensure this role is set
        status: "pending", // Pending approval from super admin
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await fetchUserProfile(uid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createKitchenManager = async (email, password, kitchenManagerData, restaurantId) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // Create kitchen manager profile in 'users' collection
      await setDoc(doc(db, "users", uid), {
        email,
        fullName: kitchenManagerData.fullName,
        phone: kitchenManagerData.phone,
        role: "kitchen_manager",
        restaurantId, // Associate kitchen manager with restaurant
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await fetchUserProfile(uid)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Create super admin (this should be called only once manually or through secure endpoint)
  const createSuperAdmin = async (email, password, adminData) => {
    const createSuperAdmin = async (email, password, adminData) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const uid = userCredential.user.uid

        // Create super admin profile directly in 'users' collection
        await setDoc(doc(db, "users", uid), {
          // Write to 'users'
          email,
          fullName: adminData.fullName,
          role: "super_admin", // Ensure this role is set
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        await fetchUserProfile(uid)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      setUserRole(null)
      setUserProfile(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserRole(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    userProfile,
    login,
    logout,
    signupRestaurantOwner,
    createSuperAdmin,
    createKitchenManager,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
