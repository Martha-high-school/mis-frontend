"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, FileText, TrendingUp, DollarSign } from "lucide-react"

interface FinancialReportsProps {
  userRole: string
}

// Mock financial report data
const monthlyRevenue = [
  { month: "Jan", revenue: 45000000, expenses: 12000000, net: 33000000 },
  { month: "Feb", revenue: 48000000, expenses: 13000000, net: 35000000 },
  { month: "Mar", revenue: 52000000, expenses: 14000000, net: 38000000 },
  { month: "Apr", revenue: 49000000, expenses: 13500000, net: 35500000 },
  { month: "May", revenue: 55000000, expenses: 15000000, net: 40000000 },
]

const feeCollectionByCategory = [
  { name: "Tuition Fees", value: 189000000, color: "hsl(var(--primary))" },
  { name: "Lunch Fees", value: 28350000, color: "hsl(var(--secondary))" },
  { name: "Transport Fees", value: 14175000, color: "hsl(var(--accent))" },
  { name: "Activity Fees", value: 6075000, color: "hsl(var(--muted))" },
]

const outstandingByClass = [
  { class: "S.1", outstanding: 5400000, students: 18 },
  { class: "S.2", outstanding: 4950000, students: 15 },
  { class: "S.3", outstanding: 3600000, students: 12 },
  { class: "S.4", outstanding: 4500000, students: 14 },
  { class: "S.5", outstanding: 2700000, students: 8 },
  { class: "S.6", outstanding: 1800000, students: 6 },
]

export function FinancialReports({ userRole }: FinancialReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-term")
  const [selectedReport, setSelectedReport] = useState("revenue")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const generateReport = (reportType: string) => {
    // In a real app, this would generate and download the report
    alert(`Generating ${reportType} report...`)
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-term">Current Term</SelectItem>
              <SelectItem value="last-term">Last Term</SelectItem>
              <SelectItem value="academic-year">Academic Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Report</SelectItem>
              <SelectItem value="collection">Collection Report</SelectItem>
              <SelectItem value="outstanding">Outstanding Report</SelectItem>
              <SelectItem value="expenses">Expenses Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => generateReport("excel")}>
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(249000000)}</div>
            <p className="text-xs text-green-600">+15% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.5%</div>
            <p className="text-xs text-green-600">+3.2% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(22950000)}</div>
            <p className="text-xs text-red-600">73 students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(181500000)}</div>
            <p className="text-xs text-green-600">+18% from last term</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeCollectionByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {feeCollectionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Fees by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Fees by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outstandingByClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip
                formatter={(value, name) => [
                  name === "outstanding" ? formatCurrency(Number(value)) : value,
                  name === "outstanding" ? "Outstanding Amount" : "Students",
                ]}
              />
              <Bar dataKey="outstanding" fill="hsl(var(--destructive))" name="Outstanding Amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeCollectionByCategory.map((category) => (
                <div key={category.name} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(category.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((category.value / feeCollectionByCategory.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(
                        1,
                      )}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expected Revenue</span>
                <span className="text-sm font-medium">{formatCurrency(270000000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Collected Revenue</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(237600000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Outstanding Amount</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(32400000)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Collection Rate</span>
                <span className="text-sm font-medium">88.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
