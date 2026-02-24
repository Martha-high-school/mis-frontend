"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Breadcrumb } from "./breadcrumb"
import { useAuth } from "@/contexts/auth-context"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface MainLayoutProps {
  children: ReactNode
  /**
   * @deprecated No longer needed — role is resolved from auth context.
   * Kept for backwards compatibility.
   */
  userRole?: "director" | "head_teacher" | "class_teacher" | "bursar"
  pageTitle: string
  userName?: string
  breadcrumbs?: BreadcrumbItem[]
  showBackButton?: boolean
}

export function MainLayout({
  children,
  userRole: userRoleProp,
  pageTitle,
  userName,
  breadcrumbs,
  showBackButton = false,
}: MainLayoutProps) {
  const { user } = useAuth()
  const role = userRoleProp || user?.role || "class_teacher"

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar userRole={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle} userName={userName} userRole={role} />
        {breadcrumbs && <Breadcrumb items={breadcrumbs} showBackButton={showBackButton} />}
        <main className="flex-1 overflow-auto p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}