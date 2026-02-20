"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { classService, type SetupSubject } from "@/services/class.service"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Plus, Trash2, BookOpen, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"

// Predefined subject list
const AVAILABLE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Biology",
  "Chemistry",
  "Geography",
  "History and Political Education",
  "Kiswahili",
  "Entrepreneurship",
  "Physical Education",
  "Religious Education (CRE)",
  "Literature in English",
  "Art and Design",
  "ICT",
  "Music",
  "French",
  "Agriculture",
  "Home Science",
  "Business Studies",
  "Computer Studies"
]

const COMPETENCE_MAX_SCORE = 3

interface SubjectFormData {
  id: string
  subjectName: string
  isCore: boolean
  instructorName?: string
  instructorInitials?: string
  competences: Array<{ name: string }>
}

// Generate initials from full name
function generateInitials(fullName: string): string {
  if (!fullName) return ""
  
  const words = fullName.trim().split(/\s+/)
  if (words.length === 0) return ""
  
  // Get first letter of each word, max 3
  const initials = words
    .slice(0, 3)
    .map(word => word[0]?.toUpperCase() || "")
    .join("")
  
  return initials
}

export default function ClassSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { classId } = useParams()
  const searchParams = useSearchParams()

  // Get year from URL parameter
  const urlYear = searchParams.get('year')
  const year = urlYear ? parseInt(urlYear) : new Date().getFullYear()

  const [classInfo, setClassInfo] = useState<any>(null)
  const [subjects, setSubjects] = useState<SubjectFormData[]>([
    {
      id: crypto.randomUUID(),
      subjectName: "",
      isCore: true,
      competences: [{ name: "" }],
    },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [classId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const classData = await classService.getClassById(classId as string)
      setClassInfo(classData)
    } catch (error: any) {
      toast.error(error.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: crypto.randomUUID(),
        subjectName: "",
        isCore: false,
        competences: [{ name: "" }],
      },
    ])
  }

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id))
    }
  }

  const updateSubject = (id: string, field: keyof SubjectFormData, value: any) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value }
          
          // Auto-generate initials when instructor name changes
          if (field === "instructorName") {
            updated.instructorInitials = generateInitials(value)
          }
          
          return updated
        }
        return s
      })
    )
  }

  const addCompetence = (subjectId: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            competences: [...s.competences, { name: "" }],
          }
        }
        return s
      })
    )
  }

  const removeCompetence = (subjectId: string, index: number) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId && s.competences.length > 1) {
          return {
            ...s,
            competences: s.competences.filter((_, i) => i !== index),
          }
        }
        return s
      })
    )
  }

  const updateCompetence = (subjectId: string, index: number, value: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            competences: s.competences.map((c, i) => (i === index ? { name: value } : c)),
          }
        }
        return s
      })
    )
  }

  const validateForm = (): boolean => {
    // Check if at least one subject is added
    if (subjects.length === 0) {
     toast.error("Please add at least one subject")
      return false
    }

    // Check if all subjects have names
    const emptySubjects = subjects.filter((s) => !s.subjectName.trim())
    if (emptySubjects.length > 0) {
      toast.error("Please select a subject for all entries")
      return false
    }

    // Check for duplicate subjects
    const subjectNames = subjects.map((s) => s.subjectName.toLowerCase())
    const hasDuplicates = subjectNames.some((name, idx) => subjectNames.indexOf(name) !== idx)
    if (hasDuplicates) {
      toast.error("Duplicate subjects are not allowed")
      return false
    }

    // Check if at least one core subject exists
    const coreSubjects = subjects.filter((s) => s.isCore)
    if (coreSubjects.length === 0) {
      toast.error("At least one core subject is required")
      return false
    }

    // Check if all subjects have at least one competence with a name
    for (const subject of subjects) {
      const validCompetences = subject.competences.filter((c) => c.name.trim())
      if (validCompetences.length === 0) {
      toast.error( `Please add at least one competence for ${subject.subjectName}`)
        return false
      }
    }

    // Check year is valid
    if (!year || isNaN(year)) {
      toast.error("Invalid academic year.")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)

      const setupData: SetupSubject[] = subjects.map((s) => ({
        subjectName: s.subjectName.trim(),
        isCore: s.isCore,
        instructorName: s.instructorName?.trim(),
        instructorInitials: s.instructorInitials?.trim(),
        competences: s.competences
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            maxScore: COMPETENCE_MAX_SCORE,
          })),
      }))

      // Pass year from URL to the service
      await classService.setupClassSubjects(classId as string, year, setupData)

      toast.success(`Class subjects configured successfully for ${year}`)

      router.push("/my-classes")
    } catch (error: any) {
      toast.error(error.message || "Failed to save subjects")
    } finally {
      setSaving(false)
    }
  }

  // Get available subjects (excluding already selected ones)
  const getAvailableSubjectsForDropdown = (currentSubjectId: string) => {
    const selectedSubjects = subjects
      .filter((s) => s.id !== currentSubjectId && s.subjectName)
      .map((s) => s.subjectName)

    return AVAILABLE_SUBJECTS.filter((subject) => !selectedSubjects.includes(subject))
  }

  if (loading) {
    return (
      <MainLayout userRole={user?.role} userName={user?.name}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <ProtectedRoute requiredPermissions={["classes.setup_subjects"]}>
      <MainLayout userRole={user?.role} userName={user?.name}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-8 w-8" />
                Setup Class Subjects
              </h1>
              <p className="text-muted-foreground">
                Configure subjects and competences for {classInfo?.name || "class"} - Academic Year {year}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {year}
            </Badge>
          </div>

          {/* Year Warning if not provided */}
          {!urlYear && (
            <div className="flex items-start gap-3 p-4 border border-red-300 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 mt-1" />
              <p className="text-sm text-red-700">
                No year specified in the URL. Using current year ({year}).  
                Add <code className="px-1 bg-muted rounded">?year=2025</code> to specify an academic year.
              </p>
            </div>

          )}

          {/* Class Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
              <CardDescription>Setting up subjects for this class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Class Name</Label>
                  <p className="font-semibold text-lg">{classInfo?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <p className="font-semibold text-lg">
                    {classInfo?.level === "O" ? "O-Level" : classInfo?.level === "A" ? "A-Level" : classInfo?.level}
                    {classInfo?.rank && ` (${classInfo.rank})`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Academic Year</Label>
                  <p className="font-semibold text-lg">{year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subjects & Competences</CardTitle>
                  <CardDescription>
                    Add subjects with their competences (each competence is scored out of {COMPETENCE_MAX_SCORE})
                  </CardDescription>
                </div>
                <Button onClick={addSubject} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {subjects.map((subject, subjectIndex) => (
                <Card key={subject.id} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant="secondary" className="text-base">
                          #{subjectIndex + 1}
                        </Badge>
                        
                        {/* Subject Selection */}
                        <div className="flex-1 max-w-xs">
                          <Select
                            value={subject.subjectName}
                            onValueChange={(value) => updateSubject(subject.id, "subjectName", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableSubjectsForDropdown(subject.id).map((subj) => (
                                <SelectItem key={subj} value={subj}>
                                  {subj}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Core Checkbox */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`core-${subject.id}`}
                            checked={subject.isCore}
                            onCheckedChange={(checked) => updateSubject(subject.id, "isCore", checked)}
                          />
                          <Label htmlFor={`core-${subject.id}`} className="cursor-pointer">
                            Core Subject
                          </Label>
                        </div>
                      </div>

                      {subjects.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeSubject(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Instructor Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Instructor Name</Label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={subject.instructorName || ""}
                          onChange={(e) => updateSubject(subject.id, "instructorName", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Initials (Auto-generated)</Label>
                        <Input
                          placeholder="e.g., JD"
                          value={subject.instructorInitials || ""}
                          onChange={(e) => updateSubject(subject.id, "instructorInitials", e.target.value)}
                          className="mt-1"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    {/* Competences */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Competences (max score: {COMPETENCE_MAX_SCORE} each)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addCompetence(subject.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {subject.competences.map((comp, compIndex) => (
                          <div key={compIndex} className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 justify-center">
                              {compIndex + 1}
                            </Badge>
                            <Input
                              placeholder={`Competence ${compIndex + 1} name`}
                              value={comp.name}
                              onChange={(e) => updateCompetence(subject.id, compIndex, e.target.value)}
                              className="flex-1"
                            />
                            {subject.competences.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeCompetence(subject.id, compIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Summary */}
              <div className="flex items-start gap-3 p-4 border border-blue-200 bg-blue-50 rounded-md">
                <BookOpen className="h-4 w-4 text-blue-700 mt-1" />
                <p className="text-sm text-blue-800">
                  <strong>{subjects.length}</strong> subject{subjects.length !== 1 ? "s" : ""} configured •  
                  <strong> {subjects.filter(s => s.isCore).length}</strong> core •  
                  <strong> {subjects.filter(s => !s.isCore).length}</strong> elective
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
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
                  Save Setup for {year}
                </>
              )}
            </Button>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
