"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Users, UserCheck, AlertTriangle } from "lucide-react"

interface StudentReportsProps {
  userRole: string
}

// Mock student data for reports
const studentSummary = [
  {
    id: "STU001",
    name: "John Mukasa",
    class: "S.4 East",
    average: 85,
    attendance: 95,
    feeStatus: "Paid",
    competencyLevel: "Proficient",
    rank: 3,
  },
  {
    id: "STU002",
    name: "Sarah Namukasa",
    class: "S.3 West",
    average: 78,
    attendance: 88,
    feeStatus: "Pending",
    competencyLevel: "Developing",
    rank: 12,
  },
  {
    id: "STU003",
    name: "David Okello",
    class: "S.6 North",
    average: 92,
    attendance: 98,
    feeStatus: "Paid",
    competencyLevel: "Advanced",
    rank: 1,
  },
  {
    id: "STU004",
    name: "Grace Atim",
    class: "S.2 South",
    average: 88,
    attendance: 92,
    feeStatus: "Partial",
    competencyLevel: "Proficient",
    rank: 5,
  },
]

const attendanceData = [
  { class: "S.1", present: 165, absent: 15, rate: 91.7 },
  { class: "S.2", present: 158, absent: 17, rate: 90.3 },
  { class: "S.3", present: 155, absent: 13, rate: 92.3 },
  { class: "S.4", present: 148, absent: 14, rate: 91.4 },
  { class: "S.5", present: 142, absent: 13, rate: 91.6 },
  { class: "S.6", present: 138, absent: 10, rate: 93.2 },
]

export function StudentReports({ userRole }: StudentReportsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredStudents = studentSummary.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class.includes(selectedClass.replace("s", "S."))
    const matchesStatus = selectedStatus === "all" || student.feeStatus.toLowerCase() === selectedStatus
    return matchesSearch && matchesClass && matchesStatus
  })

  const getCompetencyBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Advanced: "default",
      Proficient: "secondary",
      Developing: "secondary",
      Beginning: "destructive",
    }
    return <Badge variant={variants[level] || "default"}>{level}</Badge>
  }

  const getFeeStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Paid: "default",
      Pending: "destructive",
      Partial: "secondary",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const generateReport = (reportType: string) => {
    alert(`Generating ${reportType} report...`)
  }

  return (
    <div className="space-y-6">
      {/* Student Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+2.3% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.8%</div>
            <p className="text-xs text-green-600">+1.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Compliance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.5%</div>
            <p className="text-xs text-muted-foreground">1,092 students paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-red-600">Require intervention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Student Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Fee status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => generateReport("student-list")}>
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => generateReport("attendance")}>
              Attendance Report
            </Button>
            <Button variant="outline" onClick={() => generateReport("performance")}>
              Performance Report
            </Button>
            <Button variant="outline" onClick={() => generateReport("fee-status")}>
              Fee Status Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Summary ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <span className="font-medium">{student.average}%</span>
                  </TableCell>
                  <TableCell>
                    <span className={student.attendance >= 90 ? "text-green-600" : "text-red-600"}>
                      {student.attendance}%
                    </span>
                  </TableCell>
                  <TableCell>{getFeeStatusBadge(student.feeStatus)}</TableCell>
                  <TableCell>{getCompetencyBadge(student.competencyLevel)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">#{student.rank}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Analysis by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((cls) => (
                <TableRow key={cls.class}>
                  <TableCell className="font-medium">{cls.class}</TableCell>
                  <TableCell className="text-green-600">{cls.present}</TableCell>
                  <TableCell className="text-red-600">{cls.absent}</TableCell>
                  <TableCell>
                    <span className="font-medium">{cls.rate}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cls.rate >= 92 ? "default" : cls.rate >= 85 ? "secondary" : "destructive"}>
                      {cls.rate >= 92 ? "Excellent" : cls.rate >= 85 ? "Good" : "Poor"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: "90-100%", count: 156, percentage: 12.6, color: "bg-green-500" },
                { range: "80-89%", count: 370, percentage: 30.0, color: "bg-blue-500" },
                { range: "70-79%", count: 432, percentage: 35.0, color: "bg-yellow-500" },
                { range: "60-69%", count: 229, percentage: 18.6, color: "bg-orange-500" },
                { range: "Below 60%", count: 47, percentage: 3.8, color: "bg-red-500" },
              ].map((range) => (
                <div key={range.range} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${range.color}`} />
                  <span className="w-20 text-sm font-medium">{range.range}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${range.color}`} style={{ width: `${range.percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-16">{range.count} students</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "Fully Paid", count: 1092, percentage: 88.5, color: "bg-green-500" },
                { status: "Partially Paid", count: 89, percentage: 7.2, color: "bg-yellow-500" },
                { status: "Not Paid", count: 53, percentage: 4.3, color: "bg-red-500" },
              ].map((status) => (
                <div key={status.status} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${status.color}`} />
                  <span className="w-24 text-sm font-medium">{status.status}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${status.color}`} style={{ width: `${status.percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-16">{status.count} students</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
