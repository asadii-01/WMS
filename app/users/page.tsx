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

interface User {
  user_id: number
  username: string
  email: string
  phone_no: string
  address: string
  role_id: number
  role_name?: string
}

interface Role {
  role_id: number
  role_name: string
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_no: "",
    address: "",
    password: "",
    role_id: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proxy/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "role_id" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/proxy/users/${currentId}` : "/api/proxy/users/register"

      const method = isEditing ? "PUT" : "POST"

      // For registration, split username into firstname and lastname
      const payload = isEditing
        ? formData
        : {
            firstname: formData.username.split(" ")[0] || formData.username,
            lastname: formData.username.split(" ").slice(1).join(" ") || "",
            email: formData.email,
            phone: formData.phone_no,
            address: formData.address,
            password: formData.password,
            usertype: roles.find((r) => r.role_id === formData.role_id)?.role_name || "resident",
          }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "User Updated" : "User Created",
          description: isEditing ? "User has been updated successfully" : "New user has been added",
        })
        fetchUsers()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} user`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      phone_no: user.phone_no,
      address: user.address,
      password: "", // Don't populate password for security
      role_id: user.role_id,
    })
    setCurrentId(user.user_id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/proxy/users/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast({
            title: "User Deleted",
            description: "User has been deleted successfully",
          })
          fetchUsers()
        } else {
          const error = await response.json()
          throw new Error(error.message || "Something went wrong")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phone_no: "",
      address: "",
      password: "",
      role_id: 0,
    })
    setIsEditing(false)
    setCurrentId(null)
    setIsDialogOpen(false)
  }

  // Enrich users with role information
  const enrichedUsers = users.map((user) => {
    const role = roles.find((r) => r.role_id === user.role_id)
    return {
      ...user,
      role_name: role?.role_name || "Unknown",
    }
  })

  const filteredUsers = enrichedUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>

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
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Name</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_no">Phone</Label>
                <Input
                  id="phone_no"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password {isEditing && "(leave blank to keep current)"}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
                  required={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
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
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={
                  !formData.username || !formData.email || (!isEditing && !formData.password) || formData.role_id === 0
                }
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
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_no}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role_name === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role_name === "collector"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role_name}
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
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.user_id)}>
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
