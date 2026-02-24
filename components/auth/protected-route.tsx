"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/contexts/permission-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * @deprecated Use `requiredPermissions` instead.
   * Kept for backwards compatibility during migration.
   */
  allowedRoles?: Array<"director" | "head_teacher" | "class_teacher" | "bursar">
  /**
   * Permission codes required to access this route.
   * User needs ANY ONE of these permissions (OR logic).
   * Example: requiredPermissions={["fees.view", "fees.view_reports"]}
   */
  requiredPermissions?: string[]
  /**
   * If true, user needs ALL listed permissions (AND logic).
   * Default: false (OR logic).
   */
  requireAll?: boolean
  /**
   * Module name — if provided, checks if user can access this sidebar module.
   * Simpler alternative to listing individual permissions.
   * Example: module="fees"
   */
  module?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  module,
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth()
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isLoading: permLoading,
  } = usePermissions()
  const router = useRouter()

  const isLoading = authLoading || permLoading

  // Compute access result synchronously (no useEffect redirect)
  const accessAllowed = (() => {
    if (isLoading || !user) return null // still loading — undecided

    // Director always has full access
    if (user.role === "director") return true

    // Check module access
    if (module && !canAccessModule(module)) return false

    // Check permission-based access
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requireAll
        ? hasAllPermissions(...requiredPermissions)
        : hasAnyPermission(...requiredPermissions)
    }

    // Backwards compatible: check role-based access
    if (allowedRoles && allowedRoles.length > 0 && !requiredPermissions && !module) {
      return allowedRoles.includes(user.role)
    }

    // No restrictions defined — allow
    return true
  })()

  // Redirect side-effects
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (accessAllowed === false) {
      router.push("/unauthorized")
    }
  }, [user, isLoading, accessAllowed, router])

  // --- Render ---

  if (isLoading || accessAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || accessAllowed === false) return null

  return <>{children}</>
}
