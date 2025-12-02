"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, Receipt, CreditCard, Download } from "lucide-react"

interface PaymentProcessingProps {
  userRole: string
}

// Mock payment data
const mockPayments = [
  {
    id: "PAY001",
    studentName: "John Mukasa",
    studentId: "STU001",
    amount: 450000,
    feeType: "Tuition Fee",
    method: "Bank Transfer",
    status: "Completed",
    date: "2024-01-15",
    receiptNo: "RCP001",
    reference: "BT123456789",
  },
  {
    id: "PAY002",
    studentName: "Sarah Namukasa",
    studentId: "STU002",
    amount: 125000,
    feeType: "Lunch Fee",
    method: "Mobile Money",
    status: "Pending",
    date: "2024-01-14",
    receiptNo: "",
    reference: "MM987654321",
  },
  {
    id: "PAY003",
    studentName: "David Okello",
    studentId: "STU003",
    amount: 450000,
    feeType: "Tuition Fee",
    method: "Cash",
    status: "Completed",
    date: "2024-01-13",
    receiptNo: "RCP002",
    reference: "CASH001",
  },
]

export function PaymentProcessing({ userRole }: PaymentProcessingProps) {
  const [payments, setPayments] = useState(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<(typeof mockPayments)[0] | null>(null)

  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    amount: "",
    feeType: "",
    method: "",
    reference: "",
  })

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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleProcessPayment = () => {
    const newPayment = {
      id: `PAY${String(payments.length + 1).padStart(3, "0")}`,
      studentName: "Student Name", // In real app, fetch from student ID
      studentId: paymentForm.studentId,
      amount: Number.parseInt(paymentForm.amount),
      feeType: paymentForm.feeType,
      method: paymentForm.method,
      status: "Completed",
      date: new Date().toISOString().split("T")[0],
      receiptNo: `RCP${String(payments.length + 1).padStart(3, "0")}`,
      reference: paymentForm.reference,
    }
    setPayments([newPayment, ...payments])
    setPaymentForm({ studentId: "", amount: "", feeType: "", method: "", reference: "" })
    setIsProcessDialogOpen(false)
  }

  const generateReceipt = (payment: (typeof mockPayments)[0]) => {
    // In a real app, this would generate and download a PDF receipt
    alert(`Receipt generated for ${payment.receiptNo}`)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Process New Payment</DialogTitle>
                <DialogDescription>Record a new payment from a student.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Student ID</label>
                    <Input
                      value={paymentForm.studentId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                      placeholder="Enter student ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (UGX)</label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fee Type</label>
                    <Select
                      value={paymentForm.feeType}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, feeType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                        <SelectItem value="Lunch Fee">Lunch Fee</SelectItem>
                        <SelectItem value="Transport Fee">Transport Fee</SelectItem>
                        <SelectItem value="Activity Fee">Activity Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select
                      value={paymentForm.method}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Number</label>
                  <Input
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleProcessPayment}>Process Payment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Records ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">{payment.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.feeType}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {payment.status === "Completed" && (
                        <Button variant="ghost" size="sm" onClick={() => generateReceipt(payment)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(5400000)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(40050000)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">356</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(160200000)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-red-600">{formatCurrency(10350000)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
