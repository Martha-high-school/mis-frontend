"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Loader2 } from "lucide-react"
import { userService, type User, type UpdateUserData } from "@/services/user.service"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  user: User | null
}

export function EditUserDialog({ open, onOpenChange, onSuccess, user }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UpdateUserData>({
    email: "",
    role: "class_teacher",
    classAssignment: "",
    department: "",
    phoneNumber: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        role: user.role,
        classAssignment: user.classAssignment || "",
        department: user.department || "",
        phoneNumber: user.phoneNumber || "",
      })
      setErrors({})
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await userService.updateUser(user.id, formData)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof UpdateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }))
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrors({})
    }
    onOpenChange(open)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Edit className="h-5 w-5 text-primary" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information. Changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {errors.submit && (
              <div className="flex items-start gap-2 p-3 border-2 border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Current Name</Label>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-md border-2 border-slate-200 dark:border-slate-700">
                {user.firstName} {user.lastName}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                disabled={isLoading}
                className={`h-10 border-2 ${errors.email ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary bg-white dark:bg-slate-900`}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                Role *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => updateField("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={`h-10 border-2 ${errors.role ? "border-red-300" : "border-slate-200 dark:border-slate-700"} focus:border-primary`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="head_teacher">Head Teacher</SelectItem>
                  <SelectItem value="class_teacher">Class Teacher</SelectItem>
                  <SelectItem value="bursar">Bursar</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+256 700 000 000"
                value={formData.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                disabled={isLoading}
                className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
              />
            </div>

            {(formData.role === "class_teacher" || formData.role === "head_teacher") && (
              <div className="space-y-2">
                <Label htmlFor="classAssignment" className="text-slate-700 dark:text-slate-300">Class Assignment</Label>
                <Input
                  id="classAssignment"
                  type="text"
                  placeholder="e.g., S.4 East"
                  value={formData.classAssignment}
                  onChange={(e) => updateField("classAssignment", e.target.value)}
                  disabled={isLoading}
                  className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="department" className="text-slate-700 dark:text-slate-300">Department</Label>
              <Input
                id="department"
                type="text"
                placeholder="e.g., Mathematics, Science"
                value={formData.department}
                onChange={(e) => updateField("department", e.target.value)}
                disabled={isLoading}
                className="h-10 border-2 border-slate-200 dark:border-slate-700 focus:border-primary bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" className="h-10" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}