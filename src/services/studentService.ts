import { apiClient } from "./apiClient";

export const studentService = {
  getProfile: (studentId: number | string) =>
    apiClient.get(`/students/${studentId}/profile`),

  getTasks: (studentId: number | string) =>
    apiClient.get(`/tasks?student_id=${studentId}`),

  submitTask: (taskId: number | string) =>
    apiClient.post(`/tasks/${taskId}/submit`, {}),
};
