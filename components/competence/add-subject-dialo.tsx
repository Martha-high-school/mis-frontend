"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Info } from "lucide-react"
import { toast } from "react-toastify"
import { classService } from "@/services/class.service"
import type { Competence } from "@/services/competency.service"

interface AddSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  year: number
  onAdded: () => void
}

export function AddSubjectDialog({
  open,
  onOpenChange,
  classId,
  year,
  onAdded
}: AddSubjectDialogProps) {

  
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [subjectName, setSubjectName] = useState<string>("")
  const [isCore, setIsCore] = useState(true)
  const [instructorName, setInstructorName] = useState<string>("")
  const [instructorInitials, setInstructorInitials] = useState("")
  const [competencies, setCompetencies] = useState<Competence[]>([
    { idx: 1, name: "", maxScore: 10 },
    { idx: 2, name: "", maxScore: 10 },
    { idx: 3, name: "", maxScore: 10 }
  ])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  // Generate initials from instructor name
  const generateInitials = (name: string): string => {
    if (!name.trim()) return ""
    
    const words = name.trim().split(/\s+/)
    const initials = words
      .map(word => word.charAt(0).toUpperCase())
      .join("")
    
    return initials
  }

  // Handle instructor name change and auto-generate initials
  const handleInstructorNameChange = (name: string) => {
    setInstructorName(name)
    setInstructorInitials(generateInitials(name))
  }

  const resetForm = () => {
    setSubjectName("")
    setIsCore(true)
    setInstructorName("")
    setInstructorInitials("")
    setCompetencies([
      { idx: 1, name: "", maxScore: 10 },
      { idx: 2, name: "", maxScore: 10 },
      { idx: 3, name: "", maxScore: 10 }
    ])
  }

  const handleAddCompetency = () => {
    const newIdx = competencies.length + 1
    setCompetencies([
      ...competencies,
      { idx: newIdx, name: "", maxScore: 10 }
    ])
  }

  const handleRemoveCompetency = (index: number) => {
    if (competencies.length <= 1) {
      toast.info("A subject must have at least one competency")
      return
    }

    const updated = competencies.filter((_, i) => i !== index)
    // Re-index remaining competencies
    const reindexed = updated.map((comp, i) => ({
      ...comp,
      idx: i + 1
    }))
    setCompetencies(reindexed)
  }

  const handleCompetencyChange = (index: number, field: keyof Competence, value: string | number) => {
    const updated = [...competencies]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setCompetencies(updated)
  }

  const validateForm = (): boolean => {
    if (!subjectName.trim()) {
      toast.error("Please enter a subject name")
      return false
    }

    if (!instructorName.trim()) {
      toast.error("Please enter instructor name")
      return false
    }

    if (!instructorInitials.trim()) {
      toast.error("Instructor initials could not be generated")
      return false
    }

    // Check if all competencies have names
    const emptyCompetencies = competencies.filter(c => !c.name.trim())
    if (emptyCompetencies.length > 0) {
      toast.error("All competencies must have a name")
      return false
    }

    // Check if all max scores are valid
    const invalidScores = competencies.filter(c => c.maxScore <= 0 || c.maxScore > 100)
    if (invalidScores.length > 0) {
      toast.error("All max scores must be between 1 and 100")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const payloadSubjects = [
        {
          subjectName: subjectName.trim(),
          isCore,
          instructorName: instructorName.trim(),
          instructorInitials: instructorInitials.trim(),
          competences: competencies.map(c => ({
            idx: c.idx,
            name: c.name.trim(),
            maxScore: Number(c.maxScore)
          }))
        }
      ]

      await classService.setupClassSubjects(classId, payloadSubjects)
      toast.success("Subject added successfully with competencies for all terms")

      onAdded()

      setTimeout(() => {
        onOpenChange(false)
      }, 400)

    } catch (error: any) {
      toast.error("Failed to add subject")
    } finally {
      setLoading(false)
    }
  }


  const totalMaxScore = competencies.reduce((sum, c) => sum + Number(c.maxScore), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Subject to Class</DialogTitle>
          <DialogDescription>
            Configure a new subject with competencies. Competencies will be applied to all three terms (T1, T2, T3).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subject Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Mathematics, English Literature, Physics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full name of the subject
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="is-core">Subject Type</Label>
                <p className="text-sm text-muted-foreground">
                  Is this a core subject or elective?
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isCore ? "default" : "secondary"}>
                  {isCore ? "Core" : "Elective"}
                </Badge>
                <Switch
                  id="is-core"
                  checked={isCore}
                  onCheckedChange={setIsCore}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor-name">Instructor Name *</Label>
              <Input
                id="instructor-name"
                placeholder="e.g., Mutebi Mark, John Doe"
                value={instructorName}
                onChange={(e) => handleInstructorNameChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full name of the teacher (initials will be generated automatically)
              </p>
            </div>

            {instructorInitials && (
              <div className="space-y-2">
                <Label htmlFor="instructor-initials">Generated Initials</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="instructor-initials"
                    value={instructorInitials}
                    onChange={(e) => setInstructorInitials(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-32"
                  />
                  <Badge variant="outline">{instructorInitials}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can edit the initials if needed
                </p>
              </div>
            )}
          </div>

          {/* Competencies */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Competencies</CardTitle>
                  <CardDescription>
                    Define the competencies that will be assessed for this subject
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Total: {totalMaxScore} marks
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {competencies.map((competency, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {competency.idx}.
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Competency name (e.g., 'Linear Algebra', 'Essay Writing')"
                      value={competency.name}
                      onChange={(e) => handleCompetencyChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-shrink-0 w-24">
                    <Input
                      type="number"
                      placeholder="Score"
                      min="1"
                      max="100"
                      value={competency.maxScore}
                      onChange={(e) => handleCompetencyChange(index, "maxScore", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCompetency(index)}
                    disabled={competencies.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCompetency}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Competency
              </Button>

              <div className="flex items-start gap-3 p-3 rounded-md border border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-700 mt-0.5" />
                <p className="text-sm text-blue-800">
                  These competencies will be automatically applied to all three terms (T1, T2, T3).  
                  You can customize them for each term later by editing.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !subjectName.trim() || !instructorName.trim()}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}