"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ordersAPI } from "../utils/api"
import type { Order } from "../types"
import { Package, Calendar, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react"

const Orders: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        const userOrders = await ordersAPI.getOrders()
        setOrders(userOrders)
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border border-green-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <Package className="h-16 w-16 text-slate-300 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">View Your Orders</h1>
          <p className="text-lg text-slate-600 mb-8">
            Sign in to your account to see your complete order history and track your purchases.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sign In to Your Account
            <ArrowRight className="h-5 w-5 ml-2" />
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading your orders...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-error bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Your Orders</h1>
          </div>
          <p className="text-slate-600 ml-11">Track and manage all your purchases in one place</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No orders yet</h2>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto">
              You haven't placed any orders yet. Start exploring our products and make your first purchase today.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Start Shopping
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">${order.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Items ({order.items.length})</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {typeof item.product === "string" ? `Product ${item.product}` : item.product.name}
                          </p>
                          {typeof item.product !== "string" && (
                            <p className="text-sm text-slate-500 mt-1">{item.product.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                          <span className="text-sm font-medium text-slate-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-slate-900 min-w-fit">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
