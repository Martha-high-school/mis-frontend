import { pdfService } from '@/services/pdf-report.service'
import { toast } from 'sonner'

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Using sonner toast (install: npm install sonner)
  if (type === 'success') {
    toast.success(message)
  } else if (type === 'error') {
    toast.error(message)
  } else {
    toast.info(message)
  }
}

/**
 * Generate PDF report for a single student
 */
export const handleGenerateReport = async (
  studentId: string,
  classId: string,
  year: string,
  term: string
) => {
  try {
    showToast('Generating PDF report...', 'info')

    // Convert term format: "term1" -> "T1"
    const termFormatted = pdfService.formatTermForAPI(term)

    await pdfService.generateReport({
      studentId,
      classId,
      year: Number(year),
      term: termFormatted
    })

    showToast('PDF report downloaded successfully!', 'success')
  } catch (error: any) {
    console.error('Generate report error:', error)
    showToast(error.message || 'Failed to generate PDF report', 'error')
  }
}

/**
 * Generate PDF reports for all students in a class (bulk)
 */
export const handleBulkGenerate = async (
  classId: string,
  year: string,
  term: string,
  onProgress?: (current: number, total: number, percentage: number) => void
) => {
  try {
    showToast('Starting bulk report generation...', 'info')

    // Convert term format
    const termFormatted = pdfService.formatTermForAPI(term)

    // Download all reports with progress tracking
    const result = await pdfService.downloadAllReports(
      {
        classId,
        year: Number(year),
        term: termFormatted
      },
      (current, total) => {
        const percentage = Math.round((current / total) * 100)
        if (onProgress) {
          onProgress(current, total, percentage)
        }
      }
    )

    if (result.successful > 0) {
      showToast(
        `✅ Downloaded ${result.successful} report${result.successful > 1 ? 's' : ''} successfully!${
          result.failed > 0 ? ` (${result.failed} failed)` : ''
        }`,
        'success'
      )
    } else {
      showToast('No reports were generated', 'error')
    }

    return result
  } catch (error: any) {
    console.error('Bulk generate error:', error)
    showToast(error.message || 'Failed to generate bulk reports', 'error')
    throw error
  }
}

/**
 * Get preview data for a student report
 */
export const handlePreview = async (
  studentId: string,
  classId: string,
  year: string,
  term: string
) => {
  try {
    showToast('Loading preview...', 'info')

    const termFormatted = pdfService.formatTermForAPI(term)

    const reportData = await pdfService.getPreviewData({
      studentId,
      classId,
      year: Number(year),
      term: termFormatted
    })

    return reportData
  } catch (error: any) {
    console.error('Preview error:', error)
    showToast(error.message || 'Failed to load preview', 'error')
    throw error
  }
}

/**
 * Check if PDF service is available
 */
export const checkPDFServiceHealth = async () => {
  try {
    const isHealthy = await pdfService.checkHealth()
    if (!isHealthy) {
      showToast('PDF service is not available', 'error')
    }
    return isHealthy
  } catch (error) {
    console.error('Health check error:', error)
    return false
  }
}