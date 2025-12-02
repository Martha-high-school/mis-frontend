import apiClient from "@/lib/api-client"

export interface SubjectScoreDetail {
  subjectId: string
  subjectName: string
  continuousScore: number
  eotScore: number
  total: number
  passed: boolean
}

export interface SubjectInfo {
  id: string
  name: string
  isCore?: boolean
}

export interface StudentForPromotion {
  id: string
  enrollmentId: string
  firstName: string
  lastName: string
  fullName: string
  gender: string
  photo: string | null
  averageScore: number
  totalScore: number
  subjectCount: number
  passedSubjects: number
  failedSubjects: number
  passStatus: 'PASS' | 'FAIL'
  // Subject scores as object keyed by subject name
  subjectScores: Record<string, SubjectScoreDetail>
  promotionStatus: 'PENDING' | 'PROMOTED' | 'REPEATED'
  promotionRemarks: string | null
  promotedToClassId: string | null
  promotedToClassName?: string | null
  isAlreadyProcessed: boolean
  qualifiesForPromotion: boolean
}

export interface AvailableClass {
  id: string
  name: string
  level: string
  rank?: string
  stream?: string | null
  classTeacher?: {
    id: string
    name: string
  } | null
  studentCount: number
}

export interface NextLevelInfo {
  currentClass: {
    id: string
    name: string
    level: string
    rank?: string
    stream?: string | null
  }
  nextLevel: string | null
  nextRank: string | null
  nextLevelDisplay: string
  isGraduatingClass: boolean
  isOLevelToALevel: boolean
  suggestedClassId: string | null
  suggestedClassName: string | null
  availableClasses: AvailableClass[]
}

export interface StudentsForPromotionResponse {
  classId: string
  className: string
  classLevel: string
  classRank?: string
  year: number
  term: string
  // Summary stats
  totalStudents: number
  passingStudents: number
  failingStudents: number
  alreadyProcessed: number
  pendingDecisions: number
  // Subjects for table headers
  subjects: SubjectInfo[]
  // Students data
  students: StudentForPromotion[]
  // Next level info
  nextLevelInfo: NextLevelInfo
  nextAcademicYear: {
    id: string
    year: number
  } | null
  canProcess: boolean
}

export interface PromotionDecision {
  studentId: string
  action: 'PROMOTE' | 'REPEAT'
  toClassId?: string
  remarks?: string
}

export interface ProcessPromotionsPayload {
  year: number
  newAcademicYearId: string
  decisions: PromotionDecision[]
}

export interface ProcessPromotionsResponse {
  message: string
  summary: {
    promoted: number
    repeated: number
    errors: number
    total: number
  }
  results: {
    promoted: any[]
    repeated: any[]
    errors: any[]
  }
}

export interface TeacherOverridePayload {
  studentId: string
  fromClassId: string
  toClassId?: string
  action: 'PROMOTE' | 'REPEAT'
  reason: string
}

export interface PromotionStats {
  totalStudents: number
  promoted: number
  repeated: number
  pending: number
  percentageComplete: number
}

export interface PromotionHistoryItem {
  id: string
  year: number
  fromClass: string
  toClass: string
  status: string
  averageScore: number | null
  remarks: string | null
  createdAt: string
}

export interface AvailableYear {
  id: string
  year: number
  isCurrent: boolean
}

// PROMOTION SERVICE

class PromotionService {
  /**
   * Get available years for promotion filtering
   */
  async getAvailableYears(): Promise<{ count: number; years: AvailableYear[] }> {
    try {
      const response = await apiClient.get('/promotions/years')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch years")
    }
  }

