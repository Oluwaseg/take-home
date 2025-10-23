"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ShoppingCart, Plus, Minus, Package, Check, Truck, Shield } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { productsAPI } from "../utils/api"
import type { Product } from "../types"

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id])

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true)
      const product = await productsAPI.getProduct(productId)
      setProduct(product)
    } catch (err) {
      setError("Failed to fetch product")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Product Not Found</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {error || "The product you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-slate-900 text-white font-semibold text-lg rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-lg hover:shadow-xl"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image Section */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                    <span className="text-slate-500 text-lg font-medium">No Image Available</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full mb-6">
                {product.category}
              </span>
            </div>

            {/* Title and Price */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">{product.name}</h1>
              <p className="text-4xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-slate-700 font-medium">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About this product</h2>
              <p className="text-slate-600 leading-relaxed text-base">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-900 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-5 w-5 text-slate-600" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    min="1"
                    max={product.stock}
                    className="w-16 text-center border-0 focus:ring-0 focus:outline-none text-lg font-semibold text-slate-900"
                    aria-label="Product quantity"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-4 px-6 bg-slate-900 text-white font-bold text-lg rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Add to Cart</span>
            </button>

            {/* Out of Stock Message */}
            {product.stock === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-700 font-medium">This product is currently out of stock</p>
              </div>
            )}

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
              <div className="text-center">
                <Truck className="h-6 w-6 text-slate-900 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Free Shipping</p>
                <p className="text-xs text-slate-600">On orders over $50</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-slate-900 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Secure</p>
                <p className="text-xs text-slate-600">100% protected</p>
              </div>
              <div className="text-center">
                <Check className="h-6 w-6 text-slate-900 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Guaranteed</p>
                <p className="text-xs text-slate-600">30-day returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
