"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Activity, Database, Download } from "lucide-react"
import { useState } from "react"

interface SystemAnalyticsProps {
  userRole: string
}

// Mock system analytics data
const systemUsage = [
  { month: "Jan", logins: 2450, activeUsers: 156, dataEntries: 1200 },
  { month: "Feb", logins: 2680, activeUsers: 162, dataEntries: 1350 },
  { month: "Mar", logins: 2890, activeUsers: 168, dataEntries: 1450 },
  { month: "Apr", logins: 2750, activeUsers: 165, dataEntries: 1380 },
  { month: "May", logins: 3100, activeUsers: 172, dataEntries: 1520 },
]

const userRoleDistribution = [
  { role: "Class Teachers", count: 45, color: "hsl(var(--primary))" },
  { role: "Students", count: 1234, color: "hsl(var(--secondary))" },
  { role: "Head Teachers", count: 8, color: "hsl(var(--accent))" },
  { role: "Directors", count: 3, color: "hsl(var(--muted))" },
  { role: "Bursars", count: 2, color: "hsl(var(--destructive))" },
]

const moduleUsage = [
  { module: "Student Management", usage: 95, sessions: 1250 },
  { module: "Academic Assessment", usage: 88, sessions: 980 },
  { module: "Financial Management", usage: 76, sessions: 650 },
  { module: "Reports & Analytics", usage: 82, sessions: 720 },
  { module: "User Management", usage: 45, sessions: 180 },
]

export function SystemAnalytics({ userRole }: SystemAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days")

  return (
    <div className="space-y-6">
      {/* Analytics Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">System Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">Monitor system usage and performance metrics</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,292</div>
            <p className="text-xs text-green-600">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,240</div>
            <p className="text-xs text-green-600">+12% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-green-600">Excellent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="logins" stroke="hsl(var(--primary))" name="Logins" />
                <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--secondary))" name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                >
                  {userRoleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Module Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="hsl(var(--primary))" name="Usage %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Module Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleUsage
                .sort((a, b) => b.sessions - a.sessions)
                .map((module) => (
                  <div key={module.module} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{module.module}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{module.sessions} sessions</p>
                      <p className="text-xs text-muted-foreground">{module.usage}% usage rate</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-sm font-medium">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Queries/min</span>
                <span className="text-sm font-medium">2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm font-medium text-green-600">0.02%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm font-medium">2.4 GB / 10 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Backup Status</span>
                <span className="text-sm font-medium text-green-600">Up to date</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
