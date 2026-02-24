"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

const dashboardRoutes: Record<string, string> = {
  director: "/dashboard/director",
  head_teacher: "/dashboard/headteacher",
  class_teacher: "/dashboard/classteacher",
  bursar: "/dashboard/bursar",
}

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleGoToDashboard = () => {
    const destination = user?.role ? dashboardRoutes[user.role] ?? "/" : "/"
    router.push(destination)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page. Please contact your administrator if you believe this is
            an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoToDashboard}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
