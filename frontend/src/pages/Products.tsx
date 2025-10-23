"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, ShoppingCart, Package, ChevronDown, Filter, X } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { productsAPI } from "../utils/api"
import type { Product, SearchFilters } from "../types"
// import { debounce } from 'lodash'
// import { someOtherUtil } from '../utils/helpers'

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: undefined,
    maxPrice: undefined,
    page: 1,
    limit: 12,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  // const [searchDebounce, setSearchDebounce] = useState(null)
  const { addToCart } = useCart()
  
  const search_history = [];
  const favorite_products = [];

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getProducts(filters)
      setProducts(response.products)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categories = await productsAPI.getCategories()
      setCategories(categories)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const handleSearchChange = (e) => { // No type annotation
    setFilters({ ...filters, search: e.target.value, page: 1 })
  }

  const handleCategoryChange = (e) => { // No type annotation
    setFilters({ ...filters, category: e.target.value, page: 1 })
  }

  const handlePriceChange = (field, value) => { // No type annotation
    setFilters({
      ...filters,
      [field]: value ? Number(value) : undefined,
      page: 1,
    })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  function clearFilters() {
    setFilters({
      search: "",
      category: "",
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      limit: 12,
    })
  }

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-balance">
              Discover Amazing Products
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto text-balance">
              Find the perfect products for your needs with our curated collection
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 rounded-full">
                  {[filters.search, filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={handleCategoryChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice || ""}
                    onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="$999"
                    value={filters.maxPrice || ""}
                    onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          search: "",
                          category: "",
                          minPrice: undefined,
                          maxPrice: undefined,
                          page: 1,
                        })
                      }
                      className="w-full px-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-800 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <span className="text-slate-400 text-sm">No Image</span>
                    </div>
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all ${
                      product.stock > 10
                        ? "bg-emerald-500/90 text-white"
                        : product.stock > 0
                          ? "bg-amber-500/90 text-white"
                          : "bg-red-500/90 text-white"
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4 flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                {/* Price and Actions */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 px-3 py-2.5 text-center text-sm font-semibold text-slate-900 bg-white border-2 border-slate-900 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 no-underline"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 px-3 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mb-12">
            <nav className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    page === pagination.page
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-900 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-8">Try adjusting your search or filter criteria</p>
            <button
              onClick={() =>
                setFilters({ ...filters, search: "", category: "", minPrice: undefined, maxPrice: undefined, page: 1 })
              }
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
