"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  permissionService,
  type SidebarItem,
  type MyPermissionsResponse,
} from "@/services/permission.service"
import { useAuth } from "@/contexts/auth-context"

// ============================================================================
// TYPES
// ============================================================================

interface PermissionContextType {
  /** Set of permission code strings, e.g. "classes.view", "fees.record_payment" */
  permissions: Set<string>
  /** Sidebar items the current user can see (pre-filtered by backend) */
  sidebar: SidebarItem[]
  /** Check if user has a specific permission */
  hasPermission: (code: string) => boolean
  /** Check if user has ANY of the listed permissions */
  hasAnyPermission: (...codes: string[]) => boolean
  /** Check if user has ALL of the listed permissions */
  hasAllPermissions: (...codes: string[]) => boolean
  /** Check if user can see a specific module in the sidebar */
  canAccessModule: (module: string) => boolean
  /** Whether permissions are still loading */
  isLoading: boolean
  /** Reload permissions from server (e.g. after admin changes) */
  refresh: () => Promise<void>
}

// ============================================================================
// CONTEXT
// ============================================================================

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
)

// ============================================================================
// PROVIDER
// ============================================================================

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<Set<string>>(new Set())
  const [sidebar, setSidebar] = useState<SidebarItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions(new Set())
      setSidebar([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data: MyPermissionsResponse =
        await permissionService.getMyPermissions()

      setPermissions(new Set(data.permissions))
      setSidebar(data.sidebar)

      // Also store in localStorage for quick hydration on next load
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "userPermissions",
          JSON.stringify(data.permissions)
        )
        localStorage.setItem("userSidebar", JSON.stringify(data.sidebar))
      }
    } catch (error) {
      console.error("Failed to load permissions:", error)
      // Try to hydrate from localStorage as fallback
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("userPermissions")
          const cachedSidebar = localStorage.getItem("userSidebar")
          if (cached) setPermissions(new Set(JSON.parse(cached)))
          if (cachedSidebar) setSidebar(JSON.parse(cachedSidebar))
        } catch {
          // ignore parse errors
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Load permissions when user changes
  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  // Clear on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setPermissions(new Set())
      setSidebar([])
      if (typeof window !== "undefined") {
        localStorage.removeItem("userPermissions")
        localStorage.removeItem("userSidebar")
      }
    }
  }, [isAuthenticated])

  // ---- Helpers ----

  const hasPermission = useCallback(
    (code: string) => permissions.has(code),
    [permissions]
  )

  const hasAnyPermission = useCallback(
    (...codes: string[]) => codes.some((c) => permissions.has(c)),
    [permissions]
  )

  const hasAllPermissions = useCallback(
    (...codes: string[]) => codes.every((c) => permissions.has(c)),
    [permissions]
  )

  const canAccessModule = useCallback(
    (module: string) => sidebar.some((item) => item.module === module),
    [sidebar]
  )

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        sidebar,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessModule,
        isLoading,
        refresh: loadPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider")
  }
  return context
}