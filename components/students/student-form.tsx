"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

interface StudentFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function StudentForm({ initialData, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    class: initialData?.class || "",
    guardianName: initialData?.guardianName || "",
    guardianPhone: initialData?.guardianPhone || "",
    address: initialData?.address || "",
    enrollmentDate: initialData?.enrollmentDate || new Date().toISOString().split("T")[0],
    feeStatus: initialData?.feeStatus || "Pending",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const classes = [
    "S.1 East",
    "S.1 West",
    "S.1 North",
    "S.1 South",
    "S.2 East",
    "S.2 West",
    "S.2 North",
    "S.2 South",
    "S.3 East",
    "S.3 West",
    "S.3 North",
    "S.3 South",
    "S.4 East",
    "S.4 West",
    "S.4 North",
    "S.4 South",
    "S.5 East",
    "S.5 West",
    "S.5 North",
    "S.5 South",
    "S.6 East",
    "S.6 West",
    "S.6 North",
    "S.6 South",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!initialData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">System Student Number</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                A unique student number will be automatically generated in the format MHS{new Date().getFullYear()}XXX
                when you save this student.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialData && (
              <div className="space-y-2">
                <Label>Student ID</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-sm">
                    {initialData.id}
                  </Badge>
                  <span className="text-xs text-muted-foreground">System generated</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="10"
                  max="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number.parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Initial Class Assignment *</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select initial class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Student's home address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name *</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent/Guardian full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone *</Label>
              <Input
                id="guardianPhone"
                type="tel"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+256 700 123 456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeStatus">Initial Fee Status</Label>
              <Select
                value={formData.feeStatus}
                onValueChange={(value) => setFormData({ ...formData, feeStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Student" : "Add Student"}</Button>
      </div>
    </form>
  )
}
