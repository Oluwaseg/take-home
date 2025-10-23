"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { User, Lock, ArrowRight } from "lucide-react"

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [submitError, setSubmitError] = useState("")

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    if (submitError) {
      setSubmitError("")
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    // Additional validation for registration
    if (!isLogin) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password = "Password must contain at least one lowercase letter"
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase letter"
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setSubmitError("")
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.username, formData.password)
        navigate("/")
      } else {
        await register(formData.username, formData.password)
        navigate("/")
      }
    } catch (err: any) {
      // Show user-friendly error message
      const errorMessage = err.message || (isLogin ? "Login failed. Please check your credentials." : "Registration failed. Please try again.")
      setSubmitError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/20">
            <User className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-slate-300 text-lg mb-6">
            {isLogin ? "Sign in to continue shopping" : "Join us and start shopping today"}
          </p>
          <div className="text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setFormData({ username: "", password: "" })
                setErrors({})
                setSubmitError("")
              }}
              className="text-white font-semibold hover:text-slate-200 transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {submitError}
              </div>
            )}
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-3">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.username 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-white/20 focus:ring-white/50'
                  }`}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-300">{errors.username}</p>
              )}
            </div>


            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-white/20 focus:ring-white/50'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-300">{errors.password}</p>
              )}
              {!isLogin && (
                <p className="mt-2 text-xs text-slate-400">
                  Password must contain at least 6 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {/* Guest Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">
                Continue as guest
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Login
