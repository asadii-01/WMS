"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Calendar, Truck, AlertTriangle, CheckCircle, Users, Map } from "lucide-react"
import { wastebinsAPI, requestsAPI, collectionsAPI, trucksAPI, usersAPI, routesAPI, rolesAPI } from "@/lib/api"

interface DashboardStats {
  totalWastebins: number
  totalRequests: number
  totalCollections: number
  totalTrucks: number
  totalUsers: number
  totalRoutes: number
  pendingRequests: number
  completedCollections: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWastebins: 0,
    totalRequests: 0,
    totalCollections: 0,
    totalTrucks: 0,
    totalUsers: 0,
    totalRoutes: 0,
    pendingRequests: 0,
    completedCollections: 0,
  })
  const [userRole, setUserRole] = useState<string>("resident")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const user = localStorage.getItem("user")

    const fetchRole = async (userData: any) => {
      try {
        const response = await rolesAPI.getById(userData.role_id);
        setUserRole(response.role_name || "resident")
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    if (user) {
      const userData = JSON.parse(user)
      fetchRole(userData);
    }

    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [wastebins, requests,pRequests, collections, cCollections, trucks, users, routes] = await Promise.all([
          wastebinsAPI.getTotal(),
          requestsAPI.getTotal(),
          requestsAPI.getPending(),
          collectionsAPI.getTotal(),
          collectionsAPI.getCompleted(),
          trucksAPI.getTotal(),
          usersAPI.getTotal(),
          routesAPI.getTotal(),
        ])

        setStats({
          totalWastebins: wastebins.total,
          totalRequests: requests.total,
          totalCollections: collections.total,
          totalTrucks: trucks.total,
          totalUsers: users.total,
          totalRoutes: routes.total,
          pendingRequests: pRequests.total,
          completedCollections: cCollections.total,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {userRole === "admin" && <TabsTrigger value="admin">Admin</TabsTrigger>}
          {userRole === "collector" && <TabsTrigger value="collector">Collector</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Waste Bins"
              value={stats.totalWastebins}
              icon={<Trash2 className="h-6 w-6 text-green-600" />}
              description="Total waste bins in system"
            />

            <StatCard
              title="Requests"
              value={stats.totalRequests}
              icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
              description="Total service requests"
            />

            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
              description="Requests awaiting action"
            />

            <StatCard
              title="Completed Collections"
              value={stats.completedCollections}
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              description="Successfully completed collections"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500 text-center py-8">Activity data will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500 text-center py-8">Collection status data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {userRole === "admin" && (
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Users"
                value={stats.totalUsers}
                icon={<Users className="h-6 w-6 text-blue-600" />}
                description="Total registered users"
              />

              <StatCard
                title="Trucks"
                value={stats.totalTrucks}
                icon={<Truck className="h-6 w-6 text-orange-500" />}
                description="Available garbage trucks"
              />

              <StatCard
                title="Routes"
                value={stats.totalRoutes}
                icon={<Map className="h-6 w-6 text-purple-600" />}
                description="Collection routes"
              />

              <StatCard
                title="Collections"
                value={stats.totalCollections}
                icon={<Calendar className="h-6 w-6 text-indigo-600" />}
                description="Total collection records"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">System performance metrics will be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">User activity data will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {userRole === "collector" && (
          <TabsContent value="collector" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Today's Collections"
                value={10}
                icon={<Calendar className="h-6 w-6 text-blue-600" />}
                description="Collections scheduled for today"
              />

              <StatCard
                title="Assigned Requests"
                value={5}
                icon={<Map className="h-6 w-6 text-purple-600" />}
                description="Routes assigned to you"
              />

              <StatCard
                title="Completed Today"
                value={2}
                icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                description="Requests completed today"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500 text-center py-8">Your collection schedule will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
