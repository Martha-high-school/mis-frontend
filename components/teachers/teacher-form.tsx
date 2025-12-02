"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface TeacherFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function TeacherForm({ initialData, onSubmit, onCancel }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    qualification: initialData?.qualification || "",
    subjects: initialData?.subjects || [],
    classes: initialData?.classes || [],
    employmentDate: initialData?.employmentDate || new Date().toISOString().split("T")[0],
  })

  const availableSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Literature",
    "History",
    "Geography",
    "Economics",
    "Entrepreneurship",
    "Computer Studies",
    "Fine Art",
    "Music",
    "Physical Education",
    "Religious Education",
  ]

  const availableClasses = [
    "S.1 East",
    "S.1 West",
    "S.1 North",
    "S.1 South",
    "S.2 East",
    "S.2 West",
    "S.2 North",
    "S.2 South",
    "S.3 East",
    "S.3 West",
    "S.3 North",
    "S.3 South",
    "S.4 East",
    "S.4 West",
    "S.4 North",
    "S.4 South",
    "S.5 East",
    "S.5 West",
    "S.5 North",
    "S.5 South",
    "S.6 East",
    "S.6 West",
    "S.6 North",
    "S.6 South",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, subjects: [...formData.subjects, subject] })
    } else {
      setFormData({ ...formData, subjects: formData.subjects.filter((s: string) => s !== subject) })
    }
  }

  const handleClassChange = (cls: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, classes: [...formData.classes, cls] })
    } else {
      setFormData({ ...formData, classes: formData.classes.filter((c: string) => c !== cls) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@marthahigh.edu.ug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+256 700 123 456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <Textarea
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., Bachelor of Science in Mathematics"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentDate">Employment Date *</Label>
              <Input
                id="employmentDate"
                type="date"
                value={formData.employmentDate}
                onChange={(e) => setFormData({ ...formData, employmentDate: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject and Class Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teaching Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subjects *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {availableSubjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={formData.subjects.includes(subject)}
                      onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                    />
                    <Label htmlFor={`subject-${subject}`} className="text-sm">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Classes</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {availableClasses.map((cls) => (
                  <div key={cls} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls}`}
                      checked={formData.classes.includes(cls)}
                      onCheckedChange={(checked) => handleClassChange(cls, checked as boolean)}
                    />
                    <Label htmlFor={`class-${cls}`} className="text-sm">
                      {cls}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Teacher" : "Add Teacher"}</Button>
      </div>
    </form>
  )
}
