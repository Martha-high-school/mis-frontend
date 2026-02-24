"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "react-toastify"
import { 
  Mail, 
  Search, 
  Edit, 
  Trash2, 
  UserX, 
  UserCheck, 
  RefreshCw,
  Loader2
} from "lucide-react"
import { userService, type User } from "@/services/user.service"
import { InviteUserDialog } from "@/components/director/user-management/invite-user-dialog"
import { EditUserDialog } from "@/components/director/user-management/edit-user-dialog"
import { DeleteUserDialog } from "@/components/director/user-management/delete-user-confirmation"

function UserManagementContent() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const breadcrumbs = [
    { label: "Dashboard" },
    { label: "User Management" }
  ]

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getAllUsers()
      setUsers(data.users)
    } catch (err: any) {
      toast.error(err.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (!user) return null

  const handleInviteSuccess = () => {
    toast.success("Invitation sent successfully! The user will receive an email with setup instructions.")
    loadUsers()
  }

  const handleEditSuccess = () => {
    toast.success("User updated successfully!")
    loadUsers()
  }

  const handleDeleteSuccess = () => {
    toast.success("User deleted successfully!")
    loadUsers()
  }

  const handleSuspend = async (userId: string) => {
    try {
      setActionLoading(userId)
      await userService.suspendUser(userId)
      toast.success("User suspended successfully!")
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend user")
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      setActionLoading(userId)
      await userService.activateUser(userId)
      toast.success("User activated successfully!")
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to activate user")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter
    const matchesStatus = statusFilter === "All Statuses" || u.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; className?: string }> = {
      ACTIVE: { variant: "default", label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      PENDING: { variant: "secondary", label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
      SUSPENDED: { variant: "destructive", label: "Suspended" },
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      director: "Director",
      head_teacher: "Head Teacher",
      class_teacher: "Class Teacher",
      bursar: "Bursar",
      DIRECTOR: "Director",
      HEAD_TEACHER: "Head Teacher",
      CLASS_TEACHER: "Class Teacher",
      BURSER: "Bursar",
    }
    return roleMap[role] || role
  }

  if (isLoading) {
    return (
      <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-slate-500">Loading users...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => loadUsers()} variant="outline" className="h-10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setInviteDialogOpen(true)} className="h-10">
              <Mail className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Filters - Compact single row */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 min-w-[160px]">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Roles">All Roles</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="head_teacher">Head Teacher</SelectItem>
                    <SelectItem value="class_teacher">Class Teacher</SelectItem>
                    <SelectItem value="bursar">Bursar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-[160px]">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending Setup</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(roleFilter !== "All Roles" || statusFilter !== "All Statuses") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setRoleFilter("All Roles")
                    setStatusFilter("All Statuses")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Staff Members <span className="text-slate-500">({filteredUsers.length})</span>
            </p>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Email</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Role</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 w-[100px]">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{u.email}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{getRoleDisplay(u.role)}</TableCell>
                        <TableCell>{getStatusBadge(u.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              {/* Edit Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setEditDialogOpen(true)
                                    }}
                                    disabled={actionLoading === u.id}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit User</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Suspend/Activate Button */}
                              {u.status === "ACTIVE" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                      onClick={() => handleSuspend(u.id)}
                                      disabled={actionLoading === u.id}
                                    >
                                      {actionLoading === u.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <UserX className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Suspend User</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              
                              {u.status === "SUSPENDED" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                      onClick={() => handleActivate(u.id)}
                                      disabled={actionLoading === u.id}
                                    >
                                      {actionLoading === u.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <UserCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Activate User</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Delete Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setDeleteDialogOpen(true)
                                    }}
                                    disabled={actionLoading === u.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={handleInviteSuccess}
      />
      
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        user={selectedUser}
      />
      
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />
    </MainLayout>
  )
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredPermissions={["users.view"]}>
      <UserManagementContent />
    </ProtectedRoute>
  )
}