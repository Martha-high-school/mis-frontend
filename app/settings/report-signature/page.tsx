"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { MainLayout } from '@/components/layout/main-layout'
import { SignatureUpload } from '@/components/signatures/signature-upload'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SignatureSettingsContent() {

 const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Setting" },
    { label: "Report Signature" }
  ]

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            {/* <h1 className="text-3xl font-bold tracking-tight">Signature Settings</h1> */}
            <p className="text-muted-foreground">
              Manage your digital signature for report cards
            </p>
          </div>
        </div>

        <SignatureUpload />
      </div>
    </MainLayout>
  )
}

export default function SignatureSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["head_teacher", "class_teacher"]}>
      <SignatureSettingsContent />
    </ProtectedRoute>
  )
}