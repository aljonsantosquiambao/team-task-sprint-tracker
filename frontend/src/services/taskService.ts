
import api from "@/lib/api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
}

export type TaskUpdate = Partial<TaskCreate>;

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TaskListResponse {
  success: boolean;
  message: string;
  data: Task[];
  meta: PaginationMeta;
}

export const taskService = {
  async getTasks(filters: TaskFilters = {}) {
    const params = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      task_status: filters.status,
      priority: filters.priority,
      assignee_id: filters.assignee_id,
      search: filters.search,
    };

    const response = await api.get<TaskListResponse>("/tasks/", {
      params,
    });

    return {
      tasks: response.data.data,
      meta: response.data.meta,
    };
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(payload: TaskCreate): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(
      "/tasks/",
      payload
    );
    return response.data.data;
  },

  async updateTask(
    id: string,
    payload: TaskUpdate
  ): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(
      `/tasks/${id}`,
      payload
    );
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/tasks/${id}`);
  },
};
