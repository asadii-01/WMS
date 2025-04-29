"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Edit, MoreVertical, Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Route {
  route_id: number
  route_name: string
  optimized_path: string
}

export default function RoutesPage() {
  const { toast } = useToast()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    route_name: "",
    optimized_path: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/route")
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error("Error fetching routes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch routes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/route/${currentId}` : "/api/proxy/route"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Route Updated" : "Route Created",
          description: isEditing ? "Route has been updated successfully" : "New route has been added",
        })
        fetchRoutes()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving route:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} route`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (route: Route) => {
    setFormData({
      route_name: route.route_name,
      optimized_path: route.optimized_path,
    })
    setCurrentId(route.route_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        const response = await fetch(`/api/proxy/route/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Route Deleted",
            description: "Route has been deleted successfully",
          })
          fetchRoutes()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting route:", error)
        toast({
          title: "Error",
          description: "Failed to delete route",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      route_name: "",
      optimized_path: "",
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  const filteredRoutes = routes.filter(
    (route) =>
      route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.optimized_path.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Collection Routes</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Route" : "Add New Route"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="route_name">Route Name</Label>
                <Input
                  id="route_name"
                  name="route_name"
                  value={formData.route_name}
                  onChange={handleInputChange}
                  placeholder="Enter route name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimized_path">Optimized Path</Label>
                <textarea
                  id="optimized_path"
                  name="optimized_path"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  value={formData.optimized_path}
                  onChange={handleInputChange}
                  placeholder="Enter optimized path details"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={!formData.route_name}
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Routes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search routes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No routes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Optimized Path</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.route_id}>
                    <TableCell>{route.route_id}</TableCell>
                    <TableCell>{route.route_name}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{route.optimized_path}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(route)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(route.route_id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
