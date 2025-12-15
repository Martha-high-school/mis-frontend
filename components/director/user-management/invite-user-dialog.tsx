"use client"

import { useState } from "react"
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
import { AlertCircle, Mail, Loader2 } from "lucide-react"
import { userService, type InviteUserData } from "@/services/user.service"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: "",
    role: "class_teacher" as "director" | "head_teacher" | "class_teacher" | "bursar",
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
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

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await userService.inviteUser(formData)
      onSuccess()
      onOpenChange(false)
      // Reset form
      setFormData({
        email: "",
        role: "class_teacher",
      })
      setErrors({})
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
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
      // Reset form when closing
      setFormData({
        email: "",
        role: "class_teacher",
      })
      setErrors({})
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Mail className="h-5 w-5 text-primary" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to a new staff member. They will receive a link to complete their account setup.
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
              {errors.email ? (
                <p className="text-sm text-red-600">{errors.email}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  The invitation will be sent to this email address
                </p>
              )}
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
              {errors.role ? (
                <p className="text-sm text-red-600">{errors.role}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Select the user's role in the system
                </p>
              )}
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
                  Sending Invitation...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}