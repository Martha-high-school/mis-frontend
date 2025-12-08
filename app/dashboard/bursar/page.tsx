"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Building,
  Send,
  Banknote,
  Smartphone,
  CircleDollarSign,
  CreditCard,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  Receipt,
  PiggyBank,
  BadgeDollarSign,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  TrendingDown,
  BarChart3,
  Activity,
  Eye,
  Filter,
} from "lucide-react"
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
} from "recharts"

import { dashboardService, BursarDashboardData } from "@/services/dashbaord.service"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `UGX ${(amount / 1000000000).toFixed(2)}B`
  }
  if (amount >= 1000000) {
    return `UGX ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `UGX ${(amount / 1000).toFixed(0)}K`
  }
  return `UGX ${amount.toLocaleString()}`
}

const getMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'bank transfer': return Building
    case 'mobile money': return Smartphone
    case 'cash': return Banknote
    default: return CreditCard
  }
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
  delay = 0,
  progress,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "blue" | "green" | "amber" | "red" | "purple" | "pink" | "indigo" | "cyan" | "emerald"
  loading?: boolean
  delay?: number
  progress?: number
}) => {
  const colorConfig: Record<string, { gradient: string; bg: string; border: string; iconBg: string; ring: string; progressBg: string }> = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      border: "border-blue-200/60",
      iconBg: "bg-blue-500",
      ring: "ring-blue-500/20",
      progressBg: "bg-blue-500"
    },
    green: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20",
      progressBg: "bg-emerald-500"
    },
    emerald: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-gradient-to-br from-emerald-50 to-teal-100/50",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20",
      progressBg: "bg-emerald-500"
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      border: "border-amber-200/60",
      iconBg: "bg-amber-500",
      ring: "ring-amber-500/20",
      progressBg: "bg-amber-500"
    },
    red: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-gradient-to-br from-red-50 to-rose-100/50",
      border: "border-red-200/60",
      iconBg: "bg-red-500",
      ring: "ring-red-500/20",
      progressBg: "bg-red-500"
    },
    purple: {
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
      border: "border-violet-200/60",
      iconBg: "bg-violet-500",
      ring: "ring-violet-500/20",
      progressBg: "bg-violet-500"
    },
    pink: {
      gradient: "from-pink-500 to-pink-600",
      bg: "bg-gradient-to-br from-pink-50 to-pink-100/50",
      border: "border-pink-200/60",
      iconBg: "bg-pink-500",
      ring: "ring-pink-500/20",
      progressBg: "bg-pink-500"
    },
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
      border: "border-indigo-200/60",
      iconBg: "bg-indigo-500",
      ring: "ring-indigo-500/20",
      progressBg: "bg-indigo-500"
    },
    cyan: {
      gradient: "from-cyan-500 to-cyan-600",
      bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
      border: "border-cyan-200/60",
      iconBg: "bg-cyan-500",
      ring: "ring-cyan-500/20",
      progressBg: "bg-cyan-500"
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
        <div className="space-y-3 flex-1">
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
          {progress !== undefined && !loading && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Collection Rate</span>
                <span className="font-semibold text-gray-700">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${config.progressBg} rounded-full transition-all duration-1000`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {trend && trendValue && !loading && !progress && (
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
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
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
                : `${entry.value}%`}
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white shadow-xl shadow-emerald-500/25">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/20" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-white/10" />
        {/* Money pattern */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="money-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#money-pattern)" />
        </svg>
      </div>
      
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-200">{getGreeting()}, Bursar</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-emerald-100 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {context ? `${context.year} Academic Year - Term ${context.term.charAt(1)}` : "Loading..."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            size="sm" 
            onClick={onRefresh} 
            disabled={loading}
            className="h-10 bg-white/15 hover:bg-white/25 border-0 text-white backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

const DefaulterCard = ({ 
  student, 
  className: studentClass, 
  balance, 
  lastPayment, 
  rank 
}: { 
  student: string
  className: string
  balance: number
  lastPayment: string
  rank: number
}) => (
  <div className="group flex items-center gap-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 p-4 transition-all duration-300 hover:shadow-md hover:border-red-200">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-red-500/30">
      #{rank}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900 truncate">{student}</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{studentClass}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Last payment: {lastPayment}
      </p>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-red-600">{formatCurrency(balance)}</p>
      <Button variant="ghost" size="sm" className="text-xs h-7 mt-1 text-red-600 hover:text-red-700 hover:bg-red-100">
        <Send className="h-3 w-3 mr-1" /> Remind
      </Button>
    </div>
  </div>
)

// ============================================================================
// BURSAR DASHBOARD CONTENT
// ============================================================================

function BursarDashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) 
  const [data, setData] = useState<BursarDashboardData | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await dashboardService.getBursarDashboard()
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

  // Calculate collection rate
  const collectionRate = data?.metrics.totalExpected.value && data?.metrics.totalCollected.value
    ? Math.round((data.metrics.totalCollected.value as number / (data.metrics.totalExpected.value as number)) * 100)
    : 0

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
            title="Total Expected"
            value={data ? formatCurrency(data.metrics.totalExpected.value as number) : "-"}
            subtitle={data?.metrics.totalExpected.subtitle}
            icon={CircleDollarSign}
            trend={data?.metrics.totalExpected.trend}
            trendValue={data?.metrics.totalExpected.trendValue}
            color="blue"
            loading={loading}
            delay={0}
          />
          <MetricCard
            title="Total Collected"
            value={data ? formatCurrency(data.metrics.totalCollected.value as number) : "-"}
            subtitle={data?.metrics.totalCollected.subtitle}
            icon={Wallet}
            color="emerald"
            loading={loading}
            delay={100}
            progress={collectionRate}
          />
          <MetricCard
            title="Outstanding Balance"
            value={data ? formatCurrency(data.metrics.outstanding.value as number) : "-"}
            subtitle={data?.metrics.outstanding.subtitle}
            icon={AlertTriangle}
            trend={data?.metrics.outstanding.trend}
            trendValue={data?.metrics.outstanding.trendValue}
            color="red"
            loading={loading}
            delay={200}
          />
          <MetricCard
            title="Today's Collection"
            value={data ? formatCurrency(data.metrics.todayCollection.value as number) : "-"}
            subtitle={data?.metrics.todayCollection.subtitle}
            icon={TrendingUp}
            trend={data?.metrics.todayCollection.trend}
            trendValue={data?.metrics.todayCollection.trendValue}
            color="purple"
            loading={loading}
            delay={300}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Termly Collection Trend */}
          <ChartCard
            title="Collection Trend"
            subtitle="Collected vs Expected by term"
            className="lg:col-span-2"
            loading={loading}
            icon={TrendingUp}
          >
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data?.charts.termlyCollection || []}>
                <defs>
                  <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#collectedGradient)"
                  name="Collected"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  name="Expected"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Payment Status */}
          <ChartCard 
            title="Payment Status" 
            subtitle="Student breakdown"
            loading={loading}
            icon={Users}
          >
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <defs>
                    {(data?.charts.paymentStatus || []).map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`statusGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie 
                    data={data?.charts.paymentStatus || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={75} 
                    paddingAngle={4} 
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(data?.charts.paymentStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#statusGradient${index})`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2 w-full px-2">
                {(data?.charts.paymentStatus || []).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.value} students</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Methods */}
          <ChartCard 
            title="Payment Methods" 
            subtitle="Distribution by method"
            loading={loading}
            icon={CreditCard}
          >
            <div className="flex items-center gap-6">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <defs>
                      {(data?.charts.paymentMethods || []).map((entry, index) => (
                        <linearGradient key={`method-gradient-${index}`} id={`methodGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie 
                      data={data?.charts.paymentMethods || []} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={70} 
                      paddingAngle={4} 
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {(data?.charts.paymentMethods || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#methodGradient${index})`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                {(data?.charts.paymentMethods || []).map((item) => {
                  const Icon = getMethodIcon(item.name)
                  return (
                    <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="rounded-xl p-2.5 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                        <Icon className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.value}% • {formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ChartCard>

          {/* Top Defaulters */}
          <ChartCard
            title="Top Defaulters"
            subtitle="Highest outstanding balances"
            loading={loading}
            icon={AlertTriangle}
            action={
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {(data?.topDefaulters || []).slice(0, 3).map((defaulter, i) => (
                <DefaulterCard 
                  key={defaulter.id}
                  student={defaulter.student}
                  className={defaulter.class}
                  balance={defaulter.balance}
                  lastPayment={defaulter.lastPayment}
                  rank={i + 1}
                />
              ))}
              {(!data?.topDefaulters || data.topDefaulters.length === 0) && !loading && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900">No defaulters found</p>
                  <p className="text-xs text-gray-500 mt-1">All students are up to date!</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Record Payment", icon: Receipt, description: "Log new fee payment", color: "bg-emerald-500" },
            { label: "Fee Management", icon: BadgeDollarSign, description: "Manage fee structures", color: "bg-blue-500" },
            { label: "Financial Reports", icon: FileText, description: "Generate reports", color: "bg-violet-500" },
            { label: "Send Reminders", icon: Send, description: "Notify defaulters", color: "bg-amber-500" },
          ].map((action, idx) => (
            <button
              key={idx}
              className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1"
            >
              <div className={`rounded-xl ${action.color} p-3 mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                <action.icon className="h-5 w-5 text-white" />
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

export default function BursarDashboardPage() {
  return (
    <ProtectedRoute>
      <BursarDashboardContent />
    </ProtectedRoute>
  )
}