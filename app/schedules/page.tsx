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

interface Schedule {
  schedule_id: number
  collection_time: string
  wastebin_id: number
  truck_id: number
  wastebin_location?: string
  truck_license?: string
}

interface Wastebin {
  wastebin_id: number
  bin_location: string
}

interface Truck {
  truck_id: number
  license_plate: string
}

export default function SchedulesPage() {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [wastebins, setWastebins] = useState<Wastebin[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    collection_time: "",
    wastebin_id: 0,
    truck_id: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchSchedules()
    fetchWastebins()
    fetchTrucks()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/schedule")
      const data = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWastebins = async () => {
    try {
      const response = await fetch("/api/proxy/wastebin")
      const data = await response.json()
      setWastebins(data)
    } catch (error) {
      console.error("Error fetching wastebins:", error)
    }
  }

  const fetchTrucks = async () => {
    try {
      const response = await fetch("/api/proxy/garbageTruck")
      const data = await response.json()
      setTrucks(data)
    } catch (error) {
      console.error("Error fetching trucks:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: ["wastebin_id", "truck_id"].includes(name) ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/schedule/${currentId}` : "/api/proxy/schedule"

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
          title: isEditing ? "Schedule Updated" : "Schedule Created",
          description: isEditing ? "Schedule has been updated successfully" : "New schedule has been added",
        })
        fetchSchedules()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} schedule`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setFormData({
      collection_time: schedule.collection_time,
      wastebin_id: schedule.wastebin_id,
      truck_id: schedule.truck_id,
    })
    setCurrentId(schedule.schedule_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        const response = await fetch(`/api/proxy/schedule/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Schedule Deleted",
            description: "Schedule has been deleted successfully",
          })
          fetchSchedules()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting schedule:", error)
        toast({
          title: "Error",
          description: "Failed to delete schedule",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      collection_time: "",
      wastebin_id: 0,
      truck_id: 0,
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  // Enrich schedules with wastebin and truck information
  const enrichedSchedules = schedules.map((schedule) => {
    const wastebin = wastebins.find((w) => w.wastebin_id === schedule.wastebin_id)
    const truck = trucks.find((t) => t.truck_id === schedule.truck_id)

    return {
      ...schedule,
      wastebin_location: wastebin?.bin_location || "Unknown",
      truck_license: truck?.license_plate || "Unknown",
    }
  })

  const filteredSchedules = enrichedSchedules.filter(
    (schedule) =>
      schedule.wastebin_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.truck_license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.collection_time.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Collection Schedules</h1>

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
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="collection_time">Collection Time</Label>
                <Input
                  id="collection_time"
                  name="collection_time"
                  type="datetime-local"
                  value={formData.collection_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wastebin_id">Waste Bin</Label>
                <select
                  id="wastebin_id"
                  name="wastebin_id"
                  className="w-full p-2 border rounded-md"
                  value={formData.wastebin_id}
                  onChange={handleInputChange}
                >
                  <option value={0}>Select Waste Bin</option>
                  {wastebins.map((bin) => (
                    <option key={bin.wastebin_id} value={bin.wastebin_id}>
                      {bin.bin_location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck_id">Garbage Truck</Label>
                <select
                  id="truck_id"
                  name="truck_id"
                  className="w-full p-2 border rounded-md"
                  value={formData.truck_id}
                  onChange={handleInputChange}
                >
                  <option value={0}>Select Truck</option>
                  {trucks.map((truck) => (
                    <option key={truck.truck_id} value={truck.truck_id}>
                      {truck.license_plate}
                    </option>
                  ))}
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
                disabled={!formData.collection_time || formData.wastebin_id === 0 || formData.truck_id === 0}
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
            <CardTitle>All Collection Schedules</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search schedules..."
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
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No schedules found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Collection Time</TableHead>
                  <TableHead>Waste Bin Location</TableHead>
                  <TableHead>Truck License</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell>{schedule.schedule_id}</TableCell>
                    <TableCell>{new Date(schedule.collection_time).toLocaleString()}</TableCell>
                    <TableCell>{schedule.wastebin_location}</TableCell>
                    <TableCell>{schedule.truck_license}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(schedule.schedule_id)}>
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
