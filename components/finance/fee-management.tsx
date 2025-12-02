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
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"

interface FeeManagementProps {
  userRole: string
}

// Mock fee structure data
const mockFeeStructures = [
  {
    id: "FEE001",
    name: "Tuition Fee - S.1",
    category: "Tuition",
    amount: 450000,
    class: "S.1",
    term: "Term 1",
    dueDate: "2024-02-15",
    status: "Active",
  },
  {
    id: "FEE002",
    name: "Lunch Fee - All Classes",
    category: "Lunch",
    amount: 125000,
    class: "All",
    term: "Term 1",
    dueDate: "2024-02-01",
    status: "Active",
  },
  {
    id: "FEE003",
    name: "Transport Fee - Day Students",
    category: "Transport",
    amount: 75000,
    class: "All",
    term: "Term 1",
    dueDate: "2024-02-01",
    status: "Active",
  },
]

export function FeeManagement({ userRole }: FeeManagementProps) {
  const [feeStructures, setFeeStructures] = useState(mockFeeStructures)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<(typeof mockFeeStructures)[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    class: "",
    term: "",
    dueDate: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddFee = () => {
    const newFee = {
      id: `FEE${String(feeStructures.length + 1).padStart(3, "0")}`,
      name: formData.name,
      category: formData.category,
      amount: Number.parseInt(formData.amount),
      class: formData.class,
      term: formData.term,
      dueDate: formData.dueDate,
      status: "Active",
    }
    setFeeStructures([...feeStructures, newFee])
    setFormData({ name: "", category: "", amount: "", class: "", term: "", dueDate: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditFee = () => {
    if (!selectedFee) return
    setFeeStructures(
      feeStructures.map((fee) =>
        fee.id === selectedFee.id
          ? {
              ...fee,
              name: formData.name,
              category: formData.category,
              amount: Number.parseInt(formData.amount),
              class: formData.class,
              term: formData.term,
              dueDate: formData.dueDate,
            }
          : fee,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedFee(null)
  }

  const openEditDialog = (fee: (typeof mockFeeStructures)[0]) => {
    setSelectedFee(fee)
    setFormData({
      name: fee.name,
      category: fee.category,
      amount: fee.amount.toString(),
      class: fee.class,
      term: fee.term,
      dueDate: fee.dueDate,
    })
    setIsEditDialogOpen(true)
  }

  const FeeForm = ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Fee Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter fee name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tuition">Tuition</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Activity">Activity</SelectItem>
              <SelectItem value="Uniform">Uniform</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (UGX)</label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Class</label>
          <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Classes</SelectItem>
              <SelectItem value="S.1">Senior 1</SelectItem>
              <SelectItem value="S.2">Senior 2</SelectItem>
              <SelectItem value="S.3">Senior 3</SelectItem>
              <SelectItem value="S.4">Senior 4</SelectItem>
              <SelectItem value="S.5">Senior 5</SelectItem>
              <SelectItem value="S.6">Senior 6</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Term</label>
          <Select value={formData.term} onValueChange={(value) => setFormData({ ...formData, term: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Term 1">Term 1</SelectItem>
              <SelectItem value="Term 2">Term 2</SelectItem>
              <SelectItem value="Term 3">Term 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Due Date</label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>{selectedFee ? "Update Fee" : "Add Fee"}</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Fee Structure Management</h3>
          <p className="text-sm text-muted-foreground">Configure and manage school fee structures</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Fee Structure</DialogTitle>
              <DialogDescription>Create a new fee structure for students.</DialogDescription>
            </DialogHeader>
            <FeeForm onSubmit={handleAddFee} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Fee Structures Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Structures ({feeStructures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructures.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.id}</TableCell>
                  <TableCell>{fee.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{fee.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                  <TableCell>{fee.class}</TableCell>
                  <TableCell>{fee.term}</TableCell>
                  <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="default">{fee.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(fee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Fee Structure</DialogTitle>
            <DialogDescription>Update the fee structure information.</DialogDescription>
          </DialogHeader>
          <FeeForm
            onSubmit={handleEditFee}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setSelectedFee(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeStructures.length}</div>
            <p className="text-xs text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Expected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(feeStructures.reduce((sum, fee) => sum + fee.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Per student per term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(feeStructures.map((fee) => fee.category)).size}</div>
            <p className="text-xs text-muted-foreground">Fee categories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
