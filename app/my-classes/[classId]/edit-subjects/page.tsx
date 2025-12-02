"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, BookOpen, Edit, AlertCircle, ChevronLeft, Calendar, GraduationCap, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { classService } from "@/services/class.service"
import { academicYearService } from "@/services/accademic-year.service"
import { competencyService, type Subject } from "@/services/competency.service"
import { EditCompetenciesDialog } from "@/components/competence/edit-competence-dialog"
import { AddSubjectDialog } from "@/components/competence/add-subject-dialo"

export default function EditSubjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
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
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive"
      })
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
      toast({
        title: "Error",
        description: error.message || "Failed to load subjects",
        variant: "destructive"
      })
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
    toast({
      title: "Success",
      description: "Competencies updated successfully",
    })
  }

  const handleSubjectAdded = () => {
    loadSubjects()
    toast({
      title: "Success",
      description: "Subject added successfully",
    })
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
      <ProtectedRoute allowedRoles={["head_teacher", "class_teacher"]}>
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
    <ProtectedRoute allowedRoles={["head_teacher", "class_teacher"]}>
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-muted-foreground">
                  {classInfo?.name} • Add subjects and configure competencies for each term
                </p>
              </div>
            </div>
            <Button onClick={() => setAddSubjectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>

          {/* Year & Term Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Period
              </CardTitle>
              <CardDescription>
                Select the academic year and term to view/edit subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select
                    value={selectedYear?.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select
                    value={selectedTerm}
                    onValueChange={(value) => setSelectedTerm(value as "T1" | "T2" | "T3")}
                  >
                    <SelectTrigger>
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
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Viewing subjects for <strong>{getTermName(selectedTerm)} {selectedYear}</strong>.
                  When you add a subject, it will be available for all terms. You can then customize competencies per term.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Subjects for {classInfo?.name}
                  </CardTitle>
                  <CardDescription>
                    Manage subjects and their competencies for {getTermName(selectedTerm)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No subjects configured for this class yet. Click "Add Subject" to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Competencies ({selectedTerm})</TableHead>
                        <TableHead className="text-center">Total Max Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject, index) => {
                        const totalMaxScore = subject.competences?.reduce(
                          (sum, c) => sum + c.maxScore,
                          0
                        ) || 0

                        return (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{subject.subject.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={subject.isCore ? "default" : "secondary"}>
                                {subject.isCore ? "Core" : "Elective"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {subject.competences?.length > 0 ? (
                                <Badge variant="outline">
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
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Adding a subject:</strong> When you add a subject, you'll set up initial competencies. 
                    These will be automatically applied to all three terms (T1, T2, T3).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Term-specific competencies:</strong> Each term can have different competencies. 
                    Click "Edit Competencies" to customize for the selected term without affecting other terms.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Auto-cloning:</strong> When you first edit competencies for a new term, 
                    the system copies from the last edited term as a starting point.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Assessment calculation:</strong> Continuous assessment = 
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