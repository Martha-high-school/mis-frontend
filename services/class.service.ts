import apiClient from "@/lib/api-client"
export interface ClassData {
  id?: string
  name: string
  level: string        // "O" or "A"
  rank?: string        // "S1", "S2", "S3", "S4", "S5", "S6"
  stream?: string | null  // null, "A", "B", "Sciences", "Arts"
  classTeacherId?: string | number
  status?: string
  studentCount?: number
  classTeacher?: {
    id: string
    firstName: string
    lastName: string
    email?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateClassData {
  rank: string         // Required: "S1", "S2", "S3", "S4", "S5", "S6"
  stream?: string | null  // Required for A-Level (S5, S6): "Sciences" or "Arts"
  name?: string        // Optional: Auto-generated from rank + stream
  classTeacherId?: string | number
}

export interface RankOption {
  rank: string
  level: string
  description: string
  requiresStream?: boolean
}

export interface StreamOption {
  value: string | null
  label: string
}

export interface SubjectCompetence {
  idx?: number
  name: string
  maxScore?: number
}

export interface SubjectWithCompetences {
  subjectName: string
  isCore?: boolean
  competences: SubjectCompetence[]
}

export interface ClassSubject {
  id: string
  classId: string
  subjectId: string
  year: number
  isActive: boolean
  isCore?: boolean
  instructorId?: string
  instructorName?: string
  instructorInitials?: string
  instructor?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  subject: {
    id: string
    name: string
    isCore: boolean
  }
  competences: Array<{
    id: string
    idx: number
    name: string
    maxScore: number
  }>
}

export interface AssessmentData {
  projectScore: number
  continuousScore: number
  eotScore: number
  competenceScores?: Record<string, number>
}

export interface SaveAssessmentsPayload {
  year: number
  term: string | number
  subjectName: string
  assessments: Record<string, AssessmentData>
}

export interface CompetenceSettingsPayload {
  year: number
  term: string
  subjects: Array<{
    subjectName: string
    competences: SubjectCompetence[]
  }>
}

export interface ClassSummary {
  totalStudents: number
  byGender: {
    male: number
    female: number
    other: number
  }
  byStatus: {
    initial: number
    promoted: number
    repeated: number
  }
}

export interface ClassSetupStatus {
  classId: string
  year: number
  term: string
  isSetup: boolean
  hasInstructors: boolean
  totalSubjects: number
  coreSubjectsCount: number
  electiveSubjectsCount: number
  subjects: ClassSubject[]
}

export interface SetupSubject {
  subjectName: string
  isCore: boolean
  instructorId?: string
  instructorInitials?: string
  competences?: SubjectCompetence[]
}

export interface SubjectWithInstructor extends ClassSubject {}

// CLASS SERVICE

class ClassService {
  // RANK & STREAM UTILITIES

  /**
   * Get available ranks for class creation
   */
  getAvailableRanks(): RankOption[] {
    return [
      { rank: 'S1', level: 'O', description: 'Senior 1 (O-Level)' },
      { rank: 'S2', level: 'O', description: 'Senior 2 (O-Level)' },
      { rank: 'S3', level: 'O', description: 'Senior 3 (O-Level)' },
      { rank: 'S4', level: 'O', description: 'Senior 4 (O-Level Final)' },
      { rank: 'S5', level: 'A', description: 'Senior 5 (A-Level)', requiresStream: true },
      { rank: 'S6', level: 'A', description: 'Senior 6 (A-Level Final)', requiresStream: true },
    ]
  }

  /**
   * Get available streams for a rank
   */
  getAvailableStreams(rank: string): StreamOption[] {
    const r = rank?.toUpperCase()
    
    // A-Level requires Sciences or Arts
    if (r === 'S5' || r === 'S6') {
      return [
        { value: 'Sciences', label: 'Sciences' },
        { value: 'Arts', label: 'Arts' }
      ]
    }

    // O-Level can have optional streams
    return [
      { value: null, label: 'No Stream' },
      { value: 'A', label: 'Stream A' },
      { value: 'B', label: 'Stream B' },
      { value: 'C', label: 'Stream C' }
    ]
  }

  /**
   * Check if rank requires a stream
   */
  rankRequiresStream(rank: string): boolean {
    const r = rank?.toUpperCase()
    return r === 'S5' || r === 'S6'
  }

  /**
   * Get level from rank
   */
  getLevelFromRank(rank: string): 'O' | 'A' {
    const r = rank?.toUpperCase()
    if (r === 'S5' || r === 'S6') return 'A'
    return 'O'
  }

  /**
   * Generate class name from rank and stream
   */
  generateClassName(rank: string, stream?: string | null): string {
    if (!rank) return ''
    
    // Convert S1 to S.1, S2 to S.2, etc.
    const baseName = rank.replace('S', 'S.')
    
    if (stream && ['Sciences', 'Arts'].includes(stream)) {
      return `${baseName} ${stream}`
    }
    if (stream) {
      return `${baseName} ${stream}`
    }
    return baseName
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
      'S6': null  // Graduates
    }

    const normalized = currentRank?.toUpperCase()
    return progressionMap[normalized] || null
  }

  /**
   * Format rank for display
   */
  formatRankDisplay(rank: string): string {
    const displayMap: Record<string, string> = {
      'S1': 'Senior 1',
      'S2': 'Senior 2',
      'S3': 'Senior 3',
      'S4': 'Senior 4',
      'S5': 'Senior 5',
      'S6': 'Senior 6'
    }
    return displayMap[rank?.toUpperCase()] || rank
  }

  // CLASS CRUD OPERATIONS

  /**
   * Get all classes (head teacher only)
   */
  async getAllClasses(): Promise<{ classes: ClassData[]; message: string }> {
    try {
      const response = await apiClient.get("/classes")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch classes")
    }
  }

  /**
   * Get classes for the logged-in user
   */
  async getMyClasses(): Promise<{ classes: ClassData[]; message: string }> {
    try {
      const response = await apiClient.get("/classes/my")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch classes")
    }
  }

  /**
   * Get a specific class by ID
   */
  async getClassById(classId: string | number): Promise<ClassData> {
    try {
      const response = await apiClient.get(`/classes/${classId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch class")
    }
  }

  /**
   * Get class summary with student statistics
   */
  async getClassSummary(
    classId: string | number,
    params?: { year?: number; term?: "T1" | "T2" | "T3" }
  ): Promise<{
    classId: string
    academicYear: number
    term: string
    summary: ClassSummary
  }> {
    try {
      const queryParams = params
        ? {
            year: params.year,
            term: params.term,
          }
        : {}

      const response = await apiClient.get(`/classes/${classId}/summary`, {
        params: queryParams,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch class summary")
    }
  }

  /**
   * Check if class has been set up with subjects
   */
  async getClassSetupStatus(
    classId: string | number,
    year: string | number,
    term: string
  ): Promise<ClassSetupStatus> {
    try {
      const response = await apiClient.get(`/classes/${classId}/setup-status`, {
        params: {
          year,
          term,
        },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to check setup status")
    }
  }

  /**
   * Create a new class with rank
   */
  async createClass(classData: CreateClassData): Promise<{ message: string; class: ClassData }> {
    try {
      const response = await apiClient.post("/classes", classData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create class")
    }
  }

  /**
   * Update a class
   */
  async updateClass(
    classId: string | number,
    updates: Partial<ClassData>
  ): Promise<{ message: string; class: ClassData }> {
    try {
      const response = await apiClient.patch(`/classes/${classId}`, updates)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update class")
    }
  }

  /**
   * Delete a class (soft delete)
   */
  async deleteClass(classId: string | number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/classes/${classId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete class")
    }
  }

  /**
   * Assign a teacher to a class
   */
  async assignTeacher(
    classId: string | number,
    teacherId: string | number
  ): Promise<{ message: string; class: ClassData }> {
    try {
      const response = await apiClient.patch(`/classes/${classId}/assign-teacher`, {
        classTeacherId: teacherId,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to assign teacher")
    }
  }

  /**
   * Get students in a class
   */
  async getClassStudents(classId: string | number, year?: number, term?: number | string) {
    try {
      const params: any = {}
      if (year) params.year = year
      if (term) params.term = term

      const response = await apiClient.get(`/classes/${classId}/students`, { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch students")
    }
  }

  /**
   * Setup class subjects with instructors
   */
  async setupClassSubjects(
    classId: string | number,
    year: number,
    subjects: SetupSubject[]
  ): Promise<{ message: string; classId: string; year: number; subjects: any[] }> {
    try {
      const response = await apiClient.post(
        `/classes/${classId}/subjects/setup`,
        { subjects },
        { params: { year } }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to setup subjects")
    }
  }

  /**
   * Get class subjects with instructor information
   */
  async getClassSubjectsWithInstructors(classId: string | number): Promise<{
    classId: string
    year: number
    subjects: SubjectWithInstructor[]
  }> {
    try {
      const response = await apiClient.get(`/classes/${classId}/subjects/with-instructors`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch subjects")
    }
  }

  /**
   * Update subject instructor
   */
  async updateSubjectInstructor(
    classId: string | number,
    subjectId: string | number,
    instructorId: string | number | null,
    instructorInitials?: string
  ): Promise<{
    message: string
    classSubject: SubjectWithInstructor
  }> {
    try {
      const response = await apiClient.patch(`/classes/${classId}/subjects/${subjectId}/instructor`, {
        instructorId,
        instructorInitials,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update instructor")
    }
  }

  // ACADEMIC OPERATIONS

  /**
   * Get available academic years
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await apiClient.get("/academics/years")
      return response.data.years
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch years")
    }
  }

  /**
   * Get available terms for a specific year
   */
  async getAvailableTerms(year: number): Promise<string[]> {
    try {
      const response = await apiClient.get("/academics/terms", {
        params: { year },
      })
      return response.data.terms
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch terms")
    }
  }

  /**
   * Set subjects for a class (legacy method)
   */
  async setClassSubjects(
    classId: string | number,
    year: number,
    subjects: SubjectWithCompetences[]
  ): Promise<ClassSubject[]> {
    try {
      const response = await apiClient.post(`/academics/classes/${classId}/subjects`, {
        year,
        subjects,
      })
      return response.data.subjects
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to set subjects")
    }
  }

  /**
   * Get subjects for a class in a specific year WITH term-specific competencies
   */
  async getClassSubjects(
    classId: string | number,
    year: number,
    term?: string | number
  ): Promise<ClassSubject[]> {
    try {
      const params: any = { year }
      
      if (term !== undefined && term !== null) {
        params.term = term
      }

      const response = await apiClient.get(`/academics/classes/${classId}/subjects`, {
        params,
      })
      return response.data.subjects
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch subjects")
    }
  }

  /**
   * Update competence settings for a class
   */
  async saveCompetenceSettings(classId: string | number, payload: CompetenceSettingsPayload) {
    try {
      const response = await apiClient.patch(`/academics/classes/${classId}/competences`, payload)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to save competence settings")
    }
  }

  /**
   * Save assessments for a subject
   */
  async saveAssessments(classId: string | number, payload: SaveAssessmentsPayload) {
    try {
      const response = await apiClient.post(`/academics/classes/${classId}/assessments`, payload)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to save assessments")
    }
  }

  /**
   * Get assessments for a class/year/term (optionally filtered by subject)
   */
  async getAssessments(
    classId: string | number,
    year: number,
    term: string | number,
    subjectName?: string
  ): Promise<any> {
    try {
      const params: any = { year, term }
      if (subjectName) {
        params.subjectName = subjectName
      }

      const response = await apiClient.get(`/academics/classes/${classId}/assessments`, { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch assessments")
    }
  }

  /**
   * Create or get a term record
   */
  async createOrGetTerm(classId: string | number, year: number, term: string) {
    try {
      const response = await apiClient.post(`/academics/classes/${classId}/term`, {
        year,
        term,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create term")
    }
  }

  async getClassTeachers() {
    try {
      const response = await apiClient.get(`users/teachers`)
      return response.data.teachers
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed get class teachers")
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  formatTerm(term: string): string {
    const termMap: Record<string, string> = {
      T1: "Term 1",
      T2: "Term 2",
      T3: "Term 3",
      "1": "Term 1",
      "2": "Term 2",
      "3": "Term 3",
    }
    return termMap[term] || term
  }

  getSubjectTypeBadge(isCore: boolean): { text: string; className: string } {
    return isCore
      ? { text: "Core", className: "bg-blue-100 text-blue-800 border-blue-200" }
      : { text: "Elective", className: "bg-green-100 text-green-800 border-green-200" }
  }

  getSubjectsBreakdown(subjects: ClassSubject[]): {
    total: number
    core: number
    elective: number
  } {
    return {
      total: subjects.length,
      core: subjects.filter((s) => s.isCore).length,
      elective: subjects.filter((s) => !s.isCore).length,
    }
  }

  hasInstructor(subject: ClassSubject): boolean {
    return !!subject.instructorId || !!subject.instructorName
  }

  getInstructorName(subject: ClassSubject): string {
    if (subject.instructorName) return subject.instructorName
    if (!subject.instructor) return "Not assigned"
    return `${subject.instructor.firstName} ${subject.instructor.lastName}`
  }

  validateSetupSubject(subject: SetupSubject): { valid: boolean; error?: string } {
    if (!subject.subjectName?.trim()) {
      return { valid: false, error: "Subject name is required" }
    }

    if (subject.competences && subject.competences.length > 0) {
      for (const comp of subject.competences) {
        if (!comp.name?.trim()) {
          return { valid: false, error: `Competence name is required in ${subject.subjectName}` }
        }
        if (comp.maxScore && (comp.maxScore < 1 || comp.maxScore > 100)) {
          return { valid: false, error: `Invalid max score for competence in ${subject.subjectName}` }
        }
      }
    }

    return { valid: true }
  }

  validateSetupSubjects(subjects: SetupSubject[]): { valid: boolean; error?: string } {
    if (!subjects || subjects.length === 0) {
      return { valid: false, error: "At least one subject is required" }
    }

    const hasCoreSubject = subjects.some((s) => s.isCore)
    if (!hasCoreSubject) {
      return { valid: false, error: "At least one core subject is required" }
    }

    for (const subject of subjects) {
      const validation = this.validateSetupSubject(subject)
      if (!validation.valid) {
        return validation
      }
    }

    const names = subjects.map((s) => s.subjectName.trim().toLowerCase())
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicates.length > 0) {
      return { valid: false, error: `Duplicate subject name: ${duplicates[0]}` }
    }

    return { valid: true }
  }

  generateInitials(firstName: string, lastName: string): string {
    const first = firstName?.trim()[0]?.toUpperCase() || ""
    const last = lastName?.trim()[0]?.toUpperCase() || ""
    return `${first}${last}`
  }
}

export const classService = new ClassService()