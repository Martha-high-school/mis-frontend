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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail } from "lucide-react"
import { userService, type InviteUserData } from "@/services/user.service"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    role: "class_teacher" as "director" | "head_teacher" | "class_teacher" | "bursar",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.email || !formData.role) {
      setError("Email and role are required")
      setIsLoading(false)
      return
    }

    try {
      await userService.inviteUser(formData)
      onSuccess()
      onOpenChange(false)
      // Reset form
      setFormData({
        email: "",
        role: "class_teacher",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to a new staff member. They will receive a link to complete their account setup.
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
              <p className="text-sm text-muted-foreground">
                The invitation will be sent to this email address
              </p>
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
                  <SelectItem value="bursar">Bursar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select the user's role in the system
              </p>
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