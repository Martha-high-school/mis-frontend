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
import { Checkbox } from "@/components/ui/checkbox"
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
  ChevronDown,
  Info,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Calendar,
  School,
  FileText,
  DollarSign,
  TrendingUp,
  ClipboardList,
  FileDown,
  PenTool,
} from "lucide-react"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"

// ============================================================================
// FRIENDLY LABELS
// ============================================================================

const MODULE_META: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard:      { label: "Dashboard",               icon: LayoutDashboard },
  users:          { label: "User Management",          icon: Users },
  permissions:    { label: "Permissions",              icon: Shield },
  academic_years: { label: "Academic Years & Terms",   icon: Calendar },
  classes:        { label: "Classes",                  icon: School },
  academics:      { label: "Academics",                icon: BookOpen },
  students:       { label: "Students",                 icon: GraduationCap },
  promotions:     { label: "Promotions",               icon: TrendingUp },
  reports:        { label: "Reports & Comments",       icon: FileText },
  report_cards:   { label: "Report Cards",             icon: ClipboardList },
  pdf_reports:    { label: "PDF Reports",              icon: FileDown },
  fees:           { label: "Fees & Payments",          icon: DollarSign },
  signatures:     { label: "Signatures",               icon: PenTool },
}

/** Human-friendly permission names (keyed by code). Falls back to the
 *  backend description when a code isn't listed here. */
const PERMISSION_LABELS: Record<string, string> = {
  // Dashboard
  "dashboard.view":               "Access own dashboard",
  "dashboard.view_director":      "View Director dashboard",
  "dashboard.view_head_teacher":  "View Head Teacher dashboard",
  "dashboard.view_class_teacher": "View Class Teacher dashboard",
  "dashboard.view_bursar":        "View Bursar dashboard",
  // Users
  "users.view":            "View all users",
  "users.invite":          "Invite new users",
  "users.edit":            "Edit user details",
  "users.suspend":         "Suspend accounts",
  "users.activate":        "Activate accounts",
  "users.delete":          "Delete accounts",
  "users.view_audit_logs": "View audit logs",
  "users.view_teachers":   "View teachers list",
  // Permissions
  "permissions.view":   "View permissions",
  "permissions.assign": "Assign or revoke permissions",
  // Academic Years
  "academic_years.view":            "View academic years",
  "academic_years.create":          "Create academic years",
  "academic_years.set_current":     "Set current year / term",
  "academic_years.configure_terms": "Configure term dates",
  "academic_years.complete_term":   "Mark term as completed",
  // Classes
  "classes.view":              "View all classes",
  "classes.view_own":          "View own assigned classes",
  "classes.create":            "Create new classes",
  "classes.edit":              "Edit class details",
  "classes.delete":            "Delete classes",
  "classes.assign_teacher":    "Assign class teacher",
  "classes.view_students":     "View students in class",
  "classes.setup_subjects":    "Set up class subjects",
  "classes.manage_instructors":"Manage subject instructors",
  // Academics
  "academics.view":               "View academic data",
  "academics.manage_subjects":    "Manage subjects",
  "academics.manage_competences": "Manage competences",
  "academics.manage_assessments": "Enter / edit assessment scores",
  "academics.view_grades":        "View grades & promotion stats",
  "academics.clone_competences":  "Clone competences from previous year",
  // Students
  "students.view":             "View student list",
  "students.create":           "Add / enroll students",
  "students.edit":             "Edit student details",
  "students.search":           "Search students",
  "students.view_assessments": "View student assessments",
  "students.view_competences": "View competence scores",
  // Promotions
  "promotions.view":     "View promotion data",
  "promotions.process":  "Process promotions",
  "promotions.override": "Override promotion decisions",
  // Reports
  "reports.view":                    "View reports",
  "reports.manage_comments":         "Manage teacher comments",
  "reports.manage_general_comments": "Manage general class comments",
  "reports.auto_generate":           "Auto-generate comments",
  "reports.manage_grade_ranges":     "Manage grade ranges",
  "reports.manage_settings":         "Edit report settings",
  // Report Cards
  "report_cards.view":          "View report cards",
  "report_cards.generate_pdf":  "Generate individual PDF",
  "report_cards.bulk_generate": "Bulk generate report cards",
  // PDF Reports
  "pdf_reports.generate":      "Generate PDF reports",
  "pdf_reports.bulk_generate": "Bulk generate PDF reports",
  // Fees
  "fees.view":               "View fee information",
  "fees.view_student_status":"View student fee status",
  "fees.set_fees":           "Set / update fee structures",
  "fees.bulk_set_fees":      "Bulk set class fees",
  "fees.record_payment":     "Record payments",
  "fees.void_payment":       "Void / delete payments",
  "fees.view_reports":       "View financial reports",
  // Signatures
  "signatures.manage": "Manage own signature",
}

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
      u.role.toLowerCase().includes(search.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "director":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "head_teacher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "class_teacher":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "bursar":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

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
                    selectedUserId === user.id && "bg-primary/5 border-l-4 border-l-primary",
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
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
                          getRoleBadgeColor(user.role),
                        )}
                      >
                        {formatRole(user.role)}
                      </span>
                      {selectedUserId === user.id && <ChevronRight className="h-4 w-4 text-primary" />}
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
// PERMISSION EDITOR PANEL  (checkbox layout, grouped by module)
// ============================================================================

