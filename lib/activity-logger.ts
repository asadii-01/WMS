import { activityLogsAPI } from "./api"

interface ActivityLogData {
  user_id: number
  action: string
  entity_type: string
  entity_id: number
  details: string
}

export async function logActivity(data: ActivityLogData) {
  try {
    // Get user IP address (in a real implementation, this would come from the server)
    const ipAddress = "127.0.0.1" // Placeholder

    await activityLogsAPI.create({
      ...data,
      ip_address: ipAddress,
    })

    return true
  } catch (error) {
    console.error("Failed to log activity:", error)
    return false
  }
}