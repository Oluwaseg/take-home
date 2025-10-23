"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, User, LogOut, Package, ShoppingBag, Settings, Menu, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 hidden sm:inline">ProductStore</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span>
            </Link>

            <Link
              to="/cart"
              className="relative text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-stone-100 group"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
                <Link
                  to="/orders"
                  className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-stone-100"
                  title="My Orders"
                >
                  <ShoppingBag className="h-5 w-5" />
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-stone-100"
                    title="Admin Dashboard"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}

                <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm hidden sm:block">
                    <div className="text-slate-900 font-medium">{user.username}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="block px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
                {getTotalItems() > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </Link>
            {user && (
              <>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                to="/login"
                className="block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
