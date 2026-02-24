"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PermissionGate } from "@/components/auth/permission-gate"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const SearchIcon = () => (
  <svg
    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

// Mock teacher data with auto-generated initials
const mockTeachers = [
  {
    id: "TCH001",
    name: "Peter Ssemakula",
    initials: "PS",
    email: "p.ssemakula@marthahigh.edu.ug",
    phone: "+256 700 111 222",
    subjects: ["Mathematics", "Physics"],
    classes: ["S.4 East", "S.5 North"],
    employmentDate: "2020-01-15",
    status: "Active",
    qualification: "Bachelor of Science in Mathematics",
  },
  {
    id: "TCH002",
    name: "Mary Nakato",
    initials: "MN",
    email: "m.nakato@marthahigh.edu.ug",
    phone: "+256 700 333 444",
    subjects: ["English", "Literature"],
    classes: ["S.2 West", "S.3 South"],
    employmentDate: "2019-08-20",
    status: "Active",
    qualification: "Bachelor of Arts in English",
  },
  {
    id: "TCH003",
    name: "James Okwir",
    initials: "JO",
    email: "j.okwir@marthahigh.edu.ug",
    phone: "+256 700 555 666",
    subjects: ["Chemistry", "Biology"],
    classes: ["S.5 East", "S.6 West"],
    employmentDate: "2021-03-10",
    status: "Active",
    qualification: "Bachelor of Science in Chemistry",
  },
]

function TeachersContent() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState(mockTeachers)
  const [searchTerm, setSearchTerm] = useState("")

  if (!user) return null

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Active: "default",
      Inactive: "secondary",
      Suspended: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const breadcrumbs = [{ label: "Dashboard"}, { label: "Teachers" }]

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <SearchIcon />
            <Input
              placeholder="Search teachers by name, initials, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <PermissionGate permissions={["users.invite"]}>
              <Link href="/teachers/new">
                <Button>
                  <PlusIcon />
                  <span className="ml-2">Add Teacher</span>
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Initials</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {teacher.initials}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.map((cls) => (
                          <Badge key={cls} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <PermissionGate permissions={["users.edit"]}>
                          <Link href={`/teachers/${teacher.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <EditIcon />
                            </Button>
                          </Link>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function TeachersPage() {
  return (
    <ProtectedRoute requiredPermissions={["users.view_teachers"]}>
      <TeachersContent />
    </ProtectedRoute>
  )
}