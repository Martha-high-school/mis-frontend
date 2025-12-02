"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Phone, MapPin, Calendar, GraduationCap, DollarSign } from "lucide-react"

interface StudentDetailsProps {
  student: {
    id: string
    name: string
    class: string
    age: number
    gender: string
    guardianName: string
    guardianPhone: string
    address: string
    enrollmentDate: string
    status: string
    feeStatus: string
  }
}

export function StudentDetails({ student }: StudentDetailsProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Active: "default",
      Inactive: "secondary",
      Suspended: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getFeeStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Paid: "default",
      Pending: "destructive",
      Partial: "secondary",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{student.name}</h3>
          <p className="text-muted-foreground">Student ID: {student.id}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(student.status)}
          {getFeeStatusBadge(student.feeStatus)}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p className="text-sm">{student.age} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm">{student.gender}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Class
              </p>
              <p className="text-sm">{student.class}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Address
              </p>
              <p className="text-sm">{student.address}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Enrollment Date
              </p>
              <p className="text-sm">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guardian Name</p>
              <p className="text-sm">{student.guardianName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone Number
              </p>
              <p className="text-sm">{student.guardianPhone}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Fee Status
              </p>
              <div className="mt-1">{getFeeStatusBadge(student.feeStatus)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">85%</p>
              <p className="text-sm text-muted-foreground">Overall Average</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-secondary">12</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-accent">3rd</p>
              <p className="text-sm text-muted-foreground">Class Rank</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
