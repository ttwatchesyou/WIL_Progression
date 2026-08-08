// src/services/reportService.ts
import { apiClient } from './apiClient';

export const reportService = {
  // บันทึกรายงานประจำวันพร้อมรูปถ่าย
  createReport: (formData: FormData) =>
    apiClient.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // ดึงรายการรายงานทั้งหมด
  getReports: (params?: { classroom?: string; date?: string }) =>
    apiClient.get('/reports', { params }),
};