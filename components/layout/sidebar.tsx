"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  Home,
  UserCheck,
  FileText,
  LogOut,
  ChevronDown,
  Calendar,
  Pen
} from "lucide-react"

interface SidebarProps {
  userRole: "director" | "head_teacher" | "class_teacher" | "bursar"
}

const navigationItems = {
   "director": [
    { name: "Dashboard", href: "/dashboard/director", icon: Home },
    { name: "User Management", href: "/director/user-management", icon: UserCheck },
    // { name: "Students", href: "/students", icon: Users },
    // { name: "Classes", href: "/classes", icon: GraduationCap },
    // { name: "Assessments", href: "/assessments", icon: BookOpen },
    // { name: "Finance", href: "/finance", icon: DollarSign },
    // { name: "Reports", href: "/reports", icon: BarChart3 },
    // { name: "Settings", href: "/settings", icon: Settings },
  ],
  "head_teacher": [
    { name: "Dashboard", href: "/dashboard/headteacher", icon: Home },
    { name: "Classes", href: "/classes", icon: GraduationCap },
    // { name: "Teachers", href: "/teachers", icon: Users },
    { name: "Students", href: "/students", icon: Users },
    { name: "Assessments", href: "/assessments", icon: BookOpen },
    // { name: "Report Settings", href: "/report-settings", icon: Settings },
    { name: "Report Generator", href: "/reports", icon: BarChart3 },
    {
      name: "Settings",
      icon: Settings,
      subItems: [
        { name: "Report Settings", href: "/settings/report-settings", icon: FileText },
        { name: "Academic Year", href: "/settings/academic-year", icon: Calendar },
        { name: "Report Signature", href: "/settings/report-signature", icon: Pen },
      ],
    },
  ],
  "class_teacher": [
    { name: "Dashboard", href: "/dashboard/classteacher", icon: Home },
    {
      name: "My Classes",
      icon: GraduationCap,
      subItems: [
        { name: "All classes", href: "/my-classes", icon: Calendar },
        { name: "Current Class List", href: "/my-classes/promotion-management", icon: FileText },
      ],
    },
    {
      name: "Settings",
      icon: Settings,
      subItems: [
        { name: "Report Settings", href: "/settings/report-settings", icon: FileText },
        { name: "Report Signature", href: "/settings/report-signature", icon: Pen },
      ],
    },
  ],
  "bursar": [
    { name: "Dashboard", href: "/dashboard/bursar", icon: Home },
    { name: "Fee Management", href: "/fee", icon: DollarSign },
    { name: "Financial Reports", href: "/finance", icon: BarChart3 },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSettings, setExpandedSettings] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()
  
  // Use userRole from props if available, otherwise fall back to auth context
  const role = userRole || user?.role
  const items = navigationItems[role as keyof typeof navigationItems] || []
  
  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Image
              src="/images/school-logo.png"
              alt="Martah High School"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Martah High School</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Management System</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const hasSubItems = "subItems" in item && item.subItems
            const isActive = item.href ? pathname === item.href : false
            const isSubItemActive = hasSubItems && item.subItems?.some((sub) => pathname === sub.href)

            if (hasSubItems) {
              return (
                <div key={item.name}>
                  <Button
                    variant={isSubItemActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      collapsed && "justify-center px-2",
                      isSubItemActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() => !collapsed && setExpandedSettings(!expandedSettings)}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.name}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSettings && "rotate-180")} />
                      </>
                    )}
                  </Button>
                  {!collapsed && expandedSettings && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-sidebar-border pl-2">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link key={subItem.name} href={subItem.href}>
                            <Button
                              variant={isSubActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 h-9 text-sm",
                                isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                              )}
                            >
                              <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{subItem.name}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.name} href={item.href!}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Role Badge & Logout */}
     {!collapsed && (
  <div className="p-4 border-t border-sidebar-border space-y-3">
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
      <p className="text-xs font-medium text-blue-800 dark:text-blue-200 capitalize">
        {role?.replace(/_/g, " ") || "User"}
      </p>
      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Empowering to Excel</p>
    </div>
    <Button 
      onClick={handleLogout} 
      variant="destructive" 
      size="sm" 
      className="w-full h-8 gap-2 text-xs"
    >
      <LogOut className="h-3.5 w-3.5" />
      Log Out
    </Button>
  </div>
)}
    </div>
  )
}