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

interface Permission {
  permission_id: number
  permission_name: string
  permission_description: string
}

interface Role {
  role_id: number
  role_name: string
}

interface RolePermission{
    role_id: number
    permission_id: number
}

export default function PermissionsPage() {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    permission_name: "",
    permission_description: "",
    role_id: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  useEffect(() => {
    fetchPermissions()
    fetchRoles()
    fetchRolePermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/permission")
      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/proxy/role")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch(`/api/proxy/role/permission`)
      const data = await response.json()
      setRolePermissions(data)
    } catch (error) {
      console.error("Error fetching role permissions:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "role_id" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/permission/${currentId}` : "/api/proxy/permission"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission_name: formData.permission_name,
          permission_description: formData.permission_description,
        }),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Permission Updated" : "Permission Created",
          description: isEditing ? "Permission has been updated successfully" : "New permission has been added",
        })
        fetchPermissions()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving permission:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} permission,
        variant: "destructive"`,
      })
    }
  }

  const handleAssignPermission = async () => {
    try {
      const response = await fetch(`/api/proxy/role/permission/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission_id: currentId,
          role_id: formData.role_id,
        }),
      })

      if (response.ok) {
        toast({
          title: "Permission Assigned",
          description: "Permission has been assigned to the role successfully",
        })
        setIsAssignDialogOpen(false)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error assigning permission:", error)
      toast({
        title: "Error",
        description: "Failed to assign permission to role",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (permission: Permission) => {
    setFormData({
      permission_name: permission.permission_name,
      permission_description: permission.permission_description,
      role_id: 0,
    })
    setCurrentId(permission.permission_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      try {
        const response = await fetch(`/api/proxy/permission/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "Permission Deleted",
            description: "Permission has been deleted successfully",
          })
          fetchPermissions()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting permission:", error)
        toast({
          title: "Error",
          description: "Failed to delete permission",
          variant: "destructive",
        })
      }
    }
  }

  const openAssignDialog = (permission: Permission) => {
    setCurrentId(permission.permission_id)
    setFormData({
      ...formData,
      role_id: 0,
    })
    setIsAssignDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      permission_name: "",
      permission_description: "",
      role_id: 0,
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.permission_description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const enrichedRolePermissions = rolePermissions.map((rolePermission) => {
    const role = roles.find((r) => r.role_id === rolePermission.role_id)
    return {
      ...rolePermission,
      role_name: role?.role_name || "",
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Permissions</h1>

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
              Add Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Permission" : "Add New Permission"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="permission_name">Permission Name</Label>
                <Input
                  id="permission_name"
                  name="permission_name"
                  value={formData.permission_name}
                  onChange={handleInputChange}
                  placeholder="Enter permission name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permission_description">Description</Label>
                <textarea
                  id="permission_description"
                  name="permission_description"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  value={formData.permission_description}
                  onChange={handleInputChange}
                  placeholder="Enter permission description"
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
                disabled={!formData.permission_name}
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Permission to Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role_id">Select Role</Label>
                <select
                  id="role_id"
                  name="role_id"
                  className="w-full p-2 border rounded-md"
                  value={formData.role_id}
                  onChange={handleInputChange}
                >
                  <option value={0}>Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAssignPermission}
                disabled={formData.role_id === 0}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Permissions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search permissions..."
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
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No permissions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Permission Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned to Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.permission_id}>
                    <TableCell>{permission.permission_id}</TableCell>
                    <TableCell>{permission.permission_name}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{permission.permission_description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">
                        {enrichedRolePermissions
                          .filter((rolePermission) => rolePermission.permission_id === permission.permission_id)
                          .map((rolePermission) => rolePermission.role_name)
                          .join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(permission)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignDialog(permission)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign to Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(permission.permission_id)}
                          >
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