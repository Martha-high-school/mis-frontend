import apiClient from "@/lib/api-client"

export interface ReportData {
  student: {
    id: string
    name: string
    firstName: string
    lastName: string
    studentNumber: string
    gender: string
    class: string
    stream: string
    year: string
    profileImage?: string | null
  }
  academic: {
    subjects: SubjectPerformance[]
    totalMarks: number
    totalAverage: number
    average: number
    overallGrade: string
    overallAchievement: string
    averageScore: number
    rank: number
    numberOfStudents: number
    grade: string
    maxCompetences: number
  }
  comments: {
    classTeacherComment: string
    headTeacherComment: string
  }
  fees: {
    nextTermFees: number
    balance: number
    total: number
  }
  term: {
    name: string
    endDate: string | Date
    nextTermStartDate?: string | Date | null
  }
  school: {
    name: string
    motto: string
    logo: string
    poBox: string
    phone: string
    email: string
    website: string
  } | null
  gradingScale: GradeRange[]
  status: string
}

export interface SubjectPerformance {
  name: string
  formative: {
    u1: number | null
    u2: number | null
    u3: number | null
    u4: number | null
    u5?: number | null
    u6?: number | null
    average: number
    total: number
  }
  summative: {
    mt: number
    eot: number
    total: number
    mark: number
  }
  totalMark: number
  grade: string
  descriptor: string
  teacherInitials: string
}

export interface GradeRange {
  grade: string
  scoreRange: string
  descriptor: string
}

export interface GenerateReportParams {
  studentId: string
  classId: string
  year: number
  term: string // 'T1' | 'T2' | 'T3'
}

export interface BulkGenerateParams {
  classId: string
  year: number
  term: string // 'T1' | 'T2' | 'T3'
}

export interface BulkGenerateResult {
  message: string
  results: {
    total: number
    successful: Array<{
      studentId: string
      studentName: string
      fileName: string
      htmlContent: string
    }>
    failed: Array<{
      studentId: string
      studentName: string
      error: string
    }>
  }
}

class PDFService {
  /**
   * Generate and download PDF report from database data
   * Uses the integrated backend (no separate PDF server needed)
   */
  async generateReport(params: GenerateReportParams): Promise<void> {
    try {
      const response = await apiClient.post('/pdf/generate-report', params, {
        responseType: 'blob'
      })

      // Generate filename
      const fileName = `Report_${params.studentId}_${params.term}_${params.year}.pdf`
      
      // Download the blob
      this.downloadBlob(response.data, fileName)
    } catch (error: any) {
      console.error('PDF generation error:', error)
      throw new Error(error.response?.data?.error || 'Failed to generate PDF report')
    }
  }

  /**
   * Generate PDF from raw HTML (legacy support)
   */
  async generateFromHTML(htmlContent: string, fileName: string = 'report.pdf'): Promise<void> {
    try {
      const response = await apiClient.post('/pdf/generate-from-html', {
        htmlContent,
        fileName,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '10px',
            right: '15px',
            bottom: '10px',
            left: '15px'
          }
        }
      }, {
        responseType: 'blob'
      })

      this.downloadBlob(response.data, fileName)
    } catch (error: any) {
      console.error('PDF from HTML error:', error)
      throw new Error(error.response?.data?.error || 'Failed to generate PDF from HTML')
    }
  }

  /**
   * Get report preview data without generating PDF
   */
  async getPreviewData(params: GenerateReportParams): Promise<ReportData> {
    try {
      const response = await apiClient.get(`/pdf/preview-data/${params.studentId}`, {
        params: {
          classId: params.classId,
          year: params.year,
          term: params.term
        }
      })

      return response.data.data
    } catch (error: any) {
      console.error('Preview data error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get preview data')
    }
  }

  /**
   * Bulk generate reports for a class
   * Returns HTML content for each student - frontend then generates PDFs one by one
   */
  async bulkGenerate(params: BulkGenerateParams): Promise<BulkGenerateResult> {
    try {
      const response = await apiClient.post('/pdf/bulk-generate', params)
      return response.data
    } catch (error: any) {
      console.error('Bulk generate error:', error)
      throw new Error(error.response?.data?.error || 'Failed to bulk generate reports')
    }
  }

  /**
   * Download all reports for a class
   * Generates PDFs one by one with progress tracking
   */
  async downloadAllReports(
    params: BulkGenerateParams,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ successful: number; failed: number }> {
    try {
      // Step 1: Get HTML content for all students
      const bulkResult = await this.bulkGenerate(params)
      const { successful, failed } = bulkResult.results

      if (successful.length === 0) {
        throw new Error('No reports to generate')
      }

      // Step 2: Generate PDFs one by one
      let successCount = 0
      let failCount = failed.length

      for (let i = 0; i < successful.length; i++) {
        const student = successful[i]

        try {
          // Small delay between downloads to prevent overwhelming
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          await this.generateFromHTML(student.htmlContent, student.fileName)
          successCount++

          // Update progress
          if (onProgress) {
            onProgress(i + 1, successful.length)
          }
        } catch (error) {
          console.error(`Failed to download report for ${student.studentName}:`, error)
          failCount++
        }
      }

      return { successful: successCount, failed: failCount }
    } catch (error: any) {
      console.error('Download all reports error:', error)
      throw new Error(error.message || 'Failed to download reports')
    }
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)
  }

  /**
   * Check PDF service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/pdf/health')
      return response.status === 200
    } catch {
      return false
    }
  }

  /**
   * Convert term from UI format (term1, term2, term3) to API format (T1, T2, T3)
   */
  formatTermForAPI(term: string): string {
    const termMap: { [key: string]: string } = {
      'term1': 'T1',
      'term2': 'T2',
      'term3': 'T3',
      '1': 'T1',
      '2': 'T2',
      '3': 'T3'
    }
    return termMap[term.toLowerCase()] || term
  }

  /**
   * Convert term from API format (T1, T2, T3) to UI format (Term 1, Term 2, Term 3)
   */
  formatTermForDisplay(term: string): string {
    const termMap: { [key: string]: string } = {
      'T1': 'Term 1',
      'T2': 'Term 2',
      'T3': 'Term 3'
    }
    return termMap[term] || term
  }
}

export const pdfService = new PDFService()