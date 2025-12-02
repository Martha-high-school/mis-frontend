"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react"

interface FinanceOverviewProps {
  userRole: string
}

// Mock financial data
const recentTransactions = [
  {
    id: "TXN001",
    studentName: "John Mukasa",
    studentId: "STU001",
    amount: 450000,
    type: "Tuition Fee",
    status: "Completed",
    date: "2024-01-15",
    method: "Bank Transfer",
  },
  {
    id: "TXN002",
    studentName: "Sarah Namukasa",
    studentId: "STU002",
    amount: 125000,
    type: "Lunch Fee",
    status: "Pending",
    date: "2024-01-14",
    method: "Mobile Money",
  },
  {
    id: "TXN003",
    studentName: "David Okello",
    studentId: "STU003",
    amount: 450000,
    type: "Tuition Fee",
    status: "Completed",
    date: "2024-01-13",
    method: "Cash",
  },
]

const feeCollectionByClass = [
  { class: "S.1", collected: 85, target: 100, amount: 38250000 },
  { class: "S.2", collected: 78, target: 100, amount: 35100000 },
  { class: "S.3", collected: 92, target: 100, amount: 41400000 },
  { class: "S.4", collected: 88, target: 100, amount: 39600000 },
  { class: "S.5", collected: 95, target: 100, amount: 42750000 },
  { class: "S.6", collected: 90, target: 100, amount: 40500000 },
]

export function FinanceOverview({ userRole }: FinanceOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Completed: "default",
      Pending: "secondary",
      Failed: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(237600000)}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5% from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(32400000)}</div>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              148 students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts Issued</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,086</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeCollectionByClass.map((cls) => (
              <div key={cls.class} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="font-medium w-12">{cls.class}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(cls.amount)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{cls.collected}%</span>
                  </div>
                </div>
                <Progress value={cls.collected} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.studentName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.method}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: "Bank Transfer", percentage: 45, amount: 106920000 },
                { method: "Mobile Money", percentage: 35, amount: 83160000 },
                { method: "Cash", percentage: 20, amount: 47520000 },
              ].map((method) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{method.method}</span>
                    <span className="text-sm text-muted-foreground">
                      {method.percentage}% ({formatCurrency(method.amount)})
                    </span>
                  </div>
                  <Progress value={method.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Tuition Fees", amount: 189000000, percentage: 80 },
                { category: "Lunch Fees", amount: 28350000, percentage: 12 },
                { category: "Transport Fees", amount: 14175000, percentage: 6 },
                { category: "Activity Fees", amount: 6075000, percentage: 2 },
              ].map((category) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
