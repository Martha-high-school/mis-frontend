"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
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
  Sparkles,
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  BarChart3,
  PieChart,
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
// ENHANCED COMPONENTS
// ============================================================================

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  loading = false,
  delay = 0
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "blue" | "green" | "amber" | "red" | "purple" | "pink"
  loading?: boolean
  delay?: number
}) => {
  const colorConfig = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      border: "border-blue-200/60",
      iconBg: "bg-blue-500",
      ring: "ring-blue-500/20"
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20"
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      border: "border-amber-200/60",
      iconBg: "bg-amber-500",
      ring: "ring-amber-500/20"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      border: "border-red-200/60",
      iconBg: "bg-red-500",
      ring: "ring-red-500/20"
    },
    purple: {
      bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
      border: "border-violet-200/60",
      iconBg: "bg-violet-500",
      ring: "ring-violet-500/20"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-pink-100/50",
      border: "border-pink-200/60",
      iconBg: "bg-pink-500",
      ring: "ring-pink-500/20"
    }
  }

  const config = colorConfig[color]

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-5 transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-60" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-40" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 tracking-wide">{title}</p>
          {loading ? (
            <div className="h-9 w-28 bg-gray-200/80 animate-pulse rounded-lg" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {subtitle}
            </p>
          )}
          {trend && trendValue && !loading && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-transform group-hover:scale-105 ${
              trend === "up" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" :
              trend === "down" ? "bg-red-100 text-red-700 ring-1 ring-red-200" :
              "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
            }`}>
              {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> :
               trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`rounded-2xl ${config.iconBg} p-3.5 shadow-lg ring-4 ${config.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-6 w-6 text-white" />
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
  loading = false,
  icon: Icon
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  loading?: boolean
  icon?: any
}) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300/60 ${className}`}>
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 p-2.5 ring-1 ring-gray-200/50">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {loading ? (
      <div className="flex flex-col items-center justify-center h-[200px] gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading data...</p>
      </div>
    ) : (
      <div className="relative">{children}</div>
    )}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 shadow-xl">
        <p className="mb-2 font-semibold text-gray-900 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {typeof entry.value === 'number' && entry.value > 10000
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const WelcomeHeader = ({ 
  userName, 
  context, 
  onRefresh, 
  loading,
}: { 
  userName: string
  context?: { year: string; term: string }
  onRefresh: () => void
  loading: boolean
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
      style={{
        background: "linear-gradient(to right, #9bb8ad, #7f958d, #36423b)",
        boxShadow: "0 25px 50px -12px rgba(54, 66, 59, 0.35)",
      }}
    >

      {/* ========================================================= */}
      {/*   DECORATIVE BACKGROUND (NOW FULLY VISIBLE & STRONG)      */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Bright circles */}
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/30 blur-2xl mix-blend-overlay" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-white/25 blur-xl mix-blend-overlay" />
        <div className="absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-white/20 blur-lg mix-blend-overlay" />

        {/* Abstract shapes */}
        <div className="absolute top-16 left-1/4 h-32 w-32 rotate-45 bg-emerald-200/25 blur-md rounded-xl mix-blend-soft-light" />
        <div className="absolute bottom-10 right-1/4 h-24 w-24 -rotate-12 bg-teal-300/20 blur-md rounded-lg mix-blend-soft-light" />

        {/* Dot pattern */}
        <svg className="absolute inset-0 h-full w-full mix-blend-soft-light opacity-40">
          <pattern id="dots-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.45" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/*   MAIN FOREGROUND CONTENT                                 */}
      {/* ========================================================= */}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          
          {/* Greeting */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">
              {getGreeting()}, Director
            </span>
          </div>

          {/* Welcome back */}
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {userName}!
          </h1>

          {/* Academic Year */}
          <p className="flex items-center gap-2 text-white">
            <Calendar className="h-4 w-4 text-white" />
            {context
              ? `${context.year} Academic Year — Term ${context.term.charAt(1)}`
              : "Loading..."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-10 bg-white/15 hover:bg-white/25 border-0 text-white backdrop-blur-sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-10 bg-white/15 hover:bg-white/25 border-0 text-white backdrop-blur-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}


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
      const msg = err.message || "Failed to load dashboard data"
      setError(msg)
      toast.error(msg)
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
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs} pageTitle="Dashboard">
      <div className="space-y-6 pb-8">
        {/* Welcome Header */}
        <WelcomeHeader 
          userName={user.name}
          context={data?.context}
          onRefresh={fetchDashboard}
          loading={loading}
        />

        {/* Row 1: Key Metrics (4 cards) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Students"
            value={data ? formatNumber(data.metrics.totalStudents.value as number) : "-"}
            subtitle={data?.metrics.totalStudents.subtitle}
            icon={Users}
            trend={data?.metrics.totalStudents.trend}
            trendValue={data?.metrics.totalStudents.trendValue}
            color="blue"
            loading={loading}
            delay={0}
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
            delay={100}
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
            delay={200}
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
            delay={300}
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
            icon={TrendingUp}
            action={
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-600 font-medium">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-600 font-medium">O-Level</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span className="text-gray-600 font-medium">A-Level</span>
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.charts.enrollmentTrends || []}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorALevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorStudents)" name="Total" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="oLevel" stroke="#10b981" strokeWidth={2.5} fill="url(#colorOLevel)" name="O-Level" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="aLevel" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorALevel)" name="A-Level" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Fee Status - 1 column */}
          <ChartCard 
            title="Fee Status" 
            subtitle="Current term"
            loading={loading}
            icon={PieChart}
          >
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <RechartsPie>
                  <defs>
                    {(data?.charts.feeStatus || []).map((entry, index) => (
                      <linearGradient key={`fee-gradient-${index}`} id={`feeGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie 
                    data={data?.charts.feeStatus || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45} 
                    outerRadius={65} 
                    paddingAngle={4} 
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(data?.charts.feeStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#feeGradient${index})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-3">
                {(data?.charts.feeStatus || []).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 font-medium">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Row 3: Gender Distribution, Term Progress, Class Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gender Distribution */}
          <ChartCard 
            title="Gender Distribution" 
            subtitle="Student demographics"
            loading={loading}
            icon={Users}
          >
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <RechartsPie>
                  <defs>
                    {(data?.charts.genderDistribution || []).map((entry, index) => (
                      <linearGradient key={`gender-gradient-${index}`} id={`genderGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie 
                    data={data?.charts.genderDistribution || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45} 
                    outerRadius={65} 
                    paddingAngle={4} 
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(data?.charts.genderDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#genderGradient${index})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex gap-8 mt-3">
                {(data?.charts.genderDistribution || []).map((item) => {
                  const total = (data?.charts.genderDistribution || []).reduce((sum, g) => sum + g.value, 0)
                  return (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
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
          <ChartCard 
            title="Term Progress" 
            subtitle="Performance this year"
            loading={loading}
            icon={BarChart3}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.charts.termProgress || []}>
                <defs>
                  <linearGradient id="termAvgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="termPassGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="average" fill="url(#termAvgGradient)" radius={[6, 6, 0, 0]} name="Avg Score" />
                <Bar dataKey="passRate" fill="url(#termPassGradient)" radius={[6, 6, 0, 0]} name="Pass Rate" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Class Performance */}
          <ChartCard 
            title="Class Performance" 
            subtitle="Average by class"
            loading={loading}
            icon={Award}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.charts.classPerformance || []} layout="vertical">
                <defs>
                  <linearGradient id="classBarGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <YAxis dataKey="class" type="category" stroke="#64748b" fontSize={11} width={35} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar dataKey="average" fill="url(#classBarGradient)" radius={[0, 6, 6, 0]} name="Average" />
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
    <ProtectedRoute requiredPermissions={["dashboard.view_director"]}>
      <DirectorDashboardContent />
    </ProtectedRoute>
  )
}
