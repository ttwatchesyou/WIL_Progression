import { apiClient } from "./apiClient";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin";
  student_code?: string;
  classroom?: string;
}

export const authService = {
  login: (data: { username: string; password: string }) =>
    apiClient.post("/login", data),

  register: (data: RegisterPayload) => apiClient.post("/register", data),

  forgotPassword: (email: string) =>
    apiClient.post("/forgot-password", { email }),
};
