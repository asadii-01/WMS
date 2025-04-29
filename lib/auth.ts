"use client"

// Authentication utilities

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { rolesAPI } from "@/lib/api"
import Cookies from "js-cookie"

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const user = localStorage.getItem("user")
  return !!user
}

// Get current user
export function getCurrentUser() {
  if (typeof window === "undefined") return null

  try {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

const fetchRole = async (userData: any) => {
  try {
    const response = await rolesAPI.getById(userData.role_id);
    return response.role_name || "resident"
  } catch (error) {
    console.error("Error fetching role:", error);
  }
};

// Get user role
export async function getUserRole(): Promise<string> {
  const user = getCurrentUser();
  if (!user) return "resident";

  try {
    const role = await fetchRole(user);
    return role ?? "resident";
  } catch {
    return "resident";
  }
}

// Get user role
// export function getUserRole(): string {
//   const user = getCurrentUser()
//   const role = user ? fetchRole(user) : "resident"
//   return role;
// }

// Custom hook for authentication
export function useAuth() {
  const router = useRouter()
  const { toast } = useToast()

  const logout = () => {
    localStorage.removeItem("user")
    Cookies.remove("user") // Also remove from cookies

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  return {
    isAuthenticated,
    getCurrentUser,
    getUserRole,
    logout,
  }
}
