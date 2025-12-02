import apiClient from "@/lib/api-client"

// Types
export interface StudentWithFees {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  guardianPhone?: string;
  enrollments: {
    class: {
      id: string;
      name: string;
      level: string;
      stream?: string;
    };
  }[];
  fees: any[];
  // Current term figures
  currentTermExpected: number;
  currentTermPaid: number;
  currentTermBalance: number;
  // Carried forward from previous terms/years
  carryForwardBalance: number;
  // Total figures (what matters for payment)
  totalExpected: number;
  totalPaid: number;
  balance: number;
  status: "PAID" | "PENDING";
  // Next term info
  nextTermFees: number;
}

export interface FeeStatus {
  studentId: string;
  year: number;
  term: number;
  carryForwardBalance: number;
  currentTerm: {
    tuitionFee: number;
    otherFees: number;
    totalExpected: number;
    totalPaid: number;
    balance: number;
  };
  totalExpectedWithCarryForward: number;
  totalPaid: number;
  currentBalance: number;
  status: "PAID" | "PENDING";
  nextTermFees: number;
  nextTermDetails: {
    year: number;
    term: number;
    tuitionFee: number;
    otherFees: number;
  } | null;
}

export interface TermBreakdown {
  term: number;
  tuitionFee: number;
  otherFees: number;
  totalExpected: number;
  totalPaid: number;
  openingBalance: number;
  closingBalance: number;
  payments: {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
  }[];
}

export interface StudentFeeSummary {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    guardianPhone?: string;
    guardianRelation?: string;
  };
  year: number;
  enrollment: any;
  balanceBroughtForward: number;
  yearlyExpected: number;
  yearlyPaid: number;
  totalExpected: number;
  totalPaid: number;
  balance: number;
  status: "PAID" | "PENDING";
  termBreakdown: TermBreakdown[];
}

export interface ReportCardFeeData {
  currentBalance: number;
  nextTermFees: number;
  carryForwardBalance: number;
  currentTermExpected: number;
  currentTermPaid: number;
  totalExpected: number;
  totalPaid: number;
}

class FeeService {
  /**
   * Get all students with their fee information
   * Includes carry-forward balances from previous terms/years
   */
  async getAllStudentsWithFees(params: {
    year: number;
    term?: number;
    search?: string;
    classId?: string;
    status?: "PAID" | "PENDING";
  }): Promise<{ year: number; term?: number; count: number; students: StudentWithFees[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append("year", params.year.toString());
    if (params.term) queryParams.append("term", params.term.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.status) queryParams.append("status", params.status);

    const response = await apiClient.get(`/fees/students?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get student's current fee status with accurate carry-forward balance
   * This is the main method for getting accurate current figures
   */
  async getStudentFeeStatus(
    studentId: string,
    year: number,
    term: number
  ): Promise<FeeStatus> {
    const response = await apiClient.get(
      `/fees/students/${studentId}/status?year=${year}&term=${term}`
    );
    return response.data;
  }

  /**
   * Get student's fee summary for a specific year
   * Includes term-by-term breakdown with running balance
   */
  async getStudentFeeSummary(
    studentId: string,
    year: number
  ): Promise<StudentFeeSummary> {
    const response = await apiClient.get(
      `/fees/students/${studentId}/summary?year=${year}`
    );
    return response.data;
  }

  /**
   * Get complete fee payment history for a student
   */
  async getStudentFeeHistory(studentId: string): Promise<{ studentId: string; history: any[] }> {
    const response = await apiClient.get(`/fees/students/${studentId}/history`);
    return response.data;
  }

  /**
   * Get fee data specifically formatted for report cards
   * Returns: nextTermFees, currentBalance (with carry-forward)
   */
  async getReportCardFeeData(
    studentId: string,
    year: number,
    term: number
  ): Promise<ReportCardFeeData> {
    const response = await apiClient.get(
      `/fees/students/${studentId}/report-card-data?year=${year}&term=${term}`
    );
    return response.data;
  }

  /**
   * Set fee structure for a student (current or future term)
   */
  async setStudentFee(data: {
    studentId: string;
    year: number;
    term: number;
    tuitionFee: number;
    otherFees?: number;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/fees/students/${data.studentId}/set`, {
      year: data.year,
      term: data.term,
      tuitionFee: data.tuitionFee,
      otherFees: data.otherFees || 0,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Set fee for the next term for a specific student
   * Automatically calculates what the next term is (handles year rollover)
   */
  async setNextTermFee(data: {
    studentId: string;
    currentYear: number;
    currentTerm: number;
    tuitionFee: number;
    otherFees?: number;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/fees/students/${data.studentId}/set-next-term`, {
      currentYear: data.currentYear,
      currentTerm: data.currentTerm,
      tuitionFee: data.tuitionFee,
      otherFees: data.otherFees || 0,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Record a payment for a student
   */
  async recordPayment(data: {
    studentId: string;
    year: number;
    term: number;
    amount: number;
    paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE";
    referenceNumber?: string;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/fees/students/${data.studentId}/payment`, {
      year: data.year,
      term: data.term,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Bulk set fees for multiple students (entire class or all students)
   */
  async bulkSetFees(data: {
    year: number;
    term: number;
    classId?: string;
    tuitionFee: number;
    otherFees?: number;
    notes?: string;
  }): Promise<{ message: string; count: number; year: number; term: number }> {
    const response = await apiClient.post("/fees/bulk-set", {
      year: data.year,
      term: data.term,
      classId: data.classId,
      tuitionFee: data.tuitionFee,
      otherFees: data.otherFees || 0,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Bulk set fees for the NEXT term for all students or a class
   * This is specifically for setting fees that appear on report cards
   */
  async bulkSetNextTermFees(data: {
    currentYear: number;
    currentTerm: number;
    classId?: string;
    tuitionFee: number;
    otherFees?: number;
    notes?: string;
  }): Promise<{ message: string; count: number; year: number; term: number }> {
    const response = await apiClient.post("/fees/bulk-set-next-term", {
      currentYear: data.currentYear,
      currentTerm: data.currentTerm,
      classId: data.classId,
      tuitionFee: data.tuitionFee,
      otherFees: data.otherFees || 0,
      notes: data.notes,
    });
    return response.data;
  }

  /**
   * Update fee structure
   */
  async updateFee(
    feeId: string,
    data: { tuitionFee?: number; otherFees?: number; notes?: string }
  ): Promise<any> {
    const response = await apiClient.patch(`/fees/${feeId}`, data);
    return response.data;
  }

  /**
   * Void a payment
   */
  async voidPayment(paymentId: string, reason: string): Promise<any> {
    const response = await apiClient.delete(`/fees/payments/${paymentId}`, {
      data: { reason },
    });
    return response.data;
  }

  // REPORTS

  /**
   * Get outstanding fees report (includes carry-forward balances)
   */
  async getOutstandingFeesReport(params: {
    year: number;
    term?: number;
    classId?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append("year", params.year.toString());
    if (params.term) queryParams.append("term", params.term.toString());
    if (params.classId) queryParams.append("classId", params.classId);

    const response = await apiClient.get(`/fees/reports/outstanding?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get fee collection report
   */
  async getFeeCollectionReport(params: {
    year: number;
    term?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append("year", params.year.toString());
    if (params.term) queryParams.append("term", params.term.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await apiClient.get(`/fees/reports/collection?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get overall fee summary for the year (includes carry-forward balances)
   */
  async getFeesSummaryReport(year: number): Promise<any> {
    const response = await apiClient.get(`/fees/reports/summary?year=${year}`);
    return response.data;
  }
}

export const feeService = new FeeService();