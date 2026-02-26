import type { Metadata } from "next"
import { DM_Sans, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "ResultReach — Client Onboarding",
  description: "Complete your onboarding questionnaire to get started with ResultReach.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen bg-surface-50 antialiased">
        {children}
      </body>
    </html>
  )
}
