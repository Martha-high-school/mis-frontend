"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface ClassFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ClassForm({ initialData, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState({
    level: initialData?.level || "",
    stream: initialData?.stream || "",
    classTeacher: initialData?.classTeacher || "",
    classTeacherId: initialData?.classTeacherId || "",
    capacity: initialData?.capacity || 45,
    subjects: initialData?.subjects || [],
  })

  const levels = ["S.1", "S.2", "S.3", "S.4", "S.5", "S.6"]
  const streams = ["East", "West", "North", "South", "Central"]

  // Mock teachers data - in real app, this would come from API
  const availableTeachers = [
    { id: "TCH001", name: "Peter Ssemakula", initials: "PS" },
    { id: "TCH002", name: "Mary Nakato", initials: "MN" },
    { id: "TCH003", name: "James Okwir", initials: "JO" },
    { id: "TCH004", name: "Sarah Nambi", initials: "SN" },
    { id: "TCH005", name: "David Musoke", initials: "DM" },
  ]

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

  const handleTeacherChange = (teacherId: string) => {
    const teacher = availableTeachers.find((t) => t.id === teacherId)
    setFormData({
      ...formData,
      classTeacherId: teacherId,
      classTeacher: teacher?.name || "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream">Stream *</Label>
                <Select value={formData.stream} onValueChange={(value) => setFormData({ ...formData, stream: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map((stream) => (
                      <SelectItem key={stream} value={stream}>
                        {stream}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classTeacher">Class Teacher *</Label>
              <Select value={formData.classTeacherId} onValueChange={handleTeacherChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class teacher" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.initials})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Class Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="20"
                max="60"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subjects *</Label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
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
              <p className="text-xs text-muted-foreground">Select subjects that will be taught in this class</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Class" : "Create Class"}</Button>
      </div>
    </form>
  )
}
