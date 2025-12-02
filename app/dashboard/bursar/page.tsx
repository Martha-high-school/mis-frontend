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
  AlertCircle
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
  Line
} from "recharts"

import { dashboardService, BursarDashboardData } from "@/services/dashbaord.service"

// HELPER FUNCTIONS

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
              : `${entry.value}%`}
          </p>
        ))}
      </div>
    )
  }
  return null
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

  return (
    <MainLayout userRole={user.role} userName={user.name} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Finance Dashboard</h2>
            <p className="text-sm text-gray-500">
              Manage fee collection and financial records.
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

        {/* Row 1: Key Metrics (4 cards) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Expected"
            value={data ? formatCurrency(data.metrics.totalExpected.value as number) : "-"}
            subtitle={data?.metrics.totalExpected.subtitle}
            icon={CircleDollarSign}
            trend={data?.metrics.totalExpected.trend}
            trendValue={data?.metrics.totalExpected.trendValue}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Total Collected"
            value={data ? formatCurrency(data.metrics.totalCollected.value as number) : "-"}
            subtitle={data?.metrics.totalCollected.subtitle}
            icon={Wallet}
            trend={data?.metrics.totalCollected.trend}
            trendValue={data?.metrics.totalCollected.trendValue}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Outstanding"
            value={data ? formatCurrency(data.metrics.outstanding.value as number) : "-"}
            subtitle={data?.metrics.outstanding.subtitle}
            icon={AlertTriangle}
            trend={data?.metrics.outstanding.trend}
            trendValue={data?.metrics.outstanding.trendValue}
            color="red"
            loading={loading}
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
          />
        </div>

        {/* Row 2: Monthly Collection Trend & Payment Status */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly Collection Trend */}
          <ChartCard
            title="Termly Collection Trend"
            subtitle="Collected vs Expected (T1, T2, T3)"
            className="lg:col-span-2"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={data?.charts.termlyCollection || []}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorCollected)"
                  name="Collected"
                />

                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Expected"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>


          {/* Payment Status Donut */}
          <ChartCard title="Payment Status" subtitle="Student breakdown" loading={loading}>
            <ResponsiveContainer width="100%" height={180}>
              <RechartsPie>
                <Pie 
                  data={data?.charts.paymentStatus || []} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={3} 
                  dataKey="value"
                >
                  {(data?.charts.paymentStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {(data?.charts.paymentStatus || []).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">{item.value} students</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Row 3: Payment Methods & Top 3 Defaulters */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Methods */}
          <ChartCard title="Payment Methods" subtitle="Distribution" loading={loading}>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <RechartsPie>
                  <Pie 
                    data={data?.charts.paymentMethods || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={65} 
                    paddingAngle={3} 
                    dataKey="value"
                  >
                    {(data?.charts.paymentMethods || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {(data?.charts.paymentMethods || []).map((item) => {
                  const Icon = getMethodIcon(item.name)
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${item.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.value}% • {formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ChartCard>

          {/* Top 3 Defaulters */}
          <ChartCard
            title="Top Defaulters"
            subtitle="Highest outstanding balances"
            loading={loading}
          >
            <div className="space-y-3">
              {(data?.topDefaulters || []).map((student, i) => (
                <div key={student.id} className="flex items-center gap-4 rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200 text-sm font-bold text-red-700">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{student.student}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{student.class}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Last payment: {student.lastPayment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{formatCurrency(student.balance)}</p>
                    <Button variant="ghost" size="sm" className="text-xs h-6 mt-1">
                      <Send className="h-3 w-3 mr-1" /> Remind
                    </Button>
                  </div>
                </div>
              ))}
              {(!data?.topDefaulters || data.topDefaulters.length === 0) && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No defaulters found</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
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