"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Save, Download } from "lucide-react"

interface MarksEntryProps {
  userRole: string
}

// Mock student data for marks entry
const mockStudents = [
  { id: "STU001", name: "John Mukasa", currentMark: 85, competencyLevel: "Proficient" },
  { id: "STU002", name: "Sarah Namukasa", currentMark: 78, competencyLevel: "Developing" },
  { id: "STU003", name: "David Okello", currentMark: 92, competencyLevel: "Advanced" },
  { id: "STU004", name: "Grace Atim", currentMark: 88, competencyLevel: "Proficient" },
  { id: "STU005", name: "Peter Ssali", currentMark: 65, competencyLevel: "Beginning" },
]

export function MarksEntry({ userRole }: MarksEntryProps) {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCompetency, setSelectedCompetency] = useState("")
  const [students, setStudents] = useState(mockStudents)

  const classes = ["S.1 East", "S.2 West", "S.3 North", "S.4 South", "S.5 East", "S.6 West"]
  const subjects = ["Mathematics", "English", "Science", "Social Studies", "ICT", "Agriculture"]
  const competencies = [
    "Communication Skills",
    "Critical Thinking",
    "Problem Solving",
    "Scientific Inquiry",
    "Creative Expression",
  ]

  const getCompetencyBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Advanced: "default",
      Proficient: "secondary",
      Developing: "secondary",
      Beginning: "destructive",
    }
    return <Badge variant={variants[level] || "default"}>{level}</Badge>
  }

  const updateStudentMark = (studentId: string, newMark: number) => {
    setStudents(
      students.map((student) => {
        if (student.id === studentId) {
          let competencyLevel = "Beginning"
          if (newMark >= 90) competencyLevel = "Advanced"
          else if (newMark >= 80) competencyLevel = "Proficient"
          else if (newMark >= 70) competencyLevel = "Developing"

          return { ...student, currentMark: newMark, competencyLevel }
        }
        return student
      }),
    )
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Competency</label>
              <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((competency) => (
                    <SelectItem key={competency} value={competency}>
                      {competency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import from Excel
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {selectedClass && selectedSubject && selectedCompetency && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Marks Entry - {selectedClass} | {selectedSubject} | {selectedCompetency}
            </CardTitle>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save All Marks
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Current Mark</TableHead>
                  <TableHead>New Mark</TableHead>
                  <TableHead>Competency Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.currentMark}%</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={student.currentMark}
                        className="w-20"
                        onChange={(e) => updateStudentMark(student.id, Number.parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>{getCompetencyBadge(student.competencyLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Competency Grading Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Grading Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Badge className="mb-2">Advanced</Badge>
              <p className="text-sm font-medium">90-100%</p>
              <p className="text-xs text-muted-foreground">Exceeds expectations</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Badge variant="secondary" className="mb-2">
                Proficient
              </Badge>
              <p className="text-sm font-medium">80-89%</p>
              <p className="text-xs text-muted-foreground">Meets expectations</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Badge variant="secondary" className="mb-2">
                Developing
              </Badge>
              <p className="text-sm font-medium">70-79%</p>
              <p className="text-xs text-muted-foreground">Approaching expectations</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <Badge variant="destructive" className="mb-2">
                Beginning
              </Badge>
              <p className="text-sm font-medium">Below 70%</p>
              <p className="text-xs text-muted-foreground">Below expectations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