  /**
   * Get students with Term 3 results for promotion
   * Filter by year to access any year's T3 results
   */
  async getStudentsForPromotion(
    classId: string | number,
    year?: number
  ): Promise<StudentsForPromotionResponse> {
    try {
      const params = year ? { year } : {}
      const response = await apiClient.get(
        `/promotions/classes/${classId}/students`,
        { params }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch students")
    }
  }

  /**
   * Get available next-level classes for promotion
   */
  async getNextLevelClasses(classId: string | number): Promise<NextLevelInfo> {
    try {
      const response = await apiClient.get(
        `/promotions/classes/${classId}/next-classes`
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch next classes")
    }
  }

  /**
   * Get promotion statistics for a class
   */
  async getPromotionStats(
    classId: string | number,
    year?: number
  ): Promise<{ classId: string; year: number; stats: PromotionStats }> {
    try {
      const params = year ? { year } : {}
      const response = await apiClient.get(
        `/promotions/classes/${classId}/stats`,
        { params }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch stats")
    }
  }

  /**
   * Process bulk promotions for a class
   */
  async processPromotions(
    classId: string | number,
    payload: ProcessPromotionsPayload
  ): Promise<ProcessPromotionsResponse> {
    try {
      const response = await apiClient.post(
        `/promotions/classes/${classId}/process`,
        payload
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to process promotions")
    }
  }

  /**
   * Teacher override - manually promote or repeat a student
   */
  async teacherOverride(
    payload: TeacherOverridePayload
  ): Promise<{ message: string; result: any }> {
    try {
      const response = await apiClient.post('/promotions/override', payload)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to submit override")
    }
  }

  /**
   * Get student's promotion history
   */
  async getStudentHistory(
    studentId: string | number
  ): Promise<{ studentId: string; count: number; history: PromotionHistoryItem[] }> {
    try {
      const response = await apiClient.get(
        `/promotions/students/${studentId}/history`
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch history")
    }
  }

  // UTILITY METHODS

  /**
   * Generate default decisions based on pass/fail status
   */
  generateDefaultDecisions(
    students: StudentForPromotion[],
    suggestedClassId: string | null,
    currentClassId: string
  ): PromotionDecision[] {
    return students.map(student => ({
      studentId: student.id,
      action: student.qualifiesForPromotion ? 'PROMOTE' : 'REPEAT',
      toClassId: student.qualifiesForPromotion 
        ? (suggestedClassId || undefined)
        : currentClassId,
      remarks: student.qualifiesForPromotion
        ? 'Auto-promote based on qualifying grade'
        : 'Auto-repeat based on non-qualifying grade'
    }))
  }

  /**
   * Format promotion status for display
   */
  formatStatus(status: string): { text: string; color: string } {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: 'Pending', color: 'gray' },
      PROMOTED: { text: 'Promoted', color: 'green' },
      REPEATED: { text: 'Repeating', color: 'amber' }
    }
    return statusMap[status] || { text: status, color: 'gray' }
  }

  /**
   * Get rank display name
   */
  getRankDisplayName(rank: string): string {
    const rankMap: Record<string, string> = {
      'S1': 'Senior 1',
      'S2': 'Senior 2',
      'S3': 'Senior 3',
      'S4': 'Senior 4 (O-Level)',
      'S5': 'Senior 5',
      'S6': 'Senior 6 (A-Level)'
    }
    return rankMap[rank?.toUpperCase()] || rank
  }

  /**
   * Get class level display name (backward compatible)
   */
  getLevelDisplayName(level: string): string {
    // Handle both old level format and new rank format
    const levelMap: Record<string, string> = {
      'O': 'O-Level',
      'A': 'A-Level',
      'S1': 'Senior 1',
      'S2': 'Senior 2',
      'S3': 'Senior 3',
      'S4': 'Senior 4 (O-Level)',
      'S5': 'Senior 5',
      'S6': 'Senior 6 (A-Level)'
    }
    return levelMap[level?.toUpperCase()] || level
  }

  /**
   * Get grade badge color based on score
   */
  getScoreBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-blue-100 text-blue-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  /**
   * Check if a class is graduating
   */
  isGraduatingRank(rank: string): boolean {
    return rank?.toUpperCase() === 'S6'
  }

  /**
   * Check if this is O-Level to A-Level transition
   */
  isOLevelToALevelTransition(rank: string): boolean {
    return rank?.toUpperCase() === 'S4'
  }

  /**
   * Get next rank in progression
   */
  getNextRank(currentRank: string): string | null {
    const progressionMap: Record<string, string | null> = {
      'S1': 'S2',
      'S2': 'S3',
      'S3': 'S4',
      'S4': 'S5',
      'S5': 'S6',
      'S6': null
    }
    return progressionMap[currentRank?.toUpperCase()] || null
  }

  /**
   * Generate class name from rank and stream
   */
  generateClassName(rank: string, stream?: string | null): string {
    if (!rank) return ''
    const baseName = rank.replace('S', 'S.')
    if (stream && ['Sciences', 'Arts'].includes(stream)) {
      return `${baseName} ${stream}`
    }
    if (stream) {
      return `${baseName} ${stream}`
    }
    return baseName
  }
}

export const promotionService = new PromotionService()