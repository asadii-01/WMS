"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        {error.message || "An unexpected error occurred. Please try again later."}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
