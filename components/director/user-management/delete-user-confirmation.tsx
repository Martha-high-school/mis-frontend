"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trash2 } from "lucide-react"
import { userService, type User } from "@/services/user.service"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  user: User | null
}

export function DeleteUserDialog({ open, onOpenChange, onSuccess, user }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      await userService.deleteUser(user.id)
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              Are you sure you want to delete{" "}
              <strong>
                {user.firstName} {user.lastName}
              </strong>{" "}
              ({user.email})?
            </div>
            <div className="text-destructive">
              This action cannot be undone. All data associated with this user will be permanently removed.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete User
              </span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}