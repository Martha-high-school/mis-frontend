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

  // Generate and download a PDF financial statement
  const handleDownloadStatement = () => {
    if (!selectedStudent || studentHistory.length === 0) return

    const studentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`
    const className = selectedStudent.enrollments?.[0]?.class?.name || "N/A"

    // Gather all payments across all terms
    const allPayments = studentHistory.flatMap((r: any) =>
      (r.payments || []).map((p: any) => ({ ...p, year: r.year, term: r.term }))
    )

    const totalOpening = studentHistory[0]?.openingBalance ?? 0
    const totalFees = studentHistory.reduce((s: number, r: any) => s + (r.totalExpected ?? 0), 0)
    const totalPaidAll = studentHistory.reduce((s: number, r: any) => s + (r.totalPaid ?? 0), 0)
    const lastClosing = studentHistory[studentHistory.length - 1]?.closingBalance ?? 0

    // Build printable HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Statement - ${studentName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; }
          .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #555; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          .info-row div span:first-child { color: #555; }
          .info-row div span:last-child { font-weight: 600; margin-left: 6px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .summary-card { border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; }
          .summary-card .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }
          .summary-card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
          .summary-card .value.orange { color: #c2410c; }
          .summary-card .value.blue { color: #1d4ed8; }
          .summary-card .value.green { color: #15803d; }
          .summary-card .value.red { color: #b91c1c; }
          h2 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 2px solid #d1d5db; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .text-right { text-align: right; }
          .text-green { color: #15803d; }
          .text-red { color: #b91c1c; font-weight: 600; }
          .text-orange { color: #c2410c; }
          .text-bold { font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #888; }
          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>STUDENT FINANCIAL STATEMENT</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>

        <div class="info-row">
          <div><span>Student:</span> <span>${studentName}</span></div>
          <div><span>Class:</span> <span>${className}</span></div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Opening Balance</div>
            <div class="value orange">${formatCurrency(totalOpening)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Fees Charged</div>
            <div class="value blue">${formatCurrency(totalFees)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Paid</div>
            <div class="value green">${formatCurrency(totalPaidAll)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Current Balance</div>
            <div class="value red">${formatCurrency(lastClosing)}</div>
          </div>
        </div>

        <h2>Term-by-Term Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th class="text-right">Opening Bal.</th>
              <th class="text-right">Term Fees</th>
              <th class="text-right">Total Due</th>
              <th class="text-right">Paid</th>
              <th class="text-right">Closing Bal.</th>
            </tr>
          </thead>
          <tbody>
            ${studentHistory
              .map(
                (r: any) => `
              <tr>
                <td class="text-bold">${r.year} Term ${r.term}</td>
                <td class="text-right text-orange">${formatCurrency(r.openingBalance ?? 0)}</td>
                <td class="text-right">${formatCurrency(r.totalExpected ?? 0)}</td>
                <td class="text-right text-bold">${formatCurrency((r.openingBalance ?? 0) + (r.totalExpected ?? 0))}</td>
                <td class="text-right text-green">${formatCurrency(r.totalPaid ?? 0)}</td>
                <td class="text-right text-red">${formatCurrency(r.closingBalance ?? 0)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        ${
          allPayments.length > 0
            ? `
        <h2>Payment Transactions (${allPayments.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Period</th>
              <th>Method</th>
              <th>Reference</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${allPayments
              .map(
                (p: any) => `
              <tr>
                <td>${new Date(p.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>${p.year} T${p.term}</td>
                <td>${p.paymentMethod?.replace(/_/g, " ") || "-"}</td>
                <td>${p.referenceNumber || "-"}</td>
                <td class="text-right text-green text-bold">${formatCurrency(p.amount)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
            : ""
        }

        <div class="footer">
          This is a computer-generated statement. No signature is required.
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      // Give it a moment to render, then trigger print (which allows Save as PDF)
      setTimeout(() => {
        printWindow.print()
      }, 400)
    }
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

        {/* Student Financial Statement Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-lg">
                    Financial Statement
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedStudent?.firstName} {selectedStudent?.lastName}
                    {selectedStudent?.enrollments?.[0]?.class?.name && (
                      <span className="ml-2 text-xs">
                        ({selectedStudent.enrollments[0].class.name})
                      </span>
                    )}
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => {
                    if (!selectedStudent || studentHistory.length === 0) return
                    handleDownloadStatement()
                  }}
                  disabled={loadingHistory || studentHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : studentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm">No fee records found for this student.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary cards row */}
                  {(() => {
                    const totalOpening = studentHistory[0]?.openingBalance ?? 0
                    const totalFees = studentHistory.reduce((s: number, r: any) => s + (r.totalExpected ?? 0), 0)
                    const totalPaidAll = studentHistory.reduce((s: number, r: any) => s + (r.totalPaid ?? 0), 0)
                    const lastClosing = studentHistory[studentHistory.length - 1]?.closingBalance ?? 0
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="rounded-lg border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Opening Balance</p>
                          <p className="text-lg font-bold text-orange-600 mt-1">{formatCurrency(totalOpening)}</p>
                        </div>
                        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Total Fees Charged</p>
                          <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(totalFees)}</p>
                        </div>
                        <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Total Paid</p>
                          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(totalPaidAll)}</p>
                        </div>
                        <div className="rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
                          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(lastClosing)}</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Term-by-term breakdown table */}
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="font-semibold py-3">Period</TableHead>
                          <TableHead className="text-right font-semibold py-3">Opening Bal.</TableHead>
                          <TableHead className="text-right font-semibold py-3">Term Fees</TableHead>
                          <TableHead className="text-right font-semibold py-3">Total Due</TableHead>
                          <TableHead className="text-right font-semibold py-3">Paid</TableHead>
                          <TableHead className="text-right font-semibold py-3">Closing Bal.</TableHead>
                          <TableHead className="font-semibold py-3">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentHistory.map((record: any, index: number) => (
                          <TableRow key={record.id || index} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {record.year} Term {record.term}
                            </TableCell>
                            <TableCell className="text-right text-orange-600">
                              {formatCurrency(record.openingBalance ?? 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(record.totalExpected ?? 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency((record.openingBalance ?? 0) + (record.totalExpected ?? 0))}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(record.totalPaid ?? 0)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              {formatCurrency(record.closingBalance ?? 0)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.closingBalance > 0 ? "destructive" : "default"}
                                className="text-[10px]"
                              >
                                {record.closingBalance > 0 ? "Balance Due" : "Cleared"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Payment transactions table */}
                  {(() => {
                    const allPayments = studentHistory.flatMap((r: any) =>
                      (r.payments || []).map((p: any) => ({ ...p, year: r.year, term: r.term }))
                    )
                    if (allPayments.length === 0) return null
                    return (
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Payment Transactions ({allPayments.length})
                        </h3>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-semibold py-3">Date</TableHead>
                                <TableHead className="font-semibold py-3">Period</TableHead>
                                <TableHead className="font-semibold py-3">Method</TableHead>
                                <TableHead className="font-semibold py-3">Reference</TableHead>
                                <TableHead className="text-right font-semibold py-3">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allPayments.map((payment: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-muted/30">
                                  <TableCell className="text-sm">
                                    {new Date(payment.paymentDate).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {payment.year} T{payment.term}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-normal">
                                      {payment.paymentMethod?.replace(/_/g, " ")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {payment.referenceNumber || "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-green-600">
                                    {formatCurrency(payment.amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default function FeeManagementPage() {
  return (
    <ProtectedRoute requiredPermissions={["fees.view", "fees.record_payment", "fees.set_fees"]}>
      <FeeManagementContent />
    </ProtectedRoute>
  )
}
