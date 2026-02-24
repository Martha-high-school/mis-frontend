"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import Link from "next/link"
import { useAcademicContext } from "@/contexts/use-academic-contex"
import { useRouter } from "next/navigation"
import { classService } from "@/services/class.service"
import { studentService } from "@/services/student.service"

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

interface Class {
  id: string
  name: string
  level: string
  stream?: string
  classTeacher?: {
    firstName: string
    lastName: string
  }
}

interface StudentFormData {
  student: {
    firstName: string
    lastName: string
    gender: string
    date?: string
    guardian: {
      phone: string
      relationship: string
    }
  }
  status: "INITIAL"
  initialClassAssignment: string
}

function NewStudentContent() {
  const { user } = useAuth()
  const router = useRouter()

  const { context, loading: contextLoading, year, term, termName } = useAcademicContext()

  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  const [formData, setFormData] = useState<StudentFormData>({
    student: {
      firstName: "",
      lastName: "",
      gender: "",
      date: new Date().toISOString().split('T')[0],
      guardian: {
        phone: "",
        relationship: ""
      },
    },
    status: "INITIAL",
    initialClassAssignment: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true)
      const data = await classService.getAllClasses()
      if (!data) {
        throw new Error('Failed to fetch classes')
      }
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
      setErrors({ classes: 'Failed to load classes. Please refresh the page.' })
    } finally {
      setLoadingClasses(false)
    }
  }

  if (!user) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate required student fields
    if (!formData.student.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.student.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.student.gender) {
      newErrors.gender = "Gender is required"
    }

    // Validate required guardian fields
    if (!formData.student.guardian.phone.trim()) {
      newErrors.guardianPhone = "Guardian phone is required"
    }
    if (!formData.student.guardian.relationship.trim()) {
      newErrors.relationship = "Relationship is required"
    }

    // Validate class assignment
    if (!formData.initialClassAssignment) {
      newErrors.initialClass = "Initial class assignment is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Prepare payload matching backend expectations
      const payload = {
        student: {
          firstName: formData.student.firstName.trim(),
          lastName: formData.student.lastName.trim(),
          gender: formData.student.gender.toUpperCase() as "MALE" | "FEMALE" | "OTHER",
          date: formData.student.date,
          guardian: {
            phone: formData.student.guardian.phone.trim(),
            relationship: formData.student.guardian.relationship,
          }
        },
        status: formData.status,
        initialClassAssignment: formData.initialClassAssignment
      }

      console.log("Submitting payload:", payload)

      // Use studentService instead of direct fetch
      const result = await studentService.addStudent(payload)
      toast.success("Student created successfully")

      // Redirect to students list after 2 seconds
      setTimeout(() => {
        router.push("/students")
      }, 2000)
    } catch (error: any) {
      toast.error("An error occurred while registering the student")
    } finally {
      setLoading(false)
    }
  }

  const updateStudentField = (field: keyof StudentFormData["student"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        [field]: value,
      },
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const updateGuardianField = (field: keyof StudentFormData["student"]["guardian"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        guardian: {
          ...prev.student.guardian,
          [field]: value,
        },
      },
    }))
    const errorKey = `guardian${field.charAt(0).toUpperCase() + field.slice(1)}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/students" },
    { label: "Create Student" },
  ]

  return (
    <MainLayout
      userRole={user.role}
      userName={user.name}
      breadcrumbs={breadcrumbs}
      showBackButton={true}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register New Student</h1> */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add a new student to the system. Student number will be generated automatically.
          </p>
        </div>

        {errors.classes && (
          <div className="flex items-start gap-2 mb-6 p-4 border-2 border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{errors.classes}</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Student Information</CardTitle>
                <CardDescription>Enter the student's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.student.firstName}
                      onChange={(e) => updateStudentField("firstName", e.target.value)}
                      className={`h-10 border-2 ${errors.firstName ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                      required
                    />
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.student.lastName}
                      onChange={(e) => updateStudentField("lastName", e.target.value)}
                      className={`h-10 border-2 ${errors.lastName ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                      required
                    />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.student.gender}
                      onValueChange={(value) => updateStudentField("gender", value)}
                      required
                    >
                      <SelectTrigger className={`h-10 border-2 ${errors.gender ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.student.date}
                      onChange={(e) => updateStudentField("date", e.target.value)}
                      className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialClass">Initial Class Assignment *</Label>
                  <Select
                    value={formData.initialClassAssignment}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, initialClassAssignment: value }))
                      if (errors.initialClass) {
                        setErrors((prev) => ({ ...prev, initialClass: "" }))
                      }
                    }}
                    required
                    disabled={loadingClasses}
                  >
                    <SelectTrigger className={`h-10 border-2 ${errors.initialClass ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary`}>
                      <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select initial class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length === 0 && !loadingClasses ? (
                        <div className="px-2 py-6 text-center text-sm text-slate-500">
                          No classes available
                        </div>
                      ) : (
                        classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.stream && `- ${cls.stream}`}
                            {cls.classTeacher && 
                              ` (${cls.classTeacher.firstName} ${cls.classTeacher.lastName})`
                            }
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.initialClass && <p className="text-sm text-red-600">{errors.initialClass}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Guardian Information</CardTitle>
                <CardDescription>Enter the primary guardian's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone Number *</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    placeholder="+256 700 000 000"
                    value={formData.student.guardian.phone}
                    onChange={(e) => updateGuardianField("phone", e.target.value)}
                    className={`h-10 border-2 ${errors.guardianPhone ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
                    required
                  />
                  {errors.guardianPhone && <p className="text-sm text-red-600">{errors.guardianPhone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={formData.student.guardian.relationship}
                    onValueChange={(value) => updateGuardianField("relationship", value)}
                    required
                  >
                    <SelectTrigger className={`h-10 border-2 ${errors.relationship ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary`}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.relationship && <p className="text-sm text-red-600">{errors.relationship}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="h-10 flex items-center gap-2" disabled={loading || loadingClasses}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Register Student
                </>
              )}
            </Button>
            <Link href="/students">
              <Button type="button" variant="outline" className="h-10" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default function NewStudentPage() {
  return (
    <ProtectedRoute requiredPermissions={["students.create"]}>
      <NewStudentContent />
    </ProtectedRoute>
  )
}