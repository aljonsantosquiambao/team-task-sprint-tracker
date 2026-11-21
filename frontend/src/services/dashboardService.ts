
import api from "@/lib/api";

export interface DashboardSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;

  status_counts: {
    TODO: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };

  priority_counts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardResponse>(
      "/dashboard/summary"
    );

    return response.data.data;
  },
};