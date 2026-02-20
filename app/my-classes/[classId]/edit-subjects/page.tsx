"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, BookOpen, Edit, AlertCircle, ChevronLeft, Calendar, GraduationCap, Plus, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { classService } from "@/services/class.service"
import { academicYearService } from "@/services/accademic-year.service"
import { competencyService, type Subject } from "@/services/competency.service"
import { EditCompetenciesDialog } from "@/components/competence/edit-competence-dialog"
import { AddSubjectDialog } from "@/components/competence/add-subject-dialo"

export default function EditSubjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { classId } = useParams()

  const [loading, setLoading] = useState(true)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<"T1" | "T2" | "T3">("T1")
  const [contextYear, setContextYear] = useState<number | null>(null)
  const [contextTerm, setContextTerm] = useState<"T1" | "T2" | "T3" | null>(null)

  // Edit competencies dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // Add subject dialog state
  const [addSubjectDialogOpen, setAddSubjectDialogOpen] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [classId])

  useEffect(() => {
    if (selectedYear) {
      loadSubjects()
    }
  }, [selectedYear, selectedTerm])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Load academic context
      const { context } = await academicYearService.getCurrentContext()
      setContextYear(context.year)
      setContextTerm(context.termEnum)
      setSelectedYear(context.year)
      setSelectedTerm(context.termEnum)

      // Load class info
      const classData = await classService.getClassById(classId as string)
      setClassInfo(classData)

      // Load available years
      const years = await academicYearService.getAllAcademicYears()
      const yearNumbers = years.academicYears.map((y: any) => y.year).sort((a: number, b: number) => b - a)
      setAvailableYears(yearNumbers)

    } catch (error: any) {
      toast.error(error.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    if (!selectedYear) return
    
    try {
      setLoading(true)
      const subjectsData = await competencyService.getClassSubjectsWithCompetencies(
        classId as string,
        selectedYear
      )
      setSubjects(subjectsData)
    } catch (error: any) {
      toast.error(error.message || "Failed to load subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCompetencies = (subject: Subject) => {
    setEditingSubject(subject)
    setEditDialogOpen(true)
  }

  const handleCompetenciesSaved = () => {
    loadSubjects()
    toast.success("Competencies updated successfully")
  }

  const handleSubjectAdded = () => {
    loadSubjects()
    toast.success("Subject added successfully")
  }

  const getTermName = (term: string) => {
    const termMap: Record<string, string> = {
      T1: "First Term",
      T2: "Second Term",
      T3: "Third Term"
    }
    return termMap[term] || term
  }

  if (loading && !classInfo) {
    return (
      <ProtectedRoute requiredPermissions={["academics.manage_subjects"]}>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }
  const breadcrumbs = [
    {label: "Dashboard", href: "/dashboard" },
    {label: "My classes", href: "/my-classes" }, 
    { label: "Edit Subjects" }]

  return (
    <ProtectedRoute requiredPermissions={["academics.manage_subjects"]}>
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Subjects</h1> */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {classInfo?.name} • Add subjects and configure competencies for each term
              </p>
            </div>
            <Button className="h-10" onClick={() => setAddSubjectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>

          {/* Year & Term Selector */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Academic Year</label>
                  <Select
                    value={selectedYear?.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                          {year === contextYear && (
                            <Badge variant="secondary" className="ml-2">Current</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Term</label>
                  <Select
                    value={selectedTerm}
                    onValueChange={(value) => setSelectedTerm(value as "T1" | "T2" | "T3")}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T1">
                        First Term (T1)
                        {selectedTerm === "T1" && selectedYear === contextYear && (
                          <Badge variant="secondary" className="ml-2">Current</Badge>
                        )}
                      </SelectItem>
                      <SelectItem value="T2">
                        Second Term (T2)
                        {selectedTerm === "T2" && selectedYear === contextYear && (
                          <Badge variant="secondary" className="ml-2">Current</Badge>
                        )}
                      </SelectItem>
                      <SelectItem value="T3">
                        Third Term (T3)
                        {selectedTerm === "T3" && selectedYear === contextYear && (
                          <Badge variant="secondary" className="ml-2">Current</Badge>
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 h-9 px-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border-2 border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    Viewing <strong>{getTermName(selectedTerm)} {selectedYear}</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card className="border-slate-200 dark:border-slate-700 overflow-visible">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Subjects for {classInfo?.name} <span className="text-slate-400">• {getTermName(selectedTerm)}</span>
              </p>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="flex items-start gap-3 p-4 m-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    No subjects configured for this class yet. Click <strong>"Add Subject"</strong> to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 w-[50px] text-center">#</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4">Subject Name</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Type</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Competencies ({selectedTerm})</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Total Max Score</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject, index) => {
                        const totalMaxScore = subject.competences?.reduce(
                          (sum, c) => sum + c.maxScore,
                          0
                        ) || 0

                        return (
                          <TableRow key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <TableCell className="font-medium text-center">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{subject.subject.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={subject.isCore ? "default" : "secondary"}>
                                {subject.isCore ? "Core" : "Elective"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {subject.competences?.length > 0 ? (
                                <Badge variant="outline" className="border-slate-300">
                                  {subject.competences.length} competencies
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Not configured
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {totalMaxScore} marks
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleEditCompetencies(subject)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Competencies
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 dark:text-slate-300">How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300">Adding a subject:</strong> When you add a subject, you'll set up initial competencies. 
                    These will be automatically applied to all three terms (T1, T2, T3).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300">Term-specific competencies:</strong> Each term can have different competencies. 
                    Click "Edit Competencies" to customize for the selected term without affecting other terms.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300">Auto-cloning:</strong> When you first edit competencies for a new term, 
                    the system copies from the last edited term as a starting point.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300">Assessment calculation:</strong> Continuous assessment = 
                    Sum of Competence Scores + Project Score (10 marks)
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Competencies Dialog */}
        {editingSubject && selectedYear && (
          <EditCompetenciesDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            classId={classId as string}
            subjectId={editingSubject.subjectId}
            subjectName={editingSubject.subject.name}
            year={selectedYear}
            term={selectedTerm}
            onSaved={handleCompetenciesSaved}
          />
        )}

        {/* Add Subject Dialog */}
        {selectedYear && (
          <AddSubjectDialog
            open={addSubjectDialogOpen}
            onOpenChange={setAddSubjectDialogOpen}
            classId={classId as string}
            year={selectedYear}
            onAdded={handleSubjectAdded}
          />
        )}
      </MainLayout>
    </ProtectedRoute>
  )
}
