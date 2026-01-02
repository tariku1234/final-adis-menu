import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDoc, // Import getDoc
} from "firebase/firestore"
import { db } from "./firebase.service.js"

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, "orders")
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { success: true, orderId: docRef.id }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }
}

// Get all orders for a restaurant (for restaurant owner)
export const getRestaurantOrders = async (restaurantId) => {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("restaurantId", "==", restaurantId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const orders = []
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching restaurant orders:", error)
    return { success: false, error: error.message }
  }
}

// Get orders for a kitchen manager's assigned restaurant
export const getKitchenManagerOrders = async (restaurantId) => {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("restaurantId", "==", restaurantId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const orders = []
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching kitchen manager orders:", error)
    return { success: false, error: error.message }
  }
}

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, "orders", orderId)
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }
}

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId)
    const docSnapshot = await getDoc(orderRef) // Use getDoc here
    if (docSnapshot.exists()) {
      return {
        success: true,
        order: {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        },
      }
    } else {
      return { success: false, error: "Order not found" }
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    return { success: false, error: error.message }
  }
}

// Get orders by status for a restaurant
export const getOrdersByStatus = async (restaurantId, status) => {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(
      ordersRef,
      where("restaurantId", "==", restaurantId),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    )
    const querySnapshot = await getDocs(q)
    const orders = []
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching orders by status:", error)
    return { success: false, error: error.message }
  }
}
