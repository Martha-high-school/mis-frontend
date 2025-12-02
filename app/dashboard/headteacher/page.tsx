"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts"
import { dashboardService, HeadTeacherDashboardData } from "@/services/dashbaord.service"

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
      <div className="flex items-center justify-center h-[280px]">
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

// ============================================================================
// HEAD TEACHER DASHBOARD CONTENT
// ============================================================================

function HeadTeacherDashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HeadTeacherDashboardData | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await dashboardService.getHeadTeacherDashboard()
      setData(dashboardData)
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (!user) return null

  const breadcrumbs = [{ label: "Dashboard" }]

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Head Teacher Dashboard</h2>
            <p className="text-sm text-gray-500">
              Monitor academic performance and teacher activities.
              {data?.context && ` (${data.context.year} - Term ${data.context.term.charAt(1)})`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && <ErrorAlert message={error} onRetry={fetchDashboard} />}

        {/* Row 1: Key Metrics (4 cards) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Classes"
            value={data?.metrics.totalClasses.value || "-"}
            subtitle={data?.metrics.totalClasses.subtitle}
            icon={GraduationCap}
            trend={data?.metrics.totalClasses.trend}
            trendValue={data?.metrics.totalClasses.trendValue}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Teaching Staff"
            value={data?.metrics.teachingStaff.value || "-"}
            subtitle={data?.metrics.teachingStaff.subtitle}
            icon={Users}
            trend={data?.metrics.teachingStaff.trend}
            trendValue={data?.metrics.teachingStaff.trendValue}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="School Average"
            value={data?.metrics.schoolAverage.value || "-"}
            subtitle={data?.metrics.schoolAverage.subtitle}
            icon={TrendingUp}
            trend={data?.metrics.schoolAverage.trend}
            trendValue={data?.metrics.schoolAverage.trendValue}
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Pending Reports"
            value={data?.metrics.pendingReports.value || "-"}
            subtitle={data?.metrics.pendingReports.subtitle}
            icon={FileText}
            trend={data?.metrics.pendingReports.trend}
            trendValue={data?.metrics.pendingReports.trendValue}
            color="amber"
            loading={loading}
          />
        </div>

        {/* Row 2: Charts (Class Performance + Subject Performance) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard 
            title="Class Performance Comparison" 
            subtitle="Average scores and pass rates"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.charts.classPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="class" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Score" />
                <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard 
            title="Subject Performance" 
            subtitle="School-wide averages"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={data?.charts.subjectPerformance || []}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </MainLayout>
  )
}


export default function HeadTeacherDashboardPage() {
  return (
    <ProtectedRoute>
      <HeadTeacherDashboardContent />
    </ProtectedRoute>
  )
}