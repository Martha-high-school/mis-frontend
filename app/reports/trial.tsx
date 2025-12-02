"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Download, 
  FileText, 
  Users, 
  Eye, 
  Filter, 
  MessageSquare,
  Loader2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { studentService } from "@/services/student.service"
import { classService, type ClassData } from "@/services/class.service"
import { academicYearService, type AcademicYear } from "@/services/accademic-year.service"
import { pdfService, type ReportData } from "@/services/pdf-report.service"

// =============================================================================
// TYPES
// =============================================================================

interface StudentListItem {
  id: string
  name: string
  firstName: string
  lastName: string
  studentNumber: string
  gender: string
  class: string
  classId: string
  average?: number
  grade?: string
  status: string
  feeStatus: string
  profileImage?: string
}

interface TermOption {
  value: string
  label: string
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate competence column headers dynamically (C1, C2, ..., Cn)
 */
const getCompetenceColumns = (maxCompetences: number): string[] => {
  return Array.from({ length: maxCompetences }, (_, i) => `C${i + 1}`)
}

/**
 * Format term name for display (T1 -> Term 1)
 */
const formatTermName = (term: string): string => {
  const termMap: Record<string, string> = {
    'T1': 'Term 1',
    'T2': 'Term 2',
    'T3': 'Term 3'
  }
  return termMap[term] || term
}

// =============================================================================
// REPORT PREVIEW MODAL COMPONENT
// =============================================================================

interface ReportPreviewModalProps {
  reportData: ReportData | null
  isOpen: boolean
  onClose: () => void
  onGeneratePDF: () => void
  loading: boolean
}

function ReportPreviewModal({ 
  reportData, 
  isOpen, 
  onClose, 
  onGeneratePDF,
  loading 
}: ReportPreviewModalProps) {
  if (!reportData) return null

  const { student, academic, comments, fees, term, school, gradingScale } = reportData
  const competenceColumns = getCompetenceColumns(academic.maxCompetences || 5)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview - {student.name}</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-6 text-black" id="report-content">
          {/* School Header */}
          <div className="mb-6 border-b-2 border-gray-300 pb-4">
            <div className="flex items-start justify-between gap-4">
              {/* School Logo - Left */}
              <div className="w-24 h-24 flex-shrink-0">
                {school?.logo && (
                  <img
                    src={school.logo}
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* School Info - Center */}
              <div className="flex-1 text-center">
                <h1 className="text-xl font-bold uppercase">{school?.name || 'School Name'}</h1>
                <p className="text-sm italic mt-1">{school?.motto || ''}</p>
                <p className="text-xs text-gray-600 mt-2">{school?.poBox || ''}</p>
                <p className="text-xs text-gray-600">{school?.phone || ''}</p>
                <p className="text-xs text-gray-600">{school?.email || ''}</p>
              </div>

              {/* Student Photo - Right */}
              <div className="w-24 h-24 flex-shrink-0">
                {student.profileImage ? (
                  <img
                    src={student.profileImage}
                    alt="Student Photo"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                    <span className="text-xs text-gray-500">PHOTO</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold border-b border-t border-gray-300 py-2 uppercase">
              END OF TERM REPORT CARD
            </h2>
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <div className="grid grid-cols-6 gap-4 text-sm border-b border-gray-300 pb-4">
              <div><strong>Student No:</strong> {student.studentNumber}</div>
              <div><strong>Name:</strong> {student.name}</div>
              <div><strong>Gender:</strong> {student.gender}</div>
              <div><strong>Class:</strong> {student.class}</div>
              <div><strong>Stream:</strong> {student.stream || '-'}</div>
              <div><strong>Year:</strong> {student.year}</div>
            </div>
          </div>

          {/* Term Section */}
          <div className="mb-4">
            <div className="text-center bg-gray-100 py-2 font-bold uppercase text-sm border border-gray-300">
              {term.name}
            </div>
          </div>

          {/* Academic Performance Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left" rowSpan={2}>SUBJECT</th>
                  <th className="border border-gray-300 p-2" colSpan={competenceColumns.length + 2}>
                    Scores for End Of Chapter Activities of Integration
                  </th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>EOT/80</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>
                    Total<br />(100%)
                  </th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>Grade</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>Descriptor</th>
                  <th className="border border-gray-300 p-2" rowSpan={2}>
                    Tr's<br />Initials
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  {competenceColumns.map((col) => (
                    <th key={col} className="border border-gray-300 p-1">{col}</th>
                  ))}
                  <th className="border border-gray-300 p-1">Project/10</th>
                  <th className="border border-gray-300 p-1">Score/20</th>
                </tr>
              </thead>

              <tbody>
                {academic.subjects.map((subject, index) => {
                  // Get competence values dynamically
                  const competenceValues = [
                    subject.formative.u1,
                    subject.formative.u2,
                    subject.formative.u3,
                    subject.formative.u4,
                    subject.formative.u5,
                    subject.formative.u6,
                  ].slice(0, academic.maxCompetences)

                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 font-medium text-left">{subject.name}</td>
                      {competenceValues.map((value, idx) => (
                        <td key={idx} className="border border-gray-300 p-1 text-center">
                          {value !== null && value !== undefined ? value : '-'}
                        </td>
                      ))}
                      <td className="border border-gray-300 p-1 text-center">{subject.summative.mt || '-'}</td>
                      <td className="border border-gray-300 p-1 text-center font-semibold">
                        {subject.formative.total || '-'}
                      </td>
                      <td className="border border-gray-300 p-1 text-center">{subject.summative.eot}</td>
                      <td className="border border-gray-300 p-1 text-center font-bold">
                        {subject.totalMark}
                      </td>
                      <td className="border border-gray-300 p-1 text-center font-semibold">{subject.grade}</td>
                      <td className="border border-gray-300 p-1 text-center text-[10px]">
                        {subject.descriptor || '-'}
                      </td>
                      <td className="border border-gray-300 p-1 text-center">{subject.teacherInitials || '-'}</td>
                    </tr>
                  )
                })}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2">TOTAL</td>
                  <td className="border border-gray-300 p-1" colSpan={competenceColumns.length + 3}></td>
                  <td className="border border-gray-300 p-1 text-center">{academic.totalMarks}</td>
                  <td className="border border-gray-300 p-1" colSpan={3}></td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2">AVERAGE</td>
                  <td className="border border-gray-300 p-1" colSpan={competenceColumns.length + 3}></td>
                  <td className="border border-gray-300 p-1 text-center">
                    {academic.totalAverage || academic.average}
                  </td>
                  <td className="border border-gray-300 p-1" colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="mb-6">
            {/* Overall Grade and Achievement */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-32">Overall Grade</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-20">
                    {academic.overallGrade}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                    Overall Achievement Descriptor
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {academic.overallAchievement}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Average Score and Ranking */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Average Score out 100:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-24">
                    {academic.averageScore}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Rank:</td>
                  <td className="border border-gray-300 p-2 text-center w-16">{academic.rank}</td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Number of Students</td>
                  <td className="border border-gray-300 p-2 text-center w-16">{academic.numberOfStudents}</td>
                </tr>
              </tbody>
            </table>

            {/* Comments Section */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                    Class Teacher's<br />Comment
                  </td>
                  <td className="border border-gray-300 p-2 text-left">
                    {comments.classTeacherComment || 'No comment provided'}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Signature</td>
                  <td className="border border-gray-300 p-2 w-32"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                    Head Teacher's<br />Comment
                  </td>
                  <td className="border border-gray-300 p-2 text-left">
                    {comments.headTeacherComment || 'No comment provided'}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Signature</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>

            {/* Fees Information */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-32">Next term Fees:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold w-32">
                    {fees.nextTermFees.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-24">Balance:</td>
                  <td className="border border-gray-300 p-2 text-center w-32">
                    {fees.balance.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-20">Total:</td>
                  <td className="border border-gray-300 p-2 text-center font-bold">
                    Ugx {fees.total.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Term Dates */}
            <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                    This term has ended on:
                  </td>
                  <td className="border border-gray-300 p-2 text-center w-32">
                    {term.endDate ? new Date(term.endDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                    Next term begins on:
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {term.nextTermStartDate ? new Date(term.nextTermStartDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grade Rubric - Page Break */}
          <div className="mb-6 page-break">
            <h3 className="text-lg font-semibold mb-2">Grade Rubric:</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 w-20">GRADE</th>
                  <th className="border border-gray-300 p-2 w-32">SCORE RANGE</th>
                  <th className="border border-gray-300 p-2">GRADE DESCRIPTOR</th>
                </tr>
              </thead>
              <tbody>
                {gradingScale.map((scale, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 text-center font-semibold">{scale.grade}</td>
                    <td className="border border-gray-300 p-2 text-center">{scale.scoreRange}</td>
                    <td className="border border-gray-300 p-2">{scale.descriptor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>
              Generated on {new Date().toLocaleDateString()} | {school?.website || ''}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onGeneratePDF} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// COMMENT MODAL COMPONENT
// =============================================================================

interface CommentModalProps {
  student: StudentListItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (comments: { classTeacher: string; headTeacher: string }) => void
}

function CommentModal({ student, isOpen, onClose, onSave }: CommentModalProps) {
  const [classTeacherComment, setClassTeacherComment] = useState("")
  const [headTeacherComment, setHeadTeacherComment] = useState("")

  const handleSave = () => {
    onSave({ 
      classTeacher: classTeacherComment, 
      headTeacher: headTeacherComment 
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Comments - {student?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Class Teacher Comment</Label>
            <Textarea 
              value={classTeacherComment} 
              onChange={(e) => setClassTeacherComment(e.target.value)} 
              rows={3}
              placeholder="Enter class teacher's comment..."
            />
          </div>

          <div className="space-y-2">
            <Label>Head Teacher Comment</Label>
            <Textarea 
              value={headTeacherComment} 
              onChange={(e) => setHeadTeacherComment(e.target.value)} 
              rows={3}
              placeholder="Enter head teacher's comment..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN REPORTS COMPONENT
// =============================================================================

function ReportsContent() {
  const { user } = useAuth()
  const { context, loading: contextLoading } = useAcademicContext()
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  // Selection state
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState("")
  
  // Data state
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [previewData, setPreviewData] = useState<ReportData | null>(null)
  const [commentStudent, setCommentStudent] = useState<StudentListItem | null>(null)
  
  // UI state
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Options state
  const [years, setYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [terms, setTerms] = useState<TermOption[]>([])

  // =============================================================================
  // DATA FETCHING EFFECTS
  // =============================================================================
  
  /**
   * Initialize with current context
   */
  useEffect(() => {
    if (context && !selectedYear && !selectedTerm) {
      setSelectedYear(context.year)
      setSelectedTerm(context.termEnum)
    }
  }, [context, selectedYear, selectedTerm])

  /**
   * Load academic years on component mount
   */
  useEffect(() => {
    const loadYears = async () => {
      try {
        const { academicYears } = await academicYearService.getAllAcademicYears()
        setYears(academicYears || [])
      } catch (error) {
        console.error('Failed to load academic years:', error)
        toast.error('Failed to load academic years')
        setYears([])
      }
    }
    
    loadYears()
  }, [])

  /**
   * Load terms when year changes
   */
  useEffect(() => {
    const loadTerms = async () => {
      if (!selectedYear) {
        setTerms([])
        return
      }

      try {
        const academicYear = years.find(y => y.year === selectedYear)
        if (!academicYear) {
          setTerms([])
          return
        }

        const { terms: termConfigs } = await academicYearService.getTermsForYear(academicYear.id!)
        setTerms(
          termConfigs.map((t) => ({
            value: t.term,
            label: academicYearService.formatTermName(t.term),
          }))
        )
      } catch (error) {
        console.error('Failed to load terms:', error)
        toast.error('Failed to load terms')
        setTerms([])
      }
    }
    
    loadTerms()
  }, [selectedYear, years])

  /**
   * Load classes on component mount
   */
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const { classes: allClasses } = await classService.getMyClasses()
        setClasses(allClasses || [])
      } catch (error) {
        console.error('Failed to load classes:', error)
        toast.error('Failed to load classes')
        setClasses([])
      }
    }
    
    loadClasses()
  }, [])

  /**
   * Load students when class/term/year selected
   */
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedYear || !selectedTerm || !selectedClass) {
        setStudents([])
        return
      }

      setLoading(true)
      try {
        const result = await studentService.getStudents({
          year: selectedYear,
          term: selectedTerm,
          classId: selectedClass,
          page: 1,
          pageSize: 100 // Get all students for reports
        })

        setStudents(result.students || [])
      } catch (error) {
        console.error('Failed to load students:', error)
        toast.error('Failed to load students')
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [selectedYear, selectedTerm, selectedClass])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle preview button click
   */
  const handlePreview = async (studentId: string) => {
    if (!selectedClass || !selectedYear || !selectedTerm) return

    setGenerating(true)
    try {
      const data = await pdfService.getPreviewData({
        studentId,
        classId: selectedClass,
        year: selectedYear,
        term: selectedTerm // Already in T1, T2, T3 format
      })
      
      setPreviewData(data)
      setShowPreviewModal(true)
    } catch (error: any) {
      console.error('Error loading preview:', error)
      toast.error(error.message || 'Failed to load preview')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Handle generate individual report
   */
  const handleGenerateReport = async (studentId: string) => {
    if (!selectedClass || !selectedYear || !selectedTerm) return

    setGenerating(true)
    try {
      await pdfService.generateReport({
        studentId,
        classId: selectedClass,
        year: selectedYear,
        term: selectedTerm // Already in T1, T2, T3 format
      })
      
      toast.success('PDF report generated successfully!')
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast.error(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Handle generate from preview modal
   */
  const handleGenerateFromPreview = async () => {
    if (!previewData || !selectedClass || !selectedYear || !selectedTerm) return

    setGenerating(true)
    try {
      await pdfService.generateReport({
        studentId: previewData.student.id,
        classId: selectedClass,
        year: selectedYear,
        term: selectedTerm // Already in T1, T2, T3 format
      })
      
      toast.success('PDF report generated successfully!')
      setShowPreviewModal(false)
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast.error(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Handle bulk generate all reports
   */
  const handleBulkGenerate = async () => {
    if (!selectedClass || !selectedYear || !selectedTerm || students.length === 0) return

    setGenerating(true)
    
    try {
      toast.info(`Starting bulk generation for ${students.length} students...`)
      
      const result = await pdfService.downloadAllReports(
        {
          classId: selectedClass,
          year: selectedYear,
          term: selectedTerm // Already in T1, T2, T3 format
        },
        (current, total) => {
          toast.info(`Generating report ${current} of ${total}...`)
        }
      )

      if (result.failed > 0) {
        toast.warning(
          `Bulk generation completed. ${result.successful} successful, ${result.failed} failed.`
        )
      } else {
        toast.success(`Successfully generated all ${result.successful} reports!`)
      }
    } catch (error: any) {
      console.error('Error in bulk generation:', error)
      toast.error(error.message || 'Failed to generate reports')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Handle save comments
   */
  const handleSaveComments = (comments: { classTeacher: string; headTeacher: string }) => {
    // TODO: Implement API call to save comments
    toast.info('Comment saving functionality needs to be implemented on the backend')
    setCommentStudent(null)
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Report Generator" }
  ]

  if (contextLoading) {
    return (
      <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      userRole={user.role} 
      userName={user.name} 
      breadcrumbs={breadcrumbs}
    >
      <style jsx global>{`
        @media print {
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Student Report Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive PDF reports for students with academic assessments, teacher comments, and fees information
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Academic Year Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select 
                  value={selectedYear?.toString() || ""} 
                  onValueChange={(value) => setSelectedYear(Number(value))}
                  disabled={years.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={years.length === 0 ? "No years available" : "Select year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.year.toString()}>
                        {year.year} {year.isCurrent && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Term</label>
                <Select 
                  value={selectedTerm || ""} 
                  onValueChange={setSelectedTerm}
                  disabled={!selectedYear || terms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedYear ? 'Select a year first' : 
                      terms.length === 0 ? 'No terms available' : 
                      'Select term'
                    } />
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

              {/* Class Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select 
                  value={selectedClass} 
                  onValueChange={setSelectedClass}
                  disabled={!selectedYear || !selectedTerm || classes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedYear || !selectedTerm ? 'Select year and term first' : 
                      classes.length === 0 ? 'No classes available' : 
                      'Select class'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id!}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Generate Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleBulkGenerate} 
                  disabled={!selectedClass || !selectedTerm || students.length === 0 || generating} 
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate All Reports
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List Card */}
        {selectedClass && selectedTerm && selectedYear ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students in {classes.find((c) => c.id === selectedClass)?.name} - {
                  terms.find(t => t.value === selectedTerm)?.label
                } {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                  <p className="text-muted-foreground">
                    No students are enrolled in this class for the selected term.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={student.profileImage} />
                          <AvatarFallback>
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{student.name}</h3>
                            <Badge variant="outline">{student.studentNumber}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Gender: {student.gender}</span>
                            <span>Status: {student.status}</span>
                            <Badge 
                              variant={
                                student.feeStatus === 'Paid' ? 'default' : 
                                student.feeStatus === 'Pending' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {student.feeStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCommentStudent(student)}
                          disabled={generating}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comments
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreview(student.id)}
                          disabled={generating}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>

                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(student.id)}
                          disabled={generating}
                        >
                          {generating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Generate PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select Class and Term</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Choose an academic year, term, and class to view students and generate their comprehensive PDF reports with grades, comments, and fees information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ReportPreviewModal
        reportData={previewData}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewData(null)
        }}
        onGeneratePDF={handleGenerateFromPreview}
        loading={generating}
      />

      <CommentModal
        student={commentStudent}
        isOpen={!!commentStudent}
        onClose={() => setCommentStudent(null)}
        onSave={handleSaveComments}
      />
    </MainLayout>
  )
}

// =============================================================================
// PAGE EXPORT WITH PROTECTED ROUTE
// =============================================================================

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher", "class_teacher", "bursar"]}>
      <ReportsContent />
    </ProtectedRoute>
  )
}