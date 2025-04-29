"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      router.push("/")
    } else {
      setIsAuthed(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!isAuthed) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
