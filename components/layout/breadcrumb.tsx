"use client"

import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showBackButton?: boolean
}

export function Breadcrumb({ items, showBackButton = false }: BreadcrumbProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 border-b border-border">
      {showBackButton && (
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
