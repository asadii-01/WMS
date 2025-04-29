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

interface Collection {
  collection_id: number;
  completion_status: string;
  schedule_id: number;
  route_id: number;
  schedule_time?: string;
  route_name?: string;
}

interface Schedule {
  schedule_id: number;
  collection_time: string;
}

interface Route {
  route_id: number;
  route_name: string;
}

export default function CollectionsPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    completion_status: "pending",
    schedule_id: 0,
    route_id: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchSchedules();
    fetchRoutes();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proxy/collection");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/proxy/schedule");
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/proxy/route");
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["schedule_id", "route_id"].includes(name)
        ? Number.parseInt(value)
        : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing
        ? `/api/proxy/collection/${currentId}`
        : "/api/proxy/collection";

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
          title: isEditing ? "Collection Updated" : "Collection Created",
          description: isEditing
            ? "Collection has been updated successfully"
            : "New collection has been added",
        });
        fetchCollections();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving collection:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} collection`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collection: Collection) => {
    setFormData({
      completion_status: collection.completion_status,
      schedule_id: collection.schedule_id,
      route_id: collection.route_id,
    });
    setCurrentId(collection.collection_id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      try {
        const response = await fetch(`/api/proxy/collection/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Collection Deleted",
            description: "Collection has been deleted successfully",
          });
          fetchCollections();
        } else {
          const error = await response.json();
          throw new Error(error.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast({
          title: "Error",
          description: "Failed to delete collection",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      completion_status: "pending",
      schedule_id: 0,
      route_id: 0,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsDialogOpen(false);
  };

  // Enrich collections with schedule and route information
  const enrichedCollections = collections.map((collection) => {
    const schedule = schedules.find((s) => s.schedule_id === collection.schedule_id);
    const route = routes.find((r) => r.route_id === collection.route_id);

    return {
      ...collection,
      schedule_time: schedule?.collection_time || "Unknown",
      route_name: route?.route_name || "Unknown",
    };
  });

  const filteredCollections = enrichedCollections.filter(
    (collection) =>
      collection.completion_status
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.schedule_time &&
        new Date(collection.schedule_time)
          .toLocaleString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Collections</h1>

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
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Collection" : "Add New Collection"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="completion_status">Status</Label>
                <select
                  id="completion_status"
                  name="completion_status"
                  className="w-full p-2 border rounded-md"
                  value={formData.completion_status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_id">Schedule</Label>
                <select
                  id="schedule_id"
                  name="schedule_id"
                  className="w-full p-2 border rounded-md"
                  value={formData.schedule_id}
                  onChange={handleInputChange}
                >
                  <option value={0}>Select Schedule</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.schedule_id} value={schedule.schedule_id}>
                      {new Date(schedule.collection_time).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="route_id">Route</Label>
                <select
                  id="route_id"
                  name="route_id"
                  className="w-full p-2 border rounded-md"
                  value={formData.route_id}
                  onChange={handleInputChange}
                >
                  <option value={0}>Select Route</option>
                  {routes.map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.route_name}
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
                disabled={formData.schedule_id === 0 || formData.route_id === 0}
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
            <CardTitle>All Collections</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search collections..."
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
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No collections found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule Time</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((collection) => (
                  <TableRow key={collection.collection_id}>
                    <TableCell>{collection.collection_id}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          collection.completion_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : collection.completion_status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : collection.completion_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {collection.completion_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {collection.schedule_time
                        ? new Date(collection.schedule_time).toLocaleString()
                        : "Unknown"}
                    </TableCell>
                    <TableCell>{collection.route_name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(collection)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDelete(collection.collection_id)
                            }
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
