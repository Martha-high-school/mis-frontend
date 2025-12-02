"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, BookOpen, Users, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { classService, type SaveAssessmentsPayload, type AssessmentData } from "@/services/class.service"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  firstName: string
  lastName: string
  gender?: string
}

interface Competence {
  id: string
  idx: number
  name: string
  maxScore: number
}

interface Subject {
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

interface GradeData {
  projectScore: number
  continuousScore: number
  eotScore: number
  competenceScores: Record<string, number>
}

export default function GradesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { classId } = useParams()
  const searchParams = useSearchParams()
  const { year: contextYear, term: contextTerm, termName } = useAcademicContext()

  // Get year and term from URL parameters, fallback to current context
  const urlYear = searchParams.get('year')
  const urlTerm = searchParams.get('term')
  
  const year = urlYear ? parseInt(urlYear) : contextYear
  const term = urlTerm || contextTerm
  
  // Get display name for the selected term
  const getTermDisplayName = (termValue: string) => {
    const termMap: Record<string, string> = {
      T1: "First Term",
      T2: "Second Term",
      T3: "Third Term"
    }
    return termMap[termValue] || termValue
  }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  // Store grades per subject: { subjectName: { studentId: GradeData } }
  const [grades, setGrades] = useState<Record<string, Record<string, GradeData>>>({})

  useEffect(() => {
    if (year && term) {
      loadData()
    }
  }, [classId, year, term])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load class info
      const classData = await classService.getClassById(classId as string)
      setClassInfo(classData)

      // Load subjects with competences for current year
      const subjectsData = await classService.getClassSubjects(
      classId as string,
      year,
      term 
    )
      setSubjects(subjectsData)

      // Load students for current year and term
      const studentsResponse = await classService.getClassStudents(
        classId as string,
        year,
        getTerm(term)
      )
      
      // Handle different response structures
      const studentsList = Array.isArray(studentsResponse) 
        ? studentsResponse 
        : studentsResponse.students || []
      
      // Extract student data from enrollments if needed
      const studentsData = studentsList.map((item: any) => {
        if (item.student) {
          // If it's an enrollment object with nested student
          return {
            id: item.student.id,
            firstName: item.student.firstName,
            lastName: item.student.lastName,
            gender: item.student.gender,
            studentNumber: item.student.studentNumber
          }
        }
        // If it's already a student object
        return item
      })
      
      setStudents(studentsData)

