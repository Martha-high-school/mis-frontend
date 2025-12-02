"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, User, Hash } from "lucide-react"

interface ClassDetailsProps {
  classData: {
    id: string
    name: string
    level: string
    stream: string
    classTeacher: string
    classTeacherId: string
    studentCount: number
    subjects: string[]
    capacity: number
    status: string
  }
}

export function ClassDetails({ classData }: ClassDetailsProps) {
  const capacityPercentage = (classData.studentCount / classData.capacity) * 100

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Class ID:</span>
                <span className="text-sm">{classData.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Class Name:</span>
                <span className="text-sm font-semibold">{classData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Class Teacher:</span>
                <span className="text-sm">{classData.classTeacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Enrollment:</span>
                <Badge
                  variant={
                    capacityPercentage >= 90 ? "destructive" : capacityPercentage >= 75 ? "secondary" : "outline"
                  }
                >
                  {classData.studentCount}/{classData.capacity} ({Math.round(capacityPercentage)}%)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={classData.status === "Active" ? "default" : "secondary"}>{classData.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjects ({classData.subjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {classData.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{classData.studentCount}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{classData.subjects.length}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{classData.capacity - classData.studentCount}</div>
              <div className="text-sm text-muted-foreground">Available Spots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(capacityPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Capacity Used</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
