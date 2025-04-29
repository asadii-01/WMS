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

interface GarbageTruck {
  truck_id: number
  truck_capacity: number
  truck_status: string
  license_plate: string
}

export default function TrucksPage() {
  const { toast } = useToast()
  const [trucks, setTrucks] = useState<GarbageTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    truck_capacity: 0,
    truck_status: "available",
    license_plate: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchTrucks()
  }, [])

  const fetchTrucks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/garbageTruck")
      const data = await response.json()
      setTrucks(data)
    } catch (error) {
      console.error("Error fetching trucks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch garbage trucks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "truck_capacity" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/garbageTruck/${currentId}` : "/api/proxy/garbageTruck"

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
          title: isEditing ? "Truck Updated" : "Truck Created",
          description: isEditing ? "Garbage truck has been updated successfully" : "New garbage truck has been added",
        })
        fetchTrucks()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving truck:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} garbage truck`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (truck: GarbageTruck) => {
    setFormData({
      truck_capacity: truck.truck_capacity,
      truck_status: truck.truck_status,
      license_plate: truck.license_plate,
    })
    setCurrentId(truck.truck_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this garbage truck?")) {
      try {
        const response = await fetch(`/api/proxy/garbageTruck/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Truck Deleted",
            description: "Garbage truck has been deleted successfully",
          })
          fetchTrucks()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting truck:", error)
        toast({
          title: "Error",
          description: "Failed to delete garbage truck",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      truck_capacity: 0,
      truck_status: "available",
      license_plate: "",
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.truck_status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Garbage Trucks</h1>

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
              Add Truck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Garbage Truck" : "Add New Garbage Truck"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  placeholder="Enter license plate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck_capacity">Capacity (kg)</Label>
                <Input
                  id="truck_capacity"
                  name="truck_capacity"
                  type="number"
                  value={formData.truck_capacity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck_status">Status</Label>
                <select
                  id="truck_status"
                  name="truck_status"
                  className="w-full p-2 border rounded-md"
                  value={formData.truck_status}
                  onChange={handleInputChange}
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-service">Out of Service</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={!formData.license_plate || formData.truck_capacity <= 0}
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
            <CardTitle>All Garbage Trucks</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trucks..."
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
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No garbage trucks found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Capacity (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrucks.map((truck) => (
                  <TableRow key={truck.truck_id}>
                    <TableCell>{truck.truck_id}</TableCell>
                    <TableCell>{truck.license_plate}</TableCell>
                    <TableCell>{truck.truck_capacity}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          truck.truck_status === "available"
                            ? "bg-green-100 text-green-800"
                            : truck.truck_status === "in-use"
                              ? "bg-blue-100 text-blue-800"
                              : truck.truck_status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {truck.truck_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(truck)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(truck.truck_id)}>
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
