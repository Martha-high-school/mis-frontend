"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Breadcrumb } from "./breadcrumb"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface MainLayoutProps {
  children: ReactNode
  userRole: "director" | "head_teacher" | "class_teacher" | "bursar"
  pageTitle: string
  userName?: string
  breadcrumbs?: BreadcrumbItem[]
  showBackButton?: boolean
}

export function MainLayout({
  children,
  userRole,
  pageTitle,
  userName,
  breadcrumbs,
  showBackButton = false,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} userName={userName} userRole={userRole} />
        {breadcrumbs && <Breadcrumb items={breadcrumbs} showBackButton={showBackButton} />}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
