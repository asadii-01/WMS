import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Smart Waste Management System</title>
        <meta name="description" content="Smart Waste Management System" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
