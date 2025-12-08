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
import { toast } from "react-toastify"
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

  // Form submission loading states
  const [settingFee, setSettingFee] = useState(false)
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [settingBulkFees, setSettingBulkFees] = useState(false)

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
      toast.error("Failed to load academic years")
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
      toast.error("Failed to load students")
      
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
      toast.error("Failed to load student fee history")
    } finally {
      setLoadingHistory(false)
    }
  }

  // Export student financial statement
  const exportStudentStatement = async (student: StudentWithFees) => {
    try {
      toast.info("Generating financial statement...")
      window.open(`/fees/${student.id}`, '_blank')
    } catch (error) {
      toast.error("Failed to generate statement")
    }
  }

  // Handlers
  const handleSetFee = async () => {
    if (!selectedStudent || !feeData.tuitionFee) {
      toast.error("Please enter tuition fee")
      return
    }

    setSettingFee(true)
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
        toast.success("Fee structure set successfully")
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
        toast.success(`Next term fees (${nextTermInfo.year} Term ${nextTermInfo.term}) set successfully`)
      }

      setShowSetFeeDialog(false)
      setFeeData({ tuitionFee: "", otherFees: "", notes: "" })
      setFeeTermType("current")
      fetchStudents()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to set fee")
    } finally {
      setSettingFee(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentData.amount) {
      toast.error("Please enter payment amount")
      return
    }

    setRecordingPayment(true)
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
      toast.success(`Payment recorded. New balance: ${formatCurrency(result.updatedBalance)}`)
      setShowPaymentDialog(false)
      setPaymentData({
        amount: "",
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: ""
      })
      fetchStudents()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to record payment")
    } finally {
      setRecordingPayment(false)
    }
  }

  const handleBulkSetFees = async () => {
    if (!bulkFeeData.tuitionFee) {
      toast.error("Please enter tuition fee")

      return
    }

    setSettingBulkFees(true)
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
        toast.info(`Fees set for ${result.count} students`)
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
        toast.success(result.message)
      }

      setShowBulkSetDialog(false)
      setBulkFeeData({ tuitionFee: "", otherFees: "", notes: "" })
      setBulkFeeTermType("current")
      fetchStudents()
    } catch (error: any) {
      toast.error( error.response?.data?.error || "Failed to set bulk fees")
    } finally {
      setSettingBulkFees(false)
    }
  }

  const handleViewDetails = async (student: StudentWithFees) => {
    setSelectedStudent(student)
    setShowDetailDialog(true)
    await fetchStudentHistory(student.id)
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

        {/* Summary Cards - with subtle fill backgrounds */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
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

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Carry Forward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-600">{formatCurrency(totalCarryForward)}</div>
              <p className="text-xs text-muted-foreground mt-1">From previous terms</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Term Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(totalExpected - totalCarryForward)}</div>
              <p className="text-xs text-muted-foreground mt-1">Term {selectedTerm} fees</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(totalExpected)}</div>
              <p className="text-xs text-muted-foreground mt-1">Including carry forward</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : 0}% collected
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total balance due</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Compact single row */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs">Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9">
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

              <div className="space-y-1 min-w-[120px]">
                <Label className="text-xs">Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                    <SelectItem value="3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9">
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

              <div className="space-y-1 min-w-[120px]">
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 flex-1 min-w-[180px]">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
                    className="pl-8 h-9"
                  />
                </div>
              </div>

              <Button onClick={fetchStudents} disabled={loading} size="sm" className="h-9">
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

              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowBulkSetDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Bulk Set Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table with Pagination */}
        <Card className="border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Students ({students.length})
            </p>
            <p className="text-xs text-slate-500">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No students found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Student Name</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Class</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">
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
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Term Fees</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Total Expected</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Paid</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Balance</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
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
                  <div className="mt-4 px-6 pb-4">
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
              <DialogTitle className="text-slate-900 dark:text-white">Set Fee Structure</DialogTitle>
              <DialogDescription>
                Set fees for {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={feeTermType} onValueChange={(v) => setFeeTermType(v as "current" | "next")}>
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="current" className="h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  Current Term
                </TabsTrigger>
                <TabsTrigger value="next" className="h-9">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Term
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="mt-4">
                <div className="p-3 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Setting fees for <strong>{selectedYear} Term {selectedTerm}</strong>
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="next" className="mt-4">
                <div className="p-3 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p>Setting fees for <strong>{getNextTermInfo().year} Term {getNextTermInfo().term}</strong></p>
                      <p className="text-xs mt-1 opacity-80">This will appear as "Next Term Fees" on report cards</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Tuition Fee *</Label>
                <Input
                  type="number"
                  placeholder="Enter tuition fee"
                  value={feeData.tuitionFee}
                  onChange={(e) => setFeeData({ ...feeData, tuitionFee: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Other Fees</Label>
                <Input
                  type="number"
                  placeholder="Enter other fees (optional)"
                  value={feeData.otherFees}
                  onChange={(e) => setFeeData({ ...feeData, otherFees: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={feeData.notes}
                  onChange={(e) => setFeeData({ ...feeData, notes: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 mt-2">
              <Button variant="outline" className="h-10" onClick={() => {
                setShowSetFeeDialog(false)
                setFeeTermType("current")
              }} disabled={settingFee}>
                Cancel
              </Button>
              <Button className="h-10" onClick={handleSetFee} disabled={settingFee}>
                {settingFee ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting Fee...
                  </>
                ) : (
                  <>Set {feeTermType === "next" ? "Next Term " : ""}Fee</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Carry Forward</p>
                    <p className="text-orange-600 font-medium">{formatCurrency(selectedStudent.carryForwardBalance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Current Term</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(selectedStudent.currentTermExpected || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Total Due</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(selectedStudent.totalExpected || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Balance</p>
                    <p className="text-red-600 font-semibold">{formatCurrency(selectedStudent.balance || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Amount *</Label>
                <Input
                  type="number"
                  placeholder="Enter payment amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(val: any) => setPaymentData({ ...paymentData, paymentMethod: val })}
                >
                  <SelectTrigger className="h-10 border-2 border-slate-200 dark:border-slate-700">
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
                <Label className="text-slate-700 dark:text-slate-300">Reference Number</Label>
                <Input
                  placeholder="Enter reference number (optional)"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 mt-2">
              <Button variant="outline" className="h-10" onClick={() => setShowPaymentDialog(false)} disabled={recordingPayment}>
                Cancel
              </Button>
              <Button className="h-10" onClick={handleRecordPayment} disabled={recordingPayment}>
                {recordingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Set Fees Dialog - with Current/Next Term tabs */}
        <Dialog open={showBulkSetDialog} onOpenChange={setShowBulkSetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Bulk Set Fees</DialogTitle>
              <DialogDescription>
                Set fees for{" "}
                {selectedClass === "ALL"
                  ? "all students"
                  : `all students in ${classes.find((c) => c.id.toString() === selectedClass)?.name}`}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={bulkFeeTermType} onValueChange={(v) => setBulkFeeTermType(v as "current" | "next")}>
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="current" className="h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  Current Term
                </TabsTrigger>
                <TabsTrigger value="next" className="h-9">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Term
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="mt-4">
                <div className="p-3 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p>Setting fees for <strong>{selectedYear} Term {selectedTerm}</strong></p>
                      <p className="text-xs mt-1 opacity-80">This will update fees for multiple students. Existing fees will be overwritten.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="next" className="mt-4">
                <div className="p-3 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p>Setting fees for <strong>{getNextTermInfo().year} Term {getNextTermInfo().term}</strong></p>
                      <p className="text-xs mt-1 opacity-80">These will appear as "Next Term Fees" on all report cards</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Tuition Fee *</Label>
                <Input
                  type="number"
                  placeholder="Enter tuition fee"
                  value={bulkFeeData.tuitionFee}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, tuitionFee: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Other Fees</Label>
                <Input
                  type="number"
                  placeholder="Enter other fees (optional)"
                  value={bulkFeeData.otherFees}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, otherFees: e.target.value })}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Notes</Label>
                <Textarea
                  placeholder="Enter any notes (optional)"
                  value={bulkFeeData.notes}
                  onChange={(e) => setBulkFeeData({ ...bulkFeeData, notes: e.target.value })}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 mt-2">
              <Button variant="outline" className="h-10" onClick={() => {
                setShowBulkSetDialog(false)
                setBulkFeeTermType("current")
              }} disabled={settingBulkFees}>
                Cancel
              </Button>
              <Button className="h-10" onClick={handleBulkSetFees} disabled={settingBulkFees}>
                {settingBulkFees ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting Fees...
                  </>
                ) : (
                  <>Set {bulkFeeTermType === "next" ? "Next Term " : ""}Fees</>
                )}
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