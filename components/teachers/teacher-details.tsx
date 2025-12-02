"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, GraduationCap, BookOpen, Users } from "lucide-react"

interface TeacherDetailsProps {
  teacher: {
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
  }
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-800 font-bold text-lg">{teacher.initials}</span>
              </div>
              <div>
                <h3 className="font-semibold">{teacher.name}</h3>
                <p className="text-sm text-muted-foreground">Teacher ID: {teacher.id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Employed: {new Date(teacher.employmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{teacher.qualification}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teaching Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Subjects ({teacher.subjects.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Classes ({teacher.classes.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.classes.map((cls) => (
                  <Badge key={cls} variant="outline">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Status: </span>
              <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
