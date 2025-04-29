"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, MoreVertical, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { rolesAPI } from "@/lib/api";

interface Request {
  request_id: number;
  request_type: string;
  request_status: string;
  user_id: number;
  wastebin_id: number;
  user_name?: string;
  wastebin_location?: string;
}

interface User {
  user_id: number;
  username: string;
}

interface Wastebin {
  wastebin_id: number;
  bin_location: string;
}

export default function RequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wastebins, setWastebins] = useState<Wastebin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    request_type: "collection",
    request_status: "pending",
    user_id: 0,
    wastebin_id: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("resident");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // useEffect(() => {
  //   // Get user from localStorage
  //   const user = localStorage.getItem("user");

  //   const fetchRole = async (userData: any) => {
  //     try {
  //       const response = await rolesAPI.getById(userData.role_id);
  //       setUserRole(response.role_name || "resident");
  //     } catch (error) {
  //       console.error("Error fetching role:", error);
  //     }
  //   };

  //   if (user) {
  //     const userData = JSON.parse(user);
  //     fetchRole(userData);
  //     setCurrentUserId(userData.user_id || null);

  //     // Set default user_id in form for residents
  //     if (userRole === "resident") {
  //       setFormData((prev) => ({
  //         ...prev,
  //         user_id: userData.user_id,
  //       }));
  //     }
  //   }

  //   fetchRequests();
  //   fetchUsers();
  //   fetchWastebins();
  // }, []);

  useEffect(() => {
    // Get user from localStorage
    const user = localStorage.getItem("user");

    const fetchRole = async (userData: any) => {
      try {
        const response = await rolesAPI.getById(userData.role_id);
        setUserRole(response.role_name || "resident");
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    if (user) {
      const userData = JSON.parse(user);
      fetchRole(userData);
      setCurrentUserId(userData.user_id || null);

      // Set default user_id in form for residents
      if (userRole === "resident") {
        setFormData((prev) => ({
          ...prev,
          user_id: userData.user_id,
        }));
      }
    }
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [usersResponse, wastebinsResponse] = await Promise.all([
          fetch("/api/proxy/users"),
          fetch("/api/proxy/wastebin"),
        ]);

        const usersData = await usersResponse.json();
        const wastebinsData = await wastebinsResponse.json();

        setUsers(usersData);
        setWastebins(wastebinsData);

        const requestsResponse = await fetch("/api/proxy/requests");
        const requestsData = await requestsResponse.json();

        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proxy/requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const fetchUsers = async () => {
  //   try {
  //     const response = await fetch("/api/proxy/users");
  //     const data = await response.json();
  //     setUsers(data);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   }
  // };

  // const fetchWastebins = async () => {
  //   try {
  //     const response = await fetch("/api/proxy/wastebin");
  //     const data = await response.json();
  //     setWastebins(data);
  //   } catch (error) {
  //     console.error("Error fetching wastebins:", error);
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["user_id", "wastebin_id"].includes(name)
        ? Number.parseInt(value)
        : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing
        ? `/api/proxy/requests/${currentId}`
        : "/api/proxy/requests";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Request Updated" : "Request Created",
          description: isEditing
            ? "Request has been updated successfully"
            : "New request has been submitted",
        });
        fetchRequests();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving request:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} request`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (request: Request) => {
    setFormData({
      request_type: request.request_type,
      request_status: request.request_status,
      user_id: request.user_id,
      wastebin_id: request.wastebin_id,
    });
    setCurrentId(request.request_id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this request?")) {
      try {
        const response = await fetch(`/api/proxy/requests/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Request Deleted",
            description: "Request has been deleted successfully",
          });
          fetchRequests();
        } else {
          const error = await response.json();
          throw new Error(error.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        toast({
          title: "Error",
          description: "Failed to delete request",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      request_type: "collection",
      request_status: "pending",
      user_id: userRole === "resident" && currentUserId ? currentUserId : 0,
      wastebin_id: 0,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsDialogOpen(false);
  };

  const enrichedRequests = requests.map((request: Request) => {
    const user = users.find((u: User) => u.user_id === request.user_id);
    const wastebin = wastebins.find(
      (w: Wastebin) => w.wastebin_id === request.wastebin_id
    );

    return {
      ...request,
      user_name: user?.username || "Unknown",
      wastebin_location: wastebin?.bin_location || "Unknown",
    };
  });

  // Filter requests based on user role and search term
  const filteredRequests = enrichedRequests
    .filter((request) =>
      userRole === "resident" ? request.user_id === currentUserId : true
    )
    .filter(
      (request) =>
        request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_status
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.wastebin_location
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Service Requests</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Request" : "Submit New Request"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="request_type">Request Type</Label>
                <select
                  id="request_type"
                  name="request_type"
                  className="w-full p-2 border rounded-md"
                  value={formData.request_type}
                  onChange={handleInputChange}
                >
                  <option value="collection">Collection</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="replacement">Replacement</option>
                  <option value="relocation">Relocation</option>
                </select>
              </div>

              {userRole !== "resident" && (
                <div className="space-y-2">
                  <Label htmlFor="request_status">Status</Label>
                  <select
                    id="request_status"
                    name="request_status"
                    className="w-full p-2 border rounded-md"
                    value={formData.request_status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {userRole !== "resident" && (
                <div className="space-y-2">
                  <Label htmlFor="user_id">User</Label>
                  <select
                    id="user_id"
                    name="user_id"
                    className="w-full p-2 border rounded-md"
                    value={formData.user_id}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select User</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={formData.wastebin_id === 0 || formData.user_id === 0}
              >
                {isEditing ? "Update" : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {userRole === "resident" ? "My Requests" : "All Requests"}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
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
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Waste Bin Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell>{request.request_id}</TableCell>
                    <TableCell className="capitalize">
                      {request.request_type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          request.request_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.request_status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : request.request_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.request_status}
                      </span>
                    </TableCell>
                    <TableCell>{request.user_name}</TableCell>
                    <TableCell>{request.wastebin_location}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(request)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(request.request_id)}
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
  );
}
