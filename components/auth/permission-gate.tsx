"use client"

import { usePermissions } from "@/contexts/permission-context"

interface PermissionGateProps {
  children: React.ReactNode
  /**
   * Permission codes to check. User needs ANY ONE (default) or ALL (if requireAll=true).
   * Example: permissions={["fees.record_payment"]}
   */
  permissions?: string[]
  /**
   * If true, user must have ALL listed permissions.
   */
  requireAll?: boolean
  /**
   * Module name — shows children if user has any permission in this module.
   * Simpler alternative to listing specific permissions.
   */
  module?: string
  /**
   * Content to show if user does NOT have access. Default: nothing.
   */
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permissions,
  requireAll = false,
  module,
  fallback = null,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, canAccessModule } =
    usePermissions()

  let hasAccess = true

  if (module) {
    hasAccess = canAccessModule(module)
  }

  if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}