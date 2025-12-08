"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-toastify"
import { 
  Mail, 
  Search, 
  MoreHorizontal,
  Edit, 
  Trash2, 
  UserX, 
  UserCheck, 
  RefreshCw
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
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  if (!user) return null

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
      await userService.suspendUser(userId)
      toast.success("User suspended successfully!")
      loadUsers()

    } catch (err: any) {
      toast.error(err.message || "Failed to suspend users")
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      await userService.activateUser(userId)
      toast.success("User activated successfully!")
      loadUsers()

    } catch (err: any) {
      toast.error(err.message || "Failed to load users")
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
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      PENDING: { variant: "secondary", label: "Pending Setup" },
      SUSPENDED: { variant: "destructive", label: "Suspended" },
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      director: "Director",
      head_teacher: "Head Teacher",
      class_teacher: "Class Teacher",
      bursar: "Bursar",
      // Legacy uppercase support
      DIRECTOR: "Director",
      HEAD_TEACHER: "Head Teacher",
      CLASS_TEACHER: "Class Teacher",
      BURSER: "Bursar",
    }
    return roleMap[role] || role
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management" }
  ]

  if (isLoading) {
    return (
      <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout userRole={user.role}  userName={user.name} breadcrumbs={breadcrumbs}>
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
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 min-w-[160px]">
                <label className="text-xs font-medium">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9">
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
                <label className="text-xs font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
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
        <Card className="overflow-visible">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Staff Members <span className="text-slate-500">({filteredUsers.length})</span>
            </p>
          </div>
          <CardContent className="p-0 overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Email</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Role</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <TableCell className="font-medium">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{getRoleDisplay(u.role)}</TableCell>
                        <TableCell>{getStatusBadge(u.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              {u.status === "ACTIVE" ? (
                                <DropdownMenuItem
                                  onClick={() => handleSuspend(u.id)}
                                  className="text-orange-600"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleActivate(u.id)}
                                  className="text-green-600"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    <ProtectedRoute allowedRoles={["director"]}>
      <UserManagementContent />
    </ProtectedRoute>
  )
}