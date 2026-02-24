"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PermissionGate } from "@/components/auth/permission-gate"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { classService, ClassData } from "@/services/class.service"
import { Trash2, Edit } from "lucide-react"

function ClassesContent() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses()
      setClasses(data.classes)
    } catch (err) {
      console.error("Error loading classes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleDelete = async (cls: ClassData) => {
    setDeleting(true)
    try {
      await classService.deleteClass(cls.id!)
      setClasses((prev) => prev.filter((c) => c.id !== cls.id))
    } catch (err) {
      console.error("Error deleting class:", err)
    } finally {
      setDeleting(false)
      setSelectedClass(null)
    }
  }

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase()) ||
      (c.stream?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  if (!user) return null

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Classes" }]

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by class name, level, or stream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
            />
          </div>
          {/* Now visible to director too — anyone with classes.create */}
          <PermissionGate permissions={["classes.create"]}>
            <Link href="/classes/new">
              <Button className="h-10">Create Class</Button>
            </Link>
          </PermissionGate>
        </div>

        <Card className="overflow-visible">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              All Classes <span className="text-slate-500">({filtered.length})</span>
            </p>
          </div>
          <CardContent className="p-0 overflow-visible">
            {loading ? (
              <p className="text-muted-foreground p-4">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground p-4">No classes found.</p>
            ) : (
              <div className="overflow-x-auto overflow-y-visible">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Level</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Stream</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Teacher</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Students</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((cls) => (
                      <TableRow key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <TableCell className="text-center">{cls.name}</TableCell>
                        <TableCell className="text-center">{cls.level}</TableCell>
                        <TableCell className="text-center">{cls.stream ?? "-"}</TableCell>
                        <TableCell className="text-center">
                          {cls.classTeacher
                            ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">{cls.studentCount ?? 0}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{cls.status ?? "Active"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <PermissionGate permissions={["classes.edit"]}>
                              <Link href={`/classes/${cls.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                              </Link>
                            </PermissionGate>
                            <PermissionGate permissions={["classes.delete"]}>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setSelectedClass(cls)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{selectedClass?.name}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => selectedClass && handleDelete(selectedClass)}
                                      disabled={deleting}
                                    >
                                      {deleting ? "Deleting..." : "Yes, Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function ClassesPage() {
  return (
    <ProtectedRoute requiredPermissions={["classes.view", "classes.view_own"]}>
      <ClassesContent />
    </ProtectedRoute>
  )
}