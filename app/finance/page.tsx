"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { feeService, OutstandingFeesReport, CollectionReport, SummaryReport } from "@/services/fee.service"
import { classService } from "@/services/class.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CSVLink } from "react-csv"
import { academicYearService } from "@/services/accademic-year.service"
import {
  BarChart3,
  Loader2,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText
} from "lucide-react"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

const exportToExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available to export")
    return
  }

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

  // Generate Excel file and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
  saveAs(blob, `${filename}.xlsx`)
}


function FinancialReportsContent() {
  const { user } = useAuth()
  const { context: academicContext, loading: contextLoading } = useAcademicContext()

  // State
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("ALL")
  const [selectedClass, setSelectedClass] = useState<string>("ALL")
  const [classes, setClasses] = useState<any[]>([])

    // Academic years from database
  const [availableYears, setAvailableYears] = useState<any[]>([])
  const [loadingYears, setLoadingYears] = useState(false)

  // Reports Data
  const [outstandingReport, setOutstandingReport] = useState<OutstandingFeesReport | null>(null)
  const [collectionReport, setCollectionReport] = useState<CollectionReport | null>(null)
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null)

  // Loading states
  const [loading, setLoading] = useState({
    outstanding: false,
    collection: false,
    summary: false
  })

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Financial Reports" }
  ]

  // Initialize
  useEffect(() => {
    if (academicContext) {
      setSelectedYear(academicContext.year?.toString() || "")
    }
  }, [academicContext])

  useEffect(() => {
    if (academicContext && availableYears.length > 0) {
      const currentYear = academicContext.year?.toString()
      if (currentYear && availableYears.find(y => y.year.toString() === currentYear)) {
        setSelectedYear(currentYear)
      } else if (availableYears.length > 0) {
        setSelectedYear(availableYears[0].year.toString())
      }
      setSelectedTerm(academicContext.term?.toString() || "")
    }
  }, [academicContext, availableYears])

  useEffect(() => {
    if (selectedYear) {
      fetchClasses()
      fetchReports()
    }
  }, [selectedYear, selectedTerm, selectedClass])

    useEffect(() => {
    loadAcademicYears()
  }, [])


  // Fetch functions

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

  const fetchClasses = async () => {
    try {
      const response = await classService.getAllClasses()
      setClasses(response.classes || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchReports = async () => {
    await Promise.all([
      fetchOutstandingReport(),
      fetchCollectionReport(),
      fetchSummaryReport()
    ])
  }

  const fetchOutstandingReport = async () => {
    if (!selectedYear) return

    setLoading(prev => ({ ...prev, outstanding: true }))
    try {
      const params: any = {
        year: Number(selectedYear)
      }

      if (selectedTerm !== "ALL") {
        params.term = Number(selectedTerm)
      }

      if (selectedClass !== "ALL") {
        params.classId = selectedClass
      }

      const data = await feeService.getOutstandingFeesReport(params)
      setOutstandingReport(data)
    } catch (error) {
      console.error("Error fetching outstanding report:", error)
    } finally {
      setLoading(prev => ({ ...prev, outstanding: false }))
    }
  }

  const fetchCollectionReport = async () => {
    if (!selectedYear) return

    setLoading(prev => ({ ...prev, collection: true }))
    try {
      const params: any = {
        year: Number(selectedYear)
      }

      if (selectedTerm !== "ALL") {
        params.term = Number(selectedTerm)
      }

      const data = await feeService.getFeeCollectionReport(params)
      setCollectionReport(data)
    } catch (error) {
      console.error("Error fetching collection report:", error)
    } finally {
      setLoading(prev => ({ ...prev, collection: false }))
    }
  }

  const fetchSummaryReport = async () => {
    if (!selectedYear) return

    setLoading(prev => ({ ...prev, summary: true }))
    try {
      const data = await feeService.getFeesSummaryReport(Number(selectedYear))
      setSummaryReport(data)
    } catch (error) {
      console.error("Error fetching summary report:", error)
    } finally {
      setLoading(prev => ({ ...prev, summary: false }))
    }
  }

  // Utilities
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
        {/* Header */}
        <div>
          {/* <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1> */}
          {/* <p className="text-muted-foreground mt-1">
            Comprehensive financial analysis and reporting
          </p> */}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Terms</SelectItem>
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
                    <SelectValue />
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
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="collection">Collections</TabsTrigger>
          </TabsList>

          {/* Summary Report Tab */}
          <TabsContent value="summary" className="space-y-6">
            {loading.summary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : summaryReport ? (
              <>
                {/* Overall Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summaryReport.overall.totalStudents}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-600">{summaryReport.overall.studentsFullyPaid}</span> Fully Paid •{" "}
                        <span className="text-red-600">{summaryReport.overall.studentsPending}</span> Pending
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Expected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(summaryReport.overall.totalExpected)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Collected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(summaryReport.overall.totalPaid)}
                      </div>
                      <Progress
                        value={Number(summaryReport.overall.collectionRate)}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {summaryReport.overall.collectionRate}% Collection Rate
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Outstanding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(summaryReport.overall.totalOutstanding)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Term Breakdown */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Term-by-Term Breakdown</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!summaryReport?.termBreakdown?.length) return
                            // optional cleanup to keep numeric columns pure for Excel
                            const cleaned = summaryReport.termBreakdown.map(t => ({
                              Term: `Term ${t.term}`,
                              Students: t.studentsCount,
                              Expected: t.expected,
                              Paid: t.paid,
                              Outstanding: t.outstanding,
                              "Collection %": t.expected > 0 ? ((t.paid / t.expected) * 100).toFixed(1) : "0.0"
                            }))
                            exportToExcel(cleaned, `Term_Breakdown_${selectedYear}`)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>

                        {summaryReport?.termBreakdown?.length > 0 && (
                          <CSVLink
                            data={summaryReport.termBreakdown.map(t => ({
                              Term: `Term ${t.term}`,
                              Students: t.studentsCount,
                              Expected: t.expected,
                              Paid: t.paid,
                              Outstanding: t.outstanding,
                              "Collection %": t.expected > 0 ? ((t.paid / t.expected) * 100).toFixed(1) : "0.0"
                            }))}
                            filename={`Term_Breakdown_${selectedYear}.csv`}
                            className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                            CSV
                          </CSVLink>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Term</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead className="text-right">Expected</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                          <TableHead className="text-right">Collection %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaryReport.termBreakdown.map((term) => {
                          const collectionRate = term.expected > 0
                            ? ((term.paid / term.expected) * 100).toFixed(1)
                            : 0
                          return (
                            <TableRow key={term.term}>
                              <TableCell className="font-medium">Term {term.term}</TableCell>
                              <TableCell>{term.studentsCount}</TableCell>
                              <TableCell className="text-right">{formatCurrency(term.expected)}</TableCell>
                              <TableCell className="text-right text-green-600 font-semibold">
                                {formatCurrency(term.paid)}
                              </TableCell>
                              <TableCell className="text-right text-red-600 font-semibold">
                                {formatCurrency(term.outstanding)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={Number(collectionRate) >= 80 ? "default" : "destructive"}>
                                  {collectionRate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Class Breakdown */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Class-by-Class Breakdown</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(summaryReport.classSummary, `Class_Summary_${selectedYear}`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>

                        <CSVLink
                          data={summaryReport.classSummary}
                          filename={`Class_Summary_${selectedYear}.csv`}
                          className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm hover:bg-accent"
                        >
                          <Download className="h-4 w-4" />
                          CSV
                        </CSVLink>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead className="text-right">Expected</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                          <TableHead className="text-right">Collection %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaryReport.classSummary.map((cls) => (
                          <TableRow key={cls.className}>
                            <TableCell className="font-medium">{cls.className}</TableCell>
                            <TableCell>{cls.studentsCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cls.expected)}</TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              {formatCurrency(cls.paid)}
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-semibold">
                              {formatCurrency(cls.outstanding)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={Number(cls.collectionRate) >= 80 ? "default" : "destructive"}>
                                {cls.collectionRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a year to view summary report</p>
              </div>
            )}
          </TabsContent>

          {/* Outstanding Fees Tab */}
          <TabsContent value="outstanding" className="space-y-6">
            {loading.outstanding ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : outstandingReport ? (
              <>
                {/* Outstanding Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{outstandingReport.summary.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">With Outstanding Balances</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Expected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(outstandingReport.summary.totalExpected)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(outstandingReport.summary.totalPaid)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(outstandingReport.summary.totalOutstanding)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Outstanding Students List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Students with Outstanding Balances</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(outstandingReport.students, `Outstanding_Report_${selectedYear}`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>

                        <CSVLink
                          data={outstandingReport.students}
                          filename={`Outstanding_Report_${selectedYear}.csv`}
                          className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm hover:bg-accent"
                        >
                          <Download className="h-4 w-4" />
                          CSV
                        </CSVLink>
                      </div>
                    </div>
                    <CardDescription>Sorted by highest balance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Guardian Phone</TableHead>
                          <TableHead className="text-right">Expected</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outstandingReport.students.map((student) => (
                          <TableRow key={student.studentId}>
                            <TableCell className="font-medium">{student.studentName}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.guardianPhone}</TableCell>
                            <TableCell className="text-right">{formatCurrency(student.expected)}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(student.paid)}
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-bold">
                              {formatCurrency(student.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select filters to view outstanding fees report</p>
              </div>
            )}
          </TabsContent>

          {/* Collection Report Tab */}
          <TabsContent value="collection" className="space-y-6">
            {loading.collection ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : collectionReport ? (
              <>
                {/* Collection Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{collectionReport.summary.totalPayments}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(collectionReport.summary.totalCollected)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(collectionReport.summary.averagePayment)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Methods Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Collection by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(collectionReport.byPaymentMethod).map(([method, data]) => {
                        const percentage = collectionReport.summary.totalCollected > 0
                          ? (data.total / collectionReport.summary.totalCollected * 100).toFixed(1)
                          : 0
                        
                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{method.replace(/_/g, ' ')}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {data.count} payments
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(data.total)}</div>
                                <div className="text-xs text-muted-foreground">{percentage}%</div>
                              </div>
                            </div>
                            <Progress value={Number(percentage)} />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Payments</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(collectionReport.recentPayments, `Recent_Payments_${selectedYear}`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>

                        <CSVLink
                          data={collectionReport.recentPayments}
                          filename={`Recent_Payments_${selectedYear}.csv`}
                          className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm hover:bg-accent"
                        >
                          <Download className="h-4 w-4" />
                          CSV
                        </CSVLink>
                      </div>
                    </div>
                    <CardDescription>Last 50 payments recorded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Recorded By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collectionReport.recentPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                            <TableCell className="font-medium">{payment.studentName}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.paymentMethod.replace(/_/g, ' ')}</Badge>
                            </TableCell>
                            <TableCell>{payment.referenceNumber || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {payment.recordedBy}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select filters to view collection report</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default function FinancialReportsPage() {
  return (
    <ProtectedRoute requiredPermissions={["fees.view_reports"]}>
      <FinancialReportsContent />
    </ProtectedRoute>
  )
}