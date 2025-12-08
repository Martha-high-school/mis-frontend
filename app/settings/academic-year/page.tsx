"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Circle, PlayCircle, AlertCircle, Edit2, Save, X, Loader2, RefreshCw, Plus, ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { academicYearService, type AcademicYear, type TermConfiguration } from "@/services/accademic-year.service"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Term {
  id: string
  term: "T1" | "T2" | "T3"
  name: string
  status: "not-started" | "in-progress" | "completed"
  startDate?: string
  endDate?: string
  progress: number
  isCompleted: boolean
  isCurrent: boolean
}

function AcademicYearSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allAcademicYears, setAllAcademicYears] = useState<AcademicYear[]>([])
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null)
  const [terms, setTerms] = useState<Term[]>([])
  const [editingTermId, setEditingTermId] = useState<string | null>(null)
  const [tempDates, setTempDates] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })

  // New academic year creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newYearData, setNewYearData] = useState({
    year: new Date().getFullYear() + 1, // Default to next year
    startDate: "",
    endDate: "",
  })
  const [showAllYears, setShowAllYears] = useState(false)

  // Load all academic years and current year on mount
  useEffect(() => {
    loadAllAcademicYears()
  }, [])

  const loadAllAcademicYears = async () => {
    try {
      setLoading(true)
      
      // Get all academic years
      const { academicYears } = await academicYearService.getAllAcademicYears()
      setAllAcademicYears(academicYears)

      // Get current academic year
      if (academicYears.length > 0) {
        let currentYear = academicYears.find(y => y.isCurrent) || academicYears[0]
        setAcademicYear(currentYear)
        loadTermsForYear(currentYear)
      } else {
        // No academic years exist
        toast({
          title: "No Academic Year Found",
          description: "Please create an academic year to get started.",
          variant: "default",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load academic years",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTermsForYear = (year: AcademicYear) => {
    // Convert backend terms to frontend format
    const formattedTerms: Term[] = ["T1", "T2", "T3"].map((termEnum) => {
      const backendTerm = year.terms?.find((t) => t.term === termEnum)
      
      let status: "not-started" | "in-progress" | "completed" = "not-started"
      if (backendTerm?.isCompleted) {
        status = "completed"
      } else if (backendTerm?.isCurrent) {
        status = "in-progress"
      }

      const progress = backendTerm?.startDate && backendTerm?.endDate
        ? academicYearService.calculateTermProgress(backendTerm.startDate, backendTerm.endDate)
        : 0

      return {
        id: backendTerm?.id || `temp-${termEnum}`,
        term: termEnum as "T1" | "T2" | "T3",
        name: academicYearService.formatTermName(termEnum as "T1" | "T2" | "T3"),
        status,
        startDate: backendTerm?.startDate,
        endDate: backendTerm?.endDate,
        progress: backendTerm?.isCompleted ? 100 : progress,
        isCompleted: backendTerm?.isCompleted || false,
        isCurrent: backendTerm?.isCurrent || false,
      }
    })

    setTerms(formattedTerms)
  }

  const handleCreateAcademicYear = async () => {
    try {
      // Validate
      if (!newYearData.year || !newYearData.startDate || !newYearData.endDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      // Check date order
      if (new Date(newYearData.startDate) >= new Date(newYearData.endDate)) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date",
          variant: "destructive",
        })
        return
      }

      setSaving(true)
      const { academicYear: newYear } = await academicYearService.createAcademicYear({
        year: newYearData.year,
        startDate: newYearData.startDate,
        endDate: newYearData.endDate,
      })

      toast({
        title: "Success",
        description: `Academic year ${newYear.year} created successfully`,
      })

      // Reset form and close dialog
      setNewYearData({
        year: new Date().getFullYear() + 1,
        startDate: "",
        endDate: "",
      })
      setShowCreateDialog(false)

      // Reload data
      await loadAllAcademicYears()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic year",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchAcademicYear = async (yearId: string) => {
    const selectedYear = allAcademicYears.find(y => y.id === yearId)
    if (selectedYear) {
      setAcademicYear(selectedYear)
      loadTermsForYear(selectedYear)
    }
  }

  const handleSetCurrentYear = async (yearId: string) => {
    try {
      setSaving(true)
      await academicYearService.setCurrentAcademicYear(yearId)

      toast({
        title: "Success",
        description: "Academic year set as current",
      })

      // Reload data
      await loadAllAcademicYears()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set current academic year",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSetCurrentTerm = async (termEnum: "T1" | "T2" | "T3") => {
    try {
      const term = terms.find((t) => t.term === termEnum)
      if (!term || term.id.startsWith("temp-")) {
        toast({
          title: "Configure Term First",
          description: "Please configure term dates before setting it as current",
          variant: "destructive",
        })
        return
      }

      // Check if previous terms are completed
      const termNumber = academicYearService.getTermNumber(termEnum)
      const previousTermsCompleted = terms
        .filter((t) => academicYearService.getTermNumber(t.term) < termNumber)
        .every((t) => t.status === "completed")

      if (!previousTermsCompleted && termNumber > 1) {
        toast({
          title: "Cannot Set Term",
          description: "Please complete previous terms before setting this term as current",
          variant: "destructive",
        })
        return
      }

      setSaving(true)
      await academicYearService.setCurrentTerm(term.id)

      toast({
        title: "Success",
        description: `${term.name} is now the current term`,
      })

      // Reload data
      await loadAllAcademicYears()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set current term",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteTerm = async (termId: string) => {
    try {
      setSaving(true)
      await academicYearService.completeTerm(termId)

      const term = terms.find((t) => t.id === termId)
      toast({
        title: "Success",
        description: `${term?.name} has been marked as completed`,
      })

      // Reload data
      await loadAllAcademicYears()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete term",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditDates = (term: Term) => {
    setEditingTermId(term.id)
    setTempDates({
      startDate: term.startDate || "",
      endDate: term.endDate || "",
    })
  }

  const handleSaveDates = async (term: Term) => {
    try {
      // Validate dates
      if (!tempDates.startDate || !tempDates.endDate) {
        toast({
          title: "Validation Error",
          description: "Both start date and end date are required",
          variant: "destructive",
        })
        return
      }

      // Check date order
      if (new Date(tempDates.startDate) >= new Date(tempDates.endDate)) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date",
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      if (!academicYear) {
        throw new Error("No academic year selected")
      }

      // Configure term
      await academicYearService.configureTerm(academicYear.id, {
        term: term.term,
        startDate: tempDates.startDate,
        endDate: tempDates.endDate,
      })

      toast({
        title: "Success",
        description: `${term.name} dates updated successfully`,
      })

      setEditingTermId(null)
      
      // Reload data
      await loadAllAcademicYears()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save term dates",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingTermId(null)
    setTempDates({ startDate: "", endDate: "" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "in-progress":
        return <PlayCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      "in-progress": { label: "In Progress", variant: "default" as const, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      "not-started": { label: "Not Started", variant: "outline" as const, className: "" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const overallProgress = terms.length > 0
    ? terms.reduce((acc, term) => acc + term.progress, 0) / terms.length
    : 0

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Academic Year" }
  ]

  if (loading) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Year Settings</h1> */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage academic years and configure term dates
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="h-10">
                <Plus className="h-4 w-4 mr-2" />
                New Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Create New Academic Year</DialogTitle>
                <DialogDescription>
                  Set up a new academic year with start and end dates. You can configure term dates later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-year" className="text-slate-700 dark:text-slate-300">Academic Year</Label>
                  <Input
                    id="new-year"
                    type="number"
                    value={newYearData.year}
                    onChange={(e) => setNewYearData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    min={2020}
                    max={2100}
                    placeholder="2025"
                    className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                  />
                  <p className="text-xs text-slate-500">
                    Enter the calendar year (e.g., 2025 for the 2025 academic year)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-start-date" className="text-slate-700 dark:text-slate-300">Academic Year Start Date</Label>
                  <Input
                    id="new-start-date"
                    type="date"
                    value={newYearData.startDate}
                    onChange={(e) => setNewYearData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-end-date" className="text-slate-700 dark:text-slate-300">Academic Year End Date</Label>
                  <Input
                    id="new-end-date"
                    type="date"
                    value={newYearData.endDate}
                    onChange={(e) => setNewYearData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="outline" className="h-10" onClick={() => setShowCreateDialog(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button className="h-10" onClick={handleCreateAcademicYear} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Academic Year"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!academicYear && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Calendar className="h-12 w-12 mx-auto text-slate-400" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Academic Year Found</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Create your first academic year to get started
                  </p>
                </div>
                <Button className="h-10" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Academic Year
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {academicYear && (
          <>
            {/* Academic Year Selector and All Years List */}
            <div className="space-y-4">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Select Academic Year</CardTitle>
                  <CardDescription>Choose which academic year to view and configure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="year-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">Academic Year</Label>
                      <Select
                        value={academicYear.id}
                        onValueChange={handleSwitchAcademicYear}
                      >
                        <SelectTrigger id="year-select" className="mt-2 h-10 border-2 border-slate-200 dark:border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allAcademicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.year} {year.isCurrent && "• Current"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!academicYear.isCurrent && (
                      <div className="pt-7">
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => handleSetCurrentYear(academicYear.id)}
                          disabled={saving}
                        >
                          Set as Current Year
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Collapsible list of all years */}
                  {allAcademicYears.length > 1 && (
                    <Collapsible open={showAllYears} onOpenChange={setShowAllYears}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-9">
                          <span className="text-slate-600 dark:text-slate-400">View All Academic Years ({allAcademicYears.length})</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${showAllYears ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {allAcademicYears.map((year) => (
                          <div
                            key={year.id}
                            className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
                          >
                            <div>
                              <div className="font-medium text-slate-700 dark:text-slate-300">{year.year}</div>
                              <div className="text-xs text-slate-500">
                                {academicYearService.formatDate(year.startDate)} - {academicYearService.formatDate(year.endDate)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {year.isCurrent && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Current
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleSwitchAcademicYear(year.id)}
                                disabled={year.id === academicYear.id}
                              >
                                {year.id === academicYear.id ? "Selected" : "View"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Year Overview */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-5 w-5 text-primary" />
                      Academic Year {academicYear.year}
                      {academicYear.isCurrent && (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {academicYearService.formatDate(academicYear.startDate)} - {academicYearService.formatDate(academicYear.endDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Year Progress</Label>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Sequential Term Progression</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Terms must be completed in order. Complete the first term before starting the second term.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Term Selector */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Set Current Term</CardTitle>
                <CardDescription>Select which term is currently active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="current-term" className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Term</Label>
                    <Select
                      value={terms.find((t) => t.isCurrent)?.term || ""}
                      onValueChange={(value) => handleSetCurrentTerm(value as "T1" | "T2" | "T3")}
                      disabled={saving}
                    >
                      <SelectTrigger id="current-term" className="mt-2 h-10 border-2 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select current term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.map((term) => (
                          <SelectItem
                            key={term.term}
                            value={term.term}
                            disabled={
                              term.id.startsWith("temp-") ||
                              (academicYearService.getTermNumber(term.term) > 1 &&
                                !terms
                                  .filter((t) => academicYearService.getTermNumber(t.term) < academicYearService.getTermNumber(term.term))
                                  .every((t) => t.status === "completed"))
                            }
                          >
                            {term.name}
                            {term.id.startsWith("temp-") && " (Configure dates first)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms Configuration */}
            <div className="grid gap-4">
              {terms.map((term, index) => (
                <Card key={term.term} className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(term.status)}
                        <div>
                          <CardTitle className="text-base">{term.name}</CardTitle>
                          {(term.startDate || term.endDate) && editingTermId !== term.id && (
                            <CardDescription className="text-xs mt-1">
                              {term.startDate && `Start: ${academicYearService.formatDate(term.startDate)}`}
                              {term.startDate && term.endDate && " • "}
                              {term.endDate && `End: ${academicYearService.formatDate(term.endDate)}`}
                            </CardDescription>
                          )}
                          {!term.startDate && !term.endDate && editingTermId !== term.id && (
                            <CardDescription className="text-xs mt-1 text-amber-600">
                              ⚠️ Dates not configured - Click "Edit Dates" to set up
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(term.status)}
                        {editingTermId !== term.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDates(term)}
                            className="h-8"
                            disabled={saving}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                            Edit Dates
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date Editing Form */}
                    {editingTermId === term.id && (
                      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`start-date-${term.id}`} className="text-slate-700 dark:text-slate-300">Start Date</Label>
                            <Input
                              id={`start-date-${term.id}`}
                              type="date"
                              value={tempDates.startDate}
                              onChange={(e) => setTempDates((prev) => ({ ...prev, startDate: e.target.value }))}
                              className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                              disabled={saving}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-date-${term.id}`} className="text-slate-700 dark:text-slate-300">End Date</Label>
                            <Input
                              id={`end-date-${term.id}`}
                              type="date"
                              value={tempDates.endDate}
                              onChange={(e) => setTempDates((prev) => ({ ...prev, endDate: e.target.value }))}
                              className="w-full h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="h-8" onClick={handleCancelEdit} disabled={saving}>
                            <X className="h-4 w-4 mr-1.5" />
                            Cancel
                          </Button>
                          <Button size="sm" className="h-8" onClick={() => handleSaveDates(term)} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                            Save Dates
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-slate-600 dark:text-slate-400">Term Progress</Label>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{term.progress}%</span>
                      </div>
                      <Progress value={term.progress} className="h-2" />
                    </div>

                    {term.status === "in-progress" && !term.isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompleteTerm(term.id)}
                          className="flex-1 h-10"
                          variant="default"
                          disabled={saving || term.id.startsWith("temp-")}
                        >
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                          Mark as Completed
                        </Button>
                      </div>
                    )}

                    {term.status === "not-started" && index > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Complete {terms[index - 1].name} to unlock this term
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default function AcademicYearSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher"]}>
      <AcademicYearSettings />
    </ProtectedRoute>
  )
}