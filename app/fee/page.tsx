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
    { label: "Dashboard"},
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
    const studentId = selectedStudent.id?.slice(-8)?.toUpperCase() || "N/A"

    // Gather all payments across all terms
    const allPayments = studentHistory.flatMap((r: any) =>
      (r.payments || []).map((p: any) => ({ ...p, year: r.year, term: r.term }))
    )

    const totalOpening = studentHistory[0]?.openingBalance ?? 0
    const totalFees = studentHistory.reduce((s: number, r: any) => s + (r.totalExpected ?? 0), 0)
    const totalPaidAll = studentHistory.reduce((s: number, r: any) => s + (r.totalPaid ?? 0), 0)
    const lastClosing = studentHistory[studentHistory.length - 1]?.closingBalance ?? 0
    const dateGenerated = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    const timeGenerated = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    // Build printable HTML with professional design
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Statement - ${studentName}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 14mm 16mm 14mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.5;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-wrapper {
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
          }

          /* ── HEADER WITH LOGO ── */
          .school-header {
            display: flex;
            align-items: center;
            gap: 20px;
            padding-bottom: 16px;
            border-bottom: 3px solid #1e3a5f;
            margin-bottom: 6px;
          }
          .school-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .school-info {
            flex: 1;
            text-align: center;
          }
          .school-name {
            font-size: 22px;
            font-weight: 800;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 2px;
          }
          .school-motto {
            font-size: 11px;
            color: #64748b;
            font-style: italic;
            margin-bottom: 4px;
          }
          .school-contacts {
            font-size: 10px;
            color: #64748b;
          }
          .logo-placeholder {
            width: 80px;
            flex-shrink: 0;
          }

          /* ── DOCUMENT TITLE BAR ── */
          .doc-title-bar {
            background: #1e3a5f;
            color: #ffffff;
            text-align: center;
            padding: 8px 16px;
            margin-bottom: 20px;
            letter-spacing: 2px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
          }

          /* ── STUDENT INFO GRID ── */
          .student-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin-bottom: 20px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            overflow: hidden;
          }
          .info-cell {
            padding: 8px 14px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
          }
          .info-cell:nth-child(odd) {
            border-right: 1px solid #e2e8f0;
          }
          .info-cell:nth-last-child(-n+2) {
            border-bottom: none;
          }
          .info-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 600;
            min-width: 100px;
          }
          .info-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 12px;
          }

          /* ── FINANCIAL SUMMARY BOXES ── */
          .summary-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            margin-bottom: 24px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            overflow: hidden;
          }
          .summary-box {
            padding: 12px 14px;
            text-align: center;
            border-right: 1px solid #e2e8f0;
          }
          .summary-box:last-child {
            border-right: none;
          }
          .summary-box .s-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .summary-box .s-value {
            font-size: 16px;
            font-weight: 800;
          }
          .s-orange { color: #c2410c; }
          .s-blue { color: #1d4ed8; }
          .s-green { color: #15803d; }
          .s-red { color: #b91c1c; }
          .summary-box.highlight {
            background: #fef2f2;
          }

          /* ── SECTION HEADINGS ── */
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 2px solid #1e3a5f;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .section-title .icon {
            display: inline-block;
            width: 4px;
            height: 14px;
            background: #1e3a5f;
            border-radius: 2px;
          }

          /* ── TABLE STYLES ── */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            overflow: hidden;
            font-size: 11px;
          }
          thead th {
            background: #1e3a5f;
            color: #ffffff;
            text-align: left;
            padding: 9px 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: none;
          }
          tbody td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          tbody tr:hover {
            background: #f1f5f9;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-green { color: #15803d; }
          .text-red { color: #b91c1c; }
          .text-orange { color: #c2410c; }
          .text-bold { font-weight: 700; }
          .text-medium { font-weight: 600; }

          /* ── TOTALS ROW ── */
          .totals-row td {
            background: #f1f5f9 !important;
            font-weight: 700;
            border-top: 2px solid #1e3a5f;
            border-bottom: none;
            padding: 10px 12px;
            font-size: 11.5px;
          }

          /* ── STATUS BADGE ── */
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .badge-due { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
          .badge-clear { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

          /* ── FOOTER ── */
          .doc-footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 2px solid #1e3a5f;
          }
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 10px;
            color: #64748b;
          }
          .footer-left {
            flex: 1;
          }
          .footer-right {
            text-align: right;
          }
          .footer-note {
            font-style: italic;
            margin-top: 8px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
          }

          @media print {
            body { padding: 0; }
            .page-wrapper { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">

          <!-- SCHOOL HEADER WITH LOGO -->
          <div class="school-header">
            <img src="/images/school-logo.png" alt="School Logo" class="school-logo" onerror="this.style.display='none'" />
            <div class="school-info">
              <div class="school-name">School Financial Department</div>
              <div class="school-motto">Excellence in Education</div>
              <div class="school-contacts">
                P.O. Box 0000 | Tel: +256 000 000 000 | Email: info@school.ac.ug
              </div>
            </div>
            <div class="logo-placeholder"></div>
          </div>

          <!-- DOCUMENT TITLE -->
          <div class="doc-title-bar">Student Financial Statement</div>

          <!-- STUDENT INFORMATION -->
          <div class="student-info">
            <div class="info-cell">
              <span class="info-label">Student Name:</span>
              <span class="info-value">${studentName}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Class:</span>
              <span class="info-value">${className}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Student ID:</span>
              <span class="info-value">${studentId}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Date Issued:</span>
              <span class="info-value">${dateGenerated} at ${timeGenerated}</span>
            </div>
          </div>

          <!-- FINANCIAL SUMMARY -->
          <div class="summary-strip">
            <div class="summary-box">
              <div class="s-label">Opening Balance</div>
              <div class="s-value s-orange">${formatCurrency(totalOpening)}</div>
            </div>
            <div class="summary-box">
              <div class="s-label">Total Fees Charged</div>
              <div class="s-value s-blue">${formatCurrency(totalFees)}</div>
            </div>
            <div class="summary-box">
              <div class="s-label">Total Paid</div>
              <div class="s-value s-green">${formatCurrency(totalPaidAll)}</div>
            </div>
            <div class="summary-box highlight">
              <div class="s-label">Outstanding Balance</div>
              <div class="s-value s-red">${formatCurrency(lastClosing)}</div>
            </div>
          </div>

          <!-- TERM-BY-TERM BREAKDOWN -->
          <div class="section-title"><span class="icon"></span> Term-by-Term Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th class="text-right">Opening Bal.</th>
                <th class="text-right">Term Fees</th>
                <th class="text-right">Total Due</th>
                <th class="text-right">Paid</th>
                <th class="text-right">Closing Bal.</th>
                <th class="text-center">Status</th>
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
                  <td class="text-right text-medium">${formatCurrency((r.openingBalance ?? 0) + (r.totalExpected ?? 0))}</td>
                  <td class="text-right text-green">${formatCurrency(r.totalPaid ?? 0)}</td>
                  <td class="text-right text-red text-bold">${formatCurrency(r.closingBalance ?? 0)}</td>
                  <td class="text-center">
                    <span class="badge ${(r.closingBalance ?? 0) > 0 ? 'badge-due' : 'badge-clear'}">
                      ${(r.closingBalance ?? 0) > 0 ? 'Balance Due' : 'Cleared'}
                    </span>
                  </td>
                </tr>`
                )
                .join("")}
              <tr class="totals-row">
                <td>TOTALS</td>
                <td class="text-right text-orange">${formatCurrency(totalOpening)}</td>
                <td class="text-right">${formatCurrency(totalFees)}</td>
                <td class="text-right">${formatCurrency(totalOpening + totalFees)}</td>
                <td class="text-right text-green">${formatCurrency(totalPaidAll)}</td>
                <td class="text-right text-red">${formatCurrency(lastClosing)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          ${
            allPayments.length > 0
              ? `
          <!-- PAYMENT TRANSACTIONS -->
          <div class="section-title"><span class="icon"></span> Payment Transactions (${allPayments.length})</div>
          <table>
            <thead>
              <tr>
                <th style="width:8%">#</th>
                <th>Date</th>
                <th>Period</th>
                <th>Payment Method</th>
                <th>Reference No.</th>
                <th class="text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              ${allPayments
                .map(
                  (p: any, idx: number) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${new Date(p.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>${p.year} Term ${p.term}</td>
                  <td>${p.paymentMethod?.replace(/_/g, " ") || "-"}</td>
                  <td>${p.referenceNumber || "—"}</td>
                  <td class="text-right text-green text-bold">${formatCurrency(p.amount)}</td>
                </tr>`
                )
                .join("")}
              <tr class="totals-row">
                <td colspan="5" class="text-right">TOTAL PAYMENTS</td>
                <td class="text-right text-green">${formatCurrency(totalPaidAll)}</td>
              </tr>
            </tbody>
          </table>`
              : ""
          }

          <!-- FOOTER -->
          <div class="doc-footer">
            <div class="footer-content">
              <div class="footer-left">
                <strong>Accounts Office</strong><br />
                For any queries, please contact the school bursar.
              </div>
              <div class="footer-right">
                <strong>Statement Ref:</strong> FS-${studentId}-${new Date().getFullYear()}<br />
                Printed: ${dateGenerated} ${timeGenerated}
              </div>
            </div>
            <div class="footer-note">
              This is a computer-generated financial statement. No signature is required.
            </div>
          </div>

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

                              {/* <Link href={`/fees/${student.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link> */}
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

        {/* Student Financial Statement Dialog — full-screen overlay */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="!w-[96vw] !max-w-[96vw] h-[95vh] max-h-[95vh] flex flex-col gap-0 p-0">
            {/* Sticky header */}
            <DialogHeader className="px-8 pt-6 pb-4 border-b bg-background flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      Financial Statement
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-sm">
                      {selectedStudent?.firstName} {selectedStudent?.lastName}
                      {selectedStudent?.enrollments?.[0]?.class?.name && (
                        <Badge variant="outline" className="ml-2 text-[10px] font-normal">
                          {selectedStudent.enrollments[0].class.name}
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      if (!selectedStudent || studentHistory.length === 0) return
                      handleDownloadStatement()
                    }}
                    disabled={loadingHistory || studentHistory.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9" onClick={() => setShowDetailDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : studentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-base">No fee records found for this student.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary cards row */}
                  {(() => {
                    const totalOpening = studentHistory[0]?.openingBalance ?? 0
                    const totalFees = studentHistory.reduce((s: number, r: any) => s + (r.totalExpected ?? 0), 0)
                    const totalPaidAll = studentHistory.reduce((s: number, r: any) => s + (r.totalPaid ?? 0), 0)
                    const lastClosing = studentHistory[studentHistory.length - 1]?.closingBalance ?? 0
                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opening Balance</p>
                          <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(totalOpening)}</p>
                        </div>
                        <div className="rounded-xl border-2 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Fees Charged</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalFees)}</p>
                        </div>
                        <div className="rounded-xl border-2 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Paid</p>
                          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalPaidAll)}</p>
                        </div>
                        <div className="rounded-xl border-2 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding Balance</p>
                          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(lastClosing)}</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Term-by-term breakdown table */}
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                      <Calendar className="h-4 w-4" />
                      Term-by-Term Breakdown
                    </h3>
                    <div className="rounded-xl border-2 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-b-2">
                            <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Period</TableHead>
                            <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Opening Bal.</TableHead>
                            <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Term Fees</TableHead>
                            <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Total Due</TableHead>
                            <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Paid</TableHead>
                            <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Closing Bal.</TableHead>
                            <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentHistory.map((record: any, index: number) => (
                            <TableRow key={record.id || index} className="hover:bg-muted/30">
                              <TableCell className="font-semibold py-3">
                                {record.year} Term {record.term}
                              </TableCell>
                              <TableCell className="text-right text-orange-600 py-3">
                                {formatCurrency(record.openingBalance ?? 0)}
                              </TableCell>
                              <TableCell className="text-right py-3">
                                {formatCurrency(record.totalExpected ?? 0)}
                              </TableCell>
                              <TableCell className="text-right font-medium py-3">
                                {formatCurrency((record.openingBalance ?? 0) + (record.totalExpected ?? 0))}
                              </TableCell>
                              <TableCell className="text-right text-green-600 py-3">
                                {formatCurrency(record.totalPaid ?? 0)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-red-600 py-3">
                                {formatCurrency(record.closingBalance ?? 0)}
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge
                                  variant={record.closingBalance > 0 ? "destructive" : "default"}
                                  className="text-[11px]"
                                >
                                  {record.closingBalance > 0 ? "Balance Due" : "Cleared"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Totals row */}
                          {(() => {
                            const totalOpening = studentHistory[0]?.openingBalance ?? 0
                            const totalFees = studentHistory.reduce((s: number, r: any) => s + (r.totalExpected ?? 0), 0)
                            const totalPaidAll = studentHistory.reduce((s: number, r: any) => s + (r.totalPaid ?? 0), 0)
                            const lastClosing = studentHistory[studentHistory.length - 1]?.closingBalance ?? 0
                            return (
                              <TableRow className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-t-2">
                                <TableCell className="font-bold py-3.5">TOTALS</TableCell>
                                <TableCell className="text-right font-bold text-orange-600 py-3.5">{formatCurrency(totalOpening)}</TableCell>
                                <TableCell className="text-right font-bold py-3.5">{formatCurrency(totalFees)}</TableCell>
                                <TableCell className="text-right font-bold py-3.5">{formatCurrency(totalOpening + totalFees)}</TableCell>
                                <TableCell className="text-right font-bold text-green-600 py-3.5">{formatCurrency(totalPaidAll)}</TableCell>
                                <TableCell className="text-right font-bold text-red-600 py-3.5">{formatCurrency(lastClosing)}</TableCell>
                                <TableCell className="py-3.5"></TableCell>
                              </TableRow>
                            )
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Payment transactions table */}
                  {(() => {
                    const allPayments = studentHistory.flatMap((r: any) =>
                      (r.payments || []).map((p: any) => ({ ...p, year: r.year, term: r.term }))
                    )
                    if (allPayments.length === 0) return null
                    return (
                      <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                          <Receipt className="h-4 w-4" />
                          Payment Transactions ({allPayments.length})
                        </h3>
                        <div className="rounded-xl border-2 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-b-2">
                                <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200 w-12">#</TableHead>
                                <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Date</TableHead>
                                <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Period</TableHead>
                                <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Payment Method</TableHead>
                                <TableHead className="font-bold py-3.5 text-slate-700 dark:text-slate-200">Reference</TableHead>
                                <TableHead className="text-right font-bold py-3.5 text-slate-700 dark:text-slate-200">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allPayments.map((payment: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-muted/30">
                                  <TableCell className="text-sm text-muted-foreground py-3">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="text-sm py-3">
                                    {new Date(payment.paymentDate).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-sm py-3">
                                    {payment.year} Term {payment.term}
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge variant="outline" className="text-[11px] font-normal">
                                      {payment.paymentMethod?.replace(/_/g, " ")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground py-3">
                                    {payment.referenceNumber || "—"}
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-green-600 py-3">
                                    {formatCurrency(payment.amount)}
                                  </TableCell>
                                </TableRow>
                              ))}

                              {/* Total payments row */}
                              <TableRow className="bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-t-2">
                                <TableCell colSpan={5} className="text-right font-bold py-3.5">
                                  TOTAL PAYMENTS
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600 py-3.5">
                                  {formatCurrency(allPayments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0))}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="px-8 py-4 border-t bg-background flex-shrink-0 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                This is a computer-generated financial statement.
              </p>
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