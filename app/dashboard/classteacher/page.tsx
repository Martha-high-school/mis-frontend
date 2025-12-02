"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import {
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  RefreshCw,
  MessageSquare,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"
// import { dashboardService, ClassTeacherDashboardData } from "@/services/dashboard.service"

import { dashboardService, ClassTeacherDashboardData } from "@/services/dashbaord.service"
// ============================================================================
// COMPONENTS
// ============================================================================

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  loading = false
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "blue" | "green" | "amber" | "red" | "purple" | "pink"
  loading?: boolean
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/25"
  }

  const bgColorClasses = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
    purple: "bg-purple-50 border-purple-100",
    pink: "bg-pink-50 border-pink-100"
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${bgColorClasses[color]} p-5 transition-all duration-300 hover:shadow-lg cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && trendValue && !loading && (
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend === "up" ? "bg-emerald-100 text-emerald-700" :
              trend === "down" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> :
               trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} p-3 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className = "",
  loading = false
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  loading?: boolean
}) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {loading ? (
      <div className="flex items-center justify-center h-[220px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ) : (
      children
    )}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-2 font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ErrorAlert = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
    <AlertCircle className="h-5 w-5 text-red-500" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-800">Failed to load dashboard</p>
      <p className="text-sm text-red-600">{message}</p>
    </div>
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RefreshCw className="h-4 w-4 mr-2" /> Retry
    </Button>
  </div>
)

const NoClassesAssigned = () => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
    <Users className="h-12 w-12 text-amber-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
    <p className="text-sm text-gray-600">
      You don't have any classes assigned to you yet. Please contact the administrator.
    </p>
  </div>
)

// ============================================================================
// CLASS TEACHER DASHBOARD CONTENT
// ============================================================================

function ClassTeacherDashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ClassTeacherDashboardData | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (classId?: string) => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await dashboardService.getClassTeacherDashboard(classId)
      setData(dashboardData)
      
      // Set selected class from response if not already set
      if (!selectedClassId && dashboardData.selectedClass) {
        setSelectedClassId(dashboardData.selectedClass.id)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  useEffect(() => {
    fetchDashboard()
  }, [])

  // Re-fetch when class changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    fetchDashboard(classId)
  }

  if (!user) return null

  const breadcrumbs = [{ label: "Dashboard" }]

  // Check if no classes assigned
  const hasNoClasses = data && data.myClasses.length === 0

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Teacher Dashboard</h2>
            <p className="text-sm text-gray-500">
              Manage your classes and track student progress.
              {data?.context && ` (${data.context.year} - Term ${data.context.term.charAt(1)})`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Class Filter Dropdown */}
            {data && data.myClasses.length > 0 && (
              <select
                value={selectedClassId || ""}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={loading}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              >
                {data.myClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.students} students)
                  </option>
                ))}
              </select>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchDashboard(selectedClassId || undefined)} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && <ErrorAlert message={error} onRetry={() => fetchDashboard(selectedClassId || undefined)} />}

        {/* No Classes State */}
        {hasNoClasses && !loading && <NoClassesAssigned />}

        {/* Dashboard Content (only show if has classes) */}
        {(!hasNoClasses || loading) && (
          <>
            {/* Row 1: Key Metrics (4 cards) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="My Students"
                value={data?.metrics.totalStudents.value || "-"}
                subtitle={data?.metrics.totalStudents.subtitle}
                icon={Users}
                trend={data?.metrics.totalStudents.trend}
                trendValue={data?.metrics.totalStudents.trendValue}
                color="blue"
                loading={loading}
              />
              <MetricCard
                title="Class Average"
                value={data?.metrics.classAverage.value || "-"}
                subtitle={data?.metrics.classAverage.subtitle}
                icon={TrendingUp}
                trend={data?.metrics.classAverage.trend}
                trendValue={data?.metrics.classAverage.trendValue}
                color="green"
                loading={loading}
              />
              <MetricCard
                title="Pending Marks"
                value={data?.metrics.pendingMarks.value || "-"}
                subtitle={data?.metrics.pendingMarks.subtitle}
                icon={BookOpen}
                trend={data?.metrics.pendingMarks.trend}
                trendValue={data?.metrics.pendingMarks.trendValue}
                color="amber"
                loading={loading}
              />
              <MetricCard
                title="Comments Pending"
                value={data?.metrics.pendingComments.value || "-"}
                subtitle={data?.metrics.pendingComments.subtitle}
                icon={MessageSquare}
                trend={data?.metrics.pendingComments.trend}
                trendValue={data?.metrics.pendingComments.trendValue}
                color="purple"
                loading={loading}
              />
            </div>

            {/* Row 2: Subject Performance, Class Performance Trend, Grade Distribution */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Subject Performance */}
              <ChartCard 
                title="Subject Performance" 
                subtitle={data?.selectedClass ? `${data.selectedClass.name} averages` : "Class averages"}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.charts.subjectPerformance || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                    <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Class Performance Trend */}
              <ChartCard 
                title="Class Performance Trend" 
                subtitle={data?.selectedClass ? `${data.selectedClass.name} progress` : "Class progress"}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.charts.termProgress || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Average" />
                    <Line type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Pass Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Grade Distribution */}
              <ChartCard 
                title="Grade Distribution" 
                subtitle={data?.selectedClass?.name || "Class"}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={160}>
                  <RechartsPie>
                    <Pie 
                      data={data?.charts.gradeDistribution || []} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={70} 
                      paddingAngle={3} 
                      dataKey="value"
                    >
                      {(data?.charts.gradeDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(data?.charts.gradeDistribution || []).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default function ClassTeacherDashboardPage() {
  return (
    <ProtectedRoute>
      <ClassTeacherDashboardContent />
    </ProtectedRoute>
  )
}