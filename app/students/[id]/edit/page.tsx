"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  User, 
  GraduationCap, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Home,
  ArrowLeft,
  Upload,
  X,
  Camera,
  ImageIcon
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { studentService } from "@/services/student.service"
import { classService } from "@/services/class.service"
import { toast } from "react-toastify"

// Types
interface StudentData {
  id: string
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  guardianPhone: string
  guardianRelation: string
  admissionDate: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
  enrollments: Array<{
    id: string
    classId: string
    isCurrent: boolean
    class: {
      id: string
      name: string
      level: string
    }
  }>
}

interface EditFormData {
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  guardianPhone: string
  guardianRelation: string
}

function EditStudentContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const studentId = params?.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState({
    fetching: false,
    saving: false
  })
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    gender: "MALE",
    guardianPhone: "",
    guardianRelation: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [hasPhotoChanges, setHasPhotoChanges] = useState(false)

  // Calculate age from admission date
  const calculateAge = (admissionDate: string): number => {
    if (!admissionDate) return 0
    const today = new Date()
    const birthDate = new Date(admissionDate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Load student data from API
  useEffect(() => {
    if (!studentId) return

    const loadStudentData = async () => {
      setLoading(prev => ({ ...prev, fetching: true }))
      try {
        const data = await studentService.getStudentById(studentId)
        
        if (data) {
          setStudentData(data)
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            gender: data.gender,
            guardianPhone: data.guardianPhone,
            guardianRelation: data.guardianRelation
          })
          // Set initial photo preview from existing photo
          if (data.photoUrl) {
            setPhotoPreview(data.photoUrl)
          }
        }
      } catch (error: any) {
        console.error('Failed to load student:', error)
        toast.error(error.message || 'Failed to load student data')
      } finally {
        setLoading(prev => ({ ...prev, fetching: false }))
      }
    }

    loadStudentData()
  }, [studentId])

  // Track changes
  useEffect(() => {
    if (!studentData) return

    const formChanged = 
      formData.firstName !== studentData.firstName ||
      formData.lastName !== studentData.lastName ||
      formData.gender !== studentData.gender ||
      formData.guardianPhone !== studentData.guardianPhone ||
      formData.guardianRelation !== studentData.guardianRelation

    setHasChanges(formChanged || hasPhotoChanges)
  }, [formData, studentData, hasPhotoChanges])

  const updateFormData = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setPhotoFile(file)
    setRemovePhoto(false)
    setHasPhotoChanges(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setRemovePhoto(true)
    setHasPhotoChanges(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReplacePhoto = () => {
    fileInputRef.current?.click()
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.guardianPhone.trim()) {
      newErrors.guardianPhone = 'Guardian phone is required'
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.guardianPhone)) {
      newErrors.guardianPhone = 'Please enter a valid phone number'
    }

    if (!formData.guardianRelation.trim()) {
      newErrors.guardianRelation = 'Guardian relationship is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(prev => ({ ...prev, saving: true }))

    try {
      const payload = new FormData()
      payload.append("firstName", formData.firstName)
      payload.append("lastName", formData.lastName)
      payload.append("gender", formData.gender)
      payload.append("guardianPhone", formData.guardianPhone)
      payload.append("guardianRelation", formData.guardianRelation)

      // Handle photo changes
      if (photoFile) {
        payload.append("photo", photoFile)
      } else if (removePhoto) {
        payload.append("removePhoto", "true")
      }

      await studentService.updateStudent(studentId, payload)

      toast.success('Student updated successfully!')
      
      // Reload student data
      const updatedData = await studentService.getStudentById(studentId)
      if (updatedData) {
        setStudentData(updatedData)
        setFormData({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          gender: updatedData.gender,
          guardianPhone: updatedData.guardianPhone,
          guardianRelation: updatedData.guardianRelation
        })
        // Update photo preview
        if (updatedData.photoUrl) {
          setPhotoPreview(updatedData.photoUrl)
        } else {
          setPhotoPreview(null)
        }
        setPhotoFile(null)
        setRemovePhoto(false)
        setHasPhotoChanges(false)
        setHasChanges(false)
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to update student')
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  if (loading.fetching) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  if (!studentData) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="flex items-start gap-2 p-4 border border-red-300 bg-red-50 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-1" />
            <p className="text-sm text-red-700">Student not found. Please try again.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const currentClass = studentData.enrollments.find(e => e.isCurrent)?.class
  const currentAge = calculateAge(studentData.admissionDate)

    const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Students", href: "/students" },
    { label: "Edit Student" },
  ]

  return (
    <MainLayout
      // userRole={user.role}
      // userName={user.name}
      breadcrumbs={breadcrumbs}
      // showBackButton={true}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        
        <div className="mb-6">
          {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Student</h1> */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update student information and photo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Basic student details and photo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className={`h-10 border-2 ${errors.firstName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} focus:border-primary bg-white dark:bg-slate-900`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className={`h-10 border-2 ${errors.lastName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} focus:border-primary bg-white dark:bg-slate-900`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value as "MALE" | "FEMALE" | "OTHER")}
                    >
                      <SelectTrigger id="gender" className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Admission Date</Label>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(studentData.admissionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {currentAge > 0 && (
                    <div className="space-y-2">
                      <Label>Estimated Age</Label>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {currentAge} years old
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-primary" />
                    Guardian Information
                  </CardTitle>
                  <CardDescription>
                    Primary guardian or parent details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">Guardian Relationship *</Label>
                    <Input 
                      id="guardianRelation"
                      value={formData.guardianRelation}
                      onChange={(e) => updateFormData('guardianRelation', e.target.value)}
                      placeholder="e.g., Mother, Father, Uncle, Aunt"
                      className={`h-10 border-2 ${errors.guardianRelation ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} focus:border-primary bg-white dark:bg-slate-900`}
                    />
                    {errors.guardianRelation && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.guardianRelation}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                    <Input 
                      id="guardianPhone"
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => updateFormData('guardianPhone', e.target.value)}
                      placeholder="+256 700 123 456"
                      className={`h-10 border-2 ${errors.guardianPhone ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} focus:border-primary bg-white dark:bg-slate-900`}
                    />
                    {errors.guardianPhone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.guardianPhone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Photo & Enrollment */}
            <div className="space-y-6">
              {/* Student Photo */}
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="h-5 w-5 text-primary" />
                    Student Photo
                  </CardTitle>
                  <CardDescription>
                    Upload or update student photograph
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Photo Preview */}
                  <div className="flex justify-center">
                    {photoPreview ? (
                      <div className="relative group">
                        <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <img
                            src={photoPreview}
                            alt="Student photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Overlay buttons on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleReplacePhoto}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Replace
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemovePhoto}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p className="text-sm text-center">No photo</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    
                    {photoFile && (
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs">
                      New photo selected: {photoFile.name}
                    </div>
                    )}

                    {removePhoto && (
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                        Photo will be removed when you save
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Accepted formats: JPG, PNG, GIF<br />
                    Max size: 5MB
                  </p>
                </CardContent>
              </Card>

              {/* Current Enrollment Info */}
              {currentClass && (
                <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Current Enrollment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Class:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{currentClass.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Level:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{currentClass.level}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      * To change class, use the promotion feature
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Enrollment History */}
              {studentData.enrollments && studentData.enrollments.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-5 w-5 text-primary" />
                      Enrollment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {studentData.enrollments.map((enrollment) => (
                        <div 
                          key={enrollment.id}
                          className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                            enrollment.isCurrent ? 'bg-primary/10 border border-primary/20' : 'bg-slate-50 dark:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-slate-700 dark:text-slate-300">{enrollment.class.name}</span>
                          {enrollment.isCurrent && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-800 dark:text-amber-300">Pending Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(formData.firstName !== studentData.firstName || formData.lastName !== studentData.lastName) && (
                    <div>
                      <span className="text-amber-700 font-medium">Full Name:</span>
                      <div className="mt-1">
                        <div className="line-through text-muted-foreground">{studentData.firstName} {studentData.lastName}</div>
                        <div className="font-medium text-amber-800">{formData.firstName} {formData.lastName}</div>
                      </div>
                    </div>
                  )}
                  {formData.gender !== studentData.gender && (
                    <div>
                      <span className="text-amber-700 font-medium">Gender:</span>
                      <div className="mt-1">
                        <div className="line-through text-muted-foreground">{studentData.gender}</div>
                        <div className="font-medium text-amber-800">{formData.gender}</div>
                      </div>
                    </div>
                  )}
                  {formData.guardianRelation !== studentData.guardianRelation && (
                    <div>
                      <span className="text-amber-700 font-medium">Guardian Relationship:</span>
                      <div className="mt-1">
                        <div className="line-through text-muted-foreground">{studentData.guardianRelation}</div>
                        <div className="font-medium text-amber-800">{formData.guardianRelation}</div>
                      </div>
                    </div>
                  )}
                  {formData.guardianPhone !== studentData.guardianPhone && (
                    <div>
                      <span className="text-amber-700 font-medium">Guardian Phone:</span>
                      <div className="mt-1">
                        <div className="line-through text-muted-foreground">{studentData.guardianPhone}</div>
                        <div className="font-medium text-amber-800">{formData.guardianPhone}</div>
                      </div>
                    </div>
                  )}
                  {hasPhotoChanges && (
                    <div>
                      <span className="text-amber-700 font-medium">Photo:</span>
                      <div className="mt-1">
                        <div className="font-medium text-amber-800">
                          {photoFile ? 'New photo will be uploaded' : removePhoto ? 'Photo will be removed' : 'Photo updated'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={loading.saving || !hasChanges}
              className="min-w-32 h-10"
            >
              {loading.saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading.saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Link href="/students">
              <Button type="button" variant="outline" className="h-10" disabled={loading.saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default function EditStudentPage() {
  return (
    <ProtectedRoute requiredPermissions={["students.edit"]}>
      <EditStudentContent />
    </ProtectedRoute>
  )
}
