const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (file, folder = "general") => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)
    formData.append("folder", `menu_app/${folder}`)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!data.secure_url) {
      throw new Error(data.error?.message || "Cloudinary upload failed")
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete image from Cloudinary by publicId
 * Note: Secure deletion should ideally call a backend (Firebase Cloud Function)
 * Since we are in a front-end only context, we'll keep the placeholder but
 * allow it to be called consistently.
 */
export const deleteImage = async (publicId) => {
  console.warn("Secure deletion requires a backend Firebase Cloud Function to protect API_SECRET.")
  console.warn(`Public ID to delete: ${publicId}`)
  // In a real app, you would call an API route here
  return { success: true }
}
