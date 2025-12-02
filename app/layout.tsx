import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"


export const metadata: Metadata = {
  title: "Martah High School MIS",
  description: "Management Information System for Martah High School, Zana - Empowering to Excel",
  icons: {
    icon: "/images/school-logo.ico", 
    shortcut: "/images/school-logo.ico",
    apple: "/images/school-logo.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
