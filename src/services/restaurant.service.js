import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase.service.js"
import { uploadImage, deleteImage } from "./cloudinary.service.js"

// ============================================
// RESTAURANT CRUD OPERATIONS
// ============================================

/**
 * Create a new restaurant
 */
export const createRestaurant = async (ownerId, restaurantData, logoFile = null, coverFile = null) => {
  try {
    let logoUrl = ""
    let logoPublicId = ""
    let coverImageUrl = ""
    let coverPublicId = ""

    // Upload logo if provided
    if (logoFile) {
      const logoUpload = await uploadImage(logoFile, "restaurants/logos")
      if (logoUpload.success) {
        logoUrl = logoUpload.url
        logoPublicId = logoUpload.publicId
      }
    }

    // Upload cover image if provided
    if (coverFile) {
      const coverUpload = await uploadImage(coverFile, "restaurants/covers")
      if (coverUpload.success) {
        coverImageUrl = coverUpload.url
        coverPublicId = coverUpload.publicId
      }
    }

    // Create restaurant document
    const restaurantRef = await addDoc(collection(db, "restaurants"), {
      ownerId,
      name: restaurantData.name,
      description: restaurantData.description || "",
      address: restaurantData.address || "",
      phone: restaurantData.phone || "",
      email: restaurantData.email || "",
      logo: logoUrl,
      logoPublicId,
      coverImage: coverImageUrl,
      coverPublicId,
      cuisineType: restaurantData.cuisineType || "",
      status: "active",
      subscriptionStatus: "trial",
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      qrCodeId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: restaurantRef.id }
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get restaurant by ID
 */
export const getRestaurantById = async (restaurantId) => {
  try {
    const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId))

    if (!restaurantDoc.exists()) {
      return { success: false, error: "Restaurant not found" }
    }

    return {
      success: true,
      restaurant: { id: restaurantDoc.id, ...restaurantDoc.data() },
    }
  } catch (error) {
    console.error("Error getting restaurant:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all restaurants for an owner
 */
export const getRestaurantsByOwner = async (ownerId) => {
  try {
    const q = query(collection(db, "restaurants"), where("ownerId", "==", ownerId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const restaurants = []

    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, restaurants }
  } catch (error) {
    console.error("Error getting restaurants:", error)
    return { success: false, error: error.message, restaurants: [] }
  }
}

/**
 * Get all restaurants (super admin only)
 */
export const getAllRestaurants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "restaurants"))
    const restaurants = []

    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, restaurants }
  } catch (error) {
    console.error("Error getting all restaurants:", error)
    return { success: false, error: error.message, restaurants: [] }
  }
}

/**
 * Update restaurant
 */
