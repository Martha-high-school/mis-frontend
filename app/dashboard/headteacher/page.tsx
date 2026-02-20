"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
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
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  BarChart3,
  Award,
  BookOpen,
  Settings,
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
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { dashboardService, HeadTeacherDashboardData } from "@/services/dashbaord.service"

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
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      border: "border-blue-200/60",
      iconBg: "bg-blue-500",
      ring: "ring-blue-500/20"
    },
    green: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20"
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      border: "border-amber-200/60",
      iconBg: "bg-amber-500",
      ring: "ring-amber-500/20"
    },
    red: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      border: "border-red-200/60",
      iconBg: "bg-red-500",
      ring: "ring-red-500/20"
    },
    purple: {
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
      border: "border-violet-200/60",
      iconBg: "bg-violet-500",
      ring: "ring-violet-500/20"
    },
    pink: {
      gradient: "from-pink-500 to-pink-600",
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
      <div className="flex flex-col items-center justify-center h-[280px] gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
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
            <span className="font-semibold" style={{ color: entry.color }}>{entry.value}%</span>
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-purple-500/30">

      {/* ========================================================= */}
      {/* Decorative Layer (NOW STRONG & VISIBLE)                   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Bright circles */}
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/30 blur-2xl mix-blend-overlay" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-white/25 blur-xl mix-blend-overlay" />
        <div className="absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-white/20 blur-lg mix-blend-overlay" />

        {/* Abstract glowing shapes */}
        <div className="absolute top-14 left-1/4 h-32 w-32 rotate-45 bg-fuchsia-300/25 blur-md rounded-xl mix-blend-soft-light" />
        <div className="absolute bottom-10 right-1/4 h-28 w-28 -rotate-12 bg-indigo-300/20 blur-md rounded-lg mix-blend-soft-light" />

        {/* Dot pattern (more visible) */}
        <svg className="absolute inset-0 h-full w-full mix-blend-soft-light opacity-40">
          <pattern id="purple-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.45" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#purple-dots)" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* Main Content                                              */}
      {/* ========================================================= */}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">

          {/* Sparkles + Greeting */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-200" />
            <span className="text-sm font-medium text-purple-100">
              {getGreeting()}
            </span>
          </div>

          {/* Welcome message */}
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>

          {/* Academic Info */}
          <p className="flex items-center gap-2 text-purple-100">
            <Calendar className="h-4 w-4" />
            {context
              ? `${context.year} Academic Year - Term ${context.term.charAt(1)}`
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
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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

        {/* Key Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Classes"
            value={data?.metrics.totalClasses.value || "-"}
            subtitle={data?.metrics.totalClasses.subtitle}
            icon={GraduationCap}
            trend={data?.metrics.totalClasses.trend}
            trendValue={data?.metrics.totalClasses.trendValue}
            color="blue"
            loading={loading}
            delay={0}
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
            delay={100}
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
            delay={200}
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
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Class Performance Comparison */}
          <ChartCard 
            title="Class Performance Comparison" 
            subtitle="Average scores and pass rates by class"
            loading={loading}
            icon={BarChart3}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.charts.classPerformance || []} margin={{ top: 10 }}>
                <defs>
                  <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="class" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Bar dataKey="average" fill="url(#barGradientBlue)" radius={[6, 6, 0, 0]} name="Average Score" />
                <Bar dataKey="passRate" fill="url(#barGradientGreen)" radius={[6, 6, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Subject Performance Radar */}
          <ChartCard 
            title="Subject Performance" 
            subtitle="School-wide subject averages"
            loading={loading}
            icon={Award}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data?.charts.subjectPerformance || []}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  fill="url(#radarGradient)" 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-3 shadow-xl">
                          <p className="font-semibold text-gray-900 text-sm">{payload[0].payload.subject}</p>
                          <p className="text-sm text-violet-600 font-medium">{payload[0].value}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Manage Classes", icon: GraduationCap, href: "/classes", color: "blue", description: "View and organize classes" },
            { label: "View Students", icon: Users, href: "/students", color: "green", description: "Student records" },
            { label: "Assessments", icon: BookOpen, href: "/assessments", color: "purple", description: "Manage assessments" },
            { label: "Report Settings", icon: Settings, href: "/settings/report-settings", color: "amber", description: "Configure reports" }
          ].map((action, idx) => (
            <button
              key={idx}
              className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1"
            >
              <div className={`rounded-xl bg-gradient-to-br from-${action.color}-100 to-${action.color}-50 p-3 mb-4 ring-1 ring-${action.color}-200/50`}>
                <action.icon className={`h-5 w-5 text-${action.color}-600`} />
              </div>
              <span className="font-semibold text-gray-900 mb-1">{action.label}</span>
              <span className="text-xs text-gray-500 mb-3">{action.description}</span>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-gray-600 mt-auto">
                <span>Open</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div> */}
      </div>
    </MainLayout>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default function HeadTeacherDashboardPage() {
  return (
    <ProtectedRoute requiredPermissions={["dashboard.view_head_teacher"]}>
      <HeadTeacherDashboardContent />
    </ProtectedRoute>
  )
}
