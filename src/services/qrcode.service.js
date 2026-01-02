import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "./firebase.service.js"
import QRCode from "qrcode"
import { uploadImage, deleteImage } from "./cloudinary.service.js"

/**
 * Generate QR code for a restaurant with optional table number
 */
export const generateQRCode = async (restaurantId, restaurantName, tableNumber = null) => {
  try {
    const baseUrl = `${window.location.origin}/menu/${restaurantId}`
    const menuUrl = tableNumber ? `${baseUrl}?table=${tableNumber}` : baseUrl

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Convert DataURL → File
    const response = await fetch(qrCodeDataUrl)
    const blob = await response.blob()
    const file = new File([blob], `qr-${restaurantId}.png`, {
      type: "image/png",
    })

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, "qr-codes")

    if (!uploadResult.success) {
      throw new Error("QR upload failed")
    }

    // Save to Firestore
    const qrData = {
      restaurantId,
      restaurantName,
      tableNumber, // Added tableNumber to stored data
      qrCodeUrl: uploadResult.url,
      qrCodePublicId: uploadResult.publicId,
      qrCodeDataUrl,
      menuUrl,
      scans: 0,
      lastScannedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const qrCodeRef = await addDoc(collection(db, "qr_codes"), qrData)

    if (!tableNumber) {
      await updateDoc(doc(db, "restaurants", restaurantId), {
        qrCodeId: qrCodeRef.id,
        updatedAt: serverTimestamp(),
      })
    }

    return {
      success: true,
      qrCodeId: qrCodeRef.id,
      qrCodeUrl: uploadResult.url,
      qrCodeDataUrl,
      menuUrl,
    }
  } catch (error) {
    console.error("Generate QR error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get QR code
 */
export const getQRCode = async (restaurantId) => {
  try {
    const q = query(collection(db, "qr_codes"), where("restaurantId", "==", restaurantId))

    const snap = await getDocs(q)

    if (snap.empty) {
      return { success: false, error: "QR not found" }
    }

    const docData = snap.docs[0]
    return {
      success: true,
      qrCode: { id: docData.id, ...docData.data() },
    }
  } catch (error) {
    console.error("Get QR error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate QR code for a specific table
 */
export const generateTableQRCode = async (restaurantId, restaurantName, tableNumber) => {
  try {
    const menuUrl = `${window.location.origin}/menu/${restaurantId}?table=${tableNumber}`

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Convert DataURL → File
    const response = await fetch(qrCodeDataUrl)
    const blob = await response.blob()
    const file = new File([blob], `qr-${restaurantId}-table-${tableNumber}.png`, {
      type: "image/png",
    })

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, "qr-codes")

    if (!uploadResult.success) {
      throw new Error("QR upload failed")
    }

    const qrCodeRef = await addDoc(collection(db, "qr_codes"), {
      restaurantId,
      restaurantName,
      tableNumber, // NEW FIELD
      qrCodeUrl: uploadResult.url,
      qrCodePublicId: uploadResult.publicId,
      qrCodeDataUrl, // quick preview
      menuUrl,
      scans: 0,
      lastScannedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      qrCodeId: qrCodeRef.id,
      qrCodeUrl: uploadResult.url,
      qrCodeDataUrl,
      menuUrl,
      tableNumber,
    }
  } catch (error) {
    console.error("Generate table QR error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate QR codes for multiple tables in batch
 */
export const generateTableQRCodeBatch = async (restaurantId, restaurantName, tableCount) => {
  try {
    const results = []
    const errors = []

    for (let tableNumber = 1; tableNumber <= tableCount; tableNumber++) {
      const result = await generateTableQRCode(restaurantId, restaurantName, tableNumber)
      if (result.success) {
        results.push(result)
      } else {
        errors.push({ tableNumber, error: result.error })
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      totalGenerated: results.length,
      totalFailed: errors.length,
    }
  } catch (error) {
    console.error("Batch generate QR error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all QR codes for a restaurant
 */
export const getRestaurantQRCodes = async (restaurantId) => {
  try {
    const q = query(collection(db, "qr_codes"), where("restaurantId", "==", restaurantId))

    const snap = await getDocs(q)

    if (snap.empty) {
      return { success: true, qrCodes: [] }
    }

    const qrCodes = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    qrCodes.sort((a, b) => {
      const aTable = a.tableNumber || 0
      const bTable = b.tableNumber || 0
      return aTable - bTable
    })

    return {
      success: true,
      qrCodes,
    }
  } catch (error) {
    console.error("Get restaurant QR codes error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track scan with optional table number
 */
export const trackQRScan = async (restaurantId, tableNumber = null) => {
  try {
    let q

    if (tableNumber) {
      q = query(
        collection(db, "qr_codes"),
        where("restaurantId", "==", restaurantId),
        where("tableNumber", "==", Number.parseInt(tableNumber)),
      )
    } else {
      q = query(collection(db, "qr_codes"), where("restaurantId", "==", restaurantId))
    }

    const snap = await getDocs(q)

    if (!snap.empty) {
      await updateDoc(doc(db, "qr_codes", snap.docs[0].id), {
        scans: increment(1),
        lastScannedAt: serverTimestamp(),
      })
    }

    return { success: true }
  } catch (error) {
    console.warn("[v0] Track scan permission denied (guest):", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Download QR code
 */
export const downloadQRCode = (qrCodeDataUrl, restaurantName) => {
  const link = document.createElement("a")
  link.href = qrCodeDataUrl
  link.download = `${restaurantName}-qr.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Regenerate QR code
 */
export const regenerateQRCode = async (restaurantId, restaurantName) => {
  try {
    const q = query(collection(db, "qr_codes"), where("restaurantId", "==", restaurantId))
    const snap = await getDocs(q)

    if (!snap.empty) {
      const oldQRCodeDoc = snap.docs[0]
      const oldQRCodeData = oldQRCodeDoc.data()

      // Delete old Cloudinary image
      if (oldQRCodeData.qrCodePublicId) {
        await deleteImage(oldQRCodeData.qrCodePublicId)
      }

      // Delete old Firestore doc
      await deleteDoc(doc(db, "qr_codes", oldQRCodeDoc.id))
    }

    // Generate new QR code
    return await generateQRCode(restaurantId, restaurantName)
  } catch (error) {
    console.error("Regenerate QR error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete all QR codes for a restaurant
 */
export const deleteRestaurantQRCodes = async (restaurantId) => {
  try {
    const q = query(collection(db, "qr_codes"), where("restaurantId", "==", restaurantId))
    const snap = await getDocs(q)

    const batch = writeBatch(db)

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data()
      // Delete from Cloudinary
      if (data.qrCodePublicId) {
        deleteImage(data.qrCodePublicId)
      }
      // Delete from Firestore
      batch.delete(doc(db, "qr_codes", docSnap.id))
    })

    await batch.commit()

    return { success: true, deletedCount: snap.docs.length }
  } catch (error) {
    console.error("Delete restaurant QR codes error:", error)
    return { success: false, error: error.message }
  }
}
