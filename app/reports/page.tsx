"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Users, Eye, Filter, MessageSquare, Loader2 } from "lucide-react"
import { reportCardService, ReportCardData, ReportCardParams } from "@/services/report-card.service"
import { academicYearService } from "@/services/accademic-year.service"
import { classService } from "@/services/class.service"
import apiClient from "@/lib/api-client"


// Helper Functions

// Function to show toast notifications
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 9999;
    font-family: system-ui;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, type === 'error' ? 5000 : 3000);
};

// Function to format date
const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB');
};

// Function to download PDF for a single student
const downloadStudentPDF = async (studentId: string, classId: string, year: number, term: 'T1' | 'T2' | 'T3') => {
  try {
    showToast('Generating PDF...', 'info');

    const response = await apiClient.get(`/report-cards/${studentId}/pdf`, {
      params: {
        classId,
        year,
        term
      },
      responseType: 'blob',
      timeout: 60000 // 60 seconds timeout for PDF generation
    });

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `Report_${studentId}_${year}_${term}.pdf`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1];
      }
    }
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('PDF downloaded successfully!', 'success');
  } catch (error: any) {
    console.error('PDF download error:', error);
    
    // Better error messages
    if (error.code === 'ECONNABORTED') {
      showToast('PDF generation timed out. Please try again.', 'error');
    } else {
      showToast(error.response?.data?.error || 'Failed to download PDF', 'error');
    }
  }
};

// Function to download bulk PDFs as ZIP
const downloadBulkPDFs = async (classId: string, year: number, term: 'T1' | 'T2' | 'T3') => {
  try {
    showToast('Generating ZIP file with all reports...', 'info');

    const response = await apiClient.post('/report-cards/bulk/pdf', 
      {
        classId,
        year,
        term
      },
      {
        responseType: 'blob',
        timeout: 600000 // 10 minutes timeout for bulk PDF generation
      }
    );

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `Class_${classId}_Reports_${year}_${term}.zip`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1];
      }
    }
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('ZIP file downloaded successfully!', 'success');
  } catch (error: any) {
    console.error('Bulk PDF download error:', error);
    
    // Better error messages
    if (error.code === 'ECONNABORTED') {
      showToast('Bulk PDF generation timed out. This class may have too many students. Try downloading individual PDFs instead.', 'error');
    } else {
      showToast(error.response?.data?.error || 'Failed to download ZIP file', 'error');
    }
  }
};

// Component Interfaces

interface ReportPreviewModalProps {
  reportCard: ReportCardData | null
  isOpen: boolean
  onClose: () => void
  onGeneratePDF: () => void
  selectedTerm: string
  selectedYear: string
}

interface CommentModalProps {
  reportCard: ReportCardData | null
  isOpen: boolean
  onClose: () => void
  onSave: (comments: { classTeacher: string; headTeacher: string; nextTermFees: number; balance: number }) => void
}

interface StudentDisplay {
  id: string
  studentId: string
  name: string
  studentNumber: string
  gender: string
  class: string
  stream: string
  year: string
  average: number
  grade: string
  photo: string | null
  reportCard: ReportCardData | null
}

// Modal Components

