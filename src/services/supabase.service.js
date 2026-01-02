import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "../config/supabase.config.js"

// Initialize Supabase client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Image upload helper function
export const uploadImage = async (file, bucket = "menu-images", folder = "") => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { success: false, error: error.message }
  }
}

// Delete image helper function
export const deleteImage = async (filePath, bucket = "menu-images") => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { success: false, error: error.message }
  }
}
