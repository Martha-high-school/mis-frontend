"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, CheckCircle, AlertCircle, Loader2, Search } from "lucide-react"
import { classService } from "@/services/class.service"

interface Teacher {
  id: number
  firstName: string
  lastName: string
  email: string
}

const oLevelStreams = [
  { value: "A", label: "Stream A" },
  { value: "B", label: "Stream B" },
  { value: "C", label: "Stream C" },
  { value: "D", label: "Stream D" },
]

const aLevelStreams = [
  { value: "Arts", label: "Arts" },
  { value: "Sciences", label: "Sciences" },
]

export default function EditClassPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const router = useRouter()

  const [classData, setClassData] = useState<any>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherSearch, setTeacherSearch] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    stream: "",
    classTeacherId: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classRes, teacherRes] = await Promise.all([
          classService.getClassById(id as string),
          classService.getClassTeachers(),
        ])
        setClassData(classRes)
        setTeachers(teacherRes)
        setFormData({
          name: classRes.name,
          level: classRes.level,
          stream: classRes.stream || "",
          classTeacherId: classRes.classTeacherId?.toString() || "",
        })
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "level" ? { stream: "" } : {}),
    }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = "Class name is required"
    if (!formData.level) e.level = "Level is required"
    if (!formData.classTeacherId) e.classTeacherId = "Class teacher is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    setSaveStatus("idle")

    try {
      await classService.updateClass(id as string, {
        name: formData.name,
        level: formData.level,
        stream: formData.stream || null, 
        classTeacherId: formData.classTeacherId,
      })
      setSaveStatus("success")
      setTimeout(() => router.push("/classes"), 1500)
    } catch (err) {
      console.error("Update failed:", err)
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.lastName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  if (!user) return null
  if (loading)
    return (
      <MainLayout userRole={user.role} userName={user.name}>
        <p className="text-center text-muted-foreground mt-10">Loading...</p>
      </MainLayout>
    )

  return (
    <ProtectedRoute allowedRoles={["head_teacher", "director"]}>
      <MainLayout
        userRole={user.role}
        userName={user.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          { label: classData?.name || "Edit" },
        ]}
        showBackButton
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Class Details</CardTitle>
              <CardDescription>Modify class name, level, stream, and teacher</CardDescription>
            </CardHeader>
            <CardContent>
              {saveStatus === "success" && (
                <Alert className="border-green-200 bg-green-50 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Class updated successfully!
                  </AlertDescription>
                </Alert>
              )}
              {saveStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Failed to update class.</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Name */}
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className={errors.name ? "border-red-300" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Select
                      onValueChange={(v) => updateFormData("level", v)}
                      value={formData.level}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O">O Level</SelectItem>
                        <SelectItem value="A">A Level</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.level}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stream Dropdown (Dynamic & Optional) */}
                {formData.level && (
                  <div className="space-y-2">
                    <Label>Stream (Optional)</Label>
                    <Select
                      onValueChange={(v) => updateFormData("stream", v)}
                      value={formData.stream}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.level === "O" ? oLevelStreams : aLevelStreams).map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Teacher Section */}
                <div className="space-y-2">
                  <Label htmlFor="teacherSearch">Search Teachers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="teacherSearch"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-10"
                    />
                  </div>

                  <div className="border rounded-lg max-h-64 overflow-y-auto mt-2">
                    {filteredTeachers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() =>
                          updateFormData("classTeacherId", t.id.toString())
                        }
                        className={`p-3 cursor-pointer rounded-md ${
                          formData.classTeacherId === t.id.toString()
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {t.firstName} {t.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t.email}
                            </div>
                          </div>
                          {formData.classTeacherId === t.id.toString() && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.classTeacherId && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.classTeacherId}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/classes">
                  <Button variant="outline" className="ml-3">
                    Cancel
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
