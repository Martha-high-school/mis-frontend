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


const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
)

function hydratePermissions(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem("userPermissions")
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
  return new Set()
}

function hydrateSidebar(): SidebarItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("userSidebar")
    if (raw) return JSON.parse(raw) as SidebarItem[]
  } catch { /* ignore */ }
  return []
}

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  // Hydrate from cache synchronously so the first render is never "empty"
  const [permissions, setPermissions] = useState<Set<string>>(hydratePermissions)
  const [sidebar, setSidebar] = useState<SidebarItem[]>(hydrateSidebar)
  // `hasFetched` ensures ProtectedRoute won't redirect until a real API
  // call has completed (or failed) at least once for this session.
  const [hasFetched, setHasFetched] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Derived loading flag – true while auth is resolving OR while we haven't
  // completed the first permission fetch for an authenticated user.
  const isLoading = !isAuthenticated
    ? false
    : !hasFetched || isFetching

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions(new Set())
      setSidebar([])
      setHasFetched(false)
      return
    }

    try {
      setIsFetching(true)
      const data: MyPermissionsResponse =
        await permissionService.getMyPermissions()

      const newPerms = new Set(data.permissions)
      setPermissions(newPerms)
      setSidebar(data.sidebar)

      // Persist for next hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("userPermissions", JSON.stringify(data.permissions))
        localStorage.setItem("userSidebar", JSON.stringify(data.sidebar))
      }
    } catch (error) {
      console.error("Failed to load permissions:", error)
      // Keep whatever was hydrated from cache – don't wipe it
    } finally {
      setIsFetching(false)
      setHasFetched(true)
    }
  }, [isAuthenticated, user])

  // Load permissions when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPermissions()
    }
  }, [isAuthenticated, user, loadPermissions])

  // Clear on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setPermissions(new Set())
      setSidebar([])
      setHasFetched(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("userPermissions")
        localStorage.removeItem("userSidebar")
      }
    }
  }, [isAuthenticated])


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

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider")
  }
  return context
}
