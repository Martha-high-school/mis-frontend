"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"

export default function AccountSetupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid or missing setup token")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await apiClient.post("/auth/setup-account", {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      })

      toast.success("Account setup successful! Redirecting to login...")

      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)

    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to setup account. The link may have expired or already been used."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        
        {/* Floating Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        
        {/* Decorative Shapes */}
        <div className="absolute top-10 right-1/4 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-white/15 rounded-full" />
        
        {/* Accent Lines */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 right-1/3 w-px h-40 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <Image
                src="/images/school-logo.png"
                alt="Martah High School"
                width={180}
                height={180}
                className="rounded-xl"
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Martah High School</h1>
            <p className="text-xl text-white/90">Management Information System</p>
            <p className="text-lg font-medium mt-4 text-white/80">Empowering to Excel</p>
          </div>
          
          {/* Bottom Decorative Elements */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150" />
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      </div>

      {/* Right Side - Account Setup Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/5">
        <Card className="w-full max-w-md border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-4">
            {/* Mobile Logo - Only visible on small screens */}
            <div className="flex justify-center lg:hidden">
              <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-slate-100">
                <Image
                  src="/images/school-logo.png"
                  alt="Martah High School"
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Complete Your Account Setup</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Please provide your details to get started
              </CardDescription>
              {/* Mobile tagline */}
              <p className="text-sm text-primary font-medium mt-2 lg:hidden">
                Martah High School - Empowering to Excel
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-10 border-2 ${errors.firstName ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-10 border-2 ${errors.lastName ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Create Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-10 border-2 pr-10 ${errors.password ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password ? (
                  <p className="text-sm text-red-600">{errors.password}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-10 border-2 pr-10 ${errors.confirmPassword ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-slate-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up Account...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Need help? Contact your administrator</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}