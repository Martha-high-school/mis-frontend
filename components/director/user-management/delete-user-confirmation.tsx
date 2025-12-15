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
import { AlertCircle, Trash2, Loader2 } from "lucide-react"
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
    }
    onOpenChange(open)
  }

  if (!user) return null

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 border-2 border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </strong>{" "}
                ({user.email})?
              </p>
              <div className="p-3 border-2 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ This action cannot be undone. All data associated with this user will be permanently removed.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <Button variant="outline" className="h-10" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" className="h-10" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
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