"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Trash2, 
  Plus, 
  Save, 
  BookOpen, 
  Calendar, 
  Settings2, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  GraduationCap
} from "lucide-react"
import { toast } from "react-toastify"

// -------------------- Types --------------------

interface Subject {
  id: string
  name: string
  competences: string[]
  isDefault: boolean
}

interface CompetenceSettings {
  year: string
  term: string
  numCompetences: number
  subjects: Subject[]
}

// -------------------- Helpers (API calls) --------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthHeaders() {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("token")
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

/**
 * Load subjects + competences for a given class/year/term.
 * - Reads from: GET /api/academics/classes/:classId/subjects?year=YYYY
 * - Normalises into CompetenceSettings shape.
 */
const fetchCompetenceSettings = async (
  classId: string,
  year: string,
  term: string
): Promise<CompetenceSettings> => {
  const res = await fetch(
    `${API_BASE}/api/academics/classes/${classId}/subjects?year=${year}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch class subjects: ${res.status}`)
  }

  const data = await res.json()

  // data.subjects is like the sample you showed:
  // { id, classId, subjectId, subject: { name }, competences: [{ id, idx, name, maxScore }] }
  const rawSubjects = Array.isArray(data.subjects) ? data.subjects : []

  const mappedSubjects: Subject[] = rawSubjects.map((s: any) => {
    const rawCompetences = Array.isArray(s.competences) ? s.competences : []

    // Sort by idx to keep consistent order C1, C2, ...
    rawCompetences.sort((a: any, b: any) => {
      const aIdx = typeof a.idx === "number" ? a.idx : 0
      const bIdx = typeof b.idx === "number" ? b.idx : 0
      return aIdx - bIdx
    })

    return {
      id: String(s.id),
      name: s.subject?.name ?? s.name ?? "",
      competences: rawCompetences.map((c: any) => c.name || ""),
      isDefault: true, // all subjects coming from backend are "core" here
    }
  })

  // Decide how many competences per subject (global setting):
  let maxCompetences = mappedSubjects.reduce((max, sub) => {
    return Math.max(max, sub.competences.length)
  }, 0)

  if (maxCompetences === 0) {
    maxCompetences = 3 // sensible default if none found
  }

  // Pad all subjects to same length with empty strings
  const normalisedSubjects = mappedSubjects.map((sub) => ({
    ...sub,
    competences: Array.from({ length: maxCompetences }, (_, i) => sub.competences[i] || ""),
  }))

  return {
    year,
    term,
    numCompetences: maxCompetences,
    subjects: normalisedSubjects,
  }
}

/**
 * Save competence names for a given class/year/term.
 * - Sends to: PATCH /api/academics/classes/:classId/competences
 * - Body: { year, term, subjects: [{ subjectName, competences: [{ idx, name, maxScore }] }] }
 */
