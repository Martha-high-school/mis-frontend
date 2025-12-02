"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"

interface CompetencyManagementProps {
  userRole: string
}

// Mock competency data
const mockCompetencies = [
  {
    id: "COMP001",
    name: "Communication Skills",
    description: "Ability to express ideas clearly in written and spoken form",
    subject: "English",
    gradeLevel: "S.1-S.6",
    assessmentCriteria: ["Clarity", "Grammar", "Vocabulary", "Coherence"],
    status: "Active",
  },
  {
    id: "COMP002",
    name: "Problem Solving",
    description: "Ability to analyze problems and develop effective solutions",
    subject: "Mathematics",
    gradeLevel: "S.1-S.6",
    assessmentCriteria: ["Analysis", "Strategy", "Implementation", "Verification"],
    status: "Active",
  },
  {
    id: "COMP003",
    name: "Scientific Inquiry",
    description: "Ability to conduct scientific investigations and draw conclusions",
    subject: "Science",
    gradeLevel: "S.1-S.6",
    assessmentCriteria: ["Hypothesis", "Methodology", "Data Collection", "Analysis"],
    status: "Active",
  },
]

export function CompetencyManagement({ userRole }: CompetencyManagementProps) {
  const [competencies, setCompetencies] = useState(mockCompetencies)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCompetency, setSelectedCompetency] = useState<(typeof mockCompetencies)[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    gradeLevel: "",
    assessmentCriteria: "",
  })

  const handleAddCompetency = () => {
    const newCompetency = {
      id: `COMP${String(competencies.length + 1).padStart(3, "0")}`,
      name: formData.name,
      description: formData.description,
      subject: formData.subject,
      gradeLevel: formData.gradeLevel,
      assessmentCriteria: formData.assessmentCriteria.split(",").map((c) => c.trim()),
      status: "Active",
    }
    setCompetencies([...competencies, newCompetency])
    setFormData({ name: "", description: "", subject: "", gradeLevel: "", assessmentCriteria: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditCompetency = () => {
    if (!selectedCompetency) return
    setCompetencies(
      competencies.map((comp) =>
        comp.id === selectedCompetency.id
          ? {
              ...comp,
              name: formData.name,
              description: formData.description,
              subject: formData.subject,
              gradeLevel: formData.gradeLevel,
              assessmentCriteria: formData.assessmentCriteria.split(",").map((c) => c.trim()),
            }
          : comp,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedCompetency(null)
  }

  const openEditDialog = (competency: (typeof mockCompetencies)[0]) => {
    setSelectedCompetency(competency)
    setFormData({
      name: competency.name,
      description: competency.description,
      subject: competency.subject,
      gradeLevel: competency.gradeLevel,
      assessmentCriteria: competency.assessmentCriteria.join(", "),
    })
    setIsEditDialogOpen(true)
  }

  const CompetencyForm = ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Competency Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter competency name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the competency"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Subject area"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Grade Level</label>
          <Input
            value={formData.gradeLevel}
            onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
            placeholder="e.g., S.1-S.6"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assessment Criteria</label>
        <Input
          value={formData.assessmentCriteria}
          onChange={(e) => setFormData({ ...formData, assessmentCriteria: e.target.value })}
          placeholder="Enter criteria separated by commas"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{selectedCompetency ? "Update Competency" : "Add Competency"}</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Competency Framework</h3>
          <p className="text-sm text-muted-foreground">Manage competencies aligned with Uganda's New Curriculum</p>
        </div>
        {(userRole === "director" || userRole === "head_teacher") && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Competency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Competency</DialogTitle>
                <DialogDescription>Create a new competency for assessment and tracking.</DialogDescription>
              </DialogHeader>
              <CompetencyForm onSubmit={handleAddCompetency} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Competencies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Competencies ({competencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competency ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Criteria Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competencies.map((competency) => (
                <TableRow key={competency.id}>
                  <TableCell className="font-medium">{competency.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{competency.name}</p>
                      <p className="text-xs text-muted-foreground">{competency.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{competency.subject}</TableCell>
                  <TableCell>{competency.gradeLevel}</TableCell>
                  <TableCell>{competency.assessmentCriteria.length}</TableCell>
                  <TableCell>
                    <Badge variant="default">{competency.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(userRole === "director" || userRole === "head_teacher") && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(competency)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Competency</DialogTitle>
            <DialogDescription>Update the competency information.</DialogDescription>
          </DialogHeader>
          <CompetencyForm
            onSubmit={handleEditCompetency}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setSelectedCompetency(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
