"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, DollarSign, Users, Calendar } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 45000000, expenses: 12000000 },
  { month: "Feb", revenue: 52000000, expenses: 15000000 },
  { month: "Mar", revenue: 48000000, expenses: 13000000 },
  { month: "Apr", revenue: 61000000, expenses: 18000000 },
  { month: "May", revenue: 55000000, expenses: 16000000 },
  { month: "Jun", revenue: 67000000, expenses: 20000000 },
]

const feeBreakdown = [
  { name: "Tuition Fees", value: 65, color: "#3b82f6" },
  { name: "Boarding Fees", value: 20, color: "#10b981" },
  { name: "Activity Fees", value: 10, color: "#f59e0b" },
  { name: "Other Fees", value: 5, color: "#ef4444" },
]

const paymentStatus = [
  { student: "Alice Namukasa", class: "S.4A", amount: "UGX 850,000", status: "Paid", date: "2024-01-15" },
  { student: "John Okello", class: "S.3B", amount: "UGX 750,000", status: "Partial", date: "2024-01-10" },
  { student: "Grace Atim", class: "S.6A", amount: "UGX 950,000", status: "Pending", date: "2024-01-05" },
  { student: "David Mukasa", class: "S.2C", amount: "UGX 650,000", status: "Paid", date: "2024-01-20" },
  { student: "Sarah Nalwoga", class: "S.5B", amount: "UGX 800,000", status: "Overdue", date: "2023-12-15" },
]

export function FinancialReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="current-term">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-term">Current Term</SelectItem>
              <SelectItem value="last-term">Last Term</SelectItem>
              <SelectItem value="academic-year">Academic Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX 328M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX 42M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> enrollment growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => [`UGX ${((value as number) / 1000000).toFixed(1)}M`]} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure Breakdown</CardTitle>
            <CardDescription>Distribution of fee categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {feeBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payment Status</CardTitle>
          <CardDescription>Latest payment transactions and status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Class</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatus.map((payment, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{payment.student}</td>
                    <td className="p-2">{payment.class}</td>
                    <td className="p-2">{payment.amount}</td>
                    <td className="p-2">
                      <Badge
                        variant={
                          payment.status === "Paid"
                            ? "default"
                            : payment.status === "Partial"
                              ? "secondary"
                              : payment.status === "Pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-muted-foreground">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
