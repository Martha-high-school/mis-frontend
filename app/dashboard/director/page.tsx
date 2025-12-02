"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  AreaChart,
  Area,
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
  Legend
} from "recharts"
// import { dashboardService, DirectorDashboardData } from "@/services/dashboard.service"
import { dashboardService, DirectorDashboardData } from "@/services/dashbaord.service"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `UGX ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `UGX ${(amount / 1000).toFixed(0)}K`
  }
  return `UGX ${amount}`
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

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
      <div className="flex items-center justify-center h-[200px]">
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
            {entry.name}: {typeof entry.value === 'number' && entry.value > 10000
              ? formatCurrency(entry.value)
              : entry.value}
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
// DIRECTOR DASHBOARD CONTENT
// ============================================================================

function DirectorDashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DirectorDashboardData | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await dashboardService.getDirectorDashboard()
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
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Director Dashboard</h2>
            <p className="text-sm text-gray-500">
              Welcome back, {user.name}! Here's your school overview.
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
            title="Total Students"
            value={data ? formatNumber(data.metrics.totalStudents.value as number) : "-"}
            subtitle={data?.metrics.totalStudents.subtitle}
            icon={Users}
            trend={data?.metrics.totalStudents.trend}
            trendValue={data?.metrics.totalStudents.trendValue}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Fee Collection"
            value={data ? formatCurrency(data.metrics.feeCollection.value as number) : "-"}
            subtitle={data?.metrics.feeCollection.subtitle}
            icon={DollarSign}
            trend={data?.metrics.feeCollection.trend}
            trendValue={data?.metrics.feeCollection.trendValue}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Overall Pass Rate"
            value={data?.metrics.passRate.value || "-"}
            subtitle={data?.metrics.passRate.subtitle}
            icon={Award}
            trend={data?.metrics.passRate.trend}
            trendValue={data?.metrics.passRate.trendValue}
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Staff Members"
            value={data?.metrics.staffMembers.value || "-"}
            subtitle={data?.metrics.staffMembers.subtitle}
            icon={UserCheck}
            trend={data?.metrics.staffMembers.trend}
            trendValue={data?.metrics.staffMembers.trendValue}
            color="pink"
            loading={loading}
          />
        </div>

        {/* Row 2: Enrollment Trends & Fee Status */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Enrollment Trends - 2 columns */}
          <ChartCard
            title="Enrollment Trends"
            subtitle="Student growth over 5 years"
            className="lg:col-span-2"
            loading={loading}
            action={
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Total</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">O-Level</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-gray-600">A-Level</span>
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.charts.enrollmentTrends || []}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorALevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#colorStudents)" name="Total" />
                <Area type="monotone" dataKey="oLevel" stroke="#10b981" strokeWidth={2} fill="url(#colorOLevel)" name="O-Level" />
                <Area type="monotone" dataKey="aLevel" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorALevel)" name="A-Level" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Fee Status - 1 column */}
          <ChartCard title="Fee Status" subtitle="Current term" loading={loading}>
            <ResponsiveContainer width="100%" height={140}>
              <RechartsPie>
                <Pie 
                  data={data?.charts.feeStatus || []} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={40} 
                  outerRadius={60} 
                  paddingAngle={4} 
                  dataKey="value"
                >
                  {(data?.charts.feeStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {(data?.charts.feeStatus || []).map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Row 3: Gender Distribution, Term Progress, Class Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gender Distribution */}
          <ChartCard title="Gender Distribution" subtitle="Student demographics" loading={loading}>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <RechartsPie>
                  <Pie 
                    data={data?.charts.genderDistribution || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={60} 
                    paddingAngle={4} 
                    dataKey="value"
                  >
                    {(data?.charts.genderDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2">
                {(data?.charts.genderDistribution || []).map((item) => {
                  const total = (data?.charts.genderDistribution || []).reduce((sum, g) => sum + g.value, 0)
                  return (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-gray-700">{item.name}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                      <p className="text-xs text-gray-500">
                        {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </ChartCard>

          {/* Term Progress */}
          <ChartCard title="Term Progress" subtitle="Performance this year" loading={loading}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.charts.termProgress || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score" />
                <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass Rate" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Class Performance */}
          <ChartCard title="Class Performance" subtitle="Average by class" loading={loading}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.charts.classPerformance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="class" type="category" stroke="#94a3b8" fontSize={12} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Average" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </MainLayout>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default function DirectorDashboardPage() {
  return (
    <ProtectedRoute>
      <DirectorDashboardContent />
    </ProtectedRoute>
  )
}