function PermissionEditorPanel({
  selectedUser,
  allModules,
  userPermissions,
  loading,
  saving,
  onTogglePermission,
  onToggleAllModule,
  onSave,
  onReset,
}: {
  selectedUser: User | null
  allModules: PermissionModule[]
  userPermissions: UserPermissionDetails | null
  loading: boolean
  saving: boolean
  onTogglePermission: (code: string, enabled: boolean) => void
  onToggleAllModule: (moduleName: string, enabled: boolean, codes: string[]) => void
  onSave: () => void
  onReset: () => void
}) {
  // Track which modules are collapsed (all open by default)
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set())

  const toggleModule = (mod: string) =>
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      next.has(mod) ? next.delete(mod) : next.add(mod)
      return next
    })

  const effectiveMap = new Map<string, PermissionDetail>()
  userPermissions?.permissions.forEach((p) => {
    effectiveMap.set(p.code, p)
  })

  const isDirector = selectedUser?.role === "director"

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

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
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {selectedUser.firstName} {selectedUser.lastName}
            </CardTitle>
            <CardDescription className="mt-1">
              Role:{" "}
              <Badge variant="secondary" className="ml-1 capitalize">
                {formatRole(selectedUser.role)}
              </Badge>
              {isDirector && (
                <span className="ml-2 text-amber-600 text-xs font-medium">
                  (Full access - cannot be restricted)
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
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Changes
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
              The Director role automatically has all permissions. This cannot be changed.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="p-4 space-y-4">
              {allModules.map((mod) => {
                const meta = MODULE_META[mod.module] ?? { label: mod.label, icon: Shield }
                const Icon = meta.icon
                const isCollapsed = collapsedModules.has(mod.module)

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
                const totalCount = modulePerms.length
                const allEnabled = enabledCount === totalCount
                const someEnabled = enabledCount > 0 && !allEnabled
                const allCodes = modulePerms.map((p) => p.code)

                return (
                  <div key={mod.module} className="rounded-lg border overflow-hidden">
                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                      <Checkbox
                        checked={allEnabled ? true : someEnabled ? "indeterminate" : false}
                        onCheckedChange={(checked) =>
                          onToggleAllModule(mod.module, checked === true, allCodes)
                        }
                        aria-label={`Toggle all ${meta.label} permissions`}
                      />

                      <button
                        onClick={() => toggleModule(mod.module)}
                        className="flex flex-1 items-center gap-2.5 text-left"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{meta.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                          {enabledCount} / {totalCount}
                        </span>
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Permission rows */}
                    {!isCollapsed && (
                      <div className="divide-y">
                        {modulePerms.map((perm) => {
                          const friendlyLabel =
                            PERMISSION_LABELS[perm.code] ?? perm.description
                          return (
                            <label
                              key={perm.code}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={perm.effective}
                                onCheckedChange={(checked) =>
                                  onTogglePermission(perm.code, checked === true)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{friendlyLabel}</span>
                                {perm.fromRole && !perm.override && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-[10px] h-5 align-middle"
                                  >
                                    Role Default
                                  </Badge>
                                )}
                                {perm.override && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "ml-2 text-[10px] h-5 align-middle",
                                      perm.override.granted
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                    )}
                                  >
                                    {perm.override.granted ? "Granted" : "Revoked"}
                                  </Badge>
                                )}
                              </div>
                            </label>
                          )
                        })}
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

    if (userPermissions) {
      setUserPermissions({
        ...userPermissions,
        permissions: userPermissions.permissions.map((p) =>
          p.code === code ? { ...p, effective: enabled } : p,
        ),
      })
    }
  }

  const handleToggleAllModule = (_moduleName: string, enabled: boolean, codes: string[]) => {
    const newGrants = new Set(localGrants)
    const newRevokes = new Set(localRevokes)

    for (const code of codes) {
      if (enabled) {
        newGrants.add(code)
        newRevokes.delete(code)
      } else {
        newRevokes.add(code)
        newGrants.delete(code)
      }
    }

    setLocalGrants(newGrants)
    setLocalRevokes(newRevokes)

    if (userPermissions) {
      const codeSet = new Set(codes)
      setUserPermissions({
        ...userPermissions,
        permissions: userPermissions.permissions.map((p) =>
          codeSet.has(p.code) ? { ...p, effective: enabled } : p,
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
        { label: "Dashboard", href: "/" },
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
            onToggleAllModule={handleToggleAllModule}
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