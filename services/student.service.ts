import apiClient from "@/lib/api-client"

export interface GuardianInfo {
  phone: string
  relationship: string
}

export interface StudentFormData {
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  date?: string // admission date
  guardian: GuardianInfo
}

export interface AddStudentPayload {
  student: StudentFormData
  year: number
  term: number
  status: "INITIAL" | "PROMOTED"
  initialClassAssignment: string
  seedSubjects?: SubjectWithCompetences[]
}

export interface SubjectWithCompetences {
  subjectName: string
  isCore?: boolean
  competences: Array<{
    idx?: number
    name: string
    maxScore?: number
  }>
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  guardianPhone: string
  guardianRelation: string
  admissionDate: string
  photoUrl?: string // Added photo URL support
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ClassEnrollment {
  id: string
  classId: string
  studentId: string
  year: number
  term: "T1" | "T2" | "T3"
  status: "INITIAL" | "PROMOTED" | "REPEATED"
  isCurrent: boolean
  class?: {
    id: string
    name: string
    level: string
    stream?: string
  }
}

export interface StudentWithEnrollments extends Student {
  enrollments: ClassEnrollment[]
}

export interface Assessment {
  id: string
  studentId: string
  classSubjectId: string
  year: number
  term: "T1" | "T2" | "T3"
  projectScore: number
  continuousScore: number
  eotScore: number
  classSubject: {
    subject: {
      id: string
      name: string
    }
    class: {
      id: string
      name: string
    }
  }
}

export interface CompetenceScore {
  id: string
  studentId: string
  competenceId: string
  year: number
  term: "T1" | "T2" | "T3"
  score: number
  competence: {
    id: string
    idx: number
    name: string
    maxScore: number
    classSubject: {
      subject: {
        id: string
        name: string
      }
    }
  }
}

export interface StudentSearchResult extends Student {
  enrollments: Array<{
    isCurrent: boolean
    class: {
      id: string
      name: string
      level: string
    }
  }>
}

export interface AddStudentResponse {
  message: string
  student: Student
  enrollment: ClassEnrollment
}

// NEW INTERFACES FOR PAGINATION

export interface PaginatedStudent {
  id: string
  name: string
  firstName: string
  lastName: string
  class: string
  classId: string
  age: number | null
  gender: "MALE" | "FEMALE" | "OTHER"
  guardianName: string
  guardianPhone: string
  enrollmentDate: string
  status: "INITIAL" | "PROMOTED" | "REPEATED"
  feeStatus: "Paid" | "Pending" | "Partial" | "Not Set"
  totalFee: number
  totalPaid: number
  balance: number
  photoUrl?: string // Added photo URL support for paginated students
}

export interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface GetStudentsParams {
  year: number
  term: string
  classId?: string
  search?: string
  gender?: string
  status?: string
  feeStatus?: string
  page?: number
  pageSize?: number
}

export interface GetStudentsResponse {
  message: string
  year: number
  term: string
  students: PaginatedStudent[]
  pagination: PaginationInfo
}

// STUDENT SERVICE

class StudentService {
  /**
   * Get students with pagination and filtering
   * @param params - Filter and pagination parameters
   */
  async getStudents(params: GetStudentsParams): Promise<GetStudentsResponse> {
    const queryParams = new URLSearchParams()
    
    queryParams.append('year', params.year.toString())
    queryParams.append('term', params.term)
    
    if (params.classId && params.classId !== 'All Classes') {
      queryParams.append('classId', params.classId)
    }
    
    if (params.search) {
      queryParams.append('search', params.search)
    }
    
    if (params.gender && params.gender !== 'All Genders') {
      queryParams.append('gender', params.gender)
    }
    
    if (params.status && params.status !== 'All Statuses') {
      queryParams.append('status', params.status)
    }
    
    if (params.feeStatus && params.feeStatus !== 'All Fee Statuses') {
      queryParams.append('feeStatus', params.feeStatus)
    }
    
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    
    if (params.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString())
    }

    const response = await apiClient.get<GetStudentsResponse>(
      `/students?${queryParams.toString()}`
    )
    
    return response.data
  }

  async addStudent(payload: AddStudentPayload): Promise<AddStudentResponse> {
    const response = await apiClient.post('/students/add', payload)
    return response.data
  }

  async getStudentById(studentId: string | number): Promise<StudentWithEnrollments> {
    const response = await apiClient.get(`/students/${studentId}`)
    return response.data
  }

  async updateStudent(id: string, data: FormData | object) {
    const isFormData = data instanceof FormData

    return apiClient.patch(`/students/${id}`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : {}
    })
  }

  async searchStudents(searchTerm: string): Promise<StudentSearchResult[]> {
    const response = await apiClient.get(`/students/search`, {
      params: { q: searchTerm }
    })
    return response.data.students
  }

  async getClassStudents(
    classId: string | number,
    year: number,
    term?: number
  ) {
    const params: any = { year }
    if (term) params.term = term

    const response = await apiClient.get(`/classes/${classId}/students`, {
      params
    })
    return response.data
  }

  async getStudentAssessments(
    studentId: string | number,
    year: number,
    term?: number
  ): Promise<Assessment[]> {
    const params: any = { year }
    if (term) params.term = term

    const response = await apiClient.get(`/students/${studentId}/assessments`, {
      params
    })
    return response.data.assessments
  }

  async getStudentCompetenceScores(
    studentId: string | number,
    year: number,
    term?: number
  ): Promise<CompetenceScore[]> {
    const params: any = { year }
    if (term) params.term = term

    const response = await apiClient.get(`/students/${studentId}/competences`, {
      params
    })
    return response.data.competenceScores
  }
}

export const studentService = new StudentService()