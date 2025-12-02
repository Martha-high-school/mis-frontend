"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Users, Award } from "lucide-react"
import { useState } from "react"

interface PerformanceAnalyticsProps {
  userRole: string
}

// Mock performance data
const performanceData = [
  { month: "Jan", average: 78, students: 1200 },
  { month: "Feb", average: 82, students: 1210 },
  { month: "Mar", average: 85, students: 1234 },
  { month: "Apr", average: 83, students: 1245 },
  { month: "May", average: 87, students: 1250 },
]

const subjectPerformance = [
  { subject: "Mathematics", average: 85, improvement: 5 },
  { subject: "English", average: 78, improvement: -2 },
  { subject: "Science", average: 92, improvement: 8 },
  { subject: "Social Studies", average: 80, improvement: 3 },
  { subject: "ICT", average: 88, improvement: 6 },
]

const classPerformance = [
  { class: "S.1", average: 75, students: 180, topPerformers: 45 },
  { class: "S.2", average: 78, students: 175, topPerformers: 52 },
  { class: "S.3", average: 82, students: 168, topPerformers: 58 },
  { class: "S.4", average: 85, students: 162, topPerformers: 65 },
  { class: "S.5", average: 88, students: 155, topPerformers: 72 },
  { class: "S.6", average: 90, students: 148, topPerformers: 78 },
]

export function PerformanceAnalytics({ userRole }: PerformanceAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-term")
  const [selectedClass, setSelectedClass] = useState("all")

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-term">Current Term</SelectItem>
            <SelectItem value="last-term">Last Term</SelectItem>
            <SelectItem value="academic-year">Academic Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="s1">Senior 1</SelectItem>
            <SelectItem value="s2">Senior 2</SelectItem>
            <SelectItem value="s3">Senior 3</SelectItem>
            <SelectItem value="s4">Senior 4</SelectItem>
            <SelectItem value="s5">Senior 5</SelectItem>
            <SelectItem value="s6">Senior 6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-green-600">+3% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">370</div>
            <p className="text-xs text-muted-foreground">Students above 90%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-red-600">Students below 60%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competency Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-blue-600">Meeting standards</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classPerformance.map((cls) => (
              <div key={cls.class} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="font-medium w-12">{cls.class}</span>
                    <span className="text-sm text-muted-foreground">{cls.students} students</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{cls.topPerformers} top performers</Badge>
                    <span className="font-medium">{cls.average}%</span>
                  </div>
                </div>
                <Progress value={cls.average} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Improvement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{subject.subject}</p>
                  <p className="text-sm text-muted-foreground">Average: {subject.average}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {subject.improvement > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${subject.improvement > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {subject.improvement > 0 ? "+" : ""}
                    {subject.improvement}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
