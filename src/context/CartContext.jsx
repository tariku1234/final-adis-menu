"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)
  const [customerName, setCustomerName] = useState("")

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart_data")
    if (savedCart) {
      const { items, restaurantId: savedId, name } = JSON.parse(savedCart)
      setCartItems(items || [])
      setRestaurantId(savedId || null)
      setCustomerName(name || "")
    }
  }, [])

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem(
      "cart_data",
      JSON.stringify({
        items: cartItems,
        restaurantId,
        name: customerName,
      }),
    )
  }, [cartItems, restaurantId, customerName])

  const addToCart = (item, rId, qty = 1) => {
    // If adding from a different restaurant, clear cart first
    if (restaurantId && restaurantId !== rId) {
      if (window.confirm("Changing restaurants will clear your current cart. Continue?")) {
        setCartItems([{ ...item, quantity: qty }])
        setRestaurantId(rId)
      }
      return
    }

    setRestaurantId(rId)
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId, delta) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newQty = Math.max(1, i.quantity + delta)
          return { ...i, quantity: newQty }
        }
        return i
      }),
    )
  }

  const clearCart = () => {
    setCartItems([])
    setRestaurantId(null)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        customerName,
        setCustomerName,
        restaurantId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
