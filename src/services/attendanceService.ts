// src/services/attendanceService.ts
import { apiClient } from './apiClient';

export interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'late' | 'absent' | 'leave';
  remarks?: string;
}

export const attendanceService = {
  // บันทึกเช็คชื่อแบบยกกลุ่ม
  saveAttendance: (date: string, records: AttendanceRecord[]) =>
    apiClient.post('/attendance', { date, records }),

  // ดึงรายการเช็คชื่อตามวันที่/ห้องเรียน
  getAttendance: (params?: { date?: string; classroom?: string }) =>
    apiClient.get('/attendance', { params }),

  // ดึงสรุปสถิติเช็คชื่อของนักเรียน
  getStudentSummary: (studentId: number) =>
    apiClient.get(`/students/${studentId}/attendance-summary`),
};