import { useState, useEffect } from "react"
import { academicYearService, type AcademicContext } from "@/services/accademic-year.service"

export function useAcademicContext() {
  const [context, setContext] = useState<AcademicContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContext = async () => {
    try {
      setLoading(true)
      setError(null)
      const { context: academicContext } = await academicYearService.getCurrentContext()
      setContext(academicContext)
    } catch (err: any) {
      setError(err.message || "Failed to load academic context")
      setContext(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContext()
  }, [])

  return {
    context,
    loading,
    error,
    refresh: loadContext,
    // Helper accessors
    year: context?.year,
    term: context?.termEnum,
    termName: context?.termEnum ? academicYearService.formatTermName(context.termEnum) : null,
    academicYear: context?.academicYear,
    termConfiguration: context?.term,
  }
}