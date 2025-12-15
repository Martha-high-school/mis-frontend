"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import { ArrowLeft, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await apiClient.post("/auth/forgot-password", { email })

      toast.success(`A password reset link has been sent to ${email}`)

    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmail = (value: string) => {
    setEmail(value)
    if (error) {
      setError("")
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

      {/* Right Side - Forgot Password Form */}
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
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password?</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your email to receive a password reset link
              </CardDescription>
              {/* Mobile tagline */}
              <p className="text-sm text-primary font-medium mt-2 lg:hidden">
                Martah High School - Empowering to Excel
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => updateEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-10 border-2 ${error ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
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