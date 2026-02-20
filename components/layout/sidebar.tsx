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
import { usePermissions } from "@/contexts/permission-context"
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
  Pen,
  Shield,
  type LucideIcon,
} from "lucide-react"

// ============================================================================
// ICON MAP — maps icon names from backend to Lucide components
// ============================================================================

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: Home,
  Home: Home,
  UserCheck: UserCheck,
  Users: Users,
  Shield: Shield,
  GraduationCap: GraduationCap,
  School: GraduationCap,
  BookOpen: BookOpen,
  DollarSign: DollarSign,
  BarChart3: BarChart3,
  TrendingUp: BarChart3,
  Settings: Settings,
  FileText: FileText,
  ClipboardList: FileText,
  Calendar: Calendar,
  Pen: Pen,
  ArrowUpDown: Users,
  Printer: FileText,
  FileSignature: Pen,
}

function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Home
}

// ============================================================================
// SUB-ITEMS CONFIG — modules that have sub-navigation
// Some modules expand into sub-items (e.g. settings, classes for class teacher)
// This maps module names to their sub-items with required permissions.
// ============================================================================

interface SubItem {
  name: string
  href: string
  icon: LucideIcon
  permissions?: string[] // user needs ANY of these to see the sub-item
}

interface SubItemConfig {
  subItems: SubItem[]
  requiredPermissions?: string[] // at least one sub-item must be visible
}

const moduleSubItems: Record<string, SubItemConfig> = {
  // Settings is a virtual module that aggregates items from different modules
  settings: {
    subItems: [
      {
        name: "Report Settings",
        href: "/settings/report-settings",
        icon: FileText,
        permissions: ["reports.manage_settings", "reports.manage_grade_ranges"],
      },
      {
        name: "Academic Year",
        href: "/settings/academic-year",
        icon: Calendar,
        permissions: ["academic_years.create", "academic_years.set_current", "academic_years.configure_terms"],
      },
      {
        name: "Report Signature",
        href: "/settings/report-signature",
        icon: Pen,
        permissions: ["signatures.manage"],
      },
      {
        name: "Permissions",
        href: "/settings/permissions",
        icon: Shield,
        permissions: ["permissions.view", "permissions.assign"],
      },
    ],
  },
}

// ============================================================================
// SIDEBAR NAVIGATION BUILDER
// Builds navigation from the permission context's sidebar array
// ============================================================================

interface NavItem {
  name: string
  href?: string
  icon: LucideIcon
  module: string
  subItems?: {
    name: string
    href: string
    icon: LucideIcon
  }[]
}

