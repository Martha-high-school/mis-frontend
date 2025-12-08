"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { Save, GraduationCap, User, CheckCircle, AlertCircle, Loader2, Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import { classService, type RankOption, type StreamOption } from "@/services/class.service"
import { useRouter } from "next/navigation"

interface ClassFormData {
  rank: string        // "S1", "S2", "S3", "S4", "S5", "S6"
  stream: string      // null, "A", "B", "Sciences", "Arts"
  classTeacher: string
}

interface Teacher {
  id: number
  firstName: string
  lastName: string
  email: string
}

function NewClassContent() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherSearch, setTeacherSearch] = useState("")
  const [formData, setFormData] = useState<ClassFormData>({
    rank: "",
    stream: "",
    classTeacher: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available ranks and streams from the service
  const availableRanks = useMemo(() => classService.getAvailableRanks(), [])
  
  const availableStreams = useMemo(() => {
    if (!formData.rank) return []
    return classService.getAvailableStreams(formData.rank)
  }, [formData.rank])

  // Check if stream is required for selected rank
  const streamRequired = useMemo(() => {
    return classService.rankRequiresStream(formData.rank)
  }, [formData.rank])

  // Generate preview name
  const previewName = useMemo(() => {
    if (!formData.rank) return ""
    return classService.generateClassName(formData.rank, formData.stream || null)
  }, [formData.rank, formData.stream])

  // Get level from rank
  const level = useMemo(() => {
    if (!formData.rank) return null
    return classService.getLevelFromRank(formData.rank)
  }, [formData.rank])

  // Get next rank info for promotion preview
  const nextRank = useMemo(() => {
    if (!formData.rank) return null
    return classService.getNextRank(formData.rank)
  }, [formData.rank])

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await classService.getClassTeachers()
        setTeachers(data)
      } catch (err) {
        console.error("Failed to fetch teachers:", err)
      }
    }
    fetchTeachers()
  }, [])

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.lastName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  const updateFormData = (field: keyof ClassFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      
      // Clear stream when rank changes
      if (field === "rank") {
        newData.stream = ""
      }
      
      return newData
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.rank) {
      newErrors.rank = "Class rank is required"
    }
    
    if (streamRequired && !formData.stream) {
      newErrors.stream = "Stream is required for A-Level classes"
    }
    
    if (!formData.classTeacher) {
      newErrors.classTeacher = "Class teacher assignment is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      await classService.createClass({
        rank: formData.rank,
        stream: formData.stream || undefined,
        classTeacherId: formData.classTeacher,
      })

      toast.success("Class created successfully!")

      setTimeout(() => router.push("/classes"), 1500)

    } catch (error: any) {
      console.error("Error creating class:", error)
      toast.error(error.message || "Failed to create class.")
    } finally {
      setLoading(false)
    }
  }


  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Classes", href: "/classes" },
    { label: "Create Class" },
  ]

  const selectedTeacher = teachers.find((t) => t.id.toString() === formData.classTeacher)
  const selectedRank = availableRanks.find((r) => r.rank === formData.rank)

  return (
    <MainLayout
      userRole={user.role}
      userName={user.name}
      breadcrumbs={breadcrumbs}
      showBackButton={true}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Class</h1>
              <p className="text-muted-foreground">Add a new class to the school system</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Class Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Class Information
                </CardTitle>
                <CardDescription>Select the class rank and stream</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rank Selection */}
                <div className="space-y-2">
                  <Label htmlFor="rank">Class Rank *</Label>
                  <Select onValueChange={(v) => updateFormData("rank", v)} value={formData.rank}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class rank (S1-S6)" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">O-Level</div>
                      {availableRanks.filter(r => r.level === 'O').map((r) => (
                        <SelectItem key={r.rank} value={r.rank}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.rank}</span>
                            <span className="text-muted-foreground text-xs">- {r.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">A-Level</div>
                      {availableRanks.filter(r => r.level === 'A').map((r) => (
                        <SelectItem key={r.rank} value={r.rank}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.rank}</span>
                            <span className="text-muted-foreground text-xs">- {r.description}</span>
                            {r.requiresStream && (
                              <Badge variant="outline" className="text-xs ml-1">Stream Required</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rank && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.rank}
                    </p>
                  )}
                  {selectedRank && (
                    <p className="text-xs text-muted-foreground">
                      Level: <Badge variant="outline" className="text-xs">{level === 'O' ? 'O-Level' : 'A-Level'}</Badge>
                    </p>
                  )}
                </div>

                {/* Stream Selection */}
                <div className="space-y-2">
                  <Label htmlFor="stream">
                    Stream {streamRequired ? '*' : '(Optional)'}
                  </Label>
                  <Select 
                    value={formData.stream} 
                    onValueChange={(v) => updateFormData("stream", v)}
                    disabled={!formData.rank}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.rank 
                          ? "Select rank first" 
                          : streamRequired 
                            ? "Select stream (required)" 
                            : "Select a stream (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStreams.map((s) => (
                        <SelectItem key={s.value || 'none'} value={s.value || 'none'}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stream && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.stream}
                    </p>
                  )}
                  {streamRequired && (
                    <p className="text-xs text-amber-600">
                      A-Level classes require a stream selection (Sciences or Arts)
                    </p>
                  )}
                </div>

                {/* Preview Name */}
                {previewName && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Class Name (Auto-generated)</Label>
                    <div className="text-lg font-semibold mt-1">{previewName}</div>
                  </div>
                )}

                {/* Promotion Path Preview */}
                {formData.rank && (
                  <div className="p-4 border rounded-lg bg-blue-50/50">
                    <Label className="text-xs text-muted-foreground mb-2 block">Promotion Path</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="default">{previewName || formData.rank}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      {nextRank ? (
                        <Badge variant="outline">
                          {formData.rank === 'S4' 
                            ? 'S.5 (Sciences or Arts)' 
                            : classService.generateClassName(nextRank, formData.stream || null)
                          }
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Graduate</Badge>
                      )}
                    </div>
                    {formData.rank === 'S4' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Students will choose Sciences or Arts stream when promoted to S5
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Class Teacher Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Class Teacher Assignment
                </CardTitle>
                <CardDescription>Search and assign a class teacher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="teacherSearch">Search Teachers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="teacherSearch"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                {/* Teacher List */}
                <div className="space-y-2">
                  <Label>Select Class Teacher *</Label>
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {filteredTeachers.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No teachers found matching your search
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredTeachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            onClick={() => updateFormData("classTeacher", teacher.id.toString())}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              formData.classTeacher === teacher.id.toString()
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-mono">
                                {teacher.firstName.charAt(0)}
                                {teacher.lastName.charAt(0)}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {teacher.firstName} {teacher.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">{teacher.email}</div>
                              </div>
                              {formData.classTeacher === teacher.id.toString() && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.classTeacher && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.classTeacher}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {(formData.rank || formData.classTeacher) && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg">Class Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {previewName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class Name:</span>
                      <span className="font-medium">{previewName}</span>
                    </div>
                  )}
                  {formData.rank && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rank:</span>
                      <Badge variant="outline">{formData.rank}</Badge>
                    </div>
                  )}
                  {level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <Badge variant="outline">{level === "O" ? "O-Level" : "A-Level"}</Badge>
                    </div>
                  )}
                  {formData.stream && formData.stream !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stream:</span>
                      <Badge variant="outline">{formData.stream}</Badge>
                    </div>
                  )}
                  {selectedTeacher && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Class Teacher:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedTeacher.firstName.charAt(0)}
                          {selectedTeacher.lastName.charAt(0)}
                        </Badge>
                        <span className="font-medium">
                          {selectedTeacher.firstName} {selectedTeacher.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? "Creating..." : "Create Class"}
            </Button>

            <Link href="/classes">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default function NewClassPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher"]}>
      <NewClassContent />
    </ProtectedRoute>
  )
}