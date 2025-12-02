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

// Types
interface TeacherFormData {
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
  initials: string
}

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
  "Certificate in Education",
  "Diploma in Education", 
  "Bachelor of Education",
  "Bachelor of Arts",
  "Bachelor of Science",
  "Master of Education",
  "Master of Arts", 
  "Master of Science",
  "PhD in Education",
  "Other"
]

function NewTeacherContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TeacherFormData>({
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
    specialization: "",
    initials: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Auto-generate initials when names change
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const initials = (formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase()
      setFormData(prev => ({ ...prev, initials }))
    } else {
      setFormData(prev => ({ ...prev, initials: "" }))
    }
  }, [formData.firstName, formData.lastName])

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

  const updateFormData = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setSaveStatus('saving')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Creating new teacher:", formData)
      setSaveStatus('success')
      
      // Reset form after successful creation
      setTimeout(() => {
        setSaveStatus('idle')
        // Could redirect to teachers list here
      }, 2000)
      
    } catch (error) {
      console.error("Error creating teacher:", error)
      setSaveStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Teachers", href: "/teachers" },
    { label: "Add Teacher" },
  ]

  const selectedPrimarySubject = subjects.find(s => s.value === formData.primarySubject)
  const selectedSecondarySubject = subjects.find(s => s.value === formData.secondarySubject)

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
              <h1 className="text-3xl font-bold">Add New Teacher</h1>
              <p className="text-muted-foreground">Register a new teacher in the school system</p>
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Teacher added successfully! {formData.firstName} {formData.lastName} is now registered in the system.
              </AlertDescription>
            </Alert>
          )}
          
          {saveStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to add teacher. Please check the information and try again.
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
                    Enter the teacher's personal details
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

                  {/* Auto-generated initials display */}
                  {formData.initials && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {formData.initials}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Auto-generated teacher initials
                        </span>
                      </div>
                    </div>
                  )}

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
                        placeholder="+256 700 000 000"
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
                    Academic and teaching credentials
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
                          <SelectItem key={qual} value={qual.toLowerCase().replace(/\s+/g, '_')}>
                            {qual}
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
                      rows={3}
                      placeholder="Special skills, certifications, or other relevant information"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
                  {formData.initials && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initials:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formData.initials}
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
              disabled={loading || saveStatus === 'saving'}
              className="min-w-32"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Adding...' : 'Add Teacher'}
            </Button>
            
            <Link href="/teachers">
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

export default function NewTeacherPage() {
  return (
    <ProtectedRoute allowedRoles={["director", "head_teacher"]}>
      <NewTeacherContent />
    </ProtectedRoute>
  )
}