      // Set first subject as selected
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0])
      }

      // Initialize grades structure
      const initialGrades: Record<string, Record<string, GradeData>> = {}
      
      // Initialize with zeros first
      subjectsData.forEach((subject: Subject) => {
        initialGrades[subject.subject.name] = {}
        studentsData.forEach((student: Student) => {
          initialGrades[subject.subject.name][student.id] = {
            projectScore: 0,
            continuousScore: 0,
            eotScore: 0,
            competenceScores: {}
          }
        })
      })

      // Try to load existing assessments
      try {
        const assessmentsData = await classService.getAssessments(
          classId as string,
          year,
          getTerm(term)
        )
        
        // Populate with existing data if available
        if (assessmentsData && assessmentsData.subjects) {
          Object.entries(assessmentsData.subjects).forEach(([subjectName, subjectAssessments]: [string, any]) => {
            if (initialGrades[subjectName]) {
              Object.entries(subjectAssessments).forEach(([studentId, assessment]: [string, any]) => {
                if (initialGrades[subjectName][studentId]) {
                  initialGrades[subjectName][studentId] = {
                    projectScore: assessment.projectScore || 0,
                    continuousScore: assessment.continuousScore || 0,
                    eotScore: assessment.eotScore || 0,
                    competenceScores: assessment.competenceScores || {}
                  }
                }
              })
            }
          })
        }
      } catch (error) {
        console.log("No existing assessments found or error loading:", error)
        // Continue with zeros - not a critical error
      }
      
      setGrades(initialGrades)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load grades data",
        variant: "destructive"
      })
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Convert term string to number
  const getTerm = (termStr: string): number => {
    if (termStr === "T1" || termStr === "1") return 1
    if (termStr === "T2" || termStr === "2") return 2
    if (termStr === "T3" || termStr === "3") return 3
    return 1
  }

  const updateGrade = (
    studentId: string,
    field: keyof GradeData,
    value: string | number
  ) => {
    if (!selectedSubject) return

    setGrades(prev => ({
      ...prev,
      [selectedSubject.subject.name]: {
        ...prev[selectedSubject.subject.name],
        [studentId]: {
          ...prev[selectedSubject.subject.name][studentId],
          [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }
    }))
  }

  const updateCompetenceScore = (
    studentId: string,
    competenceId: string,
    value: string
  ) => {
    if (!selectedSubject) return

    const score = parseFloat(value) || 0

    setGrades(prev => ({
      ...prev,
      [selectedSubject.subject.name]: {
        ...prev[selectedSubject.subject.name],
        [studentId]: {
          ...prev[selectedSubject.subject.name][studentId],
          competenceScores: {
            ...prev[selectedSubject.subject.name][studentId].competenceScores,
            [competenceId]: score
          }
        }
      }
    }))
  }

  const calculateTotalCompetenceScore = (studentId: string): number => {
    if (!selectedSubject) return 0
    
    const studentGrades = grades[selectedSubject.subject.name]?.[studentId]
    if (!studentGrades) return 0

    return Object.values(studentGrades.competenceScores).reduce((sum, score) => sum + score, 0)
  }

  // NEW: Calculate continuous score automatically (Competences + Project) scaled to /20
  const calculateContinuousScore = (studentId: string): number => {
    if (!selectedSubject) return 0
    
    const studentGrades = grades[selectedSubject.subject.name]?.[studentId]
    if (!studentGrades) return 0

    // Sum all competence scores
    const competenceTotal = Object.values(studentGrades.competenceScores || {})
      .reduce((sum, score) => sum + score, 0)
    const projectScore = studentGrades.projectScore || 0
    
    // Calculate the raw total
    const rawTotal = competenceTotal + projectScore
    
    // Calculate maximum possible score
    // Max = sum of all competence max scores + project max (10)
    const maxCompetenceScore = selectedSubject.competences?.reduce(
      (sum, comp) => sum + comp.maxScore, 
      0
    ) || 0
    const maxPossible = maxCompetenceScore + 10 // 10 is max project score
    
    // Scale to 20
    if (maxPossible === 0) return 0
    const scaledScore = (rawTotal / maxPossible) * 20
    
    return Math.min(scaledScore, 20) // Cap at 20
  }

  const calculateTotalScore = (studentId: string): number => {
    if (!selectedSubject) return 0
    
    const studentGrades = grades[selectedSubject.subject.name]?.[studentId]
    if (!studentGrades) return 0

    // Total = Continuous (Competences + Project) + EOT
    const continuous = calculateContinuousScore(studentId)
    const eot = studentGrades.eotScore || 0
    
    return continuous + eot
  }

  const handleSave = async () => {
    if (!selectedSubject) {
      toast({
        title: "Error",
        description: "Please select a subject first",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)

      // Prepare assessments data for the selected subject
      const assessments: Record<string, AssessmentData> = {}
      
      Object.entries(grades[selectedSubject.subject.name] || {}).forEach(([studentId, gradeData]) => {
        // Calculate continuous score automatically (Competences + Project)
        const competenceTotal = Object.values(gradeData.competenceScores || {}).reduce((sum, score) => sum + score, 0)
        const calculatedContinuous = competenceTotal + (gradeData.projectScore || 0)
        
        assessments[studentId] = {
          projectScore: gradeData.projectScore || 0,
          continuousScore: calculatedContinuous, // Use calculated value
          eotScore: gradeData.eotScore || 0,
          competenceScores: gradeData.competenceScores || {}
        }
      })

      const payload: SaveAssessmentsPayload = {
        year,
        term: getTerm(term),
        subjectName: selectedSubject.subject.name,
        assessments
      }

      await classService.saveAssessments(classId as string, payload)

      toast({
        title: "Success",
        description: `Grades saved successfully for ${selectedSubject.subject.name}`,
        duration: 3000,
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save grades",
        variant: "destructive",
        duration: 5000,
      })
      console.error("Error saving grades:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    try {
      setSaving(true)
      let successCount = 0
      let errorCount = 0

      // Save grades for all subjects
      for (const subject of subjects) {
        try {
          const assessments: Record<string, AssessmentData> = {}
          
          Object.entries(grades[subject.subject.name] || {}).forEach(([studentId, gradeData]) => {
            // Calculate continuous score automatically (Competences + Project)
            const competenceTotal = Object.values(gradeData.competenceScores || {}).reduce((sum, score) => sum + score, 0)
            const calculatedContinuous = competenceTotal + (gradeData.projectScore || 0)
            
            assessments[studentId] = {
              projectScore: gradeData.projectScore || 0,
              continuousScore: calculatedContinuous, // Use calculated value
              eotScore: gradeData.eotScore || 0,
              competenceScores: gradeData.competenceScores || {}
            }
          })

          const payload: SaveAssessmentsPayload = {
            year,
            term: getTerm(term),
            subjectName: subject.subject.name,
            assessments
          }

          await classService.saveAssessments(classId as string, payload)
          successCount++
        } catch (error) {
          errorCount++
          console.error(`Error saving ${subject.subject.name}:`, error)
        }
      }

      if (errorCount === 0) {
        toast({
          title: "Success",
          description: `All grades saved successfully (${successCount} subjects)`,
          duration: 3000,
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Saved ${successCount} subjects, ${errorCount} failed`,
          variant: "destructive",
          duration: 5000,
        })
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save grades",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin mr-2 h-6 w-6 text-primary" />
          <span className="text-muted-foreground">Loading grades...</span>
        </div>
      </MainLayout>
    )
  }

  if (!year || !term) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No academic year or term is configured. Please contact the administrator.
          </AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  if (subjects.length === 0) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subjects Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              This class has no subjects set up. Please configure subjects first.
            </p>
            <Button onClick={() => router.push(`/my-classes/${classId}/edit-subjects`)}>
              Configure Subjects
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  if (students.length === 0) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
            <p className="text-muted-foreground text-center mb-4">
              This class has no students enrolled for {year} - {getTermDisplayName(term)}.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["class_teacher", "head_teacher"]}>
      <MainLayout
        userRole={user?.role}
       
        userName={user?.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Classes", href: "/my-classes" },
          { label: "Grades" }
        ]}
      >
        <div className="space-y-6">
          {/* Viewing Period Alert */}
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Viewing Grades For:</strong> {year} - {getTermDisplayName(term)}
              {contextYear && contextTerm && year === contextYear && term === contextTerm && " (Current Period)"}
            </AlertDescription>
          </Alert>

          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Grades: {classInfo?.name} {classInfo?.stream && `(${classInfo.stream})`}

                  </CardTitle>
                  <CardDescription className="mt-2">
                    Academic Year {year} - {getTermDisplayName(term)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    <Users className="h-3 w-3 mr-1" />
                    {students.length} Students
                  </Badge>
                  <Badge variant="outline" className="bg-green-50">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {subjects.length} Subjects
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Subject Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Subject to Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subject Navigation with Arrows */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const container = document.getElementById('subject-tabs-container')
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' })
                    }}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div 
                    id="subject-tabs-container"
                    className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {subjects.map(subject => (
                      <Button
                        key={subject.id}
                        variant={selectedSubject?.id === subject.id ? "default" : "outline"}
                        onClick={() => setSelectedSubject(subject)}
                        className="min-w-[140px] flex-shrink-0 relative"
                      >
                        <span className="truncate">{subject.subject.name}</span>
                        {subject.isCore && (
                          <Badge 
                            variant="secondary" 
                            className="ml-2 text-[10px] px-1 py-0 h-4"
                          >
                            Core
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const container = document.getElementById('subject-tabs-container')
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' })
                    }}
                    className="flex-shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Subject Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg">
                  <span>
                    Total Subjects: <strong className="text-foreground">{subjects.length}</strong>
                  </span>
                  <span className="hidden sm:inline">
                    Core: <strong className="text-foreground">{subjects.filter(s => s.isCore).length}</strong>
                  </span>
                  <span className="hidden sm:inline">
                    Elective: <strong className="text-foreground">{subjects.filter(s => !s.isCore).length}</strong>
                  </span>
                </div>
              </div>

              <Tabs 
                value={selectedSubject?.id} 
                onValueChange={(value) => {
                  const subject = subjects.find(s => s.id === value)
                  setSelectedSubject(subject || null)
                }}
              >
                {subjects.map(subject => (
                  <TabsContent key={subject.id} value={subject.id} className="mt-6">
                    {/* Competences Info with Grading Explanation */}
                    {subject.competences && subject.competences.length > 0 && (
                      <Alert className="mb-4 bg-blue-50 border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                          <div className="space-y-2">
                            <div>
                              <strong>Competences for {subject.subject.name}:</strong>{" "}
                              {subject.competences.map(c => `${c.name} (${c.maxScore} pts)`).join(", ")}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Grading Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[50px] text-center sticky left-0 bg-muted/50 z-10 border-r">#</TableHead>
                              <TableHead className="min-w-[180px] sticky left-[50px] bg-muted/50 z-10 border-r">Student Name</TableHead>
                              <TableHead className="w-[80px] text-center border-r">Gender</TableHead>
                              {subject.competences?.map(comp => (
                                <TableHead key={comp.id} className="w-[100px] text-center border-r">
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium text-xs">{comp.name}</span>
                                    <span className="text-xs text-muted-foreground">/{comp.maxScore}</span>
                                  </div>
                                </TableHead>
                              ))}
                              <TableHead className="w-[100px] text-center border-r">
                                <div className="flex flex-col items-center">
                                  <span className="font-medium">Project</span>
                                  <span className="text-xs text-muted-foreground">/10</span>
                                </div>
                              </TableHead>
                              <TableHead className="w-[120px] text-center border-r bg-blue-50">
                                <div className="flex flex-col items-center">
                                  <span className="font-medium">Continuous</span>
                                  <span className="text-xs text-muted-foreground">/20</span>
                                  <span className="text-[10px] text-muted-foreground italic">(Auto)</span>
                                </div>
                              </TableHead>
                              <TableHead className="w-[100px] text-center border-r">
                                <div className="flex flex-col items-center">
                                  <span className="font-medium">EOT</span>
                                  <span className="text-xs text-muted-foreground">/80</span>
                                </div>
                              </TableHead>
                              <TableHead className="w-[100px] text-center font-bold bg-primary/10">
                                <div className="flex flex-col items-center">
                                  <span>Total</span>
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.map((student, index) => (
                              <TableRow key={student.id} className="hover:bg-muted/30">
                                {/* Row Number */}
                                <TableCell className="text-center font-medium sticky left-0 bg-background z-10 border-r">
                                  {index + 1}
                                </TableCell>
                                
                                {/* Student Name */}
                                <TableCell className="font-medium sticky left-[50px] bg-background z-10 border-r">
                                  <div className="flex flex-col">
                                    <span className="font-semibold">{student.firstName} {student.lastName}</span>
                                    {student.studentNumber && (
                                      <span className="text-xs text-muted-foreground">{student.studentNumber}</span>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Gender */}
                                <TableCell className="text-center border-r">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      student.gender?.toLowerCase() === 'male' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : student.gender?.toLowerCase() === 'female'
                                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                    }
                                  >
                                    {student.gender?.charAt(0) || '-'}
                                  </Badge>
                                </TableCell>

                                {/* Competence Scores */}
                                {subject.competences?.map(comp => (
                                  <TableCell key={comp.id} className="border-r">
                                    <Input
                                      type="number"
                                      min="0"
                                      max={comp.maxScore}
                                      className="w-[80px] text-center mx-auto"
                                      value={grades[subject.subject.name]?.[student.id]?.competenceScores?.[comp.id] || ""}
                                      onChange={(e) => updateCompetenceScore(student.id, comp.id, e.target.value)}
                                      placeholder="0"
                                    />
                                  </TableCell>
                                ))}
                              
                                {/* Project Score */}
                                <TableCell className="border-r">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    className="w-[80px] text-center mx-auto"
                                    value={grades[subject.subject.name]?.[student.id]?.projectScore || ""}
                                    onChange={(e) => updateGrade(student.id, "projectScore", e.target.value)}
                                    placeholder="0"
                                  />
                                </TableCell>

                                {/* Continuous Score - AUTO CALCULATED */}
                                <TableCell className="border-r bg-blue-50/30">
                                  <div className="w-[100px] mx-auto">
                                    <Badge 
                                      variant="outline" 
                                      className="w-full justify-center text-base font-semibold bg-blue-100 text-blue-900 border-blue-300"
                                    >
                                      {calculateContinuousScore(student.id).toFixed(1)}
                                    </Badge>
                                    <div className="text-[10px] text-center text-muted-foreground mt-0.5">
                                      Auto
                                    </div>
                                  </div>
                                </TableCell>

                                {/* EOT Score */}
                                <TableCell className="border-r">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="80"
                                    className="w-[80px] text-center mx-auto"
                                    value={grades[subject.subject.name]?.[student.id]?.eotScore || ""}
                                    onChange={(e) => updateGrade(student.id, "eotScore", e.target.value)}
                                    placeholder="0"
                                  />
                                </TableCell>

                                {/* Total Score */}
                                <TableCell className="text-center font-bold bg-primary/5">
                                  <Badge variant="secondary" className="text-base font-bold">
                                    {calculateTotalScore(student.id).toFixed(0)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Save Buttons */}
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-sm text-muted-foreground">
                        {students.length} student{students.length !== 1 ? "s" : ""} • 
                        {subject.competences?.length || 0} competence{subject.competences?.length !== 1 ? "s" : ""}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save {subject.subject.name}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Save All Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Save All Subjects</h3>
                  <p className="text-sm text-muted-foreground">
                    Save grades for all {subjects.length} subjects at once
                  </p>
                </div>
                <Button onClick={handleSaveAll} disabled={saving} size="lg">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving All...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All Subjects
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}