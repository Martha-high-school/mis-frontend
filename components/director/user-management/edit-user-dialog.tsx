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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Edit } from "lucide-react"
import { userService, type User, type UpdateUserData } from "@/services/user.service"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  user: User | null
}

export function EditUserDialog({ open, onOpenChange, onSuccess, user }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")

    if (!formData.email || !formData.role) {
      setError("Email and role are required")
      setIsLoading(false)
      return
    }

    try {
      await userService.updateUser(user.id, formData)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information. Changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Current Name</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {user.firstName} {user.lastName}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="head_teacher">Head Teacher</SelectItem>
                  <SelectItem value="class_teacher">Class Teacher</SelectItem>
                  <SelectItem value="burser">Burser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+256 700 000 000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {(formData.role === "class_teacher" || formData.role === "head_teacher") && (
              <div className="space-y-2">
                <Label htmlFor="classAssignment">Class Assignment</Label>
                <Input
                  id="classAssignment"
                  type="text"
                  placeholder="e.g., S.4 East"
                  value={formData.classAssignment}
                  onChange={(e) => setFormData({ ...formData, classAssignment: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                type="text"
                placeholder="e.g., Mathematics, Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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