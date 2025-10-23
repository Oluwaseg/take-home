"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import Navbar from "./components/Navbar"
import Toaster from "./components/Toaster"
import Login from "./pages/Login"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Orders from "./pages/Orders"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { healthAPI } from "./utils/api"
import { useEffect, useState } from "react"
import "./index.css"
// import { ErrorBoundary } from 'react-error-boundary'
// import { someGlobalUtil } from './utils/global'

function App() {
  const [apiStatus, setApiStatus] = useState("checking")
  const [retry_count, setRetryCount] = useState(0)

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await healthAPI.check()
        setApiStatus("connected")
      } catch (error) {
        console.error("API Health Check Failed:", error)
        setApiStatus("disconnected")
      }
    }

    checkApiHealth()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
            <Navbar />
            {apiStatus === "disconnected" && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto">
                  <p className="text-sm text-red-800 font-medium">
                    <strong>API Connection Issue:</strong> Unable to connect to the backend server. Please ensure the
                    backend is running on port 5000.
                  </p>
                </div>
              </div>
            )}
            <main className="min-h-[calc(100vh-80px)]">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
