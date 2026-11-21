
import api from "@/lib/api";

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  is_active: boolean;
  created_at: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: TeamMember[];
  meta: {
    total: number;
  };
}

export const userService = {
  async getUsers(): Promise<TeamMember[]> {
    const response = await api.get<UsersResponse>("/users/");
    return response.data.data;
  },
};
