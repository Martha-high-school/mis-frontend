import apiClient from "@/lib/api-client"

export interface BulkCommentRequest {
  studentId: string;
  comment: string;
  signature?: string;
}

export interface GeneralCommentRequest {
  classId: string;
  year: number;
  term: number;
  comment: string;
}

export interface GeneralComment {
  id: string;
  classId: string;
  year: number;
  term: string;
  teacherRole: string;
  teacherId: string;
  comment: string;
  isActive: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeacherComment {
  id: string;
  studentId: string;
  classId: string;
  year: number;
  term: string;
  teacherRole: string;
  teacherId: string;
  comment: string;
  signature?: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EffectiveComment {
  type: 'specific' | 'general';
  comment: TeacherComment | GeneralComment;
  source: 'student' | 'class';
}

export interface MarkBasedSuggestion {
  averageMark: number;
  grade: string;
  descriptor: string;
  suggestedComment: string;
  gradeRange: {
    id: string;
    minMark: number;
    maxMark: number;
    descriptor: string;
    comment: string;
    grade: string;
    color: string;
  };
}

export interface AutoGenerateResults {
  generated: Array<{
    studentId: string;
    studentName: string;
    averageMark: number;
    grade: string;
    comment: string;
  }>;
  skipped: Array<{
    studentId: string;
    reason: string;
  }>;
  errors: Array<{
    studentId: string;
    error: string;
  }>;
}

export interface SignatureUploadResponse {
  success: boolean;
  message: string;
  signature: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    signature: string | null;
  };
}


class ReportService {
  // GENERAL COMMENTS

  /**
   * Save general comment for all students in a class
   * POST /api/reports/classes/:classId/general-comment
   */
  async saveGeneralComment(data: GeneralCommentRequest): Promise<GeneralComment> {
    const { classId, year, term, comment } = data;
    const response = await apiClient.post(
      `/reports/classes/${classId}/general-comment`,
      { year, term, comment }
    );
    return response.data.comment;
  }

