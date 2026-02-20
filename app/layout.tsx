import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { PermissionProvider } from "@/contexts/permission-context"
import "./globals.css"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export const metadata: Metadata = {
  title: "Martah High School",
  description:
    "Management Information System for Martah High School, Zana - Empowering to Excel",
  metadataBase: new URL("https://martahhigh.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/school-logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/school-logo.png",
  },
  openGraph: {
    title: "Martah High School",
    description:
      "Management Information System for Martah High School, Zana - Empowering to Excel",
    url: "https://martahhigh.com",
    siteName: "Martah High School",
    images: [
      {
        url: "/images/school-logo.png",
        width: 1200,
        height: 630,
        alt: "Martah High School Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Martah High School",
    description:
      "Management Information System for Martah High School, Zana - Empowering to Excel",
    images: ["/images/school-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Martah High School",
  alternateName: "Martah High School MIS",
  url: "https://martahhigh.com",
  logo: "https://martahhigh.com/images/school-logo.png",
  description:
    "Management Information System for Martah High School, Zana - Empowering to Excel",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Zana",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <PermissionProvider>
            <Suspense fallback={null}>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnFocusLoss
                pauseOnHover
                theme="light"
              />
            </Suspense>
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}