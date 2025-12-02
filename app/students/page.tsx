"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { studentService, type PaginatedStudent } from "@/services/student.service"
import { classService, type ClassData } from "@/services/class.service"
import { academicYearService, type AcademicYear } from "@/services/accademic-year.service"
import Link from "next/link"
import { toast } from "sonner"

// Simple SVG icon components
const SearchIcon = () => (
  <svg
    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const FilterIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const UploadIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6" />
  </svg>
)

function StudentsContent() {
  const { user } = useAuth()
  const { context, loading: contextLoading } = useAcademicContext()

  // State for filters
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("All Classes")
  const [genderFilter, setGenderFilter] = useState("All Genders")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [feeStatusFilter, setFeeStatusFilter] = useState("All Fee Statuses")

  // State for data
  const [students, setStudents] = useState<PaginatedStudent[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [terms, setTerms] = useState<{ value: string; label: string }[]>([])
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // State for loading
  const [loading, setLoading] = useState(false)

  // Initialize with current context
  useEffect(() => {
    if (context && !selectedYear && !selectedTerm) {
      setSelectedYear(context.year)
      setSelectedTerm(context.termEnum)
    }
  }, [context, selectedYear, selectedTerm])

  // Load academic years on mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const { academicYears } = await academicYearService.getAllAcademicYears()
        setYears(academicYears)
      } catch (error) {
        console.error('Failed to load academic years:', error)
        toast.error('Failed to load academic years')
      }
    }
    loadYears()
  }, [])

  // Load terms when year changes
  useEffect(() => {
    const loadTerms = async () => {
      if (!selectedYear) return

      try {
        // Find the academic year object
        const academicYear = years.find(y => y.year === selectedYear)
        if (!academicYear) return

        const { terms: termConfigs } = await academicYearService.getTermsForYear(academicYear.id)
        setTerms(
          termConfigs.map((t) => ({
            value: t.term,
            label: academicYearService.formatTermName(t.term),
          }))
        )
      } catch (error) {
        console.error('Failed to load terms:', error)
        toast.error('Failed to load terms')
      }
    }
    loadTerms()
  }, [selectedYear, years])

  // Load classes when year/term changes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedYear || !selectedTerm) return

      try {
        const { classes: allClasses } = await classService.getMyClasses()
        setClasses(allClasses)
      } catch (error) {
        console.error('Failed to load classes:', error)
        toast.error('Failed to load classes')
      }
    }
    loadClasses()
  }, [selectedYear, selectedTerm])

  // Load students when filters or pagination changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedYear || !selectedTerm) return

      setLoading(true)
      try {
        const response = await studentService.getStudents({
          year: selectedYear,
          term: selectedTerm,
          classId: classFilter !== 'All Classes' ? classFilter : undefined,
          search: searchTerm || undefined,
          gender: genderFilter !== 'All Genders' ? genderFilter : undefined,
          status: statusFilter !== 'All Statuses' ? statusFilter : undefined,
          feeStatus: feeStatusFilter !== 'All Fee Statuses' ? feeStatusFilter : undefined,
          page: currentPage,
          pageSize,
        })

        setStudents(response.students)
        setTotalPages(response.pagination.totalPages)
        setTotalCount(response.pagination.totalCount)
      } catch (error) {
        console.error('Failed to load students:', error)
        toast.error('Failed to load students')
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [
    selectedYear,
    selectedTerm,
    classFilter,
    searchTerm,
    genderFilter,
    statusFilter,
    feeStatusFilter,
    currentPage,
    pageSize,
  ])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [classFilter, searchTerm, genderFilter, statusFilter, feeStatusFilter])

  if (!user) return null

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      INITIAL: "default",
      PROMOTED: "secondary",
      REPEATED: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getFeeStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Paid: "default",
      Pending: "destructive",
      Partial: "secondary",
      "Not Set": "secondary",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const handleClearFilters = () => {
    setClassFilter("All Classes")
    setGenderFilter("All Genders")
    setStatusFilter("All Statuses")
    setFeeStatusFilter("All Fee Statuses")
    setSearchTerm("")
  }

  const hasActiveFilters =
    classFilter !== "All Classes" ||
    genderFilter !== "All Genders" ||
    statusFilter !== "All Statuses" ||
    feeStatusFilter !== "All Fee Statuses" ||
    searchTerm !== ""

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Students" }]

  if (contextLoading) {
    return (
      <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
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
            <SearchIcon />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <DownloadIcon />
              <span className="ml-2">Export</span>
            </Button>
            <Button variant="outline">
              <UploadIcon />
              <span className="ml-2">Import</span>
            </Button>
            {user.role === "head_teacher" && (
              <Link href="/students/new">
                <Button>
                  <PlusIcon />
                  <span className="ml-2">Add Student</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FilterIcon />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select
                  value={selectedYear?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedYear(Number(value))
                    setSelectedTerm(null) // Reset term when year changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.year.toString()}>
                        {year.year} {year.isCurrent && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Term</label>
                <Select
                  value={selectedTerm || ""}
                  onValueChange={setSelectedTerm}
                  disabled={!selectedYear || terms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={classFilter} onValueChange={setClassFilter} disabled={!selectedYear || !selectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Classes">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id!}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Genders">All Genders</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    <SelectItem value="INITIAL">Initial</SelectItem>
                    <SelectItem value="PROMOTED">Promoted</SelectItem>
                    <SelectItem value="REPEATED">Repeated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fee Status</label>
                <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Fee Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Fee Statuses">All Fee Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Not Set">Not Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Students ({totalCount} total)
              {selectedYear && selectedTerm && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  • Year {selectedYear} • {academicYearService.formatTermName(selectedTerm as any)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  {!selectedYear || !selectedTerm
                    ? "Please select a year and term to view students"
                    : "No students found"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Guardian Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.guardianPhone}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>{getFeeStatusBadge(student.feeStatus)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.role === "head_teacher" && (
                              <Link href={`/students/${student.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <EditIcon />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
                      {totalCount} students
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRightIcon />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher", "class_teacher", "bursar"]}>
      <StudentsContent />
    </ProtectedRoute>
  )
}