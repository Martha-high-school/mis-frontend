"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, TrendingUp, Award } from "lucide-react"

interface AssessmentOverviewProps {
  userRole: string
}

// Mock data for assessments
const mockAssessments = [
  {
    id: "ASS001",
    subject: "Mathematics",
    class: "S.4 East",
    competency: "Problem Solving",
    studentsAssessed: 28,
    totalStudents: 30,
    averageScore: 85,
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: "ASS002",
    subject: "English",
    class: "S.3 West",
    competency: "Communication Skills",
    studentsAssessed: 25,
    totalStudents: 32,
    averageScore: 78,
    status: "In Progress",
    date: "2024-01-20",
  },
  {
    id: "ASS003",
    subject: "Science",
    class: "S.5 North",
    competency: "Scientific Inquiry",
    studentsAssessed: 24,
    totalStudents: 24,
    averageScore: 92,
    status: "Completed",
    date: "2024-01-18",
  },
]

export function AssessmentOverview({ userRole }: AssessmentOverviewProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Completed: "default",
      "In Progress": "secondary",
      Pending: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Assessed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+3% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencies Mastered</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Achievement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.id}</TableCell>
                  <TableCell>{assessment.subject}</TableCell>
                  <TableCell>{assessment.class}</TableCell>
                  <TableCell>{assessment.competency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(assessment.studentsAssessed / assessment.totalStudents) * 100}
                        className="w-16"
                      />
                      <span className="text-xs text-muted-foreground">
                        {assessment.studentsAssessed}/{assessment.totalStudents}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{assessment.averageScore}%</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Competency Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Achievement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Communication Skills", progress: 88, students: 245 },
              { name: "Critical Thinking", progress: 82, students: 198 },
              { name: "Problem Solving", progress: 90, students: 267 },
              { name: "Scientific Inquiry", progress: 85, students: 156 },
              { name: "Creative Expression", progress: 78, students: 189 },
            ].map((competency) => (
              <div key={competency.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{competency.name}</span>
                  <span className="text-muted-foreground">
                    {competency.progress}% ({competency.students} students)
                  </span>
                </div>
                <Progress value={competency.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