  /**
   * Get general comment for a class
   * GET /api/reports/classes/:classId/general-comment
   */
  async getGeneralComment(
    classId: string,
    year: number,
    term: number,
    role?: string
  ): Promise<GeneralComment | null> {
    try {
      const params: any = { year, term };
      if (role) params.role = role;

      const response = await apiClient.get(
        `/reports/classes/${classId}/general-comment`,
        { params }
      );
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Toggle general comment active status
   * PATCH /api/reports/classes/:classId/general-comment/toggle
   */
  async toggleGeneralComment(
    classId: string,
    year: number,
    term: number,
    role: string,
    isActive: boolean
  ): Promise<GeneralComment> {
    const response = await apiClient.patch(
      `/reports/classes/${classId}/general-comment/toggle`,
      { isActive },
      { params: { year, term, role } }
    );
    return response.data.comment;
  }

  /**
   * Delete general comment
   * DELETE /api/reports/classes/:classId/general-comment
   */
  async deleteGeneralComment(
    classId: string,
    year: number,
    term: number,
    role: string
  ): Promise<void> {
    await apiClient.delete(`/reports/classes/${classId}/general-comment`, {
      params: { year, term, role }
    });
  }

  // ============================================================================
  // TEACHER COMMENTS (SPECIFIC)
  // ============================================================================

  /**
   * Save teacher comment for a single student
   * POST /api/reports/teacher-comments
   */
  async saveTeacherComment(
    studentId: string,
    classId: string,
    year: number,
    term: number,
    comment: string,
    signature?: string
  ): Promise<TeacherComment> {
    const response = await apiClient.post(`/reports/teacher-comments`, {
      studentId,
      classId,
      year,
      term,
      comment,
      signature
    });
    return response.data.comment;
  }

  /**
   * Get effective comment for a student (specific or general)
   * GET /api/reports/teacher-comments/:studentId
   */
  async getEffectiveComment(
    studentId: string,
    classId: string,
    year: number,
    term: number,
    role?: string
  ): Promise<EffectiveComment | null> {
    try {
      const params: any = { classId, year, term };
      if (role) params.role = role;

      const response = await apiClient.get(
        `/reports/teacher-comments/${studentId}`,
        { params }
      );
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all specific comments for a class
   * GET /api/reports/classes/:classId/teacher-comments
   */
  async getClassComments(
    classId: string,
    year: number,
    term: number,
    role?: string
  ): Promise<TeacherComment[]> {
    try {
      const params: any = { year, term };
      if (role) params.role = role;

      const response = await apiClient.get(
        `/reports/classes/${classId}/teacher-comments`,
        { params }
      );
      return response.data.comments || [];
    } catch (error: any) {
      console.error('Error fetching class comments:', error);
      // Return empty array if no comments found
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Bulk save teacher comments
   * POST /api/reports/classes/:classId/teacher-comments/bulk
   */
  async bulkSaveTeacherComments(
    classId: string,
    year: number,
    term: number,
    comments: BulkCommentRequest[]
  ): Promise<{ success: boolean; count: number; comments: TeacherComment[] }> {
    const response = await apiClient.post(
      `/reports/classes/${classId}/teacher-comments/bulk`,
      { year, term, comments }
    );
    return response.data;
  }

  /**
   * Delete teacher comment
   * DELETE /api/reports/teacher-comments/:studentId
   */
  async deleteTeacherComment(
    studentId: string,
    year: number,
    term: number,
    role: string
  ): Promise<void> {
    await apiClient.delete(`/reports/teacher-comments/${studentId}`, {
      params: { year, term, role }
    });
  }

  // ============================================================================
  // AUTO-GENERATION (MARK-BASED COMMENTS)
  // ============================================================================

  /**
   * Get mark-based comment suggestion for a student
   * GET /api/reports/students/:studentId/suggested-comment
   */
  async getMarkBasedSuggestion(
    studentId: string,
    classId: string,
    year: number,
    term: number
  ): Promise<MarkBasedSuggestion | null> {
    try {
      const response = await apiClient.get(
        `/reports/students/${studentId}/suggested-comment`,
        { params: { classId, year, term } }
      );
      return response.data.markData;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Auto-generate mark-based comments for all students in a class
   * POST /api/reports/classes/:classId/auto-generate-comments
   */
  async autoGenerateComments(
    classId: string,
    year: number,
    term: number,
    overwriteExisting: boolean = false
  ): Promise<AutoGenerateResults> {
    const response = await apiClient.post(
      `/reports/classes/${classId}/auto-generate-comments`,
      { year, term, overwriteExisting }
    );
    return response.data.results;
  }

  // ============================================================================
  // GRADE RANGES
  // ============================================================================

  /**
   * Get all grade ranges
   * GET /api/reports/grade-ranges
   */
  async getGradeRanges(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/reports/grade-ranges`);
      return response.data.gradeRanges || [];
    } catch (error: any) {
      console.error('Error fetching grade ranges:', error);
      return [];
    }
  }

  /**
   * Save grade ranges
   * POST /api/reports/grade-ranges
   */
  async saveGradeRanges(ranges: any[]): Promise<void> {
    await apiClient.post(`/reports/grade-ranges`, { ranges });
  }

  // ============================================================================
  // REPORT SETTINGS
  // ============================================================================

  /**
   * Get report settings
   * GET /api/reports/settings
   */
  async getReportSettings(): Promise<any> {
    try {
      const response = await apiClient.get(`/reports/settings`);
      return response.data.settings || {};
    } catch (error: any) {
      console.error('Error fetching report settings:', error);
      return {};
    }
  }

  /**
   * Update report settings
   * PATCH /api/reports/settings
   */
  async updateReportSettings(settings: any): Promise<any> {
    const response = await apiClient.patch(`/reports/settings`, settings);
    return response.data.settings;
  }

  // ============================================================================
  // COMPLETE REPORT
  // ============================================================================

  /**
   * Get complete report data for a student
   * GET /api/reports/students/:studentId
   */
  async getStudentReport(
    studentId: string,
    classId: string,
    year: number,
    term: number
  ): Promise<any> {
    const response = await apiClient.get(
      `/reports/students/${studentId}`,
      { params: { classId, year, term } }
    );
    return response.data.report;
  }

  // ============================================================================
  // COMMENT STATUS
  // ============================================================================

  /**
   * Get comment status for all students in a class
   * GET /api/reports/classes/:classId/comment-status
   */
  async getClassCommentStatus(
    classId: string,
    year: number,
    term: number,
    role?: string
  ): Promise<any> {
    const params: any = { year, term };
    if (role) params.role = role;

    const response = await apiClient.get(
      `/reports/classes/${classId}/comment-status`,
      { params }
    );
    return response.data;
  }

   // ============================================================================
  // SIGNATURE MANAGEMENT
  // ============================================================================

  /**
   * Upload signature for current user
   * POST /api/signatures/upload
   */
  async uploadSignature(file: File): Promise<SignatureUploadResponse> {
  const formData = new FormData();
  formData.append('signature', file);

  const response = await apiClient.post('/signatures/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * Get current user's signature
 */
async getMySignature(): Promise<string | null> {
  try {
    const response = await apiClient.get('/signatures/me');
    return response.data.signature;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete current user's signature
 */
async deleteMySignature(): Promise<void> {
  await apiClient.delete('/signatures/me');
}

}

export const reportService = new ReportService();