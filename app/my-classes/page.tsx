"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { classService, type Class, type ClassSummary } from "@/services/class.service"
import { academicYearService } from "@/services/accademic-year.service"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  BookOpen,
  Settings,
  GraduationCap,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Calendar,
  RefreshCw,
  Filter,
} from "lucide-react"

export default function MyClassesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { year, term, termName, loading: contextLoading } = useAcademicContext()

  const [classes, setClasses] = useState<Class[]>([])
  const [classSummaries, setClassSummaries] = useState<Record<string, ClassSummary>>({})
  const [classSetupStatus, setClassSetupStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter states
  const [years, setYears] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all")
  
  const terms = [
    { value: "T1", label: "Term 1" },
    { value: "T2", label: "Term 2" },
    { value: "T3", label: "Term 3" },
  ]

  // Load academic years on mount
  useEffect(() => {
    loadAcademicYears()
  }, [])

  // Set default year and term from context
  useEffect(() => {
    if (!contextLoading && year && term && !selectedYear && !selectedTerm) {
      setSelectedYear(year.toString())
      setSelectedTerm(term)
    }
  }, [contextLoading, year, term, selectedYear, selectedTerm])

  // Load classes when year and term are selected
  useEffect(() => {
    if (selectedYear && selectedTerm) {
      loadClassesData()
    }
  }, [selectedYear, selectedTerm])

  const loadAcademicYears = async () => {
    try {
      const { academicYears } = await academicYearService.getAllAcademicYears()
      setYears(academicYears)
    } catch (error) {
      console.error("Error loading academic years:", error)
      toast.error("Failed to load academic years")

    }
  }

  const loadClassesData = async () => {
    if (!selectedYear || !selectedTerm) return

    try {
      setLoading(true)

      // Get classes
      const { classes: myClasses } = await classService.getMyClasses()
      setClasses(myClasses)

      // Load summaries and setup status for each class
      const summaries: Record<string, ClassSummary> = {}
      const setupStatuses: Record<string, any> = {}

      await Promise.all(
        myClasses.map(async (cls) => {
          try {
            const [summaryData, setupData] = await Promise.all([
              classService.getClassSummary(cls.id, {
                year: parseInt(selectedYear),
                term: selectedTerm as 'T1' | 'T2' | 'T3'
              }),
              classService.getClassSetupStatus(cls.id,selectedYear,selectedTerm),
            ])
            summaries[cls.id] = summaryData.summary
            setupStatuses[cls.id] = setupData
          } catch (err) {
            console.error(`Error loading data for class ${cls.id}:`, err)
          }
        })
      )

      setClassSummaries(summaries)
      setClassSetupStatus(setupStatuses)
    } catch (error: any) {
      toast.error("Failed to load classes")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadClassesData()
    setRefreshing(false)
  }

  const handleSetupClass = (classId: string) => {
    const params = new URLSearchParams({
      year: selectedYear,
    })
    router.push(`/my-classes/${classId}/setup?${params.toString()}`)
  }

  const handleEditSubjects = (classId: string) => {
    router.push(`/my-classes/${classId}/edit-subjects`)
  }

  const handleViewGrades = (classId: string) => {
    // Pass selected year and term as query parameters
    const params = new URLSearchParams({
      year: selectedYear,
      term: selectedTerm
    })
    router.push(`/my-classes/${classId}/grades?${params.toString()}`)
  }

  if (contextLoading) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
          <span className="text-muted-foreground">Loading academic context...</span>
        </div>
      </MainLayout>
    )
  }

  if (!year || !term) {
    toast.error("Academic year and term are not configured for the system.")
    return (
      <MainLayout pageTitle="My Classes" userRole={user?.role} userName={user?.name}>
        <p className="text-center text-muted-foreground">Please ask your head teacher to configure them in settings</p>
      </MainLayout>
    )
  }

  // Filter classes based on selected class filter
  const filteredClasses = selectedClassFilter === "all" 
    ? classes 
    : classes.filter(cls => cls.id === selectedClassFilter)

  // Get term display name
  const getTermName = (termValue: string) => {
    const term = terms.find(t => t.value === termValue)
    return term ? term.label : termValue
  }

  return (
    <ProtectedRoute requiredPermissions={["classes.view_own"]}>
      <MainLayout
        // pageTitle="My Classes"
        userRole={user?.role}
        userName={user?.name}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Classes" }, { label: "All Classes" }]}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters Card */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                {/* Academic Year */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Academic Year</label>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y: any) => (
                        <SelectItem key={y.id} value={y.year.toString()}>
                          {y.year} {y.isCurrent && "(Current)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Term</label>
                  <Select
                    value={selectedTerm}
                    onValueChange={setSelectedTerm}
                    disabled={!selectedYear}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Filter (only show if teacher has multiple classes) */}
                {classes.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Class</label>
                    <Select
                      value={selectedClassFilter}
                      onValueChange={setSelectedClassFilter}
                    >
                      <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.stream && `(${cls.stream})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Current Selection Display */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Selection</label>
                  <div className="flex items-center gap-2 h-9 px-3 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-slate-200 dark:border-slate-700">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedYear && selectedTerm 
                        ? `${selectedYear} - ${getTermName(selectedTerm)}`
                        : "Select filters"}
                    </span>
                  </div>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh} disabled={refreshing || loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          {selectedYear && selectedTerm && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Viewing:</strong> {selectedYear} - {getTermName(selectedTerm)} 
                {year && term && selectedYear === year.toString() && selectedTerm === term && " (Current Period)"}
              </AlertDescription>
            </Alert>
          )}

          {/* Classes Grid */}
          {loading ? (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-white">Loading classes...</h3>
                <p className="text-slate-500 text-center max-w-md">
                  Please wait while we fetch your class data.
                </p>
              </CardContent>
            </Card>
          ) : !selectedYear || !selectedTerm ? (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <Filter className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Select Year and Term</h3>
                <p className="text-slate-500">
                  Please select an academic year and term to view your classes.
                </p>
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">No Classes Assigned</h3>
                <p className="text-slate-500">
                  You don't have any classes assigned yet. Please contact your head teacher.
                </p>
              </CardContent>
            </Card>
          ) : filteredClasses.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">No Classes Match Filter</h3>
                <p className="text-slate-500">
                  No classes match the selected filter. Try selecting "All Classes".
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => {
                const summary = classSummaries[cls.id]
                const setupStatus = classSetupStatus[cls.id]
                const isSetup = setupStatus?.isSetup
                const hasInstructors = setupStatus?.hasInstructors

                return (
                  <Card key={cls.id} className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:border-slate-300 dark:hover:border-slate-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900 dark:text-white">
                            {cls.name}
                            {cls.stream && (
                              <span className="text-slate-500 font-normal ml-2">({cls.stream})</span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">Level: {cls.level}</CardDescription>
                        </div>
                        <Badge
                          variant={cls.status === "Active" ? "default" : "secondary"}
                          className={cls.status === "Active" ? "bg-green-500" : ""}
                        >
                          {cls.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Setup Status Badge */}
                      {!isSetup && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Class not set up. Configure subjects first.
                          </AlertDescription>
                        </Alert>
                      )}

                      {isSetup && !hasInstructors && (
                        <Alert className="py-2 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                            Some subjects missing instructors.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Student Statistics */}
                      {summary && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Students</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalStudents}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                <UserCheck className="h-3 w-3" />
                                <span>Male</span>
                              </div>
                              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                {summary.byGender.male}
                              </p>
                            </div>

                            <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                              <div className="flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400">
                                <UserX className="h-3 w-3" />
                                <span>Female</span>
                              </div>
                              <p className="text-lg font-semibold text-pink-700 dark:text-pink-300">
                                {summary.byGender.female}
                              </p>
                            </div>
                          </div>

                          {/* Status breakdown */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 mb-2">Status Distribution:</p>
                            <div className="flex gap-2 text-xs flex-wrap">
                              <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                                New: {summary.byStatus.initial}
                              </Badge>
                              <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-800">
                                Promoted: {summary.byStatus.promoted}
                              </Badge>
                              <Badge variant="outline" className="text-amber-600 border-amber-200 dark:border-amber-800">
                                Repeated: {summary.byStatus.repeated}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Subject Info */}
                      {setupStatus && isSetup && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{setupStatus.totalSubjects} Subjects</span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-800">
                              Core: {setupStatus.coreSubjectsCount}
                            </Badge>
                            <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                              Electives: {setupStatus.electiveSubjectsCount}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-3">
                        {!isSetup ? (
                          <Button onClick={() => handleSetupClass(cls.id)} className="w-full h-9" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Setup Class
                          </Button>
                        ) : (
                          <>
                            <Button onClick={() => handleViewGrades(cls.id)} className="w-full h-9" size="sm">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              View Grades
                            </Button>
                            <Button
                              onClick={() => handleEditSubjects(cls.id)}
                              variant="outline"
                              className="w-full h-9"
                              size="sm"
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Edit Subjects
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
