"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { feeService, StudentWithFees } from "@/services/fee.service"
import { classService } from "@/services/class.service"
import { academicYearService } from "@/services/accademic-year.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DollarSign,
  Search,
  Plus,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Receipt,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  ArrowRight,
  Info,
  History
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Pagination constants
const ITEMS_PER_PAGE = 10

function FeeManagementContent() {
  const { user } = useAuth()
  const { context: academicContext, loading: contextLoading } = useAcademicContext()

  // State
  const [students, setStudents] = useState<StudentWithFees[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL")
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("ALL")
  
  // Academic years from database
  const [availableYears, setAvailableYears] = useState<any[]>([])
  const [loadingYears, setLoadingYears] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE)
  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Set Fee Dialog
  const [showSetFeeDialog, setShowSetFeeDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null)
  const [feeData, setFeeData] = useState({
    tuitionFee: "",
    otherFees: "",
    notes: ""
  })
  const [feeTermType, setFeeTermType] = useState<"current" | "next">("current")

  // Payment Dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH" as "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE",
    referenceNumber: "",
    notes: ""
  })

  // Bulk Set Fee Dialog
  const [showBulkSetDialog, setShowBulkSetDialog] = useState(false)
  const [bulkFeeData, setBulkFeeData] = useState({
    tuitionFee: "",
    otherFees: "",
    notes: ""
  })
  const [bulkFeeTermType, setBulkFeeTermType] = useState<"current" | "next">("current")

  // Student Detail Dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [studentHistory, setStudentHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Fee Management" }
  ]

  // Initialize - Load academic years from database
  useEffect(() => {
    loadAcademicYears()
  }, [])

  useEffect(() => {
    if (academicContext && availableYears.length > 0) {
      const currentYear = academicContext.year?.toString()
      if (currentYear && availableYears.find(y => y.year.toString() === currentYear)) {
        setSelectedYear(currentYear)
      } else if (availableYears.length > 0) {
        setSelectedYear(availableYears[0].year.toString())
      }
      setSelectedTerm(academicContext.term?.toString() || "1")
    }
  }, [academicContext, availableYears])

  useEffect(() => {
    if (selectedYear && selectedTerm) {
      fetchStudents()
      fetchClasses()
    }
  }, [selectedYear, selectedTerm, statusFilter, selectedClass])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYear, selectedTerm, statusFilter, selectedClass, search])

  // Load academic years from database
  const loadAcademicYears = async () => {
    setLoadingYears(true)
    try {
      const response = await academicYearService.getAllAcademicYears()
      const years = response.academicYears || []
      setAvailableYears(years)
    } catch (error: any) {
      console.error("Error loading academic years:", error)
      showAlert("error", "Failed to load academic years")
    } finally {
      setLoadingYears(false)
    }
  }

  // Fetch functions
  const fetchStudents = async () => {
    if (!selectedYear || !selectedTerm) return

    setLoading(true)
    try {
      const params: any = {
        year: Number(selectedYear),
        term: Number(selectedTerm),
        search: search.trim() || undefined
      }

      if (statusFilter !== "ALL") {
        params.status = statusFilter
      }

      if (selectedClass !== "ALL") {
        params.classId = selectedClass
      }

      const data = await feeService.getAllStudentsWithFees(params)
      setStudents(data.students)
    } catch (error: any) {
      console.error("Error fetching students:", error)
      showAlert("error", "Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await classService.getAllClasses()
      setClasses(response.classes || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchStudentHistory = async (studentId: string) => {
    setLoadingHistory(true)
    try {
      const response = await feeService.getStudentFeeHistory(studentId)
      setStudentHistory(response.history || [])
    } catch (error) {
      console.error("Error fetching student history:", error)
      showAlert("error", "Failed to load student fee history")
    } finally {
      setLoadingHistory(false)
    }
  }

  // Export student financial statement
  const exportStudentStatement = async (student: StudentWithFees) => {
    try {
      showAlert("success", "Generating financial statement...")
      window.open(`/fees/${student.id}`, '_blank')
    } catch (error) {
      showAlert("error", "Failed to generate statement")
    }
  }

  // Handlers
  const handleSetFee = async () => {
    if (!selectedStudent || !feeData.tuitionFee) {
      showAlert("error", "Please enter tuition fee")
      return
    }

    try {
      if (feeTermType === "current") {
        await feeService.setStudentFee({
          studentId: selectedStudent.id,
          year: Number(selectedYear),
          term: Number(selectedTerm),
          tuitionFee: Number(feeData.tuitionFee),
          otherFees: Number(feeData.otherFees) || 0,
          notes: feeData.notes
        })
        showAlert("success", "Fee structure set successfully")
      } else {
        await feeService.setNextTermFee({
          studentId: selectedStudent.id,
          currentYear: Number(selectedYear),
          currentTerm: Number(selectedTerm),
          tuitionFee: Number(feeData.tuitionFee),
          otherFees: Number(feeData.otherFees) || 0,
          notes: feeData.notes
        })
        const nextTermInfo = getNextTermInfo()
        showAlert("success", `Next term fees (${nextTermInfo.year} Term ${nextTermInfo.term}) set successfully`)
      }

      setShowSetFeeDialog(false)
      setFeeData({ tuitionFee: "", otherFees: "", notes: "" })
      setFeeTermType("current")
      fetchStudents()
    } catch (error: any) {
      showAlert("error", error.response?.data?.error || "Failed to set fee")
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentData.amount) {
      showAlert("error", "Please enter payment amount")
      return
    }

    try {
      const result = await feeService.recordPayment({
        studentId: selectedStudent.id,
        year: Number(selectedYear),
        term: Number(selectedTerm),
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber || undefined,
        notes: paymentData.notes || undefined
      })

      showAlert("success", `Payment recorded. New balance: ${formatCurrency(result.updatedBalance)}`)
      setShowPaymentDialog(false)
      setPaymentData({
        amount: "",
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: ""
      })
      fetchStudents()
    } catch (error: any) {
      showAlert("error", error.response?.data?.error || "Failed to record payment")
    }
  }

  const handleBulkSetFees = async () => {
    if (!bulkFeeData.tuitionFee) {
      showAlert("error", "Please enter tuition fee")
      return
    }

    try {
      if (bulkFeeTermType === "current") {
        const params: any = {
          year: Number(selectedYear),
          term: Number(selectedTerm),
          tuitionFee: Number(bulkFeeData.tuitionFee),
          otherFees: Number(bulkFeeData.otherFees) || 0,
          notes: bulkFeeData.notes
        }

        if (selectedClass !== "ALL") {
          params.classId = selectedClass
        }

        const result = await feeService.bulkSetFees(params)
        showAlert("success", `Fees set for ${result.count} students`)
      } else {
        const params: any = {
          currentYear: Number(selectedYear),
          currentTerm: Number(selectedTerm),
          tuitionFee: Number(bulkFeeData.tuitionFee),
          otherFees: Number(bulkFeeData.otherFees) || 0,
          notes: bulkFeeData.notes
        }

        if (selectedClass !== "ALL") {
          params.classId = selectedClass
        }

        const result = await feeService.bulkSetNextTermFees(params)
        showAlert("success", result.message)
      }

      setShowBulkSetDialog(false)
      setBulkFeeData({ tuitionFee: "", otherFees: "", notes: "" })
      setBulkFeeTermType("current")
      fetchStudents()
    } catch (error: any) {
      showAlert("error", error.response?.data?.error || "Failed to set bulk fees")
    }
  }

  const handleViewDetails = async (student: StudentWithFees) => {
    setSelectedStudent(student)
    setShowDetailDialog(true)
    await fetchStudentHistory(student.id)
  }

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getNextTermInfo = () => {
    let nextYear = Number(selectedYear)
    let nextTerm = Number(selectedTerm) + 1
    if (nextTerm > 3) {
      nextYear += 1
      nextTerm = 1
    }
    return { year: nextYear, term: nextTerm }
  }

  // Calculate summary statistics
  const totalExpected = students.reduce((sum, s) => sum + (s.totalExpected || 0), 0)
  const totalPaid = students.reduce((sum, s) => sum + (s.totalPaid || 0), 0)
  const totalOutstanding = students.reduce((sum, s) => sum + (s.balance || 0), 0)
  const totalCarryForward = students.reduce((sum, s) => sum + (s.carryForwardBalance || 0), 0)
  const paidStudents = students.filter(s => s.status === "PAID").length
  const pendingStudents = students.filter(s => s.status === "PENDING").length

  if (contextLoading || loadingYears) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Alerts */}
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{paidStudents}</span> paid, 
                <span className="text-red-600 ml-1">{pendingStudents}</span> pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Carry Forward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalCarryForward)}</div>
              <p className="text-xs text-muted-foreground mt-1">From previous terms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Term Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpected - totalCarryForward)}</div>
              <p className="text-xs text-muted-foreground mt-1">Term {selectedTerm} fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpected)}</div>
              <p className="text-xs text-muted-foreground mt-1">Including carry forward</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : 0}% collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total balance due</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year.id} value={year.year.toString()}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                    <SelectItem value="3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={fetchStudents} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => setShowBulkSetDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Bulk Set Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table with Pagination */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Students ({students.length})</CardTitle>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages || 1}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No students found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 ml-auto">
                                Carry Forward
                                <Info className="h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Balance from previous terms/years</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-right">Term Fees</TableHead>
                        <TableHead className="text-right">Total Expected</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            {student.enrollments?.[0]?.class?.name || "N/A"}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {student.carryForwardBalance > 0 
                              ? formatCurrency(student.carryForwardBalance)
                              : "-"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(student.currentTermExpected || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(student.totalExpected || 0)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(student.totalPaid || 0)}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">
                            {formatCurrency(student.balance || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.status === "PAID" ? "default" : "destructive"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStudent(student)
                                        setShowSetFeeDialog(true)
                                      }}
                                    >
                                      <DollarSign className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Set Fee</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStudent(student)
                                        setShowPaymentDialog(true)
                                      }}
                                    >
                                      <Receipt className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Record Payment</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewDetails(student)}
                                    >
                                      <History className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View History</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Link href={`/fees/${student.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <PaginationItem key={page}>...</PaginationItem>
                          }
                          return null
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Set Fee Dialog - with Current/Next Term tabs */}
        <Dialog open={showSetFeeDialog} onOpenChange={setShowSetFeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Fee Structure</DialogTitle>
              <DialogDescription>
                Set fees for {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={feeTermType} onValueChange={(v) => setFeeTermType(v as "current" | "next")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">
                  <Calendar className="h-4 w-4 mr-2" />
                  Current Term
                </TabsTrigger>
                <TabsTrigger value="next">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Term
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Setting fees for <strong>{selectedYear} Term {selectedTerm}</strong>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="next" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Setting fees for <strong>{getNextTermInfo().year} Term {getNextTermInfo().term}</strong>
                    <br />
                    <span className="text-xs">This will appear as "Next Term Fees" on report cards</span>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tuition Fee *</Label>
                <Input
                  type="number"
                  placeholder="Enter tuition fee"
                  value={feeData.tuitionFee}
                  onChange={(e) => setFeeData({ ...feeData, tuitionFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Other Fees</Label>
                <Input
                  type="number"
                  placeholder="Enter other fees (optional)"
                  value={feeData.otherFees}
                  onChange={(e) => setFeeData({ ...feeData, otherFees: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={feeData.notes}
                  onChange={(e) => setFeeData({ ...feeData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSetFeeDialog(false)
                setFeeTermType("current")
              }}>
                Cancel
              </Button>
              <Button onClick={handleSetFee}>
                Set {feeTermType === "next" ? "Next Term " : ""}Fee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Carry Forward: <span className="text-orange-600 font-medium">{formatCurrency(selectedStudent.carryForwardBalance || 0)}</span></div>
                    <div>Current Term: <span className="font-medium">{formatCurrency(selectedStudent.currentTermExpected || 0)}</span></div>
                    <div>Total Due: <span className="font-medium">{formatCurrency(selectedStudent.totalExpected || 0)}</span></div>
                    <div>Balance: <span className="text-red-600 font-medium">{formatCurrency(selectedStudent.balance || 0)}</span></div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="Enter payment amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(val: any) => setPaymentData({ ...paymentData, paymentMethod: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input
                  placeholder="Enter reference number (optional)"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Set Fees Dialog - with Current/Next Term tabs */}
        <Dialog open={showBulkSetDialog} onOpenChange={setShowBulkSetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Set Fees</DialogTitle>
              <DialogDescription>
                Set fees for{" "}
                {selectedClass === "ALL"
                  ? "all students"
                  : `all students in ${classes.find((c) => c.id.toString() === selectedClass)?.name}`}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={bulkFeeTermType} onValueChange={(v) => setBulkFeeTermType(v as "current" | "next")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">
                  <Calendar className="h-4 w-4 mr-2" />
                  Current Term
                </TabsTrigger>
                <TabsTrigger value="next">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Term
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Setting fees for <strong>{selectedYear} Term {selectedTerm}</strong>
                    <br />
                    <span className="text-xs text-muted-foreground">This will update fees for multiple students. Existing fees will be overwritten.</span>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="next" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Setting fees for <strong>{getNextTermInfo().year} Term {getNextTermInfo().term}</strong>
                    <br />
                    <span className="text-xs">These will appear as "Next Term Fees" on all report cards</span>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tuition Fee *</Label>
                <Input
                  type="number"
                  placeholder="Enter tuition fee"
                  value={bulkFeeData.tuitionFee}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, tuitionFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Other Fees</Label>
                <Input
                  type="number"
                  placeholder="Enter other fees (optional)"
                  value={bulkFeeData.otherFees}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, otherFees: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={bulkFeeData.notes}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowBulkSetDialog(false)
                setBulkFeeTermType("current")
              }}>
                Cancel
              </Button>
              <Button onClick={handleBulkSetFees}>
                Set {bulkFeeTermType === "next" ? "Next Term " : ""}Fees
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student Detail/History Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Fee History - {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogTitle>
              <DialogDescription>
                Complete fee and payment history across all terms
              </DialogDescription>
            </DialogHeader>

            {loadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : studentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No fee records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentHistory.map((record, index) => (
                  <Card key={record.id || index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {record.year} - Term {record.term}
                        </CardTitle>
                        <Badge variant={record.closingBalance > 0 ? "destructive" : "default"}>
                          {record.closingBalance > 0 ? "Balance Due" : "Paid"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Opening Balance</p>
                          <p className="font-medium text-orange-600">{formatCurrency(record.openingBalance)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Term Fees</p>
                          <p className="font-medium">{formatCurrency(record.totalExpected)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Paid</p>
                          <p className="font-medium text-green-600">{formatCurrency(record.totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Closing Balance</p>
                          <p className="font-medium text-red-600">{formatCurrency(record.closingBalance)}</p>
                        </div>
                      </div>

                      {record.payments && record.payments.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Payments:</p>
                          <div className="space-y-1">
                            {record.payments.map((payment: any, pIndex: number) => (
                              <div key={pIndex} className="flex justify-between text-xs bg-muted/50 p-2 rounded">
                                <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                <span>{payment.paymentMethod}</span>
                                <span className="text-green-600 font-medium">{formatCurrency(payment.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default function FeeManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["bursar"]}>
      <FeeManagementContent />
    </ProtectedRoute>
  )
}