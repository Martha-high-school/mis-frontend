"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, DollarSign, TrendingUp, BookOpen, FileText } from "lucide-react"

// Role-specific dashboard content
const getDashboardContent = (role: string) => {
  switch (role) {
    case "director":
      return {
        // title: "Director Dashboard",
        stats: [
          { title: "Total Students", value: "1,234", change: "+12% from last term", icon: Users },
          { title: "Active Classes", value: "24", change: "Across all levels", icon: GraduationCap },
          { title: "Fee Collection", value: "85%", change: "Current term collection rate", icon: DollarSign },
          { title: "Performance", value: "92%", change: "Average competency achievement", icon: TrendingUp },
        ],
        actions: [
          { title: "User Management", description: "Manage staff accounts and permissions", icon: Users },
          { title: "System Reports", description: "View comprehensive system analytics", icon: FileText },
          { title: "School Settings", description: "Configure system-wide settings", icon: TrendingUp },
        ],
      }
    case "head_teacher":
      return {
        // title: "Head Teacher Dashboard",
        stats: [
          { title: "Total Classes", value: "24", change: "All grade levels", icon: GraduationCap },
          { title: "Teaching Staff", value: "45", change: "Active teachers", icon: Users },
          { title: "Avg Performance", value: "88%", change: "School-wide average", icon: TrendingUp },
          { title: "Assessments", value: "156", change: "This term", icon: BookOpen },
        ],
        actions: [
          { title: "Class Management", description: "Organize classes and assign teachers", icon: GraduationCap },
          { title: "Teacher Reports", description: "Monitor teacher performance", icon: Users },
          { title: "Academic Reports", description: "View academic performance data", icon: FileText },
        ],
      }
    case "class_teacher":
      return {
        // title: "Class Teacher Dashboard",
        stats: [
          { title: "My Classes", value: "3", change: "Assigned classes", icon: GraduationCap },
          { title: "Students", value: "89", change: "Under my supervision", icon: Users },
          { title: "Assessments", value: "12", change: "Pending grading", icon: BookOpen },
          { title: "Avg Score", value: "85%", change: "Class average", icon: TrendingUp },
        ],
        actions: [
          { title: "Grade Students", description: "Enter marks and assessments", icon: BookOpen },
          { title: "Class Reports", description: "Generate class performance reports", icon: FileText },
          { title: "Student Progress", description: "Track individual student progress", icon: Users },
        ],
      }
    case "bursar":
      return {
        // title: "Bursar Dashboard",
        stats: [
          { title: "Total Revenue", value: "UGX 450M", change: "This term", icon: DollarSign },
          { title: "Collection Rate", value: "85%", change: "+5% from last term", icon: TrendingUp },
          { title: "Outstanding", value: "UGX 67M", change: "Pending payments", icon: DollarSign },
          { title: "Receipts", value: "1,045", change: "Issued this month", icon: FileText },
        ],
        actions: [
          { title: "Process Payments", description: "Handle fee payments and receipts", icon: DollarSign },
          { title: "Fee Management", description: "Set up fee structures", icon: TrendingUp },
          { title: "Financial Reports", description: "Generate financial statements", icon: FileText },
        ],
      }
    default:
      return {
        title: "Dashboard",
        stats: [],
        actions: [],
      }
  }
}

function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  const content = getDashboardContent(user.role)

  const breadcrumbs = [{ label: "Dashboard" }]

  return (
    <MainLayout userRole={user.role} pageTitle={content.title} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div
          className="rounded-lg p-6 text-white shadow-lg"
          style={{
            background: "linear-gradient(to right, #1d4ed8, #1e40af)",
            backgroundColor: "#1d4ed8",
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#ffffff" }}>
            Welcome back, {user.name}
          </h2>
          <p style={{ color: "#dbeafe" }}>Empowering to Excel - Your {user.role.replace("-", " ")} dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{stat.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Access</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
