import apiClient from "@/lib/api-client"

export interface DashboardMetric {
  value: number | string
  subtitle: string
  trend: "up" | "down" | "neutral"
  trendValue: string
}

// Director Dashboard Types
export interface DirectorDashboardData {
  metrics: {
    totalStudents: DashboardMetric
    feeCollection: DashboardMetric
    passRate: DashboardMetric
    staffMembers: DashboardMetric
  }
  charts: {
    enrollmentTrends: Array<{ year: string; students: number; oLevel: number; aLevel: number }>
    feeStatus: Array<{ name: string; value: number; color: string }>
    genderDistribution: Array<{ name: string; value: number; color: string }>
    termProgress: Array<{ term: string; average: number; passRate: number }>
    classPerformance: Array<{ class: string; average: number; passRate: number; teacher?: string }>
  }
  context: { year: number; term: string }
}

// Head Teacher Dashboard Types
export interface HeadTeacherDashboardData {
  metrics: {
    totalClasses: DashboardMetric
    teachingStaff: DashboardMetric
    schoolAverage: DashboardMetric
    pendingReports: DashboardMetric
  }
  charts: {
    classPerformance: Array<{ class: string; average: number; passRate: number; teacher?: string }>
    subjectPerformance: Array<{ subject: string; score: number; fullMark: number }>
  }
  context: { year: number; term: string }
}

// Class Teacher Dashboard Types
export interface ClassTeacherClass {
  id: string
  name: string
  students: number
}

export interface ClassTeacherDashboardData {
  metrics: {
    totalStudents: DashboardMetric
    classAverage: DashboardMetric
    pendingMarks: DashboardMetric
    pendingComments: DashboardMetric
  }
  charts: {
    subjectPerformance: Array<{ subject: string; average: number }>
    termProgress: Array<{ term: string; average: number; passRate: number }>
    gradeDistribution: Array<{ name: string; value: number; color: string }>
  }
  myClasses: ClassTeacherClass[]
  selectedClass: {
    id: string
    name: string
    students: number
    average: number
  } | null
  context: { year: number; term: string }
}

// Bursar Dashboard Types
export interface BursarDefaulter {
  id: string
  student: string
  class: string
  balance: number
  termsFee: number
  lastPayment: string
}

export interface BursarDashboardData {
  metrics: {
    totalExpected: DashboardMetric
    totalCollected: DashboardMetric
    outstanding: DashboardMetric
    todayCollection: DashboardMetric
  }
  charts: {
    termlyCollection: Array<{ term: string; collected: number; expected: number }>
    paymentStatus: Array<{ name: string; value: number; color: string }>
    paymentMethods: Array<{ name: string; value: number; amount: number; color: string }>
  }
  topDefaulters: BursarDefaulter[]
  context: { year: number; term: string }
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// DASHBOARD SERVICE CLASS

class DashboardService {
  /**
   * Get Director Dashboard Data
   */
  async getDirectorDashboard(): Promise<DirectorDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<DirectorDashboardData>>("/dashboard/director")
      return response.data.data
    } catch (error: any) {
      console.error("Error fetching director dashboard:", error)
      throw new Error(error.response?.data?.message || "Failed to fetch director dashboard data")
    }
  }

  /**
   * Get Head Teacher Dashboard Data
   */
  async getHeadTeacherDashboard(): Promise<HeadTeacherDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<HeadTeacherDashboardData>>("/dashboard/head-teacher")
      return response.data.data
    } catch (error: any) {
      console.error("Error fetching head teacher dashboard:", error)
      throw new Error(error.response?.data?.message || "Failed to fetch head teacher dashboard data")
    }
  }

  /**
   * Get Class Teacher Dashboard Data
   * @param classId - Optional class ID to filter by specific class
   */
  async getClassTeacherDashboard(classId?: string): Promise<ClassTeacherDashboardData> {
    try {
      const params = classId ? { classId } : {}
      const response = await apiClient.get<ApiResponse<ClassTeacherDashboardData>>("/dashboard/class-teacher", { params })
      return response.data.data
    } catch (error: any) {
      console.error("Error fetching class teacher dashboard:", error)
      throw new Error(error.response?.data?.message || "Failed to fetch class teacher dashboard data")
    }
  }

  /**
   * Get Bursar Dashboard Data
   */
  async getBursarDashboard(): Promise<BursarDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<BursarDashboardData>>("/dashboard/bursar")
      return response.data.data
    } catch (error: any) {
      console.error("Error fetching bursar dashboard:", error)
      throw new Error(error.response?.data?.message || "Failed to fetch bursar dashboard data")
    }
  }

  /**
   * Get Dashboard based on user role (auto-detect)
   */
  async getDashboard(): Promise<DirectorDashboardData | HeadTeacherDashboardData | ClassTeacherDashboardData | BursarDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<any>>("/dashboard")
      return response.data.data
    } catch (error: any) {
      console.error("Error fetching dashboard:", error)
      throw new Error(error.response?.data?.message || "Failed to fetch dashboard data")
    }
  }
}

export const dashboardService = new DashboardService()