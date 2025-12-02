import apiClient from "@/lib/api-client"

export interface AcademicYear {
  id: string
  year: number
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt: string
  updatedAt: string
  terms?: TermConfiguration[]
}

export interface TermConfiguration {
  id: string
  academicYearId: string
  term: "T1" | "T2" | "T3"
  startDate: string
  endDate: string
  isCurrent: boolean
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  academicYear?: AcademicYear
}

export interface AcademicContext {
  academicYear: AcademicYear
  term: TermConfiguration
  year: number
  termEnum: "T1" | "T2" | "T3"
}

export interface CreateAcademicYearData {
  year: number
  startDate: string
  endDate: string
}

export interface ConfigureTermData {
  term: "T1" | "T2" | "T3"
  startDate: string
  endDate: string
}

class AcademicYearService {
  // ACADEMIC YEAR OPERATIONS

  /**
   * Initialize academic year (one-time setup)
   */
  async initializeAcademicYear(): Promise<{ academicYear: AcademicYear; message: string }> {
    try {
      const response = await apiClient.post("/academic-years/initialize")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to initialize academic year")
    }
  }

  /**
   * Create a new academic year
   */
  async createAcademicYear(data: CreateAcademicYearData): Promise<{ academicYear: AcademicYear; message: string }> {
    try {
      const response = await apiClient.post("/academic-years", data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create academic year")
    }
  }

  /**
   * Get all academic years
   */
  async getAllAcademicYears(): Promise<{ academicYears: AcademicYear[]; count: number }> {
    try {
      const response = await apiClient.get("/academic-years")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch academic years")
    }
  }

  /**
   * Get current academic year with terms
   */
  async getCurrentAcademicYear(): Promise<{ academicYear: AcademicYear }> {
    try {
      const response = await apiClient.get("/academic-years/current")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch current academic year")
    }
  }

  /**
   * Set an academic year as current
   */
  async setCurrentAcademicYear(yearId: string): Promise<{ academicYear: AcademicYear; message: string }> {
    try {
      const response = await apiClient.patch(`/academic-years/${yearId}/set-current`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to set current academic year")
    }
  }

  // TERM OPERATIONS

  /**
   * Configure term dates for an academic year
   */
  async configureTerm(
    yearId: string,
    data: ConfigureTermData
  ): Promise<{ term: TermConfiguration; message: string }> {
    try {
      const response = await apiClient.post(`/academic-years/${yearId}/terms`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to configure term")
    }
  }

  /**
   * Get all terms for an academic year
   */
  async getTermsForYear(yearId: string): Promise<{ terms: TermConfiguration[]; count: number }> {
    try {
      const response = await apiClient.get(`/academic-years/${yearId}/terms`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch terms")
    }
  }

  /**
   * Get current term
   */
  async getCurrentTerm(): Promise<{ term: TermConfiguration }> {
    try {
      const response = await apiClient.get("/academic-years/terms/current")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch current term")
    }
  }

  /**
   * Set a term as current
   */
  async setCurrentTerm(termId: string): Promise<{ term: TermConfiguration; message: string }> {
    try {
      const response = await apiClient.patch(`/academic-years/terms/${termId}/set-current`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to set current term")
    }
  }

  /**
   * Mark a term as completed
   */
  async completeTerm(termId: string): Promise<{ term: TermConfiguration; message: string }> {
    try {
      const response = await apiClient.patch(`/academic-years/terms/${termId}/complete`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to complete term")
    }
  }

  /**
   * Get current academic context (year and term)
   * This is the most commonly used method throughout the app
   */
  async getCurrentContext(): Promise<{ context: AcademicContext }> {
    try {
      const response = await apiClient.get("/academic-years/context")
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch academic context")
    }
  }

  // UTILITY METHODS

  /**
   * Format term enum to display name
   */
  formatTermName(term: "T1" | "T2" | "T3"): string {
    const termNames = {
      T1: "First Term",
      T2: "Second Term",
      T3: "Third Term",
    }
    return termNames[term]
  }

  /**
   * Get term number from enum
   */
  getTermNumber(term: "T1" | "T2" | "T3"): number {
    const termNumbers = { T1: 1, T2: 2, T3: 3 }
    return termNumbers[term]
  }

  /**
   * Get term enum from number
   */
  getTermEnum(termNumber: number): "T1" | "T2" | "T3" {
    const termEnums = { 1: "T1", 2: "T2", 3: "T3" } as const
    return termEnums[termNumber as 1 | 2 | 3]
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  /**
   * Check if date is in the past
   */
  isPastDate(dateString: string): boolean {
    return new Date(dateString) < new Date()
  }

  /**
   * Check if date is in the future
   */
  isFutureDate(dateString: string): boolean {
    return new Date(dateString) > new Date()
  }

  /**
   * Calculate term progress based on dates
   */
  calculateTermProgress(startDate: string, endDate: string): number {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 0
    if (now > end) return 100

    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()

    return Math.round((elapsed / totalDuration) * 100)
  }
}

export const academicYearService = new AcademicYearService()