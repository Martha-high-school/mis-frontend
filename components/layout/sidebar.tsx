"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  ],
  "head_teacher": [
    { name: "Dashboard", href: "/dashboard/headteacher", icon: Home },
    { name: "Classes", href: "/classes", icon: GraduationCap },
    { name: "Students", href: "/students", icon: Users },
    { name: "Assessments", href: "/assessments", icon: BookOpen },
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()
  
  const role = userRole || user?.role
  const items = navigationItems[role as keyof typeof navigationItems] || []
  
  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        {/* Header - Fixed height of 73px to match the main header */}
        <div className="flex items-center justify-between px-4 h-[73px] border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
                <Image
                  src="/images/school-logo.png"
                  alt="Martah High School"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-sidebar-foreground leading-tight">
                  Martah High School
                </h2>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Management System
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 mx-auto">
              <Image
                src="/images/school-logo.png"
                alt="Martah High School"
                fill
                className="object-cover"
              />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)} 
            className={cn(
              "h-7 w-7 p-0 rounded-lg hover:bg-muted/80 transition-colors",
              collapsed && "absolute -right-3 top-[22px] bg-card border border-border shadow-sm hover:bg-muted z-10"
            )}
          >
            <ChevronLeft className={cn(
              "h-3.5 w-3.5 transition-transform duration-300", 
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const hasSubItems = "subItems" in item && item.subItems
              const isActive = item.href ? pathname === item.href : false
              const isSubItemActive = hasSubItems && item.subItems?.some((sub) => pathname === sub.href)
              const isExpanded = isMenuExpanded(item.name)

              // Items with sub-menus
              if (hasSubItems) {
                // Collapsed state - show popover on hover/click
                if (collapsed) {
                  return (
                    <Popover key={item.name}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-center px-2 h-10 rounded-lg transition-all duration-200",
                            isSubItemActive 
                              ? "bg-primary/10 text-primary hover:bg-primary/15" 
                              : "hover:bg-muted/80",
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                            isSubItemActive ? "bg-primary/15" : "bg-transparent"
                          )}>
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        side="right" 
                        align="start" 
                        className="w-48 p-2"
                        sideOffset={8}
                      >
                        <div className="mb-2 px-2 py-1">
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        </div>
                        <div className="space-y-0.5">
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon
                            const isSubActive = pathname === subItem.href
                            return (
                              <Link key={subItem.name} href={subItem.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start gap-2.5 h-9 text-sm rounded-lg transition-all duration-200",
                                    isSubActive 
                                      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15" 
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                  )}
                                >
                                  <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{subItem.name}</span>
                                </Button>
                              </Link>
                            )
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }

                // Expanded state - show accordion
                return (
                  <div key={item.name} className="space-y-0.5">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
                        isSubItemActive && "bg-primary/10 text-primary hover:bg-primary/15",
                        !isSubItemActive && "hover:bg-muted/80"
                      )}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                        isSubItemActive ? "bg-primary/15" : "bg-transparent"
                      )}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      <span className="text-sm flex-1 text-left font-medium">{item.name}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200 text-muted-foreground", 
                        isExpanded && "rotate-180"
                      )} />
                    </Button>
                    
                    {/* Submenu with animation */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-muted pl-3">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link key={subItem.name} href={subItem.href}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-2.5 h-9 text-sm rounded-lg transition-all duration-200",
                                  isSubActive 
                                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                )}
                              >
                                <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{subItem.name}</span>
                              </Button>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              // Regular items without sub-menus
              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link href={item.href!}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-center px-2 h-10 rounded-lg transition-all duration-200",
                            isActive 
                              ? "bg-primary/10 text-primary hover:bg-primary/15" 
                              : "hover:bg-muted/80",
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                            isActive ? "bg-primary/15" : "bg-transparent"
                          )}>
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link key={item.name} href={item.href!}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "hover:bg-muted/80",
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                      isActive ? "bg-primary/15" : "bg-transparent"
                    )}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <span className={cn(
                      "text-sm",
                      isActive && "font-medium"
                    )}>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Role Badge & Logout */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* Role Badge */}
            {/* <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 border border-blue-200/50 dark:border-blue-800/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 capitalize relative">
                {role?.replace(/_/g, " ") || "User"}
              </p>
              <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-1 relative">
                Empowering to Excel
              </p>
            </div> */}
            
            {/* Logout Button */}
            <Button 
              onClick={handleLogout} 
              variant="outline"
              size="sm" 
              className="w-full h-9 gap-2 text-xs font-medium border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out
            </Button>
          </div>
        )}

        {/* Collapsed state logout */}
        {collapsed && (
          <div className="p-2 border-t border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost"
                  size="sm" 
                  className="w-full h-10 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}