"use client"

import { useEffect, useState } from "react"
import { Bell, Search, User, Mail, Shield, Activity, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserData {
  email?: string
  firstName?: string
  lastName?: string
  name?: string
  role?: string
  status?: string
  isDirector?: boolean
}

interface HeaderProps {
  title: string
  userName?: string
  userRole?: string
}

export function Header({ title, userName, userRole }: HeaderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUserData(parsed)
      } catch (e) {
        console.error("Failed to parse user data from localStorage")
      }
    }
  }, [])

  // Get display name and initials
  const displayName = userData?.name || userName || "User"
  const initials = userData?.firstName && userData?.lastName
    ? `${userData.firstName[0]}${userData.lastName[0]}`
    : displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

  const displayRole = userData?.role || userRole || "User"
  const formattedRole = displayRole.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Status badge color
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-500"
      case "INACTIVE":
        return "bg-slate-400"
      case "PENDING":
        return "bg-amber-500"
      default:
        return "bg-emerald-500"
    }
  }

  return (
    <header className="flex items-center justify-between px-6 h-[73px] bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search..." 
            className="pl-10 w-64 h-9 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all duration-200" 
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full hover:bg-muted/80">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 rounded-full text-[10px] font-medium flex items-center justify-center text-white shadow-sm">
            3
          </span>
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative flex items-center gap-3 h-10 px-2 pr-3 rounded-full hover:bg-muted/80 transition-colors"
            >
              {/* Avatar with initials */}
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-semibold text-white">{initials}</span>
                </div>
                {/* Online indicator */}
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 ${getStatusColor(userData?.status)} rounded-full border-2 border-card`} />
              </div>
              {/* Name preview */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {userData?.firstName || displayName.split(" ")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {formattedRole}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-72 p-0" align="end" forceMount>
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-border">
              <div className="flex items-start gap-3">
                {/* Large Avatar */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{userData?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      userData?.status === "ACTIVE" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor(userData?.status)}`} />
                      {userData?.status || "Active"}
                    </span>
                    {userData?.isDirector && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        Director
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="p-2">
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Account Details
              </DropdownMenuLabel>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium text-foreground truncate">{userData?.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground">Role</p>
                    <p className="text-sm font-medium text-foreground">{formattedRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground">Status</p>
                    <p className="text-sm font-medium text-foreground">{userData?.status || "Active"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />
            
            {/* Actions */}
            <div className="p-2">
              <DropdownMenuItem className="cursor-pointer rounded-md">
                <User className="mr-2 h-4 w-4" />
                <span className="flex-1">Profile Settings</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}