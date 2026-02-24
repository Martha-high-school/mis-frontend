"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Calendar,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  FileText,
  CheckCircle,
  Users,
  BarChart3,
  Filter,
  Download,
  Eye,
  Search,
} from "lucide-react"

// Types
interface ClassData {
  id: string
  name: string
  level: string
  studentCount: number
  subjects: string[]
  classTeacher: string
  classTeacherId: string
}

interface Student {
  id: string
  name: string
  studentNumber: string
  gender: string
  classId: string
}

interface CompetenceAssignment {
  id: string
  name: string
  maxScore: number
}

interface SubjectAssessment {
  studentId: string
  competenceScores: Record<string, number>
  projectScore: number
  continuousScore: number
  eotScore: number
  totalScore?: number
  grade?: string
}

interface TermData {
  year: string
  term: string
  classId: string
  subjects: Record<
    string,
    {
      competenceAssignments: CompetenceAssignment[]
      assessments: Record<string, SubjectAssessment>
    }
  >
}

interface ClassSummary {
  classId: string
  className: string
  studentCount: number
  subjectsCount: number
  averageScore: number
  completionRate: number
  classTeacher: string
}

// Mock API functions
const fetchAllClasses = async (): Promise<ClassData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    {
      id: "CLS001",
      name: "S.1 East",
      level: "S.1",
      studentCount: 45,
      subjects: ["Mathematics", "English", "Science", "Social Studies"],
      classTeacher: "John Mukasa",
      classTeacherId: "TCH001",
    },
    {
      id: "CLS002",
      name: "S.1 West",
      level: "S.1",
      studentCount: 42,
      subjects: ["Mathematics", "English", "Science", "Social Studies"],
      classTeacher: "Mary Namuli",
      classTeacherId: "TCH002",
    },
    {
      id: "CLS003",
      name: "S.2 East",
      level: "S.2",
      studentCount: 38,
      subjects: ["Mathematics", "English", "Science", "Social Studies", "Agriculture"],
      classTeacher: "Peter Ssemakula",
      classTeacherId: "TCH003",
    },
    {
      id: "CLS004",
      name: "S.2 West",
      level: "S.2",
      studentCount: 40,
      subjects: ["Mathematics", "English", "Science", "Social Studies", "Agriculture"],
      classTeacher: "Sarah Akello",
      classTeacherId: "TCH004",
    },
    {
      id: "CLS005",
      name: "S.3 East",
      level: "S.3",
      studentCount: 35,
      subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History"],
      classTeacher: "David Mubiru",
      classTeacherId: "TCH005",
    },
    {
      id: "CLS006",
      name: "S.4 East",
      level: "S.4",
      studentCount: 33,
      subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Geography"],
      classTeacher: "Grace Nalubega",
      classTeacherId: "TCH006",
    },
  ]
}

const fetchStudentsByClass = async (classId: string): Promise<Student[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const studentCounts: Record<string, number> = {
    CLS001: 45,
    CLS002: 42,
    CLS003: 38,
    CLS004: 40,
    CLS005: 35,
    CLS006: 33,
  }
  
  const count = studentCounts[classId] || 30
  return Array.from({ length: count }, (_, i) => ({
    id: `${classId}_STU${String(i + 1).padStart(3, '0')}`,
    name: `Student ${i + 1}`,
    studentNumber: `2024${String(i + 1).padStart(3, '0')}`,
    gender: i % 2 === 0 ? "Female" : "Male",
    classId,
  }))
}

const fetchClassSummaries = async (year: string, term: string): Promise<ClassSummary[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  
  const classes = await fetchAllClasses()
  return classes.map((cls) => ({
    classId: cls.id,
    className: cls.name,
    studentCount: cls.studentCount,
    subjectsCount: cls.subjects.length,
    averageScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
    completionRate: Math.floor(Math.random() * 20) + 80, // Random completion between 80-100%
    classTeacher: cls.classTeacher,
  }))
}

const fetchTermDataForClass = async (year: string, term: string, classId: string): Promise<TermData> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const classData = (await fetchAllClasses()).find(cls => cls.id === classId)
  const subjects = classData?.subjects || []
  const subjectsData: Record<string, any> = {}

  subjects.forEach((subject) => {
    const assessments: Record<string, SubjectAssessment> = {}
    // Generate mock assessment data for ALL students (not just first 10)
    const studentCount = classData?.studentCount || 30
    for (let i = 1; i <= studentCount; i++) {
      const studentId = `${classId}_STU${String(i).padStart(3, '0')}`
      assessments[studentId] = {
        studentId,
        competenceScores: {
          C1: Math.floor(Math.random() * 8) + 2,
          C2: Math.floor(Math.random() * 8) + 2,
          C3: Math.floor(Math.random() * 8) + 2,
        },
        projectScore: Math.floor(Math.random() * 8) + 2,
        continuousScore: Math.floor(Math.random() * 15) + 5,
        eotScore: Math.floor(Math.random() * 60) + 20,
      }
    }

    subjectsData[subject] = {
      competenceAssignments: [
        { id: "C1", name: `${subject} Competence 1`, maxScore: 10 },
        { id: "C2", name: `${subject} Competence 2`, maxScore: 10 },
        { id: "C3", name: `${subject} Competence 3`, maxScore: 10 },
      ],
      assessments,
    }
  })

  return {
    year,
    term,
    classId,
    subjects: subjectsData,
  }
}

function SchoolClassesContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState({
    classes: false,
    summaries: false,
    students: false,
    termData: false,
  })

  const [classes, setClasses] = useState<ClassData[]>([])
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [termData, setTermData] = useState<TermData | null>(null)

  // Filter states
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedTerm, setSelectedTerm] = useState("1")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // View states
  const [activeTab, setActiveTab] = useState("overview")

  // Generate years (current year and 4 years back)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  }, [])

  const terms = [
    { value: "1", label: "Term 1" },
    { value: "2", label: "Term 2" },
    { value: "3", label: "Term 3" },
  ]

  // Get unique levels from classes
  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(classes.map(cls => cls.level))]
    return [{ value: "all", label: "All Levels" }, ...uniqueLevels.map(level => ({ value: level, label: level }))]
  }, [classes])

  // Filter classes based on selected filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesLevel = selectedLevel === "all" || cls.level === selectedLevel
      const matchesSearch = searchQuery === "" || 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.classTeacher.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesLevel && matchesSearch
    })
  }, [classes, selectedLevel, searchQuery])

  // Filter summaries based on filtered classes
  const filteredSummaries = useMemo(() => {
    const classIds = filteredClasses.map(cls => cls.id)
    return classSummaries.filter(summary => classIds.includes(summary.classId))
  }, [classSummaries, filteredClasses])

  // Load initial data
  useEffect(() => {
    const loadClasses = async () => {
      setLoading((prev) => ({ ...prev, classes: true }))
      try {
        const classesData = await fetchAllClasses()
        setClasses(classesData)
      } catch (error) {
        console.error("Error loading classes:", error)
      } finally {
        setLoading((prev) => ({ ...prev, classes: false }))
      }
    }
    loadClasses()
  }, [])

  // Load class summaries when year/term changes
  useEffect(() => {
    if (!selectedYear || !selectedTerm) return

    const loadSummaries = async () => {
      setLoading((prev) => ({ ...prev, summaries: true }))
      try {
        const summaries = await fetchClassSummaries(selectedYear, selectedTerm)
        setClassSummaries(summaries)
      } catch (error) {
        console.error("Error loading summaries:", error)
      } finally {
        setLoading((prev) => ({ ...prev, summaries: false }))
      }
    }
    loadSummaries()
  }, [selectedYear, selectedTerm])

  // Load students and term data when specific class is selected
  useEffect(() => {
    if (!selectedClass) {
      setStudents([])
      setTermData(null)
      return
    }

    const loadClassData = async () => {
      setLoading((prev) => ({ ...prev, students: true, termData: true }))
      try {
        const [studentsData, termDataResult] = await Promise.all([
          fetchStudentsByClass(selectedClass),
          fetchTermDataForClass(selectedYear, selectedTerm, selectedClass)
        ])
        
        setStudents(studentsData)
        setTermData(termDataResult)
        
        // Set first subject as selected if none selected
        const subjects = Object.keys(termDataResult.subjects)
        if (subjects.length > 0 && !selectedSubject) {
          setSelectedSubject(subjects[0])
        }
      } catch (error) {
        console.error("Error loading class data:", error)
      } finally {
        setLoading((prev) => ({ ...prev, students: false, termData: false }))
      }
    }
    loadClassData()
  }, [selectedClass, selectedYear, selectedTerm])

  const currentClass = useMemo(() => classes.find((cls) => cls.id === selectedClass), [classes, selectedClass])
  const currentSubjectData = useMemo(() => termData?.subjects[selectedSubject], [termData, selectedSubject])

  // Calculate school-wide statistics
  const schoolStats = useMemo(() => {
    const totalStudents = filteredSummaries.reduce((sum, cls) => sum + cls.studentCount, 0)
    const totalClasses = filteredSummaries.length
    const averageScore = filteredSummaries.length > 0 
      ? filteredSummaries.reduce((sum, cls) => sum + cls.averageScore, 0) / filteredSummaries.length 
      : 0
    const averageCompletion = filteredSummaries.length > 0
      ? filteredSummaries.reduce((sum, cls) => sum + cls.completionRate, 0) / filteredSummaries.length
      : 0

    return {
      totalStudents,
      totalClasses,
      averageScore: Math.round(averageScore),
      averageCompletion: Math.round(averageCompletion),
    }
  }, [filteredSummaries])

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard" },
    { label: "School Assessments" }
  ]

  return (
    <MainLayout userRole={user.role}  userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes or teachers..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* School Statistics Cards */}
        {!loading.summaries && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Across {schoolStats.totalClasses} classes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Period</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedYear}</div>
                <p className="text-xs text-muted-foreground">Term {selectedTerm}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">School-wide average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schoolStats.averageCompletion}%</div>
                <p className="text-xs text-muted-foreground">Assessment completion</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Classes Overview</TabsTrigger>
            <TabsTrigger value="details">Class Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classes Summary - {selectedYear} Term {selectedTerm}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.summaries ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredSummaries.map((summary) => (
                        <Card key={summary.classId} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-base">{summary.className}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {summary.classTeacher}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  setSelectedClass(summary.classId)
                                  setActiveTab("details")
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Students</p>
                                <p className="font-medium text-sm">{summary.studentCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Subjects</p>
                                <p className="font-medium text-sm">{summary.subjectsCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Avg Score</p>
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-sm">{summary.averageScore}%</p>
                                  <Badge 
                                    variant={summary.averageScore >= 70 ? "default" : summary.averageScore >= 50 ? "secondary" : "destructive"}
                                    className="text-xs px-1 py-0"
                                  >
                                    {summary.averageScore >= 70 ? "Good" : summary.averageScore >= 50 ? "Fair" : "Poor"}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Completion</p>
                                <p className="font-medium text-sm">{summary.completionRate}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {filteredSummaries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No classes found matching your filters.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Class Details</CardTitle>
                  {currentClass && (
                    <Badge variant="outline">
                      {currentClass.name} - {currentClass.classTeacher}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Select a class to view details" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.classTeacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedClass && currentClass && (
                    <div className="space-y-6">
                      {/* Class Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Card>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="h-4 w-4" />
                              <span className="text-xs font-medium">Class Information</span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-sm">{currentClass.name}</p>
                              <p className="text-xs text-muted-foreground">Level: {currentClass.level}</p>
                              <p className="text-xs text-muted-foreground">
                                Students: {loading.students ? "Loading..." : students.length}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4" />
                              <span className="text-xs font-medium">Class Teacher</span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-sm">{currentClass.classTeacher}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {currentClass.classTeacherId}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="h-4 w-4" />
                              <span className="text-xs font-medium">Subjects</span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-sm">{currentClass.subjects.length} Subjects</p>
                              <div className="flex flex-wrap gap-1">
                                {currentClass.subjects.slice(0, 2).map((subject) => (
                                  <Badge key={subject} variant="outline" className="text-xs px-1 py-0">
                                    {subject}
                                  </Badge>
                                ))}
                                {currentClass.subjects.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{currentClass.subjects.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Subject Selection and Assessment Table */}
                      {termData && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Assessment Data</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className="w-full max-w-md">
                                  <SelectValue placeholder="Select subject to view assessments" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(termData.subjects).map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {selectedSubject && currentSubjectData && (
                                <div className="border rounded-lg overflow-auto max-h-96">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[200px]">Student Name</TableHead>
                                        <TableHead className="w-[120px]">Student No.</TableHead>
                                        {currentSubjectData.competenceAssignments.map((comp) => (
                                          <TableHead key={comp.id} className="w-[100px] text-center">
                                            {comp.name}
                                            <br />
                                            <span className="text-xs text-muted-foreground">/{comp.maxScore}</span>
                                          </TableHead>
                                        ))}
                                        <TableHead className="w-[100px] text-center">Project</TableHead>
                                        <TableHead className="w-[100px] text-center">Continuous</TableHead>
                                        <TableHead className="w-[100px] text-center">EOT</TableHead>
                                        <TableHead className="w-[100px] text-center">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {loading.students ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                          <TableRow key={i}>
                                            {Array.from({ length: 8 }).map((_, j) => (
                                              <TableCell key={j}>
                                                <Skeleton className="h-4 w-16" />
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        ))
                                      ) : (
                                        students.map((student) => {
                                          const assessment = currentSubjectData.assessments[student.id]
                                          const total = assessment ? 
                                            Object.values(assessment.competenceScores).reduce((sum, score) => sum + score, 0) +
                                            assessment.projectScore + assessment.continuousScore + assessment.eotScore : 0
                                          
                                          return (
                                            <TableRow key={student.id}>
                                              <TableCell className="font-medium">{student.name}</TableCell>
                                              <TableCell>{student.studentNumber}</TableCell>
                                              {currentSubjectData.competenceAssignments.map((comp) => (
                                                <TableCell key={comp.id} className="text-center">
                                                  {assessment?.competenceScores[comp.id] || "-"}
                                                </TableCell>
                                              ))}
                                              <TableCell className="text-center">{assessment?.projectScore || "-"}</TableCell>
                                              <TableCell className="text-center">{assessment?.continuousScore || "-"}</TableCell>
                                              <TableCell className="text-center">{assessment?.eotScore || "-"}</TableCell>
                                              <TableCell className="text-center font-medium">
                                                {total > 0 ? total : "-"}
                                              </TableCell>
                                            </TableRow>
                                          )
                                        })
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default function SchoolClassesPage() {
  return (
    <ProtectedRoute requiredPermissions={["academics.manage_assessments"]}>
      <SchoolClassesContent />
    </ProtectedRoute>
  )
}