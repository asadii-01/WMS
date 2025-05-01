import { activityLogsAPI } from "./api";

interface ActivityLogData {
  action: string;
  timestamp: string;
  user_id: number;
}

export async function logActivity(data: ActivityLogData) {
  try {
    console.log("Logging activity:", data);
    await activityLogsAPI.create({
      ...data,
    });

    return true;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return false;
  }
}