import apiClient from "@/lib/api-client"

export interface Competence {
  id?: string
  idx: number
  name: string
  maxScore: number
}

export interface CompetenceVersion extends Competence {
  id: string
  classSubjectId: string
  year: number
  term: "T1" | "T2" | "T3"
  createdAt?: string
  updatedAt?: string
}

export interface Subject {
  id: string
  classId: string
  subjectId: string
  year: number
  isCore: boolean
  subject: {
    id: string
    name: string
  }
  competences: Competence[]
}

export interface GetCompetenciesByTermResponse {
  competencies: CompetenceVersion[]
}

export interface SaveCompetenciesByTermPayload {
  year: number
  term: "T1" | "T2" | "T3"
  competencies: Competence[]
}

export interface SaveCompetenciesByTermResponse {
  message: string
}

// COMPETENCY SERVICE

class CompetencyService {
  /**
   * Get competencies for a specific class, subject, year, and term
   * If none exist for the term, the backend will auto-clone from the last edited term
   */
  async getCompetenciesByTerm(
    classId: string,
    subjectId: string,
    year: number,
    term: "T1" | "T2" | "T3"
  ): Promise<CompetenceVersion[]> {
    const response = await apiClient.get<GetCompetenciesByTermResponse>(
      `/academics/classes/${classId}/subjects/${subjectId}/competencies`,
      {
        params: { year, term }
      }
    )
    
    return response.data.competencies
  }

  /**
   * Save competencies for a specific class, subject, year, and term
   * This will replace all existing competencies for that specific term
   */
  async saveCompetenciesByTerm(
    classId: string,
    subjectId: string,
    payload: SaveCompetenciesByTermPayload
  ): Promise<SaveCompetenciesByTermResponse> {
    const response = await apiClient.patch<SaveCompetenciesByTermResponse>(
      `/academics/classes/${classId}/subjects/${subjectId}/competencies`,
      payload
    )
    
    return response.data
  }

  /**
   * Clone competencies from previous academic year to new year
   */
  async cloneCompetenciesFromPreviousYear(
    classId: string,
    oldClassId: string,
    previousYear: number,
    nextYear: number
  ): Promise<void> {
    await apiClient.post(
      `/academics/classes/${classId}/clone-competencies`,
      {
        oldClassId,
        previousYear,
        nextYear
      }
    )
  }

  /**
   * Get all subjects with their competencies for a class and year
   * This returns competencies without term specificity (for overview)
   */
  async getClassSubjectsWithCompetencies(
    classId: string,
    year: number
  ): Promise<Subject[]> {
    const response = await apiClient.get<{ subjects: Subject[] }>(
      `/academics/classes/${classId}/subjects`,
      {
        params: { year }
      }
    )
    
    return response.data.subjects
  }
}

export const competencyService = new CompetencyService()