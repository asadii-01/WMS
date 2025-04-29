"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ActivityLog {
  log_id: number;
  action: string;
  timestamp: string;
  user_id: number;
}

interface User {
  user_id: number;
  username: string;
}

export default function ActivityLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchActivityLogs();
    fetchUsers();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proxy/activityLog");
      const data = await response.json();

      setLogs(data);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/proxy/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setActionFilter("");
  };


  const enrichedlogs = logs.map((log: ActivityLog) => {
    const user = users.find((u: User) => u.user_id === log.user_id);

    return {
      ...log,
      user_name: user?.username || "Unknown",
    };
  });

  const filteredLogs = enrichedlogs.filter((log) => {
    // Apply search term filter
    const matchesSearch = log.action
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Apply date filter
    const matchesDate = dateFilter
      ? new Date(log.timestamp).toISOString().split("T")[0] === dateFilter
      : true;

    // Apply action filter
    const matchesAction = actionFilter ? log.action === actionFilter : true;

    return matchesSearch && matchesDate && matchesAction;
  });

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>System Activity</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex items-center w-full md:w-auto">
                  <Calendar className="absolute left-2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <div className="relative flex items-center w-full md:w-auto">
                  <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    className="pl-8 pr-4 py-2 w-full rounded-md border border-gray-300"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <option value="">All Actions</option>
                    {uniqueActions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell>{log.log_id}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        {format(
                          new Date(log.timestamp),
                          "MMM d, yyyy HH:mm:ss"
                        )}
                      </TableCell>
                      <TableCell>{log.user_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
