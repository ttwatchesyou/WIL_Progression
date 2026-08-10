// src/services/teacherService.ts
import { apiClient } from "./apiClient";

export interface CreateTaskPayload {
  created_by: number;
  student_id?: number;
  student_ids?: number[];
  title: string;
  description?: string;
  target_skill: string;
  skill_id?: number | null;
  points: number;
}

export interface ApproveTaskPayload {
  teacher_id: number;
  step: "step1_assign" | "step2_grade";
  status: "approved" | "rejected";
  remarks?: string;
}

export const teacherService = {
  // ดึงรายชื่อนักเรียนทั้งหมด
  getStudents: () => apiClient.get("/students"),

  // ดึงรายการภารกิจทั้งหมด
  getAllTasks: () => apiClient.get("/tasks"),

  // สั่งมอบหมายงานใหม่ให้นักเรียน (รองรับหลายคนพร้อมกัน)
  createTask: (data: CreateTaskPayload) => apiClient.post("/tasks", data),

  // อนุมัติงาน 2 ขั้นตอน
  approveTask: (taskId: number | string, data: ApproveTaskPayload) =>
    apiClient.post(`/tasks/${taskId}/approve`, data),

  // ดึงรายงานประจำวัน (WIL Journals)
  getReports: (params?: { classroom?: string; date?: string }) =>
    apiClient.get("/reports", { params }),
};
