"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart()
  const { user } = useAuth()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">Shopping Cart</h1>
            <p className="text-lg text-slate-600">Your shopping cart items</p>
          </div>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">Your cart is empty</h2>
            <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-lg text-slate-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl || "/placeholder.svg"}
                          alt={item.product.name}
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-slate-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.product.name}</h3>
                      <p className="text-sm text-slate-500 mb-2">{item.product.category}</p>
                      <p className="text-lg font-bold text-slate-900">${item.product.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Items ({items.length})</span>
                  <span className="text-slate-900 font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900 font-medium">$0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="space-y-3 mb-3">
                  <p className="text-sm text-slate-600 text-center">Please log in to proceed to checkout</p>
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                  >
                    Login to Checkout
                  </Link>
                </div>
              )}

              <Link
                to="/"
                className="block w-full py-3 text-center border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
