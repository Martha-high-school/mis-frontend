import apiClient from "@/lib/api-client"

export interface ReportCardData {
  // Student Information
  studentNumber: string
  name: string
  gender: string
  class: string
  stream: string
  year: string
  photo: string | null

  // Subject Grades
  subjects: SubjectGrade[]

  // Overall Performance
  total: number
  average: number
  overallGrade: string
  overallAchievement: string
  averageScore: number
  rank: number
  numberOfStudents: number

  // Teacher Comments
  classTeacherComment: string
  headTeacherComment: string
  classTeacherSignature: string | null
  headTeacherSignature: string | null

  // Financial Information
  nextTermFees: number
  balance: number
  totalFees: number

  // Term Dates
  termEnded: Date | string
  nextTermBegins: Date | string | null

  // Grade Rubric
  gradeRubric: GradeRubric[]

  // School Information
  school: SchoolInfo
}

export interface SubjectGrade {
  subject: string
  competencies: {
    c1?: number
    c2?: number
    c3?: number
    c4?: number
    c5?: number
    [key: string]: number | undefined
  }
  project: number
  scoreOutOf20: number
  eot: number
  totalScore: number
  grade: string
  descriptor: string
  teacherInitials: string
}

export interface GradeRubric {
  grade: string
  scoreRange: string
  descriptor: string
}

export interface SchoolInfo {
  name: string
  motto: string
  logo: string | null
  address: string
  phone: string
  email: string
  website: string
}

export interface ReportCardParams {
  studentId: string
  classId: string
  year: number
  term: 'T1' | 'T2' | 'T3'
}

export interface BulkReportCardParams {
  classId: string
  year: number
  term: 'T1' | 'T2' | 'T3'
}

export interface BulkReportCardResult {
  success: boolean
  message: string
  results: {
    total: number
    successful: Array<{
      studentId: string
      studentName: string
      reportCard: ReportCardData
    }>
    failed: Array<{
      studentId: string
      studentName: string
      error: string
    }>
  }
}

export interface ReportSummary {
  student: {
    studentNumber: string
    name: string
    class: string
    stream: string
  }
  performance: {
    average: number
    overallGrade: string
    overallAchievement: string
    rank: number
    totalStudents: number
  }
  subjectCount: number
}

class ReportCardService {
  /**
   * Get complete report card for a student
   * GET /api/report-cards/:studentId?classId=X&year=Y&term=T1
   */
  async getReportCard(params: ReportCardParams): Promise<ReportCardData> {
    try {
      const response = await apiClient.get(`/report-cards/${params.studentId}`, {
        params: {
          classId: params.classId,
          year: params.year,
          term: params.term
        },
        timeout: 30000 // 30 seconds timeout
      })

      return response.data.data
    } catch (error: any) {
      console.error('Get report card error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get report card')
    }
  }

  /**
   * Get report summary (performance overview only)
   * GET /api/report-cards/:studentId/summary?classId=X&year=Y&term=T1
   */
  async getReportSummary(params: ReportCardParams): Promise<ReportSummary> {
    try {
      const response = await apiClient.get(
        `/report-cards/${params.studentId}/summary`,
        {
          params: {
            classId: params.classId,
            year: params.year,
            term: params.term
          },
          timeout: 30000 // 30 seconds timeout
        }
      )

      return response.data.data
    } catch (error: any) {
      console.error('Get report summary error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get report summary')
    }
  }

  /**
   * Get report cards for all students in a class
   * POST /api/report-cards/bulk
   * 
   * Note: This can take 5-10 seconds per student, so timeout is set to 5 minutes
   */
  async getBulkReportCards(params: BulkReportCardParams): Promise<BulkReportCardResult> {
    try {
      // Increase timeout for bulk operations
      // Average: ~10 seconds per student
      // 30 students = ~5 minutes
      const response = await apiClient.post('/report-cards/bulk', params, {
        timeout: 300000 // 5 minutes timeout
      })
      return response.data
    } catch (error: any) {
      console.error('Get bulk report cards error:', error)
      
      // Provide more specific error message for timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The class has many students and generation is taking longer than expected.')
      }
      
      throw new Error(error.response?.data?.error || 'Failed to get bulk report cards')
    }
  }

  /**
   * Helper: Format term for display
   */
  formatTermForDisplay(term: string): string {
    const termMap: { [key: string]: string } = {
      'T1': 'Term 1',
      'T2': 'Term 2',
      'T3': 'Term 3'
    }
    return termMap[term] || term
  }

  /**
   * Helper: Format term for API
   */
  formatTermForAPI(term: string): 'T1' | 'T2' | 'T3' {
    const termMap: { [key: string]: 'T1' | 'T2' | 'T3' } = {
      'term1': 'T1',
      'term2': 'T2',
      'term3': 'T3',
      '1': 'T1',
      '2': 'T2',
      '3': 'T3'
    }
    return termMap[term.toLowerCase()] || term as 'T1' | 'T2' | 'T3'
  }

  /**
   * Helper: Calculate grade color
   */
  getGradeColor(grade: string): string {
    const colorMap: { [key: string]: string } = {
      'A*': '#10b981', // green-500
      'A': '#22c55e',  // green-400
      'B': '#3b82f6',  // blue-500
      'C': '#f59e0b',  // amber-500
      'D': '#f97316',  // orange-500
      'F': '#ef4444'   // red-500
    }
    return colorMap[grade] || '#6b7280' // gray-500 default
  }
}

export const reportCardService = new ReportCardService()