function buildNavigation(
  sidebar: { module: string; label: string; icon: string; path: string; permissions: string[] }[],
  userPermissions: Set<string>,
  userRole: string
): NavItem[] {
  const nav: NavItem[] = []
  const isDirector = userRole === "director"

  // Map dashboard to the correct role-specific path
  const getDashboardPath = () => {
    switch (userRole) {
      case "director": return "/dashboard/director"
      case "head_teacher": return "/dashboard/headteacher"
      case "class_teacher": return "/dashboard/classteacher"
      case "bursar": return "/dashboard/bursar"
      default: return "/dashboard"
    }
  }

  // Track which special modules we've seen
  const settingsSubItemsVisible: SubItem[] = []

  for (const item of sidebar) {
    const Icon = getIcon(item.icon)

    // Dashboard — use role-specific path
    if (item.module === "dashboard") {
      nav.push({
        name: "Dashboard",
        href: getDashboardPath(),
        icon: Icon,
        module: item.module,
      })
      continue
    }

    // User management
    if (item.module === "users") {
      nav.push({
        name: item.label,
        href: "/director/user-management",
        icon: UserCheck,
        module: item.module,
      })
      continue
    }

    // Permissions module — add to settings sub-items instead of top-level
    if (item.module === "permissions") {
      // Will be included via settings sub-items
      continue
    }

    // Classes
    if (item.module === "classes") {
      // Class teachers see sub-items, others see a direct link
      const hasOwnClasses = userPermissions.has("classes.view_own")
      const hasAllClasses = userPermissions.has("classes.view")
      const hasPromotions = userPermissions.has("promotions.view")

      if (hasOwnClasses && !hasAllClasses) {
        // Class teacher style — sub-items
        const subItems: { name: string; href: string; icon: LucideIcon }[] = [
          { name: "All Classes", href: "/my-classes", icon: Calendar },
        ]
        if (hasPromotions) {
          subItems.push({ name: "Current Class List", href: "/my-classes/promotion-management", icon: FileText })
        }
        nav.push({
          name: "My Classes",
          icon: GraduationCap,
          module: item.module,
          subItems,
        })
      } else {
        nav.push({
          name: item.label,
          href: item.path,
          icon: GraduationCap,
          module: item.module,
        })
      }
      continue
    }

    // Students
    if (item.module === "students") {
      nav.push({
        name: item.label,
        href: "/students",
        icon: Users,
        module: item.module,
      })
      continue
    }

    // Reports module
    if (item.module === "reports" || item.module === "report_cards") {
      // Only add once
      if (!nav.some(n => n.module === "reports")) {
        nav.push({
          name: "Report Generator",
          href: "/reports",
          icon: BarChart3,
          module: "reports",
        })
      }
      continue
    }

    // Fees
    if (item.module === "fees") {
      nav.push({
        name: "Fee Management",
        href: "/fee",
        icon: DollarSign,
        module: item.module,
      })

      // Also add financial reports if user can view reports
      if (userPermissions.has("fees.view_reports")) {
        if (!nav.some(n => n.name === "Financial Reports")) {
          nav.push({
            name: "Financial Reports",
            href: "/finance",
            icon: BarChart3,
            module: "fees_reports",
          })
        }
      }
      continue
    }

    // Signatures — add to settings
    if (item.module === "signatures") {
      continue
    }

    // Academics — skip as a top-level item (managed within classes)
    if (item.module === "academics") {
      continue
    }

    // Academic years — skip (goes into settings)
    if (item.module === "academic_years") {
      continue
    }

    // Promotions — skip (handled within classes sub-items)
    if (item.module === "promotions") {
      continue
    }

    // PDF reports — skip (handled within report generator)
    if (item.module === "pdf_reports") {
      continue
    }

    // Fallback: add as direct link
    nav.push({
      name: item.label,
      href: item.path,
      icon: Icon,
      module: item.module,
    })
  }

  // Build Settings sub-items based on user permissions
  const settingsConfig = moduleSubItems.settings
  const visibleSettingsSubItems: { name: string; href: string; icon: LucideIcon }[] = []

  for (const sub of settingsConfig.subItems) {
    if (isDirector) {
      visibleSettingsSubItems.push({ name: sub.name, href: sub.href, icon: sub.icon })
      continue
    }
    if (!sub.permissions || sub.permissions.length === 0) {
      visibleSettingsSubItems.push({ name: sub.name, href: sub.href, icon: sub.icon })
      continue
    }
    // User needs ANY of the listed permissions
    if (sub.permissions.some(p => userPermissions.has(p))) {
      visibleSettingsSubItems.push({ name: sub.name, href: sub.href, icon: sub.icon })
    }
  }

  if (visibleSettingsSubItems.length > 0) {
    nav.push({
      name: "Settings",
      icon: Settings,
      module: "settings",
      subItems: visibleSettingsSubItems,
    })
  }

  return nav
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  userRole?: "director" | "head_teacher" | "class_teacher" | "bursar"
}

export function Sidebar({ userRole: userRoleProp }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { sidebar, permissions, isLoading } = usePermissions()
  const router = useRouter()

  const role = userRoleProp || user?.role || "class_teacher"
  
  // Build navigation items from permission context
  const items = buildNavigation(sidebar, permissions, role)

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
          {isLoading ? (
            <div className="flex flex-col gap-2 px-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const hasSubItems = !!item.subItems && item.subItems.length > 0
                const isActive = item.href ? pathname === item.href : false
                const isSubItemActive = hasSubItems && item.subItems?.some((sub) => pathname === sub.href)
                const isExpanded = isMenuExpanded(item.name)

                // Items with sub-menus
                if (hasSubItems) {
                  // Collapsed state - show popover
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
          )}
        </ScrollArea>

        {/* User Role Badge & Logout */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border space-y-3">
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