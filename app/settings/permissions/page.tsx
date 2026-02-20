"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import {
  permissionService,
  type PermissionModule,
  type UserPermissionDetails,
  type PermissionDetail,
} from "@/services/permission.service"
import { userService, type User } from "@/services/user.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Search,
  Users,
  Loader2,
  RotateCcw,
  Save,
  ChevronRight,
  Info,
} from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"

// ============================================================================
// USER LIST PANEL
// ============================================================================

function UserListPanel({
  users,
  selectedUserId,
  onSelect,
  loading,
}: {
  users: User[]
  selectedUserId: string | null
  onSelect: (user: User) => void
  loading: boolean
}) {
  const [search, setSearch] = useState("")

  const filtered = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "director": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "head_teacher": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "class_teacher": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "bursar": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Staff Members
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-320px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
          ) : (
            <div className="divide-y">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-all hover:bg-muted/50",
                    selectedUserId === user.id && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", getRoleBadgeColor(user.role))}>
                        {user.role.replace(/_/g, " ")}
                      </span>
                      {selectedUserId === user.id && (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// PERMISSION EDITOR PANEL
// ============================================================================

function PermissionEditorPanel({
  selectedUser,
  allModules,
  userPermissions,
  loading,
  saving,
  onTogglePermission,
  onSave,
  onReset,
}: {
  selectedUser: User | null
  allModules: PermissionModule[]
  userPermissions: UserPermissionDetails | null
  loading: boolean
  saving: boolean
  onTogglePermission: (code: string, enabled: boolean) => void
  onSave: () => void
  onReset: () => void
}) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const effectiveMap = new Map<string, PermissionDetail>()
  userPermissions?.permissions.forEach((p) => {
    effectiveMap.set(p.code, p)
  })

  const isDirector = selectedUser?.role === "director"

  if (!selectedUser) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center py-16">
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Select a staff member to manage their permissions</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {selectedUser.firstName} {selectedUser.lastName}
            </CardTitle>
            <CardDescription className="mt-1">
              Role: <Badge variant="secondary" className="ml-1">{selectedUser.role.replace(/_/g, " ")}</Badge>
              {isDirector && (
                <span className="ml-2 text-amber-600 text-xs font-medium">
                  (All permissions — cannot be restricted)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onReset} disabled={saving || isDirector}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving || isDirector}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isDirector ? (
          <div className="flex items-center gap-3 p-4 m-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Directors automatically have all permissions. This cannot be changed.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="p-4 space-y-3">
              {allModules.map((mod) => {
                const isExpanded = expandedModule === mod.module
                const modulePerms = mod.permissions.map((p) => {
                  const detail = effectiveMap.get(p.code)
                  return {
                    ...p,
                    effective: detail?.effective ?? false,
                    fromRole: detail?.fromRole ?? false,
                    override: detail?.override ?? null,
                  }
                })
                const enabledCount = modulePerms.filter((p) => p.effective).length

                return (
                  <div key={mod.module} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedModule(isExpanded ? null : mod.module)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{mod.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {enabledCount}/{modulePerms.length} enabled
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-muted/20">
                        {modulePerms.map((perm) => (
                          <div
                            key={perm.code}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{perm.description}</span>
                                {perm.fromRole && !perm.override && (
                                  <Badge variant="outline" className="text-[10px] h-5">
                                    role default
                                  </Badge>
                                )}
                                {perm.override && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-5"
                                  >
                                    {perm.override.granted ? "granted" : "revoked"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                {perm.code}
                              </p>
                            </div>
                            <Switch
                              checked={perm.effective}
                              onCheckedChange={(checked) =>
                                onTogglePermission(perm.code, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function PermissionsContent() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [allModules, setAllModules] = useState<PermissionModule[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissionDetails | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localGrants, setLocalGrants] = useState<Set<string>>(new Set())
  const [localRevokes, setLocalRevokes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, permsRes] = await Promise.all([
          userService.getAllUsers(),
          permissionService.getAllPermissions(),
        ])
        setUsers(usersRes.users)
        setAllModules(permsRes.modules)
      } catch (err: any) {
        toast.error(err.message || "Failed to load data")
      } finally {
        setLoadingUsers(false)
      }
    }
    load()
  }, [])

  const loadUserPermissions = useCallback(async (userId: string) => {
    setLoadingPerms(true)
    setLocalGrants(new Set())
    setLocalRevokes(new Set())
    try {
      const data = await permissionService.getUserPermissions(userId)
      setUserPermissions(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load permissions")
    } finally {
      setLoadingPerms(false)
    }
  }, [])

  const handleSelectUser = (u: User) => {
    setSelectedUser(u)
    loadUserPermissions(u.id)
  }

  const handleToggle = (code: string, enabled: boolean) => {
    const newGrants = new Set(localGrants)
    const newRevokes = new Set(localRevokes)

    if (enabled) {
      newGrants.add(code)
      newRevokes.delete(code)
    } else {
      newRevokes.add(code)
      newGrants.delete(code)
    }

    setLocalGrants(newGrants)
    setLocalRevokes(newRevokes)

    // Immediate UI feedback
    if (userPermissions) {
      setUserPermissions({
        ...userPermissions,
        permissions: userPermissions.permissions.map((p) =>
          p.code === code ? { ...p, effective: enabled } : p
        ),
      })
    }
  }

  const handleSave = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      if (localGrants.size > 0) {
        await permissionService.grantPermissions(selectedUser.id, Array.from(localGrants))
      }
      if (localRevokes.size > 0) {
        await permissionService.revokePermissions(selectedUser.id, Array.from(localRevokes))
      }
      toast.success("Permissions updated successfully")
      setLocalGrants(new Set())
      setLocalRevokes(new Set())
      await loadUserPermissions(selectedUser.id)
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await permissionService.resetPermissions(selectedUser.id)
      toast.success("Permissions reset to role defaults")
      setLocalGrants(new Set())
      setLocalRevokes(new Set())
      await loadUserPermissions(selectedUser.id)
    } catch (err: any) {
      toast.error(err.message || "Failed to reset permissions")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <MainLayout
      userRole={user.role}
      userName={user.name}
      pageTitle="Permission Management"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
        { label: "Permissions" },
      ]}
      showBackButton
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-4">
          <UserListPanel
            users={users}
            selectedUserId={selectedUser?.id || null}
            onSelect={handleSelectUser}
            loading={loadingUsers}
          />
        </div>
        <div className="lg:col-span-8">
          <PermissionEditorPanel
            selectedUser={selectedUser}
            allModules={allModules}
            userPermissions={userPermissions}
            loading={loadingPerms}
            saving={saving}
            onTogglePermission={handleToggle}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>
      </div>
    </MainLayout>
  )
}

export default function PermissionsPage() {
  return (
    <ProtectedRoute requiredPermissions={["permissions.view"]}>
      <PermissionsContent />
    </ProtectedRoute>
  )
}