export const updateRestaurant = async (restaurantId, updates, logoFile = null, coverFile = null) => {
  try {
    const updateData = { ...updates, updatedAt: serverTimestamp() }

    // Upload new logo if provided
    if (logoFile) {
      const logoUpload = await uploadImage(logoFile, "restaurants/logos")
      if (logoUpload.success) {
        updateData.logo = logoUpload.url
        updateData.logoPublicId = logoUpload.publicId
      }
    }

    // Upload new cover if provided
    if (coverFile) {
      const coverUpload = await uploadImage(coverFile, "restaurants/covers")
      if (coverUpload.success) {
        updateData.coverImage = coverUpload.url
        updateData.coverPublicId = coverUpload.publicId
      }
    }

    await updateDoc(doc(db, "restaurants", restaurantId), updateData)

    return { success: true }
  } catch (error) {
    console.error("Error updating restaurant:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete restaurant
 */
export const deleteRestaurant = async (restaurantId) => {
  try {
    // TODO: Also delete related menu sections, items, and QR codes
    await deleteDoc(doc(db, "restaurants", restaurantId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    return { success: false, error: error.message }
  }
}

// ============================================
// MENU SECTION OPERATIONS
// ============================================

/**
 * Create menu section
 */
export const createMenuSection = async (restaurantId, sectionData) => {
  try {
    const sectionRef = await addDoc(collection(db, "menu_sections"), {
      restaurantId,
      name: sectionData.name,
      description: sectionData.description || "",
      displayOrder: sectionData.displayOrder || 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: sectionRef.id }
  } catch (error) {
    console.error("Error creating menu section:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get menu sections for a restaurant
 */
export const getMenuSections = async (restaurantId) => {
  try {
    const q = query(
      collection(db, "menu_sections"),
      where("restaurantId", "==", restaurantId),
      orderBy("displayOrder", "asc"),
    )

    const querySnapshot = await getDocs(q)
    const sections = []

    querySnapshot.forEach((doc) => {
      sections.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, sections }
  } catch (error) {
    console.error("Error getting menu sections:", error)
    return { success: false, error: error.message, sections: [] }
  }
}

/**
 * Update menu section
 */
export const updateMenuSection = async (sectionId, updates) => {
  try {
    await updateDoc(doc(db, "menu_sections", sectionId), {
      ...updates,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating menu section:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete menu section
 */
export const deleteMenuSection = async (sectionId) => {
  try {
    await deleteDoc(doc(db, "menu_sections", sectionId))
    return { success: true }
  } catch (error) {
    console.error("Error deleting menu section:", error)
    return { success: false, error: error.message }
  }
}

// ============================================
// MENU ITEM OPERATIONS
// ============================================

/**
 * Create menu item
 */
export const createMenuItem = async (restaurantId, sectionId, itemData, imageFile = null) => {
  try {
    let imageUrl = ""
    let imagePublicId = ""

    // Upload image if provided
    if (imageFile) {
      const imageUpload = await uploadImage(imageFile, `menu/${restaurantId}`)
      if (imageUpload.success) {
        imageUrl = imageUpload.url
        imagePublicId = imageUpload.publicId
      }
    }

    const itemRef = await addDoc(collection(db, "menu_items"), {
      restaurantId,
      sectionId,
      name: itemData.name,
      description: itemData.description || "",
      price: Number.parseFloat(itemData.price) || 0,
      image: imageUrl,
      imagePublicId: imagePublicId,
      ingredients: itemData.ingredients || [],
      isAvailable: itemData.isAvailable !== false,
      isVegetarian: itemData.isVegetarian || false,
      isVegan: itemData.isVegan || false,
      isGlutenFree: itemData.isGlutenFree || false,
      spicyLevel: itemData.spicyLevel || 0,
      displayOrder: itemData.displayOrder || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: itemRef.id }
  } catch (error) {
    console.error("Error creating menu item:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get menu items for a restaurant
 */
export const getMenuItems = async (restaurantId, sectionId = null) => {
  try {
    let q

    if (sectionId) {
      q = query(
        collection(db, "menu_items"),
        where("restaurantId", "==", restaurantId),
        where("sectionId", "==", sectionId),
        orderBy("displayOrder", "asc"),
      )
    } else {
      q = query(collection(db, "menu_items"), where("restaurantId", "==", restaurantId), orderBy("displayOrder", "asc"))
    }

    const querySnapshot = await getDocs(q)
    const items = []

    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() })
    })

    return { success: true, items }
  } catch (error) {
    console.error("Error getting menu items:", error)
    return { success: false, error: error.message, items: [] }
  }
}

/**
 * Update menu item
 */
export const updateMenuItem = async (itemId, updates, imageFile = null) => {
  try {
    const updateData = { ...updates, updatedAt: serverTimestamp() }

    // Upload new image if provided
    if (imageFile) {
      const imageUpload = await uploadImage(imageFile, "menu/items")
      if (imageUpload.success) {
        updateData.image = imageUpload.url
        updateData.imagePublicId = imageUpload.publicId
      }
    }

    await updateDoc(doc(db, "menu_items", itemId), updateData)

    return { success: true }
  } catch (error) {
    console.error("Error updating menu item:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete menu item
 */
export const deleteMenuItem = async (itemId, imagePublicId = null) => {
  try {
    // Delete image from Cloudinary if exists
    if (imagePublicId) {
      await deleteImage(imagePublicId)
    }

    await deleteDoc(doc(db, "menu_items", itemId))
    return { success: true }
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return { success: false, error: error.message }
  }
}