const saveCompetenceSettings = async (
  classId: string,
  settings: CompetenceSettings
): Promise<{ success: boolean }> => {
  const payload = {
    year: Number.parseInt(settings.year, 10),
    term: Number.parseInt(settings.term, 10), // 1, 2, or 3
    subjects: settings.subjects.map((subject) => ({
      subjectName: subject.name,
      competences: subject.competences.map((name, index) => ({
        idx: index + 1,
        name,
        maxScore: 10, // or 3 / any other default you want per competence
      })),
    })),
  }

  const res = await fetch(
    `${API_BASE}/api/academics/classes/${classId}/competences`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to save competence settings: ${res.status}`)
  }

  // We don't really care about the response body here, we just need success
  return { success: true }
}

// -------------------- Page Content --------------------

function CompetenceSettingsContent({ classId }: { classId: string }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState({
    fetching: false,
    saving: false,
  })
  const [settings, setSettings] = useState<CompetenceSettings>({
    year: new Date().getFullYear().toString(),
    term: "1",
    numCompetences: 3,
    subjects: [],
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  // Generate years (current year and 4 years back)
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())
  const terms = [
    { value: "1", label: "Term 1" },
    { value: "2", label: "Term 2" },
    { value: "3", label: "Term 3" },
  ]

  // Load settings when year/term OR classId changes
  useEffect(() => {
    if (!classId) return

    const loadSettings = async () => {
      setLoading((prev) => ({ ...prev, fetching: true }))
      try {
        const data = await fetchCompetenceSettings(classId, settings.year, settings.term)
        setSettings(data)
        setHasUnsavedChanges(false)
        setSaveStatus("idle")
      } catch (error) {
        console.error("Error loading settings:", error)
        setSaveStatus("error")
      } finally {
        setLoading((prev) => ({ ...prev, fetching: false }))
      }
    }

    loadSettings()
  }, [classId, settings.year, settings.term])

  // Mark as changed when settings are modified
  const markAsChanged = useCallback(() => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true)
      setSaveStatus("idle")
    }
  }, [hasUnsavedChanges])

  const updateYear = (year: string) => {
    setSettings((prev) => ({ ...prev, year }))
  }

  const updateTerm = (term: string) => {
    setSettings((prev) => ({ ...prev, term }))
  }

  const updateNumCompetences = (newNum: number) => {
    setSettings((prev) => ({
      ...prev,
      numCompetences: newNum,
      subjects: prev.subjects.map((subject) => ({
        ...subject,
        competences: Array.from({ length: newNum }, (_, i) => subject.competences[i] || ""),
      })),
    }))
    markAsChanged()
  }

  const updateSubjectCompetence = (subjectId: string, competenceIndex: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              competences: subject.competences.map((comp, index) =>
                index === competenceIndex ? value : comp
              ),
            }
          : subject
      ),
    }))
    markAsChanged()
  }

  const updateSubjectName = (subjectId: string, name: string) => {
    setSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, name } : subject
      ),
    }))
    markAsChanged()
  }

  // NOTE: adding totally new subjects from here will only work
  // if backend knows how to create them. Otherwise, keep this
  // for minor custom cases, or disable in future.
  const addSubject = () => {
    const newSubject: Subject = {
      id: `SUBJ${Date.now()}`,
      name: "",
      competences: Array.from({ length: settings.numCompetences }, () => ""),
      isDefault: false,
    }
    setSettings((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }))
    markAsChanged()
  }

  const removeSubject = (subjectId: string) => {
    setSettings((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject.id !== subjectId),
    }))
    markAsChanged()
  }

  const handleSave = async () => {
    if (!classId) return
    setLoading((prev) => ({ ...prev, saving: true }))
    setSaveStatus("idle")

    try {
      await saveCompetenceSettings(classId, settings)
      setHasUnsavedChanges(false)
      toast.success("Competence settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save competence settings")
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }))
    }
  }

  // Validation
  const isValid = settings.subjects.every(
    (subject) =>
      subject.name.trim() !== "" &&
      subject.competences.every((comp) => comp.trim() !== "")
  )

  const emptyFields = settings.subjects.reduce((count, subject) => {
    if (!subject.name.trim()) count++
    count += subject.competences.filter((comp) => !comp.trim()).length
    return count
  }, 0)

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard"},
    { label: "My Classes", href: "/my-classes" },
    { label: "Competence Settings" },
  ]

  return (
    <MainLayout
      userRole={user.role}
      userName={user.name}
      breadcrumbs={breadcrumbs}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Header with Save Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Configure Assessment Competences</h2>
            <p className="text-muted-foreground">
              Set up competence assignments for {settings.year} Term {settings.term}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Saved successfully</span>
              </div>
            )}

            {saveStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Save failed</span>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading.saving || !hasUnsavedChanges || !isValid}
              className="min-w-32"
            >
              {loading.saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading.saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Validation Alert */}
        {!isValid && emptyFields > 0 && (
          <div className="flex items-start gap-3 p-4 border border-red-300 bg-red-50 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-1" />
            <p className="text-sm text-red-700">
              Please fill in all {emptyFields} empty field{emptyFields !== 1 ? "s" : ""} before saving.
            </p>
          </div>
        )}


        {/* Academic Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Period
            </CardTitle>
            <CardDescription>
              Select the academic year and term to configure competence settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="year" className="text-sm font-medium">
                  Academic Year
                </Label>
                <Select value={settings.year} onValueChange={updateYear} disabled={loading.fetching}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-3">
                <Label htmlFor="term" className="text-sm font-medium">
                  Academic Term
                </Label>
                <Select value={settings.term} onValueChange={updateTerm} disabled={loading.fetching}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Number of Competences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Global Configuration
            </CardTitle>
            <CardDescription>
              Set the number of competence assignments that will apply to all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="numCompetences" className="text-sm font-medium">
                Number of Competence Assignments
              </Label>
              <div className="flex items-center gap-4">
                <Select
                  value={settings.numCompetences.toString()}
                  onValueChange={(value) => updateNumCompetences(Number.parseInt(value))}
                  disabled={loading.fetching}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Competence{num !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs">
                  Applies to all subjects
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Competences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Competences
            </CardTitle>
            <CardDescription>
              Define specific competence names for each subject (all fields are required)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading.fetching ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-10 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {settings.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border rounded-lg p-4 space-y-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Subject Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <Badge
                            variant={subject.isDefault ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {subject.isDefault ? "Core Subject" : "Custom"}
                          </Badge>
                        </div>
                        <div className="flex-1 max-w-xs">
                          <Label
                            htmlFor={`subject-${subject.id}`}
                            className="text-sm font-medium"
                          >
                            Subject Name
                          </Label>
                          <Input
                            id={`subject-${subject.id}`}
                            value={subject.name}
                            onChange={(e) => updateSubjectName(subject.id, e.target.value)}
                            className={`mt-1 ${
                              !subject.name.trim()
                                ? "border-red-200 focus:border-red-300"
                                : ""
                            }`}
                          />
                        </div>
                      </div>

                      {!subject.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubject(subject.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Competences Grid */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                        Competence Assignments ({settings.numCompetences} required)
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subject.competences.map((competence, index) => (
                          <div key={index} className="space-y-2">
                            <Label
                              htmlFor={`competence-${subject.id}-${index}`}
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">
                                C{index + 1}
                              </span>
                              Competence {index + 1}
                            </Label>
                            <Input
                              id={`competence-${subject.id}-${index}`}
                              value={competence}
                              onChange={(e) =>
                                updateSubjectCompetence(subject.id, index, e.target.value)
                              }
                              className={`${
                                !competence.trim()
                                  ? "border-red-200 focus:border-red-300"
                                  : ""
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Subject Button */}
                <Button
                  onClick={addSubject}
                  variant="outline"
                  className="w-full border-dashed hover:bg-muted/50"
                  disabled={loading.fetching}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Subject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        {settings.subjects.length > 0 && !loading.fetching && (
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Academic Year</div>
                  <div className="text-lg font-semibold">{settings.year}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Term</div>
                  <div className="text-lg font-semibold">Term {settings.term}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Subjects</div>
                  <div className="text-lg font-semibold">{settings.subjects.length}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">
                    Competences Each
                  </div>
                  <div className="text-lg font-semibold">{settings.numCompetences}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

// -------------------- Page Wrapper (with classId + roles) --------------------

function CompetenceSettingsPageInner() {
  const params = useParams() as { classId?: string | string[] }
  const classIdParam = params?.classId
  const classId = Array.isArray(classIdParam) ? classIdParam[0] : classIdParam

  if (!classId) {
    // You can render a nicer error UI here
    return <div className="p-4 text-red-600">Missing classId in route.</div>
  }

  return <CompetenceSettingsContent classId={classId} />
}

export default function CompetenceSettingsPage() {
  return (
    <ProtectedRoute requiredPermissions={["academics.manage_competences"]}>
      <CompetenceSettingsPageInner />
    </ProtectedRoute>
  )
}
