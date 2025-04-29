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

interface Role {
  role_id: number
  role_name: string
}

export default function RolesPage() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    role_name: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/role")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/role/${currentId}` : "/api/proxy/role"

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
          title: isEditing ? "Role Updated" : "Role Created",
          description: isEditing ? "Role has been updated successfully" : "New role has been added",
        })
        fetchRoles()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving role:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} role`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (role: Role) => {
    setFormData({
      role_name: role.role_name,
    })
    setCurrentId(role.role_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await fetch(`/api/proxy/role/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Role Deleted",
            description: "Role has been deleted successfully",
          })
          fetchRoles()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting role:", error)
        toast({
          title: "Error",
          description: "Failed to delete role",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      role_name: "",
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  const filteredRoles = roles.filter((role) => role.role_name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Roles</h1>

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
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Role" : "Add New Role"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name</Label>
                <Input
                  id="role_name"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleInputChange}
                  placeholder="Enter role name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={!formData.role_name}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Roles</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles..."
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
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No roles found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.role_id}>
                    <TableCell>{role.role_id}</TableCell>
                    <TableCell>{role.role_name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(role.role_id)}>
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