function ReportPreviewModal({
  reportCard,
  isOpen,
  onClose,
  onGeneratePDF,
  selectedTerm,
  selectedYear,
}: ReportPreviewModalProps) {
  if (!reportCard) return null

  // Determine the maximum number of competencies across all subjects
  // Filter out electives with no data — only show subjects the student actually takes
  const displaySubjects = reportCard.subjects.filter(
    (s: any) => s.isCore || s.hasData !== false
  )

  const getMaxCompetencies = () => {
    let maxComp = 0
    displaySubjects.forEach((subject: any) => {
      const compKeys = Object.keys(subject.competencies || {}).filter(key => 
        key.startsWith('c') && !isNaN(parseInt(key.slice(1)))
      )
      maxComp = Math.max(maxComp, compKeys.length)
    })
    return maxComp || 3 // Default to 3 if none found
  }

  const maxCompetencies = getMaxCompetencies()

  // Generate competency column headers dynamically
  const competencyHeaders = Array.from({ length: maxCompetencies }, (_, i) => `C${i + 1}`)

  // Get competency value for a subject
  const getCompetencyValue = (subject: any, index: number) => {
    const key = `c${index + 1}`
    const value = subject.competencies?.[key]
    return value !== undefined && value !== null ? value : "-"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* A4 size: 210mm x 297mm, using max-w-[210mm] for width */}
      <DialogContent className="w-[95vw] max-w-[794px] h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Report Preview - {reportCard.name}</span>
            <Badge variant="outline" className="text-xs">A4 Preview</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* A4 Paper Container - 210mm width = ~794px at 96dpi */}
        <div className="mx-auto bg-white shadow-lg" style={{ width: '210mm', minHeight: '297mm' }}>
          <div className="p-8 text-black text-[11px]" id="report-content">
            {/* School Header */}
            <div className="mb-4 border-b-2 border-gray-400 pb-3">
              <div className="flex items-start justify-between">
                {/* School Logo - Left */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src="/images/school-logo.png"
                    alt="School Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>

                {/* School Info - Center */}
                <div className="flex-1 text-center mx-4">
                  <h1 className="text-base font-bold text-blue-800 mb-0.5">{reportCard.school?.name || 'School Name'}</h1>
                  <p className="text-[10px] italic text-gray-700 mb-1">{reportCard.school?.motto || 'School Motto'}</p>
                  <p className="text-[9px] text-gray-600">{reportCard.school?.address}</p>
                  <p className="text-[9px] text-gray-600">{reportCard.school?.phone}</p>
                  <p className="text-[9px] text-gray-600">{reportCard.school?.email}</p>
                </div>

                {/* Student Photo - Right */}
                <div className="w-20 h-24 flex-shrink-0">
                  {reportCard.photo ? (
                    <img
                      src={reportCard.photo}
                      alt="Student Photo"
                      className="w-full h-full object-cover rounded border border-gray-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-20 h-24 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                      <span className="text-[8px]">PHOTO</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div className="text-center mb-3">
              <h2 className="text-sm font-bold border-b border-t border-gray-400 py-1.5 bg-gray-50">
                END OF {reportCard.term?.toUpperCase() || 'TERM'} REPORT CARD - {reportCard.year}
              </h2>
            </div>

            {/* Student Information Row */}
            <div className="mb-3">
              <div className="grid grid-cols-6 gap-2 text-[10px] border border-gray-300 p-2 bg-gray-50">
                <div><strong>Student No:</strong> {reportCard.studentNumber}</div>
                <div><strong>Name:</strong> {reportCard.name}</div>
                <div><strong>Gender:</strong> {reportCard.gender}</div>
                <div><strong>Class:</strong> {reportCard.class}</div>
                <div><strong>Stream:</strong> {reportCard.stream || '-'}</div>
                <div><strong>Year:</strong> {reportCard.year}</div>
              </div>
            </div>

            {/* Academic Performance Table - Dynamic Competencies */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold mb-2 bg-blue-800 text-white p-1.5">ACADEMIC PERFORMANCE</h3>
              <table className="w-full border-collapse text-[9px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-1 text-left font-semibold" rowSpan={2}>SUBJECT</th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" colSpan={maxCompetencies + 2}>
                      Scores for End Of Chapter Activities of Integration
                    </th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" rowSpan={2}>EOT<br/>/80</th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" rowSpan={2}>Total<br/>/100</th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" rowSpan={2}>Grade</th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" rowSpan={2}>Descriptor</th>
                    <th className="border border-gray-400 p-1 text-center font-semibold" rowSpan={2}>Tr's<br/>Init</th>
                  </tr>
                  <tr className="bg-gray-50">
                    {/* Dynamic Competency Headers */}
                    {competencyHeaders.map((header, idx) => (
                      <th key={idx} className="border border-gray-400 p-1 text-center text-[8px] font-medium">{header}</th>
                    ))}
                    <th className="border border-gray-400 p-1 text-center text-[8px] font-medium">Proj<br/>/10</th>
                    <th className="border border-gray-400 p-1 text-center text-[8px] font-medium">Score<br/>/20</th>
                  </tr>
                </thead>

                <tbody>
                  {displaySubjects.map((subject: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 p-1 font-medium">{subject.subject}</td>
                      {/* Dynamic Competency Values */}
                      {competencyHeaders.map((_, idx) => (
                        <td key={idx} className="border border-gray-400 p-1 text-center">
                          {getCompetencyValue(subject, idx)}
                        </td>
                      ))}
                      <td className="border border-gray-400 p-1 text-center">{subject.project ?? "-"}</td>
                      <td className="border border-gray-400 p-1 text-center">{subject.scoreOutOf20 ?? "-"}</td>
                      <td className="border border-gray-400 p-1 text-center">{subject.eot ?? "-"}</td>
                      <td className="border border-gray-400 p-1 text-center font-semibold">{subject.totalScore ?? "-"}</td>
                      <td className="border border-gray-400 p-1 text-center font-bold">{subject.grade}</td>
                      <td className="border border-gray-400 p-1 text-center text-[8px]">{subject.descriptor}</td>
                      <td className="border border-gray-400 p-1 text-center">{subject.teacherInitials || "-"}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="border border-gray-400 p-1">TOTAL</td>
                    <td className="border border-gray-400 p-1" colSpan={maxCompetencies + 3}></td>
                    <td className="border border-gray-400 p-1 text-center">{reportCard.total}</td>
                    <td className="border border-gray-400 p-1" colSpan={3}></td>
                  </tr>
                  {/* Average Row */}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="border border-gray-400 p-1">AVERAGE</td>
                    <td className="border border-gray-400 p-1" colSpan={maxCompetencies + 3}></td>
                    <td className="border border-gray-400 p-1 text-center">{reportCard.average}</td>
                    <td className="border border-gray-400 p-1 text-center font-bold">{reportCard.overallGrade}</td>
                    <td className="border border-gray-400 p-1" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Overall Performance Summary */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <table className="border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Overall Grade</td>
                    <td className="border border-gray-400 p-1.5 text-center font-bold text-lg">{reportCard.overallGrade}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Achievement</td>
                    <td className="border border-gray-400 p-1.5 text-center">{reportCard.overallAchievement}</td>
                  </tr>
                </tbody>
              </table>
              <table className="border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Average Score</td>
                    <td className="border border-gray-400 p-1.5 text-center font-bold">{reportCard.averageScore}/100</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Class Rank</td>
                    <td className="border border-gray-400 p-1.5 text-center font-bold">{reportCard.rank} / {reportCard.numberOfStudents}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comments Section */}
            <div className="mb-3">
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold w-36">Class Teacher's Comment</td>
                    <td className="border border-gray-400 p-1.5" style={{ minHeight: '40px' }}>
                      {reportCard.classTeacherComment || <span className="text-gray-400 italic">No comment</span>}
                    </td>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold w-20">Signature</td>
                    <td className="border border-gray-400 p-1.5 w-24">
                      {reportCard.classTeacherSignature ? (
                        <img src={reportCard.classTeacherSignature} alt="Signature" className="h-8 object-contain" />
                      ) : null}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Head Teacher's Comment</td>
                    <td className="border border-gray-400 p-1.5" style={{ minHeight: '40px' }}>
                      {reportCard.headTeacherComment || <span className="text-gray-400 italic">No comment</span>}
                    </td>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Signature</td>
                    <td className="border border-gray-400 p-1.5">
                      {reportCard.headTeacherSignature ? (
                        <img src={reportCard.headTeacherSignature} alt="Signature" className="h-8 object-contain" />
                      ) : null}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fees Information */}
            <div className="mb-3">
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Next Term Fees:</td>
                    <td className="border border-gray-400 p-1.5 text-center">UGX {reportCard.nextTermFees?.toLocaleString() || '0'}</td>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Balance:</td>
                    <td className="border border-gray-400 p-1.5 text-center">UGX {reportCard.balance?.toLocaleString() || '0'}</td>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Total Due:</td>
                    <td className="border border-gray-400 p-1.5 text-center font-bold">UGX {reportCard.totalFees?.toLocaleString() || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Term Dates */}
            <div className="mb-4">
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Term Ended:</td>
                    <td className="border border-gray-400 p-1.5 text-center">{formatDate(reportCard.termEnded)}</td>
                    <td className="border border-gray-400 p-1.5 bg-gray-100 font-semibold">Next Term Begins:</td>
                    <td className="border border-gray-400 p-1.5 text-center">{formatDate(reportCard.nextTermBegins)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grade Rubric */}
            <div className="mb-2">
              <h3 className="text-[10px] font-semibold mb-1 bg-gray-200 p-1">GRADE RUBRIC</h3>
              <table className="w-full border-collapse text-[8px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-1 w-16">GRADE</th>
                    <th className="border border-gray-400 p-1 w-20">SCORE RANGE</th>
                    <th className="border border-gray-400 p-1">GRADE DESCRIPTOR</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.gradeRubric?.map((scale, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 p-1 text-center font-bold">{scale.grade}</td>
                      <td className="border border-gray-400 p-1 text-center">{scale.scoreRange}</td>
                      <td className="border border-gray-400 p-1">{scale.descriptor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="text-center text-[8px] text-gray-500 border-t border-gray-300 pt-2 mt-4">
              <p>Generated on {new Date().toLocaleDateString()} | {reportCard.school?.website}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommentModal({ reportCard, isOpen, onClose, onSave }: CommentModalProps) {
  const [classTeacherComment, setClassTeacherComment] = useState(reportCard?.classTeacherComment || "")
  const [headTeacherComment, setHeadTeacherComment] = useState(reportCard?.headTeacherComment || "")
  const [nextTermFees, setNextTermFees] = useState(reportCard?.nextTermFees || 600000)
  const [balance, setBalance] = useState(reportCard?.balance || 0)

  useEffect(() => {
    if (reportCard) {
      setClassTeacherComment(reportCard.classTeacherComment)
      setHeadTeacherComment(reportCard.headTeacherComment)
      setNextTermFees(reportCard.nextTermFees)
      setBalance(reportCard.balance)
    }
  }, [reportCard])

  const handleSave = () => {
    onSave({ classTeacher: classTeacherComment, headTeacher: headTeacherComment, nextTermFees, balance })
    onClose()
  }

  if (!reportCard) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Edit Comments & Fees - {reportCard?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Class Teacher Comment</Label>
            <Textarea 
              value={classTeacherComment} 
              onChange={(e) => setClassTeacherComment(e.target.value)} 
              rows={3} 
              className="border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Head Teacher Comment</Label>
            <Textarea 
              value={headTeacherComment} 
              onChange={(e) => setHeadTeacherComment(e.target.value)} 
              rows={3}
              className="border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Next Term Fees (UGX)</Label>
              <Input 
                type="number" 
                value={nextTermFees} 
                onChange={(e) => setNextTermFees(Number(e.target.value))}
                className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Balance (UGX)</Label>
              <Input 
                type="number" 
                value={balance} 
                onChange={(e) => setBalance(Number(e.target.value))}
                className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" className="h-10" onClick={onClose}>Cancel</Button>
          <Button className="h-10" onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

function ReportsContent() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3' | "">("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [previewReportCard, setPreviewReportCard] = useState<ReportCardData | null>(null)
  const [commentReportCard, setCommentReportCard] = useState<ReportCardData | null>(null)
  const [students, setStudents] = useState<StudentDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [bulkReportCards, setBulkReportCards] = useState<ReportCardData[]>([])
  
  // Loading states for individual actions
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)
  const [downloadingBulk, setDownloadingBulk] = useState(false)

  const [years, setYears] = useState<any[]>([])
  const [terms, setTerms] = useState<{ value: string; label: string }[]>([])
  const [classes, setClasses] = useState<any[]>([])

  // Load academic years on mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const { academicYears } = await academicYearService.getAllAcademicYears()
        setYears(academicYears)
      } catch (error) {
        console.error("Failed to load academic years:", error)
      }
    }
    loadYears()
  }, [])

  // Load terms when year changes
  useEffect(() => {
    const loadTerms = async () => {
      if (!selectedYear) {
        setTerms([])
        return
      }
      const yearObj = years.find((y: any) => y.year.toString() === selectedYear)
      if (!yearObj) {
        setTerms([])
        return
      }
      try {
        const { terms: termConfigs } = await academicYearService.getTermsForYear(yearObj.id)
        setTerms(
          termConfigs.map((t: any) => ({
            value: t.term,
            label: academicYearService.formatTermName(t.term),
          }))
        )
      } catch (error) {
        console.error("Failed to load terms:", error)
      }
    }
    loadTerms()
  }, [selectedYear, years])

  // Load classes (once; they are not tied to a year/term in this UI)
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const { classes: backendClasses } = await classService.getMyClasses()
        setClasses(backendClasses)
      } catch (error) {
        console.error("Failed to load classes:", error)
      }
    }
    loadClasses()
  }, [])

  // Load students list (FAST) when class and term are selected
  // This only fetches basic student info, NOT full report cards
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !selectedTerm || !selectedYear) {
        setStudents([])
        setBulkReportCards([])
        return
      }

      setLoadingStudents(true)
      try {
        // Use the fast endpoint that just gets student list
        const result = await classService.getClassStudents(
          selectedClass,
          parseInt(selectedYear),
          selectedTerm
        )

        if (result.students && result.students.length > 0) {
          // Convert to student display format (without full report card data)
          const studentList: StudentDisplay[] = result.students.map((s: any) => ({
            id: s.id?.toString() || s.studentId?.toString(),
            studentId: s.id?.toString() || s.studentId?.toString(),
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
            studentNumber: s.studentNumber || `ST-${s.id}`,
            gender: s.gender || 'N/A',
            class: result.className || selectedClass,
            stream: s.stream || '',
            year: selectedYear,
            average: 0, // Will be loaded on-demand when preview is clicked
            grade: '-', // Will be loaded on-demand
            photo: s.photo || null,
            reportCard: null // Not loaded yet - will be fetched on demand
          }))

          setStudents(studentList)
          setBulkReportCards([]) // Clear any old cached report cards
          showToast(`Found ${studentList.length} students`, 'success')
        } else {
          showToast('No students found for selected filters', 'info')
          setStudents([])
          setBulkReportCards([])
        }
      } catch (error: any) {
        console.error('Error loading students:', error)
        showToast(error.message || 'Failed to load students', 'error')
        setStudents([])
        setBulkReportCards([])
      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudents()
  }, [selectedClass, selectedTerm, selectedYear])

  const handleGenerateReport = async (studentId: string) => {
    if (!selectedClass || !selectedTerm || !selectedYear) {
      showToast('Please select class, term and year', 'error')
      return
    }

    setDownloadingPDF(studentId)
    try {
      await downloadStudentPDF(
        studentId, 
        selectedClass, 
        parseInt(selectedYear), 
        selectedTerm as 'T1' | 'T2' | 'T3'
      )
    } finally {
      setDownloadingPDF(null)
    }
  }

  const handleBulkGenerate = async () => {
    if (!selectedClass || !selectedTerm || !selectedYear) {
      showToast('Please select class, term and year', 'error')
      return
    }

    if (students.length === 0) {
      showToast('No students to generate reports for', 'error')
      return
    }

    setDownloadingBulk(true)
    try {
      await downloadBulkPDFs(
        selectedClass, 
        parseInt(selectedYear), 
        selectedTerm as 'T1' | 'T2' | 'T3'
      )
    } finally {
      setDownloadingBulk(false)
    }
  }

  const handlePreview = async (student: StudentDisplay) => {
    // If we already have the report card cached, use it
    if (student.reportCard) {
      setPreviewReportCard(student.reportCard)
      return
    }

    // Otherwise, fetch it on-demand
    if (!selectedClass || !selectedTerm || !selectedYear) {
      showToast('Please select class, term and year', 'error')
      return
    }

    setLoadingPreview(student.studentId)
    try {
      const reportCard = await reportCardService.getReportCard({
        studentId: student.studentId,
        classId: selectedClass,
        year: parseInt(selectedYear),
        term: selectedTerm as 'T1' | 'T2' | 'T3'
      })

      // Cache the report card in the student list for future use
      setStudents(prev => prev.map(s => 
        s.studentId === student.studentId 
          ? { 
              ...s, 
              reportCard, 
              average: reportCard.average,
              grade: reportCard.overallGrade 
            }
          : s
      ))

      setPreviewReportCard(reportCard)
    } catch (error: any) {
      console.error('Error loading report card:', error)
      showToast(error.message || 'Failed to load report card preview', 'error')
    } finally {
      setLoadingPreview(null)
    }
  }

  const handleEditComments = async (student: StudentDisplay) => {
    // If we already have the report card cached, use it
    if (student.reportCard) {
      setCommentReportCard(student.reportCard)
      return
    }

    // Otherwise, fetch it on-demand
    if (!selectedClass || !selectedTerm || !selectedYear) {
      showToast('Please select class, term and year', 'error')
      return
    }

    setLoadingPreview(student.studentId)
    try {
      const reportCard = await reportCardService.getReportCard({
        studentId: student.studentId,
        classId: selectedClass,
        year: parseInt(selectedYear),
        term: selectedTerm as 'T1' | 'T2' | 'T3'
      })

      // Cache the report card
      setStudents(prev => prev.map(s => 
        s.studentId === student.studentId 
          ? { 
              ...s, 
              reportCard, 
              average: reportCard.average,
              grade: reportCard.overallGrade 
            }
          : s
      ))

      setCommentReportCard(reportCard)
    } catch (error: any) {
      console.error('Error loading report card:', error)
      showToast(error.message || 'Failed to load report card', 'error')
    } finally {
      setLoadingPreview(null)
    }
  }

  const handleSaveComments = (studentNumber: string, comments: any) => {
    // Update local state
    setStudents((prev) =>
      prev.map((student) =>
        student.studentNumber === studentNumber && student.reportCard
          ? { 
              ...student, 
              reportCard: {
                ...student.reportCard,
                classTeacherComment: comments.classTeacher,
                headTeacherComment: comments.headTeacher,
                nextTermFees: comments.nextTermFees,
                balance: comments.balance,
                totalFees: comments.nextTermFees + comments.balance
              }
            }
          : student
      )
    )

    // Update bulk report cards
    setBulkReportCards(prev => 
      prev.map(rc => 
        rc.studentNumber === studentNumber 
          ? {
              ...rc,
              classTeacherComment: comments.classTeacher,
              headTeacherComment: comments.headTeacher,
              nextTermFees: comments.nextTermFees,
              balance: comments.balance,
              totalFees: comments.nextTermFees + comments.balance
            }
          : rc
      )
    )

    showToast('Comments updated successfully (Note: Changes are local only)', 'success')
  }

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard"},
    { label: "Report Generator" }
  ]

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <style jsx global>{`
        @media print {
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report Generator</h1> */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate comprehensive PDF reports for students with academic assessments, teacher comments, and fees information
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              {/* Academic Year */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Academic Year</label>
                <Select
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y: any) => (
                      <SelectItem key={y.id} value={y.year.toString()}>
                        {y.year} {y.isCurrent && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Term</label>
                <Select
                  value={selectedTerm}
                  onValueChange={(value) => setSelectedTerm(value as any)}
                  disabled={!selectedYear || terms.length === 0}
                >
                  <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Class</label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={classes.length === 0}
                >
                  <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Download Button */}
              <div>
                <Button
                  onClick={handleBulkGenerate}
                  disabled={!selectedClass || !selectedTerm || loadingStudents || downloadingBulk || students.length === 0}
                  className="w-full h-9"
                >
                  {downloadingBulk ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download All (ZIP)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {loadingStudents ? (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Loading Students...</h3>
              <p className="text-slate-500 text-center max-w-md">
                Fetching student list. This should only take a moment...
              </p>
            </CardContent>
          </Card>
        ) : selectedClass && selectedTerm ? (
          students.length > 0 ? (
            <Card className="border-slate-200 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Students in Class - {reportCardService.formatTermForDisplay(selectedTerm)} {selectedYear}
                  </p>
                  <Badge variant="secondary" className="ml-2">{students.length} students</Badge>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={student.photo || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-700 dark:text-slate-300">{student.name}</h3>
                            <Badge variant="outline" className="border-slate-300">{student.studentNumber}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Gender: {student.gender}</span>
                            {student.reportCard ? (
                              <>
                                <span>Average: {student.average.toFixed(1)}%</span>
                                <Badge variant={student.grade === "A*" || student.grade === "A" ? "default" : "secondary"}>
                                  Grade {student.grade}
                                </Badge>
                              </>
                            ) : (
                              <span className="text-xs italic">Click Preview to load grades</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8"
                          onClick={() => handleEditComments(student)}
                          disabled={loadingPreview === student.studentId}
                        >
                          {loadingPreview === student.studentId ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4 mr-2" />
                          )}
                          Comments
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8"
                          onClick={() => handlePreview(student)}
                          disabled={loadingPreview === student.studentId}
                        >
                          {loadingPreview === student.studentId ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          Preview
                        </Button>

                        <Button 
                          size="sm"
                          className="h-8"
                          onClick={() => handleGenerateReport(student.studentId)}
                          disabled={downloadingPDF === student.studentId}
                        >
                          {downloadingPDF === student.studentId ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Report Cards Found</h3>
                <p className="text-slate-500 text-center max-w-md">
                  No report cards were found for the selected class and term. Please verify your selection or generate report cards first.
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Select Class and Term</h3>
              <p className="text-slate-500 text-center max-w-md">
                Choose an academic year, term, and class to view students and generate their comprehensive PDF reports with grades, comments, and fees information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        reportCard={previewReportCard}
        isOpen={!!previewReportCard}
        onClose={() => setPreviewReportCard(null)}
        onGeneratePDF={() => {
          if (previewReportCard && selectedClass && selectedTerm && selectedYear) {
            const student = students.find(s => s.reportCard === previewReportCard)
            if (student) {
              downloadStudentPDF(
                student.studentId,
                selectedClass,
                parseInt(selectedYear),
                selectedTerm as 'T1' | 'T2' | 'T3'
              )
            }
            setPreviewReportCard(null)
          }
        }}
        selectedTerm={selectedTerm}
        selectedYear={selectedYear}
      />

      {/* Comments Modal */}
      <CommentModal
        reportCard={commentReportCard}
        isOpen={!!commentReportCard}
        onClose={() => setCommentReportCard(null)}
        onSave={(comments) => {
          if (commentReportCard) {
            handleSaveComments(commentReportCard.studentNumber, comments)
          }
        }}
      />
    </MainLayout>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredPermissions={["reports.view"]}>
      <ReportsContent />
    </ProtectedRoute>
  )
}