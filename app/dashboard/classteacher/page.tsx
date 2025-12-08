"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import {
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  RefreshCw,
  MessageSquare,
  Loader2,
  Sparkles,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
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
  Legend,
  Area,
  AreaChart,
} from "recharts"

import { dashboardService, ClassTeacherDashboardData } from "@/services/dashbaord.service"

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
      className={`group relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-5 transition-all duration-500 hover:shadow-xl hover:shadow-${color}-500/10 hover:-translate-y-1`}
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
      <div className="flex flex-col items-center justify-center h-[220px] gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
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

const NoClassesAssigned = () => (
  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-12 text-center">
    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/30" />
    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-orange-200/30" />
    <div className="relative">
      <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 shadow-lg shadow-amber-500/30">
        <Users className="h-full w-full text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">No Classes Assigned Yet</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
        You don't have any classes assigned to you at the moment. 
        Please contact your administrator to get started.
      </p>
      <Button className="mt-6" variant="outline">
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact Admin
      </Button>
    </div>
  </div>
)

const WelcomeHeader = ({ 
  userName, 
  context, 
  onRefresh, 
  loading,
  classes,
  selectedClassId,
  onClassChange
}: { 
  userName: string
  context?: { year: string; term: string }
  onRefresh: () => void
  loading: boolean
  classes: Array<{ id: string; name: string; students: number }>
  selectedClassId: string | null
  onClassChange: (id: string) => void
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/30">

      {/* ========================================================= */}
      {/* DECORATIVE LAYER - NOW VISIBLE AND BEAUTIFUL              */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Glowing circles */}
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/30 blur-2xl mix-blend-overlay" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-white/25 blur-xl mix-blend-overlay" />
        <div className="absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-white/20 blur-lg mix-blend-overlay" />

        {/* Abstract shapes (blue-themed) */}
        <div className="absolute top-14 left-1/4 h-32 w-32 rotate-45 bg-blue-300/25 blur-md rounded-xl mix-blend-soft-light" />
        <div className="absolute bottom-10 right-1/4 h-28 w-28 -rotate-12 bg-sky-300/20 blur-md rounded-lg mix-blend-soft-light" />

        {/* Dot pattern */}
        <svg className="absolute inset-0 h-full w-full mix-blend-soft-light opacity-40">
          <pattern id="blue-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.45" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#blue-dots)" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT                                              */}
      {/* ========================================================= */}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        
        {/* Left side */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-200" />
            <span className="text-sm font-medium text-blue-100">
              {getGreeting()}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>

          <p className="flex items-center gap-2 text-blue-100">
            <Calendar className="h-4 w-4" />
            {context
              ? `${context.year} Academic Year - Term ${context.term.charAt(1)}`
              : "Loading..."}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          
          {/* Class Select */}
          {classes.length > 0 && (
            <select
              value={selectedClassId || ""}
              onChange={(e) => onClassChange(e.target.value)}
              disabled={loading}
              className="
                h-10 rounded-xl border-0 bg-white/15 backdrop-blur-sm
                px-4 text-sm font-medium text-white outline-none 
                focus:ring-2 focus:ring-white/30 disabled:opacity-50 
                cursor-pointer hover:bg-white/20 transition-colors
              "
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="text-gray-900">
                  {c.name} ({c.students} students)
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <Button 
            variant="secondary"
            size="sm" 
            onClick={onRefresh} 
            disabled={loading}
            className="h-10 bg-white/15 hover:bg-white/25 border-0 text-white backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  )
}


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
      
      if (!selectedClassId && dashboardData.selectedClass) {
        setSelectedClassId(dashboardData.selectedClass.id)
      }
    } catch (err: any) {
      const msg = err.message || "Failed to load dashboard data"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    fetchDashboard(classId)
  }

  if (!user) return null

  const breadcrumbs = [{ label: "Dashboard" }]
  const hasNoClasses = data && data.myClasses.length === 0

  // Custom colors for charts
  const chartColors = {
    primary: "#3b82f6",
    secondary: "#10b981", 
    tertiary: "#8b5cf6",
    quaternary: "#f59e0b"
  }

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs} pageTitle="Dashboard">
      <div className="space-y-6 pb-8">
        {/* Welcome Header */}
        <WelcomeHeader 
          userName={user.name}
          context={data?.context}
          onRefresh={() => fetchDashboard(selectedClassId || undefined)}
          loading={loading}
          classes={data?.myClasses || []}
          selectedClassId={selectedClassId}
          onClassChange={handleClassChange}
        />

        {/* No Classes State */}
        {hasNoClasses && !loading && <NoClassesAssigned />}

        {/* Dashboard Content */}
        {(!hasNoClasses || loading) && (
          <>
            {/* Key Metrics */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="My Students"
                value={data?.metrics.totalStudents.value || "-"}
                subtitle={data?.metrics.totalStudents.subtitle}
                icon={Users}
                trend={data?.metrics.totalStudents.trend}
                trendValue={data?.metrics.totalStudents.trendValue}
                color="blue"
                loading={loading}
                delay={0}
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
                delay={100}
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
                delay={200}
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
                delay={300}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Subject Performance */}
              <ChartCard 
                title="Subject Performance" 
                subtitle={data?.selectedClass ? `${data.selectedClass.name} averages` : "Class averages"}
                loading={loading}
                icon={BookOpen}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data?.charts.subjectPerformance || []} layout="vertical" margin={{ left: 10 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                    <YAxis dataKey="subject" type="category" stroke="#64748b" fontSize={11} width={70} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar dataKey="average" fill="url(#barGradient)" radius={[0, 6, 6, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Class Performance Trend */}
              <ChartCard 
                title="Performance Trend" 
                subtitle={data?.selectedClass ? `${data.selectedClass.name} progress` : "Class progress"}
                loading={loading}
                icon={TrendingUp}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data?.charts.termProgress || []}>
                    <defs>
                      <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Area type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaGradient1)" name="Average" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                    <Area type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={2.5} fill="url(#areaGradient2)" name="Pass Rate" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Grade Distribution */}
              <ChartCard 
                title="Grade Distribution" 
                subtitle={data?.selectedClass?.name || "Class"}
                loading={loading}
                icon={Users}
              >
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RechartsPie>
                      <defs>
                        {(data?.charts.gradeDistribution || []).map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie 
                        data={data?.charts.gradeDistribution || []} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={75} 
                        paddingAngle={4} 
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {(data?.charts.gradeDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieGradient${index})`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 w-full px-4">
                    {(data?.charts.gradeDistribution || []).map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600 font-medium">{item.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Quick Actions */}
            {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Enter Marks", icon: BookOpen, href: "/my-classes", color: "blue" },
                { label: "Add Comments", icon: MessageSquare, href: "/my-classes", color: "purple" },
                { label: "View Students", icon: Users, href: "/my-classes", color: "green" },
                { label: "Generate Reports", icon: TrendingUp, href: "/reports", color: "amber" }
              ].map((action, idx) => (
                <button
                  key={idx}
                  className={`group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-300 hover:shadow-lg hover:border-${action.color}-300 hover:-translate-y-0.5`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-${action.color}-100 p-2.5`}>
                      <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div> */}
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