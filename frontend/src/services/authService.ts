import api from "@/lib/api";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>(
      "/auth/login",
      credentials
    );

    return response.data;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>(
      "/auth/register",
      userData
    );

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");

    return response.data;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },
};
