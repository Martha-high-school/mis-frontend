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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  User, 
  GraduationCap, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Types
interface TeacherData {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  subjects: string[]
  classes: string[]
  employmentDate: string
  status: string
  qualification: string
  firstName: string
  lastName: string
  gender: string
  address: string
  primarySubject: string
  secondarySubject: string
  experience: number
  specialization: string
}

interface EditFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  address: string
  primarySubject: string
  secondarySubject: string
  qualification: string
  experience: number
  employmentDate: string
  specialization: string
}

// Mock data
const mockTeachers: TeacherData[] = [
  {
    id: "TCH001",
    name: "Peter Ssemakula",
    initials: "PS",
    email: "p.ssemakula@marthahigh.edu.ug",
    phone: "+256 700 111 222",
    subjects: ["Mathematics", "Physics"],
    classes: ["S.4 East", "S.5 North"],
    employmentDate: "2020-01-15",
    status: "Active",
    qualification: "bachelor_science",
    firstName: "Peter",
    lastName: "Ssemakula",
    gender: "male",
    address: "Kampala, Uganda",
    primarySubject: "mathematics",
    secondarySubject: "physics",
    experience: 8,
    specialization: "Advanced Mathematics and Physics instruction with focus on problem-solving techniques"
  },
  {
    id: "TCH002",
    name: "Mary Nakato",
    initials: "MN",
    email: "m.nakato@marthahigh.edu.ug",
    phone: "+256 700 333 444",
    subjects: ["English", "Literature"],
    classes: ["S.2 West", "S.3 South"],
    employmentDate: "2019-08-20",
    status: "Active",
    qualification: "bachelor_arts",
    firstName: "Mary",
    lastName: "Nakato",
    gender: "female",
    address: "Entebbe, Uganda",
    primarySubject: "english",
    secondarySubject: "literature",
    experience: 6,
    specialization: "English Language and Literature with emphasis on creative writing"
  },
  {
    id: "TCH003",
    name: "James Okwir",
    initials: "JO",
    email: "j.okwir@marthahigh.edu.ug",
    phone: "+256 700 555 666",
    subjects: ["Chemistry", "Biology"],
    classes: ["S.5 East", "S.6 West"],
    employmentDate: "2021-03-10",
    status: "Active",
    qualification: "bachelor_science",
    firstName: "James",
    lastName: "Okwir",
    gender: "male",
    address: "Jinja, Uganda",
    primarySubject: "chemistry",
    secondarySubject: "biology",
    experience: 4,
    specialization: "Laboratory sciences with practical application focus"
  }
]

// Subject data
const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English Language" },
  { value: "literature", label: "English Literature" },
  { value: "science", label: "General Science" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "socialstudies", label: "Social Studies" },
  { value: "agriculture", label: "Agriculture" },
  { value: "art", label: "Art & Design" },
  { value: "music", label: "Music" },
  { value: "pe", label: "Physical Education" },
  { value: "religious", label: "Religious Education" },
  { value: "computer", label: "Computer Science" },
  { value: "languages", label: "Foreign Languages" },
]

const qualifications = [
  { value: "certificate_education", label: "Certificate in Education" },
  { value: "diploma_education", label: "Diploma in Education" },
  { value: "bachelor_education", label: "Bachelor of Education" },
  { value: "bachelor_arts", label: "Bachelor of Arts" },
  { value: "bachelor_science", label: "Bachelor of Science" },
  { value: "master_education", label: "Master of Education" },
  { value: "master_arts", label: "Master of Arts" },
  { value: "master_science", label: "Master of Science" },
  { value: "phd_education", label: "PhD in Education" },
  { value: "other", label: "Other" }
]

// Mock API functions
const fetchTeacherData = async (teacherId: string): Promise<TeacherData | null> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return mockTeachers.find(teacher => teacher.id === teacherId) || null
}

const updateTeacherData = async (teacherId: string, data: EditFormData): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return { success: true }
}

