"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, GripVertical, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { competencyService, type Competence, type CompetenceVersion } from "@/services/competency.service"

interface EditCompetenciesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  subjectId: string
  subjectName: string
  year: number
  term: "T1" | "T2" | "T3"
  onSaved?: () => void
}

export function EditCompetenciesDialog({
  open,
  onOpenChange,
  classId,
  subjectId,
  subjectName,
  year,
  term,
  onSaved
}: EditCompetenciesDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [competencies, setCompetencies] = useState<Competence[]>([])
  const [errors, setErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    if (open) {
      loadCompetencies()
    }
  }, [open, classId, subjectId, year, term])

  const loadCompetencies = async () => {
    try {
      setLoading(true)
      const data = await competencyService.getCompetenciesByTerm(
        classId,
        subjectId,
        year,
        term
      )
      
      // Convert CompetenceVersion to Competence format
      const formattedCompetencies: Competence[] = data.map(c => ({
        id: c.id,
        idx: c.idx,
        name: c.name,
        maxScore: c.maxScore
      }))
      
      setCompetencies(formattedCompetencies.length > 0 ? formattedCompetencies : [
        { idx: 1, name: "", maxScore: 5 }
      ])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load competencies",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addCompetence = () => {
    const nextIdx = competencies.length > 0
      ? Math.max(...competencies.map(c => c.idx)) + 1
      : 1
    
    setCompetencies([
      ...competencies,
      { idx: nextIdx, name: "", maxScore: 5 }
    ])
  }

  const removeCompetence = (idx: number) => {
    setCompetencies(competencies.filter(c => c.idx !== idx))
    // Clear any errors for this competence
    const newErrors = { ...errors }
    delete newErrors[idx]
    setErrors(newErrors)
  }

  const updateCompetence = (idx: number, field: keyof Competence, value: any) => {
    setCompetencies(
      competencies.map(c =>
        c.idx === idx ? { ...c, [field]: value } : c
      )
    )
    
    // Clear error for this field when user starts typing
    if (field === "name" && errors[idx]) {
      const newErrors = { ...errors }
      delete newErrors[idx]
      setErrors(newErrors)
    }
  }

  const validateCompetencies = (): boolean => {
    const newErrors: Record<number, string> = {}
    let isValid = true

    competencies.forEach(comp => {
      if (!comp.name.trim()) {
        newErrors[comp.idx] = "Competence name is required"
        isValid = false
      }
      if (comp.maxScore <= 0) {
        newErrors[comp.idx] = "Max score must be greater than 0"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateCompetencies()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      await competencyService.saveCompetenciesByTerm(
        classId,
        subjectId,
        {
          year,
          term,
          competencies: competencies.map((c, index) => ({
            idx: index + 1, // Reindex to ensure sequential ordering
            name: c.name.trim(),
            maxScore: Number(c.maxScore)
          }))
        }
      )

      toast({
        title: "Success",
        description: `Competencies for ${subjectName} (${term}) saved successfully`,
      })

      onSaved?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save competencies",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getTermName = (t: string) => {
    const termMap: Record<string, string> = {
      T1: "First Term",
      T2: "Second Term",
      T3: "Third Term"
    }
    return termMap[t] || t
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Competencies
            <Badge variant="secondary">{subjectName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Configure competencies for {getTermName(term)} {year}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Competencies are term-specific. Changes here will only affect {getTermName(term)}. 
                If this is the first time editing for this term, competencies from the last edited term will be auto-loaded.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Competencies</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetence}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competence
                </Button>
              </div>

              {competencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No competencies yet. Click "Add Competence" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {competencies.map((comp, index) => (
                    <div
                      key={comp.idx}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                    >
                      <div className="flex-shrink-0 mt-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex-shrink-0 mt-2">
                        <Badge variant="outline" className="w-12 justify-center">
                          C{index + 1}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div>
                          <Label htmlFor={`name-${comp.idx}`}>
                            Competence Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`name-${comp.idx}`}
                            value={comp.name}
                            onChange={(e) => updateCompetence(comp.idx, "name", e.target.value)}
                            placeholder="e.g., Problem Solving"
                            className={errors[comp.idx] ? "border-red-500" : ""}
                          />
                          {errors[comp.idx] && (
                            <p className="text-xs text-red-500 mt-1">{errors[comp.idx]}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`maxScore-${comp.idx}`}>Max Score</Label>
                            <Input
                              id={`maxScore-${comp.idx}`}
                              type="number"
                              min="1"
                              max="20"
                              value={comp.maxScore}
                              onChange={(e) => updateCompetence(comp.idx, "maxScore", parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="text-sm text-muted-foreground pt-6">
                            out of {comp.maxScore} marks
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetence(comp.idx)}
                        className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Total Competencies: <span className="font-semibold text-foreground">{competencies.length}</span></p>
                <p>
                  Total Max Score: <span className="font-semibold text-foreground">
                    {competencies.reduce((sum, c) => sum + (c.maxScore || 0), 0)}
                  </span>
                </p>
                <p className="text-xs mt-2 italic">
                  Note: Continuous Assessment = Sum of Competence Scores + Project Score (10)
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || saving || competencies.length === 0}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Competencies
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}