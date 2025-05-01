// API utility functions to interact with the backend

import { get } from "http"

// Base URL for API requests
const API_BASE_URL = "/api/proxy"

// Generic fetch function with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    fetchAPI("users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    fetchAPI("users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
}

// Users API
export const usersAPI = {
  getAll: () => fetchAPI("users"),
  getTotal: () => fetchAPI("users/total"),
  getById: (id: number) => fetchAPI(`users/${id}`),
  create: (userData: any) =>
    fetchAPI("users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  update: (id: number, userData: any) =>
    fetchAPI(`users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  delete: (id: number) =>
    fetchAPI(`users/${id}`, {
      method: "DELETE",
    }),
}

// Roles API
export const rolesAPI = {
  getAll: () => fetchAPI("role"),
  getById: (id: number) => fetchAPI(`role/${id}`),
  create: (roleData: any) =>
    fetchAPI("role", {
      method: "POST",
      body: JSON.stringify(roleData),
    }),
  update: (id: number, roleData: any) =>
    fetchAPI(`role/${id}`, {
      method: "PUT",
      body: JSON.stringify(roleData),
    }),
  delete: (id: number) =>
    fetchAPI(`role/${id}`, {
      method: "DELETE",
    }),
}

// Wastebins API
export const wastebinsAPI = {
  getAll: () => fetchAPI("wastebin"),
  getTotal: () => fetchAPI("wastebin/total"),
  getById: (id: number) => fetchAPI(`wastebin/${id}`),
  create: (binData: any) =>
    fetchAPI("wastebin", {
      method: "POST",
      body: JSON.stringify(binData),
    }),
  update: (id: number, binData: any) =>
    fetchAPI(`wastebin/${id}`, {
      method: "PUT",
      body: JSON.stringify(binData),
    }),
  delete: (id: number) =>
    fetchAPI(`wastebin/${id}`, {
      method: "DELETE",
    }),
}

// Requests API
export const requestsAPI = {
  getAll: () => fetchAPI("requests"),
  getTotal: () => fetchAPI("requests/total"),
  getPending: () => fetchAPI("requests/pending"),
  getById: (id: number) => fetchAPI(`requests/${id}`),
  create: (requestData: any) =>
    fetchAPI("requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    }),
  update: (id: number, requestData: any) =>
    fetchAPI(`requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    }),
  delete: (id: number) =>
    fetchAPI(`requests/${id}`, {
      method: "DELETE",
    }),
}

// Schedules API
export const schedulesAPI = {
  getAll: () => fetchAPI("schedule"),
  getById: (id: number) => fetchAPI(`schedule/${id}`),
  create: (scheduleData: any) =>
    fetchAPI("schedule", {
      method: "POST",
      body: JSON.stringify(scheduleData),
    }),
  update: (id: number, scheduleData: any) =>
    fetchAPI(`schedule/${id}`, {
      method: "PUT",
      body: JSON.stringify(scheduleData),
    }),
  delete: (id: number) =>
    fetchAPI(`schedule/${id}`, {
      method: "DELETE",
    }),
}

// Collections API
export const collectionsAPI = {
  getAll: () => fetchAPI("collection"),
  getTotal: () => fetchAPI("collection/total"),
  getCompleted: () => fetchAPI("collection/completed"),
  getById: (id: number) => fetchAPI(`collection/${id}`),
  create: (collectionData: any) =>
    fetchAPI("collection", {
      method: "POST",
      body: JSON.stringify(collectionData),
    }),
  update: (id: number, collectionData: any) =>
    fetchAPI(`collection/${id}`, {
      method: "PUT",
      body: JSON.stringify(collectionData),
    }),
  delete: (id: number) =>
    fetchAPI(`collection/${id}`, {
      method: "DELETE",
    }),
}

// Garbage Trucks API
export const trucksAPI = {
  getAll: () => fetchAPI("garbageTruck"),
  getTotal: () => fetchAPI("garbageTruck/total"),
  getById: (id: number) => fetchAPI(`garbageTruck/${id}`),
  create: (truckData: any) =>
    fetchAPI("garbageTruck", {
      method: "POST",
      body: JSON.stringify(truckData),
    }),
  update: (id: number, truckData: any) =>
    fetchAPI(`garbageTruck/${id}`, {
      method: "PUT",
      body: JSON.stringify(truckData),
    }),
  delete: (id: number) =>
    fetchAPI(`garbageTruck/${id}`, {
      method: "DELETE",
    }),
}

// Routes API
export const routesAPI = {
  getAll: () => fetchAPI("route"),
  getTotal: () => fetchAPI("route/total"),
  getById: (id: number) => fetchAPI(`route/${id}`),
  create: (routeData: any) =>
    fetchAPI("route", {
      method: "POST",
      body: JSON.stringify(routeData),
    }),
  update: (id: number, routeData: any) =>
    fetchAPI(`route/${id}`, {
      method: "PUT",
      body: JSON.stringify(routeData),
    }),
  delete: (id: number) =>
    fetchAPI(`route/${id}`, {
      method: "DELETE",
    }),
}

// Activity Logs API
export const activityLogsAPI = {
  getAll: () => fetchAPI("activityLog"),
  getById: (id: number) => fetchAPI(`activityLog/${id}`),
  create: (logData: any) =>
    fetchAPI("activityLog", {
      method: "POST",
      body: JSON.stringify(logData),
    }),
  delete: (id: number) =>
    fetchAPI(`activityLog/${id}`, {
      method: "DELETE",
    }),
}

// Permission API
export const permissionsAPI = {
  getAll: () => fetchAPI("permission"),
  getById: (id: number) => fetchAPI(`permission/${id}`),
  create: (permissionData: any) =>
    fetchAPI("permission", {
      method: "POST",
      body: JSON.stringify(permissionData),
    }),
  update: (id: number, permissionData: any) =>
    fetchAPI(`permission/${id}`, {
      method: "PUT",
      body: JSON.stringify(permissionData),
    }),
  delete: (id: number) =>
    fetchAPI(`permission/${id}`, {
      method: "DELETE",
    }),
  assignToRole: (roleId: number, permissionId: number) =>
    fetchAPI(`role/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permission_id: permissionId }),
    }),
}

// Role-Permission API
export const rolePermissionAPI = {
  getAll: () => fetchAPI("role_permission"),
  getById: (id: number) => fetchAPI(`role_permission/${id}`),
  create: (rolePermissionData: any) =>
    fetchAPI("role_permission", {
      method: "POST",
      body: JSON.stringify(rolePermissionData),
    }),
  delete: (id: number) =>
    fetchAPI(`role_permission/${id}`, {
      method: "DELETE",
    }),
}