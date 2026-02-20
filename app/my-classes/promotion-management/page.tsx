"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  promotionService,
  type StudentForPromotion,
  type AvailableClass,
  type AvailableYear,
  type PromotionDecision,
  type PromotionStats,
  type SubjectInfo,
  type NextLevelInfo
} from "@/services/promotion.service"
import { classService } from "@/services/class.service"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Loader2,
  ArrowUp,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  Users,
  TrendingUp,
  RefreshCw,
  Info,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"

interface LocalDecision {
  studentId: string
  action: 'PROMOTE' | 'REPEAT'
  toClassId: string | null
  remarks: string
}

interface OverrideDialogState {
  open: boolean
  studentId: string | null
  studentName: string
  currentStatus: string
  action: 'PROMOTE' | 'REPEAT'
  reason: string
}

export default function PromotionsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Available years for filtering
  const [availableYears, setAvailableYears] = useState<AvailableYear[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [nextAcademicYear, setNextAcademicYear] = useState<{ id: string; year: number } | null>(null)

  // Classes
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [currentClassName, setCurrentClassName] = useState<string>("")
  const [currentClassRank, setCurrentClassRank] = useState<string>("")

  // Next level info - now with proper structure
  const [nextLevelInfo, setNextLevelInfo] = useState<NextLevelInfo | null>(null)

  // Subject columns
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])

  // Student data
  const [students, setStudents] = useState<StudentForPromotion[]>([])
  const [decisions, setDecisions] = useState<Map<string, LocalDecision>>(new Map())

  // Available classes for promotion
  const [availableNextClasses, setAvailableNextClasses] = useState<AvailableClass[]>([])
  const [suggestedClassId, setSuggestedClassId] = useState<string | null>(null)
  const [suggestedClassName, setSuggestedClassName] = useState<string | null>(null)
  const [isGraduatingClass, setIsGraduatingClass] = useState(false)
  const [isOLevelToALevel, setIsOLevelToALevel] = useState(false)

  // Stats
  const [stats, setStats] = useState<PromotionStats>({
    totalStudents: 0,
    promoted: 0,
    repeated: 0,
    pending: 0,
    percentageComplete: 0
  })

  // Loading states
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>({
    open: false,
    studentId: null,
    studentName: '',
    currentStatus: '',
    action: 'PROMOTE',
    reason: ''
  })

  // ============================================================================
  // LOAD INITIAL DATA
  // ============================================================================

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedYear && selectedClassId) {
      loadPromotionData()
    }
  }, [selectedYear, selectedClassId])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Load available years
      const yearsData = await promotionService.getAvailableYears()
      setAvailableYears(yearsData.years)

      // Default to current year
      const currentYear = yearsData.years.find(y => y.isCurrent)
      if (currentYear) {
        setSelectedYear(currentYear.year)
      } else if (yearsData.years.length > 0) {
        setSelectedYear(yearsData.years[0].year)
      }

      // Load teacher's classes
      const { classes: myClasses } = await classService.getMyClasses()
      setClasses(myClasses)

      if (myClasses.length > 0) {
        setSelectedClassId(myClasses[0].id)
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to load initial data")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // LOAD PROMOTION DATA
  // ============================================================================

  const loadPromotionData = async () => {
    if (!selectedYear || !selectedClassId) return

    try {
      setLoading(true)

      // Get students with grades
      const data = await promotionService.getStudentsForPromotion(selectedClassId, selectedYear)

      setStudents(data.students)
      setSubjects(data.subjects || [])
      setCurrentClassName(data.className)
      setCurrentClassRank(data.classRank || data.classLevel || '')
      setNextAcademicYear(data.nextAcademicYear)
      
      // Store the full nextLevelInfo
      setNextLevelInfo(data.nextLevelInfo)
      setAvailableNextClasses(data.nextLevelInfo.availableClasses)
      setSuggestedClassId(data.nextLevelInfo.suggestedClassId)
      setSuggestedClassName(data.nextLevelInfo.suggestedClassName)
      setIsGraduatingClass(data.nextLevelInfo.isGraduatingClass)
      setIsOLevelToALevel(data.nextLevelInfo.isOLevelToALevel || false)

      // Initialize decisions based on pass/fail status
      const newDecisions = new Map<string, LocalDecision>()
      for (const student of data.students) {
        // If already processed, use existing decision
        if (student.isAlreadyProcessed) {
          newDecisions.set(student.id, {
            studentId: student.id,
            action: student.promotionStatus === 'PROMOTED' ? 'PROMOTE' : 'REPEAT',
            toClassId: student.promotedToClassId,
            remarks: student.promotionRemarks || ''
          })
        } else {
          // Generate default based on pass/fail
          newDecisions.set(student.id, {
            studentId: student.id,
            action: student.qualifiesForPromotion ? 'PROMOTE' : 'REPEAT',
            toClassId: student.qualifiesForPromotion 
              ? data.nextLevelInfo.suggestedClassId 
              : selectedClassId,
            remarks: ''
          })
        }
      }
      setDecisions(newDecisions)

      // Load stats
      const statsData = await promotionService.getPromotionStats(selectedClassId, selectedYear)
      setStats(statsData.stats)

    } catch (error: any) {
      toast.error(error.message || "Failed to load promotion data")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // DECISION HANDLERS
  // ============================================================================

  const handleDecisionChange = (studentId: string, action: 'PROMOTE' | 'REPEAT', toClassId?: string) => {
    const newDecisions = new Map(decisions)
    const existingDecision = newDecisions.get(studentId) || {
      studentId,
      action,
      toClassId: null,
      remarks: ''
    }

    newDecisions.set(studentId, {
      ...existingDecision,
      action,
      toClassId: action === 'PROMOTE' 
        ? (toClassId || suggestedClassId || null)
        : selectedClassId
    })

    setDecisions(newDecisions)
  }

  const handleToClassChange = (studentId: string, toClassId: string) => {
    const newDecisions = new Map(decisions)
    const existingDecision = newDecisions.get(studentId)
    if (existingDecision) {
      newDecisions.set(studentId, {
        ...existingDecision,
        toClassId
      })
      setDecisions(newDecisions)
    }
  }

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  const handlePromoteAllQualifying = () => {
    const newDecisions = new Map(decisions)
    for (const student of students) {
      if (!student.isAlreadyProcessed && student.qualifiesForPromotion) {
        newDecisions.set(student.id, {
          studentId: student.id,
          action: 'PROMOTE',
          toClassId: suggestedClassId,
          remarks: 'Bulk promote - qualifying'
        })
      }
    }
    setDecisions(newDecisions)
    toast.info("Set all qualifying students to promote")

  }

  const handleRepeatAllNonQualifying = () => {
    const newDecisions = new Map(decisions)
    for (const student of students) {
      if (!student.isAlreadyProcessed && !student.qualifiesForPromotion) {
        newDecisions.set(student.id, {
          studentId: student.id,
          action: 'REPEAT',
          toClassId: selectedClassId,
          remarks: 'Bulk repeat - non-qualifying'
        })
      }
    }
    setDecisions(newDecisions)
     toast.info("Set all non-qualifying students to repeat")
  }

  // ============================================================================
  // PROCESS PROMOTIONS
  // ============================================================================

  const handleProcessPromotions = async () => {
    if (!nextAcademicYear) {
      toast.error("Next academic year not available")
      return
    }

    // Validate all PROMOTE decisions have a target class
    const pendingDecisions = Array.from(decisions.values()).filter(
      d => !students.find(s => s.id === d.studentId)?.isAlreadyProcessed
    )

    for (const decision of pendingDecisions) {
      if (decision.action === 'PROMOTE' && !decision.toClassId) {
        toast.error("All promote decisions must have a target class selected")
        return
      }
    }

    try {
      setProcessing(true)

      const payload = {
        year: selectedYear!,
        newAcademicYearId: nextAcademicYear.id,
        decisions: pendingDecisions.map(d => ({
          studentId: d.studentId,
          action: d.action,
          toClassId: d.toClassId || undefined,
          remarks: d.remarks
        }))
      }

      const result = await promotionService.processPromotions(selectedClassId, payload)

      toast.success(`Processed ${result.summary.promoted} promotions and ${result.summary.repeated} repeats`)

      setShowConfirmDialog(false)
      await loadPromotionData()

    } catch (error: any) {
      toast.error(error.message || "Failed to process promotions")
    } finally {
      setProcessing(false)
    }
  }

  // ============================================================================
  // TEACHER OVERRIDE
  // ============================================================================

  const openOverrideDialog = (student: StudentForPromotion) => {
    const currentDecision = decisions.get(student.id)
    setOverrideDialog({
      open: true,
      studentId: student.id,
      studentName: student.fullName || `${student.firstName} ${student.lastName}`,
      currentStatus: student.passStatus,
      action: currentDecision?.action === 'PROMOTE' ? 'REPEAT' : 'PROMOTE',
      reason: ''
    })
  }

  const handleOverrideSubmit = async () => {
    if (overrideDialog.reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters")
      return
    }

    try {
      const payload: any = {
        studentId: overrideDialog.studentId!,
        fromClassId: selectedClassId,
        action: overrideDialog.action,
        reason: overrideDialog.reason
      }

      if (overrideDialog.action === 'PROMOTE') {
        if (!suggestedClassId) {
          toast.error("No next class available")
          return
        }
        payload.toClassId = suggestedClassId
      }

      await promotionService.teacherOverride(payload)
      toast.success("Override applied successfully")

      setOverrideDialog({ ...overrideDialog, open: false, reason: '' })
      
      // Reload data
      await loadPromotionData()

    } catch (error: any) {
      toast.error(error.message || "Failed to submit override")
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getScoreDisplay = (score: number, passed: boolean) => {
    return (
      <span className={cn(
        "font-medium",
        passed ? "text-green-700" : "text-red-600"
      )}>
        {score || '-'}
      </span>
    )
  }

  const getTargetClassName = (classId: string | null): string => {
    if (!classId) return "Not selected"
    const targetClass = availableNextClasses.find(c => c.id === classId)
    return targetClass?.name || currentClassName
  }

  const getDecisionBadge = (student: StudentForPromotion) => {
    const decision = decisions.get(student.id)
    
    if (student.isAlreadyProcessed) {
      if (student.promotionStatus === 'PROMOTED') {
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Promoted {student.promotedToClassName && `→ ${student.promotedToClassName}`}
          </Badge>
        )
      }
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <RotateCcw className="h-3 w-3 mr-1" />
          Repeating
        </Badge>
      )
    }

    if (decision?.action === 'PROMOTE') {
      const targetClassName = getTargetClassName(decision.toClassId)
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <ArrowUp className="h-3 w-3 mr-1" />
          → {targetClassName}
        </Badge>
      )
    }

    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
        <RotateCcw className="h-3 w-3 mr-1" />
        Repeat
      </Badge>
    )
  }

  const pendingCount = students.filter(s => !s.isAlreadyProcessed).length
  const canProcess = pendingCount > 0 && nextAcademicYear !== null && availableNextClasses.length > 0

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && !selectedYear) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Classes", href: "/my-classes" },
    { label: "Promotions" }
  ]

  return (
    <ProtectedRoute requiredPermissions={["promotions.view"]}>
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              {/* <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Promotions</h1> */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review Term 3 results and make promotion decisions
              </p>
            </div>
          </div>

          {/* Filters Card */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                {/* Year Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Academic Year (Term 3)</label>
                  <Select
                    value={selectedYear?.toString() || ""}
                    onValueChange={(val) => setSelectedYear(parseInt(val))}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year.id} value={year.year.toString()}>
                          {year.year} {year.isCurrent && "(Current)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Class</label>
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger className="h-9 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.rank && `(${cls.rank})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Promote To Year */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Promote To Year</label>
                  <div className="h-9 px-3 flex items-center bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-slate-200 dark:border-slate-700">
                    {nextAcademicYear ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{nextAcademicYear.year} - Term 1</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-slate-500">
                          Year {(selectedYear || 0) + 1} not created
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Promotion Path Info */}
              {selectedClassId && nextLevelInfo && !isGraduatingClass && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Promotion path: <strong>{currentClassName}</strong>
                    <ArrowRight className="h-4 w-4 inline mx-2" />
                    <strong>{nextLevelInfo.nextLevelDisplay}</strong>
                    {suggestedClassName && (
                      <span className="text-blue-600 dark:text-blue-400 ml-2">
                        (Suggested: <strong>{suggestedClassName}</strong>)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* O-Level to A-Level transition info */}
              {isOLevelToALevel && (
                <div className="flex items-start gap-3 mt-4 p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                  <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>O-Level to A-Level Transition:</strong> Students will need to choose between Sciences and Arts.
                    {availableNextClasses.length > 1 && (
                      <span className="block mt-1">Available options: {availableNextClasses.map(c => c.name).join(", ")}</span>
                    )}
                  </p>
                </div>
              )}

              {availableNextClasses.length === 0 && !isGraduatingClass && selectedClassId && (
                <div className="flex items-start gap-3 mt-4 p-3 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    No classes available at the next level. Please create the next level class first.
                    <Button variant="link" className="px-2 h-auto" onClick={() => router.push("/classes/new")}>
                      Create Class
                    </Button>
                  </p>
                </div>
              )}
              
              {isGraduatingClass && (
                <div className="flex items-start gap-3 mt-4 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is a graduating class (S6). Students completing this class will graduate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {selectedClassId && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Total</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Qualifying</span>
                  </div>
                  <div className="text-xl font-bold text-green-700 dark:text-green-300">
                    {students.filter(s => s.qualifiesForPromotion).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Not Qualifying</span>
                  </div>
                  <div className="text-xl font-bold text-red-700 dark:text-red-300">
                    {students.filter(s => !s.qualifiesForPromotion).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Already Promoted</span>
                  </div>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.promoted}</div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-xs font-medium">Already Repeating</span>
                  </div>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{stats.repeated}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Students Table */}
          {selectedClassId && (
            <Card className="border-slate-200 dark:border-slate-700 overflow-visible">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {currentClassName} - Term 3 Results ({selectedYear})
                  </p>
                  <p className="text-xs text-slate-500">
                    {students.length} students • {subjects.length} subjects
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handlePromoteAllQualifying}
                    disabled={loading || pendingCount === 0}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Promote All Qualifying
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleRepeatAllNonQualifying}
                    disabled={loading || pendingCount === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Repeat All Non-Qualifying
                  </Button>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!canProcess || processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process ({pendingCount})
                  </Button>
                </div>
              </div>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No students found for this class in Term 3
                  </div>
                ) : (
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="min-w-max">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 w-10 text-center">#</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 min-w-[200px]">Student</TableHead>
                            {subjects.map(subj => (
                              <TableHead key={subj.id} className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center min-w-[80px]">
                                {subj.name}
                              </TableHead>
                            ))}
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Avg</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 text-center">Decision</TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200 py-4 min-w-[200px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student, idx) => {
                            const decision = decisions.get(student.id)
                            const isFailingStudent = !student.qualifiesForPromotion
                            
                            return (
                              <TableRow 
                                key={student.id}
                                className={cn(
                                  "hover:bg-slate-50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800",
                                  isFailingStudent && !student.isAlreadyProcessed && 
                                  "bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-400"
                                )}
                              >
                                <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">{student.fullName}</div>
                                    <div className="text-xs text-slate-500">
                                      {student.passedSubjects}/{student.subjectCount} subjects passed
                                    </div>
                                  </div>
                                </TableCell>
                                
                                {/* Subject scores */}
                                {subjects.map(subj => {
                                  const score = student.subjectScores[subj.name]
                                  return (
                                    <TableCell key={subj.id} className="text-center">
                                      {score ? getScoreDisplay(score.total, score.passed) : '-'}
                                    </TableCell>
                                  )
                                })}
                                
                                {/* Average */}
                                <TableCell className="text-center">
                                  <Badge className={promotionService.getScoreBadgeColor(student.averageScore)}>
                                    {student.averageScore}%
                                  </Badge>
                                </TableCell>
                                
                                {/* Pass/Fail Status */}
                                <TableCell className="text-center">
                                  {student.qualifiesForPromotion ? (
                                    <Badge className="bg-green-100 text-green-800">Qualifying</Badge>
                                  ) : (
                                    <Badge variant="destructive">Not Qualifying</Badge>
                                  )}
                                </TableCell>
                                
                                {/* Decision Badge */}
                                <TableCell className="text-center">
                                  {getDecisionBadge(student)}
                                </TableCell>
                                
                                {/* Action Controls */}
                                <TableCell>
                                  {!student.isAlreadyProcessed ? (
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={decision?.action || 'PROMOTE'}
                                        onValueChange={(val: 'PROMOTE' | 'REPEAT') => 
                                          handleDecisionChange(student.id, val)
                                        }
                                      >
                                        <SelectTrigger className="w-[110px] h-8 border-2 border-slate-200 dark:border-slate-700">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="PROMOTE">Promote</SelectItem>
                                          <SelectItem value="REPEAT">Repeat</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      {decision?.action === 'PROMOTE' && availableNextClasses.length > 1 && (
                                        <Select
                                          value={decision.toClassId || ''}
                                          onValueChange={(val) => handleToClassChange(student.id, val)}
                                        >
                                          <SelectTrigger className="w-[140px] h-8 border-2 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Select class" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableNextClasses.map(cls => (
                                              <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500">
                                      Already processed
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* Confirmation Dialog - Updated with proper class names */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Confirm Promotions</DialogTitle>
                <DialogDescription>
                  Process promotion decisions for {pendingCount} students?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>This action will:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Enroll promoted students in <strong>{suggestedClassName || nextLevelInfo?.nextLevelDisplay || 'next class'}</strong></li>
                      <li>Enroll repeated students in <strong>{currentClassName}</strong></li>
                      <li>Create enrollments for all terms (T1, T2, T3)</li>
                    </ul>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <div className="text-sm text-slate-600 dark:text-slate-400">To Promote</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Array.from(decisions.values()).filter(d => d.action === 'PROMOTE' && !students.find(s => s.id === d.studentId)?.isAlreadyProcessed).length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      → {suggestedClassName || nextLevelInfo?.nextLevelDisplay} ({nextAcademicYear?.year})
                    </div>
                  </div>
                  <div className="p-4 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <div className="text-sm text-slate-600 dark:text-slate-400">To Repeat</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {Array.from(decisions.values()).filter(d => d.action === 'REPEAT' && !students.find(s => s.id === d.studentId)?.isAlreadyProcessed).length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      → {currentClassName} ({nextAcademicYear?.year})
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button className="h-10" onClick={handleProcessPromotions} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm & Process"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Override Dialog - Updated with proper class names */}
          <Dialog open={overrideDialog.open} onOpenChange={(open) => setOverrideDialog({ ...overrideDialog, open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Teacher Override</DialogTitle>
                <DialogDescription>
                  Override decision for {overrideDialog.studentName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Current Status</Label>
                  <div className="mt-2">
                    <Badge variant={overrideDialog.currentStatus === 'PASS' ? 'default' : 'destructive'}>
                      {overrideDialog.currentStatus === 'PASS' ? 'Qualifies for Promotion' : 'Does Not Qualify'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Override To</Label>
                  <Select
                    value={overrideDialog.action}
                    onValueChange={(value: 'PROMOTE' | 'REPEAT') => 
                      setOverrideDialog({ ...overrideDialog, action: value })
                    }
                  >
                    <SelectTrigger className="mt-2 h-10 border-2 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROMOTE">
                        Promote to {suggestedClassName || nextLevelInfo?.nextLevelDisplay || 'Next Class'}
                      </SelectItem>
                      <SelectItem value="REPEAT">
                        Repeat {currentClassName}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Reason (min 10 characters)</Label>
                  <Textarea
                    className="mt-2 border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
                    placeholder="Explain why you are overriding the automatic decision..."
                    value={overrideDialog.reason}
                    onChange={(e) => setOverrideDialog({ ...overrideDialog, reason: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {overrideDialog.reason.length}/10 characters minimum
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => setOverrideDialog({ ...overrideDialog, open: false, reason: '' })}
                >
                  Cancel
                </Button>
                <Button
                  className="h-10"
                  onClick={handleOverrideSubmit}
                  disabled={overrideDialog.reason.length < 10}
                >
                  Submit Override
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
