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
import { logActivity } from "@/lib/activity-logger";

interface Wastebin {
  wastebin_id: number;
  bin_location: string;
  bin_status: string;
  bin_capacity: number;
}

export default function WastebinsPage() {
  const { toast } = useToast();
  const [wastebins, setWastebins] = useState<Wastebin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    bin_location: "",
    bin_status: "empty",
    bin_capacity: 100,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchWastebins();
  }, []);

  const fetchWastebins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proxy/wastebin");
      const data = await response.json();
      setWastebins(data);
    } catch (error) {
      console.error("Error fetching wastebins:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wastebins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "bin_capacity" ? Number.parseInt(value) : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing
        ? `/api/proxy/wastebin/${currentId}`
        : "/api/proxy/wastebin";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Get the response data which should include the created/updated entity
        const responseData = await response.json();

        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Log the activity
        await logActivity({
          action: `${
            isEditing ? "Updated" : "Created"
          } waste bin at location: ${formData.bin_location}`,
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          user_id: user.user_id,
        });

        toast({
          title: isEditing ? "Wastebin Updated" : "Wastebin Created",
          description: isEditing
            ? "Wastebin has been updated successfully"
            : "New wastebin has been added",
        });
        fetchWastebins();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving wastebin:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} wastebin`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (wastebin: Wastebin) => {
    setFormData({
      bin_location: wastebin.bin_location,
      bin_status: wastebin.bin_status,
      bin_capacity: wastebin.bin_capacity,
    });
    setCurrentId(wastebin.wastebin_id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this wastebin?")) {
      try {
        const response = await fetch(`/api/proxy/wastebin/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Get current user from localStorage
          const user = JSON.parse(localStorage.getItem("user") || "{}");

          // Log the activity
          await logActivity({
            action: `Deleted waste bin with ID: ${id}`,
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            user_id: user.user_id,
          });

          toast({
            title: "Wastebin Deleted",
            description: "Wastebin has been deleted successfully",
          });
          fetchWastebins();
        } else {
          const error = await response.json();
          throw new Error(error.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Error deleting wastebin:", error);
        toast({
          title: "Error",
          description: "Failed to delete wastebin",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bin_location: "",
      bin_status: "empty",
      bin_capacity: 100,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsDialogOpen(false);
  };

  const filteredWastebins = wastebins.filter(
    (bin) =>
      bin.bin_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.bin_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Waste Bins</h1>

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
              Add Waste Bin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Waste Bin" : "Add New Waste Bin"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bin_location">Location</Label>
                <Input
                  id="bin_location"
                  name="bin_location"
                  value={formData.bin_location}
                  onChange={handleInputChange}
                  placeholder="Enter bin location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bin_status">Status</Label>
                <select
                  id="bin_status"
                  name="bin_status"
                  className="w-full p-2 border rounded-md"
                  value={formData.bin_status}
                  onChange={handleInputChange}
                >
                  <option value="empty">Empty</option>
                  <option value="half-full">Half Full</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bin_capacity">Capacity (liters)</Label>
                <Input
                  id="bin_capacity"
                  name="bin_capacity"
                  type="number"
                  value={formData.bin_capacity}
                  onChange={handleInputChange}
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
            <CardTitle>All Waste Bins</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search waste bins..."
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
          ) : filteredWastebins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No waste bins found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity (L)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWastebins.map((bin) => (
                  <TableRow key={bin.wastebin_id}>
                    <TableCell>{bin.wastebin_id}</TableCell>
                    <TableCell>{bin.bin_location}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          bin.bin_status === "empty"
                            ? "bg-green-100 text-green-800"
                            : bin.bin_status === "half-full"
                            ? "bg-yellow-100 text-yellow-800"
                            : bin.bin_status === "full"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bin.bin_status}
                      </span>
                    </TableCell>
                    <TableCell>{bin.bin_capacity}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(bin)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(bin.wastebin_id)}
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
