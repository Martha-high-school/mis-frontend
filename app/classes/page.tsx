"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="flex justify-between gap-4">
          <Input
            placeholder="Search by class name, level, or stream"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          {user.role === "head_teacher" && (
            <Link href="/classes/new">
              <Button>Create Class</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Classes ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground">No classes found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{cls.level}</TableCell>
                      <TableCell>{cls.stream ?? "-"}</TableCell>
                      <TableCell>
                        {cls.classTeacher
                          ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                          : "-"}
                      </TableCell>
                      <TableCell>{cls.studentCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="default">{cls.status ?? "Active"}</Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Link href={`/classes/${cls.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </Link>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher"]}>
      <ClassesContent />
    </ProtectedRoute>
  )
}