function EditTeacherContent() {
  const { user } = useAuth()
  const params = useParams()
  const teacherId = params?.id as string

  const [loading, setLoading] = useState({
    fetching: false,
    saving: false
  })
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    primarySubject: "",
    secondarySubject: "",
    qualification: "",
    experience: 0,
    employmentDate: "",
    specialization: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)
  const [generatedInitials, setGeneratedInitials] = useState("")

  // Auto-generate initials when names change
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const initials = (formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase()
      setGeneratedInitials(initials)
    } else {
      setGeneratedInitials("")
    }
  }, [formData.firstName, formData.lastName])

  // Load teacher data
  useEffect(() => {
    if (!teacherId) return

    const loadTeacherData = async () => {
      setLoading(prev => ({ ...prev, fetching: true }))
      try {
        const data = await fetchTeacherData(teacherId)
        if (data) {
          setTeacherData(data)
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            address: data.address,
            primarySubject: data.primarySubject,
            secondarySubject: data.secondarySubject,
            qualification: data.qualification,
            experience: data.experience,
            employmentDate: data.employmentDate,
            specialization: data.specialization
          })
        }
      } catch (error) {
        console.error('Error loading teacher data:', error)
        setSaveStatus('error')
      } finally {
        setLoading(prev => ({ ...prev, fetching: false }))
      }
    }

    loadTeacherData()
  }, [teacherId])

  // Track changes
  useEffect(() => {
    if (!teacherData) return
    
    const hasChanged = 
      formData.firstName !== teacherData.firstName ||
      formData.lastName !== teacherData.lastName ||
      formData.email !== teacherData.email ||
      formData.phone !== teacherData.phone ||
      formData.gender !== teacherData.gender ||
      formData.address !== teacherData.address ||
      formData.primarySubject !== teacherData.primarySubject ||
      formData.secondarySubject !== teacherData.secondarySubject ||
      formData.qualification !== teacherData.qualification ||
      formData.experience !== teacherData.experience ||
      formData.employmentDate !== teacherData.employmentDate ||
      formData.specialization !== teacherData.specialization
    
    setHasChanges(hasChanged)
  }, [formData, teacherData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email address is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.primarySubject) newErrors.primarySubject = "Primary subject is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Experience validation
    if (formData.experience < 0) {
      newErrors.experience = "Experience cannot be negative"
    }

    // Employment date validation
    if (formData.employmentDate) {
      const selectedDate = new Date(formData.employmentDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.employmentDate = "Employment date cannot be in the future"
      }
    }

    // Subject conflict validation
    if (formData.primarySubject && formData.secondarySubject && 
        formData.primarySubject === formData.secondarySubject) {
      newErrors.secondarySubject = "Secondary subject must be different from primary subject"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateFormData = (field: keyof EditFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !teacherData) return

    setLoading(prev => ({ ...prev, saving: true }))
    setSaveStatus('saving')

    try {
      await updateTeacherData(teacherId, formData)
      
      // Update local state
      setTeacherData(prev => prev ? {
        ...prev,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        initials: generatedInitials
      } : null)
      
      setSaveStatus('success')
      setHasChanges(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error("Error updating teacher:", error)
      setSaveStatus('error')
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Teachers", href: "/teachers" },
    { label: teacherData?.name || "Edit Teacher" },
  ]

  const selectedPrimarySubject = subjects.find(s => s.value === formData.primarySubject)
  const selectedSecondarySubject = subjects.find(s => s.value === formData.secondarySubject)
  const selectedQualification = qualifications.find(q => q.value === formData.qualification)

  if (loading.fetching) {
    return (
      <MainLayout
        userRole={user.role}
        userName={user.name}
        breadcrumbs={breadcrumbs}
        showBackButton={true}
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!teacherData) {
    return (
      <MainLayout
        userRole={user.role}
        userName={user.name}
        breadcrumbs={breadcrumbs}
        showBackButton={true}
      >
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Teacher not found. Please check the teacher ID and try again.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      userRole={user.role}
      userName={user.name}
      breadcrumbs={breadcrumbs}
      showBackButton={true}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Teacher</h1>
              <p className="text-muted-foreground">
                Update teacher information and credentials
              </p>
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Teacher updated successfully! Changes have been saved to the system.
              </AlertDescription>
            </Alert>
          )}
          
          {saveStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to update teacher. Please check your information and try again.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update the teacher's personal details
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
                        className={errors.firstName ? 'border-red-300' : ''}
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
                        className={errors.lastName ? 'border-red-300' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current vs New Initials */}
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current Initials:</span>
                        <Badge variant="outline" className="font-mono">
                          {teacherData.initials}
                        </Badge>
                      </div>
                      {generatedInitials && generatedInitials !== teacherData.initials && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">New Initials:</span>
                          <Badge variant="default" className="font-mono">
                            {generatedInitials}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email Address *
                    </Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={errors.email ? 'border-red-300' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone Number
                      </Label>
                      <Input 
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className={errors.phone ? 'border-red-300' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => updateFormData('gender', value)}
                      >
                        <SelectTrigger className={errors.gender ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.gender}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </Label>
                    <Textarea 
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Current Teacher Info Display */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-3 text-blue-800">Current Teacher Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Teacher ID:</span>
                        <div className="font-mono">{teacherData.id}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Status:</span>
                        <Badge variant="default">{teacherData.status}</Badge>
                      </div>
                      <div>
                        <span className="text-blue-700">Assigned Classes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacherData.classes.map(cls => (
                            <Badge key={cls} variant="outline" className="text-xs">
                              {cls}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700">Teaching Subjects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacherData.subjects.map(subject => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Professional Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                  <CardDescription>
                    Update academic and teaching credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primarySubject" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Primary Subject *
                    </Label>
                    <Select 
                      value={formData.primarySubject} 
                      onValueChange={(value) => updateFormData('primarySubject', value)}
                    >
                      <SelectTrigger className={errors.primarySubject ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select primary subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.primarySubject && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.primarySubject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondarySubject">Secondary Subject</Label>
                    <Select 
                      value={formData.secondarySubject} 
                      onValueChange={(value) => updateFormData('secondarySubject', value)}
                    >
                      <SelectTrigger className={errors.secondarySubject ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select secondary subject (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects
                          .filter(s => s.value !== formData.primarySubject)
                          .map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.secondarySubject && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.secondarySubject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Highest Qualification
                    </Label>
                    <Select 
                      value={formData.qualification} 
                      onValueChange={(value) => updateFormData('qualification', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualifications.map((qual) => (
                          <SelectItem key={qual.value} value={qual.value}>
                            {qual.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input 
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={(e) => updateFormData('experience', Number(e.target.value))}
                        className={errors.experience ? 'border-red-300' : ''}
                      />
                      {errors.experience && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.experience}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentDate" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Employment Date
                      </Label>
                      <Input 
                        id="employmentDate"
                        type="date"
                        value={formData.employmentDate}
                        onChange={(e) => updateFormData('employmentDate', e.target.value)}
                        className={errors.employmentDate ? 'border-red-300' : ''}
                      />
                      {errors.employmentDate && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.employmentDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Additional Notes</Label>
                    <Textarea 
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => updateFormData('specialization', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg text-amber-800">Pending Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(formData.firstName !== teacherData.firstName || formData.lastName !== teacherData.lastName) && (
                    <div>
                      <span className="text-amber-700">Full Name:</span>
                      <div className="text-right">
                        <div className="line-through text-muted-foreground">{teacherData.firstName} {teacherData.lastName}</div>
                        <div className="font-medium text-amber-800">{formData.firstName} {formData.lastName}</div>
                      </div>
                    </div>
                  )}
                  {formData.email !== teacherData.email && (
                    <div>
                      <span className="text-amber-700">Email:</span>
                      <div className="text-right">
                        <div className="line-through text-muted-foreground">{teacherData.email}</div>
                        <div className="font-medium text-amber-800">{formData.email}</div>
                      </div>
                    </div>
                  )}
                  {selectedPrimarySubject && formData.primarySubject !== teacherData.primarySubject && (
                    <div>
                      <span className="text-amber-700">Primary Subject:</span>
                      <div className="text-right">
                        <div className="line-through text-muted-foreground">
                          {subjects.find(s => s.value === teacherData.primarySubject)?.label}
                        </div>
                        <div className="font-medium text-amber-800">{selectedPrimarySubject.label}</div>
                      </div>
                    </div>
                  )}
                  {selectedSecondarySubject && formData.secondarySubject !== teacherData.secondarySubject && (
                    <div>
                      <span className="text-amber-700">Secondary Subject:</span>
                      <div className="text-right">
                        <div className="line-through text-muted-foreground">
                          {subjects.find(s => s.value === teacherData.secondarySubject)?.label}
                        </div>
                        <div className="font-medium text-amber-800">{selectedSecondarySubject.label}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher Summary */}
          {(formData.firstName || formData.lastName || formData.primarySubject) && (
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg">Teacher Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {formData.firstName && formData.lastName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                  )}
                  {generatedInitials && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initials:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {generatedInitials}
                      </Badge>
                    </div>
                  )}
                  {selectedPrimarySubject && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Subject:</span>
                      <span className="font-medium">{selectedPrimarySubject.label}</span>
                    </div>
                  )}
                  {selectedSecondarySubject && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Secondary Subject:</span>
                      <span className="font-medium">{selectedSecondarySubject.label}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={loading.saving || !hasChanges}
              className="min-w-32"
            >
              {loading.saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading.saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Link href="/teachers">
              <Button type="button" variant="outline" disabled={loading.saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default function EditTeacherPage() {
  return (
    <ProtectedRoute requiredPermissions={["users.edit"]}>
      <EditTeacherContent />
    </ProtectedRoute>
  )
}
