import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-gray-600 mb-8">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild className="bg-green-600 hover:bg-green-700">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
