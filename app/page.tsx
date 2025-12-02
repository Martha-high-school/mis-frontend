"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const dashboardRoutes: Record<string, string> = {
    director: "/dashboard/director",
    head_teacher: "/dashboard/headteacher",
    class_teacher: "/dashboard/classteacher",
    bursar: "/dashboard/bursar",
  }

  useEffect(() => {
    if (!isLoading) {
      if (user?.role) {
        const destination = dashboardRoutes[user.role] || "/auth/login"
        router.push(destination)
      } else {
        router.push("/auth/login")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return null
}