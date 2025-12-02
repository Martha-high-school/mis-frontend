"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Save, Download, Edit, Trash2 } from "lucide-react"

interface CustomReportsProps {
  userRole: string
}

// Mock saved reports
const savedReports = [
  {
    id: "RPT001",
    name: "Monthly Academic Performance",
    description: "Comprehensive academic performance report for all classes",
    type: "Academic",
    schedule: "Monthly",
    lastRun: "2024-01-15",
    status: "Active",
  },
  {
    id: "RPT002",
    name: "Fee Collection Summary",
    description: "Financial summary of fee collection by class and category",
    type: "Financial",
    schedule: "Weekly",
    lastRun: "2024-01-20",
    status: "Active",
  },
  {
    id: "RPT003",
    name: "Student Attendance Analysis",
    description: "Detailed attendance analysis with at-risk student identification",
    type: "Student",
    schedule: "Daily",
    lastRun: "2024-01-21",
    status: "Active",
  },
]

export function CustomReports({ userRole }: CustomReportsProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [reportForm, setReportForm] = useState({
    name: "",
    description: "",
    type: "",
    dataSource: "",
    filters: "",
    schedule: "",
  })

  const [selectedFields, setSelectedFields] = useState<string[]>([])

  const availableFields = [
    { id: "student_id", label: "Student ID", category: "Student" },
    { id: "student_name", label: "Student Name", category: "Student" },
    { id: "class", label: "Class", category: "Student" },
    { id: "average_score", label: "Average Score", category: "Academic" },
    { id: "attendance_rate", label: "Attendance Rate", category: "Academic" },
    { id: "fee_status", label: "Fee Status", category: "Financial" },
    { id: "amount_paid", label: "Amount Paid", category: "Financial" },
    { id: "competency_level", label: "Competency Level", category: "Academic" },
  ]

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const handleCreateReport = () => {
    // In a real app, this would create the custom report
    alert("Custom report created successfully!")
    setIsCreating(false)
    setReportForm({ name: "", description: "", type: "", dataSource: "", filters: "", schedule: "" })
    setSelectedFields([])
  }

  const runReport = (reportId: string) => {
    alert(`Running report ${reportId}...`)
  }

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom Report Builder</h3>
          <p className="text-sm text-muted-foreground">Create and manage custom reports tailored to your needs</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Create Report Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  placeholder="Enter report name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select
                  value={reportForm.type}
                  onValueChange={(value) => setReportForm({ ...reportForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                placeholder="Describe what this report will show"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Data Fields</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                      <span className="text-xs text-muted-foreground ml-1">({field.category})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select
                  value={reportForm.dataSource}
                  onValueChange={(value) => setReportForm({ ...reportForm, dataSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="assessments">Assessments</SelectItem>
                    <SelectItem value="financial">Financial Records</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select
                  value={reportForm.schedule}
                  onValueChange={(value) => setReportForm({ ...reportForm, schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filters">Filters (Optional)</Label>
              <Textarea
                id="filters"
                value={reportForm.filters}
                onChange={(e) => setReportForm({ ...reportForm, filters: e.target.value })}
                placeholder="Enter any specific filters or conditions"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>
                <Save className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Custom Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>{report.schedule}</TableCell>
                  <TableCell>{new Date(report.lastRun).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => runReport(report.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Student Performance Summary",
                description: "Overview of student academic performance",
                type: "Academic",
              },
              {
                name: "Fee Collection Report",
                description: "Detailed fee collection analysis",
                type: "Financial",
              },
              {
                name: "Attendance Tracking",
                description: "Student attendance monitoring",
                type: "Student",
              },
              {
                name: "Teacher Performance",
                description: "Teacher effectiveness analysis",
                type: "Administrative",
              },
              {
                name: "Class Comparison",
                description: "Compare performance across classes",
                type: "Academic",
              },
              {
                name: "Financial Summary",
                description: "Complete financial overview",
                type: "Financial",
              },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {template.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
