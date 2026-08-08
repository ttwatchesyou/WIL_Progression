// src/pages/dashboard/teacher.tsx
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tabs,
  Spin,
  message,
  Card,
  Image,
  Empty,
  DatePicker,
  Radio,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  FileTextOutlined,
  SolutionOutlined,
  ReadOutlined,
  TrophyOutlined,
  SendOutlined,
  CalendarOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";
import styled from "styled-components";
import { teacherService } from "@/services/teacherService";
import {
  attendanceService,
  AttendanceRecord,
} from "@/services/attendanceService";
import { apiClient } from "@/services/apiClient";
import dayjs from "dayjs";
import Head from "next/head";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 20px;
  padding: 24px;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(10, 25, 47, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 16px;
  }
`;

const GreetingTitle = styled.h2`
  color: #ffffff;
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 700;
  margin: 0;

  span {
    color: #d4af37;
  }
`;

const BannerMetaText = styled.p`
  color: #94a3b8;
  font-size: clamp(0.78rem, 2.5vw, 0.88rem);
  margin: 4px 0 0 0;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);

  @media (max-width: 375px) {
    padding: 12px;
    gap: 8px;
  }
`;

const StatIconBox = styled.div<{ $color?: string; $bg?: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${(props) => props.$bg || "rgba(10, 25, 47, 0.08)"};
  color: ${(props) => props.$color || "#0a192f"};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StatValue = styled.span`
  font-size: clamp(1.1rem, 3.5vw, 1.35rem);
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentPanel = styled.div`
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(25px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);

  @media (max-width: 576px) {
    padding: 16px 12px;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    button {
      flex: 1;
    }
  }
`;

const StyledTable = styled(Table)`
  .ant-table {
    background: transparent !important;
  }
  .ant-table-thead > tr > th {
    background: rgba(10, 25, 47, 0.04) !important;
    color: #0f172a !important;
    font-weight: 600 !important;
    padding: 10px 12px !important;
  }
  .ant-table-tbody > tr > td {
    padding: 10px 12px !important;
  }
`;

// 📱 สไตล์พิเศษสำหรับการ์ดเช็คชื่อบนมือถือ
const DesktopTableView = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileCardView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileStudentCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StudentHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StudentNameText = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
`;

const StudentMetaTag = styled.span`
  font-size: 0.78rem;
  color: #64748b;
`;

const TouchRadioGroup = styled(Radio.Group)`
  width: 100%;
  display: flex !important;

  .ant-radio-button-wrapper {
    flex: 1;
    text-align: center;
    height: 40px !important;
    line-height: 38px !important;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0 4px !important;
  }
`;

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  const [attendanceDate, setAttendanceDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [attendanceMap, setAttendanceMap] = useState<{
    [key: number]: "present" | "late" | "absent" | "leave";
  }>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [promotionModal, setPromotionModal] = useState(false);

  const [taskForm] = Form.useForm();
  const [promotionForm] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, tasksRes, reportsRes, promoRes]: any =
        await Promise.all([
          teacherService.getStudents(),
          teacherService.getAllTasks(),
          teacherService.getReports(),
          apiClient.get("/promotions"),
        ]);

      if (studentsRes?.data) {
        setStudents(studentsRes.data);
        const initialMap: {
          [key: number]: "present" | "late" | "absent" | "leave";
        } = {};
        studentsRes.data.forEach((s: any) => {
          initialMap[s.id] = "present";
        });
        setAttendanceMap(initialMap);
      }

      if (tasksRes?.data) setTasks(tasksRes.data);
      if (reportsRes?.data) setReports(reportsRes.data);
      if (promoRes?.data) setPromotions(promoRes.data);
    } catch (error: any) {
      console.error("Error fetching teacher dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    try {
      const formattedDate = attendanceDate.format("YYYY-MM-DD");
      const res: any = await attendanceService.getAttendance({
        date: formattedDate,
      });

      if (res?.data && res.data.length > 0) {
        const existingMap: { [key: number]: any } = { ...attendanceMap };
        res.data.forEach((item: any) => {
          existingMap[item.student_id] = item.status;
        });
        setAttendanceMap(existingMap);
      }
    } catch (e) {
      console.error("Error loading attendance", e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    loadData();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      loadExistingAttendance();
    }
  }, [attendanceDate]);

  const handleAttendanceChange = (
    studentId: number,
    status: "present" | "late" | "absent" | "leave"
  ) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const filteredStudents =
      selectedClassroom === "all"
        ? students
        : students.filter((s) => s.classroom === selectedClassroom);

    if (filteredStudents.length === 0) {
      message.error("ไม่พบรายชื่อนักเรียนในห้องที่เลือก");
      return;
    }

    setSavingAttendance(true);
    try {
      const formattedDate = attendanceDate.format("YYYY-MM-DD");
      const records: AttendanceRecord[] = filteredStudents.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || "present",
      }));

      await attendanceService.saveAttendance(formattedDate, records);
      message.success(
        `บันทึกการเช็คชื่อวันที่ ${attendanceDate.format(
          "DD/MM/YYYY"
        )} เรียบร้อยแล้ว`
      );
    } catch (error: any) {
      message.error(error.message || "เกิดข้อผิดพลาดในการบันทึกเช็คชื่อ");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleApprove = async (
    taskId: number,
    step: "step1_assign" | "step2_grade",
    status: "approved" | "rejected"
  ) => {
    if (!currentUser?.id) return;
    try {
      await teacherService.approveTask(taskId, {
        teacher_id: currentUser.id,
        step,
        status,
      });
      message.success("อนุมัติงานเรียบร้อยแล้ว");
      loadData();
    } catch (error: any) {
      message.error(error.message || "เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  const handleCreateTask = async (values: any) => {
    if (!currentUser?.id) return;
    try {
      await teacherService.createTask({
        created_by: currentUser.id,
        student_ids: values.student_ids,
        title: values.title,
        description: values.description,
        target_skill: values.target_skill,
        points: values.points,
      });
      message.success(
        `สั่งงานแก่นักเรียน ${values.student_ids.length} คนเรียบร้อยแล้ว!`
      );
      setCreateTaskModal(false);
      taskForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.message || "ไม่สามารถสร้างงานได้");
    }
  };

  const handleSendPromotion = async (values: any) => {
    try {
      await apiClient.post("/teacher/promotions", values);
      message.success("ส่งเรื่องเสนอเลื่อนขั้นนักเรียนถึงแอดมินเรียบร้อยแล้ว!");
      setPromotionModal(false);
      promotionForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.message || "เกิดข้อผิดพลาดในการเสนอเลื่อนขั้น");
    }
  };

  const pendingStep1Count = tasks.filter((t) => t.status === "pending").length;
  const pendingStep2Count = tasks.filter(
    (t) => t.status === "submitted"
  ).length;

  const classroomsList = Array.from(
    new Set(students.map((s) => s.classroom).filter(Boolean))
  );

  const attendanceColumns = [
    {
      title: "รหัส",
      dataIndex: "student_code",
      key: "student_code",
      render: (code: string, record: any) => code || record.username,
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "first_name",
      key: "first_name",
      render: (_: any, record: any) => (
        <span style={{ fontWeight: 600, color: "#0f172a" }}>
          {record.first_name} {record.last_name}
        </span>
      ),
    },
    {
      title: "ห้องเรียน",
      dataIndex: "classroom",
      key: "classroom",
      render: (cls: string) => <Tag color="blue">{cls || "ทั่วไป"}</Tag>,
    },
    {
      title: "เช็คชื่อ",
      key: "attendance_status",
      render: (_: any, record: any) => (
        <Radio.Group
          value={attendanceMap[record.id] || "present"}
          onChange={(e) => handleAttendanceChange(record.id, e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button
            value="present"
            style={{
              color:
                attendanceMap[record.id] === "present" ? "#fff" : "#059669",
            }}
          >
            มา
          </Radio.Button>
          <Radio.Button value="late">สาย</Radio.Button>
          <Radio.Button value="leave">ลา</Radio.Button>
          <Radio.Button value="absent">ขาด</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  const taskColumns = [
    {
      title: "ชื่องาน / โครงงาน",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>{text}</span>
          {record.description && (
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "นักเรียน",
      dataIndex: "student_id",
      key: "student_id",
      render: (id: number) => {
        const student = students.find((s) => s.id === id);
        return student ? (
          <Tag color="blue">
            {student.first_name} {student.last_name}
          </Tag>
        ) : (
          <Tag color="blue">ID: {id}</Tag>
        );
      },
    },
    {
      title: "ทักษะเป้าหมาย",
      dataIndex: "target_skill",
      key: "target_skill",
      render: (skill: string) => <Tag color="gold">{skill}</Tag>,
    },
    {
      title: "คะแนน",
      dataIndex: "points",
      key: "points",
      render: (pts: number) => (
        <span style={{ color: "#059669", fontWeight: 600 }}>+{pts} EXP</span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "completed")
          return <Tag color="success">เสร็จสมบูรณ์</Tag>;
        if (status === "submitted")
          return <Tag color="processing">รอตรวจ Step 2</Tag>;
        if (status === "in_progress") return <Tag color="cyan">กำลังทำ</Tag>;
        if (status === "rejected") return <Tag color="error">ปฏิเสธ</Tag>;
        return <Tag color="warning">รออนุมัติ Step 1</Tag>;
      },
    },
    {
      title: "การอนุมัติ",
      key: "action",
      render: (_: any, record: any) => {
        if (record.status === "pending") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              style={{ background: "#0a192f", border: "1px solid #d4af37" }}
              onClick={() =>
                handleApprove(record.id, "step1_assign", "approved")
              }
            >
              อนุมัติ Step 1
            </Button>
          );
        }
        if (record.status === "submitted") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              style={{ background: "#059669", border: "none" }}
              onClick={() =>
                handleApprove(record.id, "step2_grade", "approved")
              }
            >
              ให้คะแนน Step 2
            </Button>
          );
        }
        return <span style={{ color: "#94a3b8", fontSize: 12 }}>-</span>;
      },
    },
  ];

  const promotionColumns = [
    {
      title: "นักเรียน",
      dataIndex: "student_first_name",
      key: "student_first_name",
      render: (_: any, record: any) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {record.student_first_name} {record.student_last_name}
          </span>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            รหัส: {record.student_code} ({record.classroom})
          </div>
        </div>
      ),
    },
    {
      title: "Rank",
      key: "rank_change",
      render: (_: any, record: any) => (
        <span>
          <Tag color="blue">Lv.{record.current_rank}</Tag> ➔{" "}
          <Tag color="gold">Lv.{record.proposed_rank}</Tag>
        </span>
      ),
    },
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "approved")
          return <Tag color="success">อนุมัติแล้ว</Tag>;
        if (status === "rejected") return <Tag color="error">ปฏิเสธ</Tag>;
        return <Tag color="warning">รอแอดมิน</Tag>;
      },
    },
  ];

  const displayStudents =
    selectedClassroom === "all"
      ? students
      : students.filter((s) => s.classroom === selectedClassroom);

  return (
    <>
      <Head>
        <title>Mechatronics and Robotics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/logo/MechaLogo.png" rel="icon" />
        <meta property="og:title" content="Mechatronics and Robotics" />
      </Head>
      <MainLayout
        userName={
          currentUser
            ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`
            : "อาจารย์"
        }
        rankLevel={99}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 12 }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <DashboardContainer>
            <WelcomeBanner>
              <div>
                <GreetingTitle>
                  สวัสดีอาจารย์,{" "}
                  <span>{currentUser?.first_name || "ผู้สอน"}</span> 👨‍🏫
                </GreetingTitle>
                <BannerMetaText>
                  ระบบอนุมัติและประเมินผลการเรียนรู้เชิงบูรณาการกับการทำงาน (WIL
                  Management)
                </BannerMetaText>
              </div>
              <ActionButtonGroup>
                <Button
                  type="default"
                  size="large"
                  icon={<TrophyOutlined style={{ color: "#d4af37" }} />}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "1px solid #d4af37",
                    fontWeight: 600,
                    borderRadius: 12,
                  }}
                  onClick={() => setPromotionModal(true)}
                >
                  เสนอเลื่อนขั้น
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  style={{
                    background: "#d4af37",
                    color: "#0a192f",
                    border: "none",
                    fontWeight: 700,
                    borderRadius: 12,
                  }}
                  onClick={() => setCreateTaskModal(true)}
                >
                  สั่งงานใหม่
                </Button>
              </ActionButtonGroup>
            </WelcomeBanner>

            <Row gutter={[12, 12]}>
              <Col xs={12} sm={12} md={6}>
                <StatCard>
                  <StatIconBox $bg="rgba(212, 175, 55, 0.15)" $color="#c5a059">
                    <ClockCircleOutlined />
                  </StatIconBox>
                  <StatInfo>
                    <StatValue>{pendingStep1Count}</StatValue>
                    <StatLabel>รออนุมัติ Step 1</StatLabel>
                  </StatInfo>
                </StatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <StatCard>
                  <StatIconBox $bg="rgba(16, 185, 129, 0.15)" $color="#059669">
                    <CheckCircleOutlined />
                  </StatIconBox>
                  <StatInfo>
                    <StatValue>{pendingStep2Count}</StatValue>
                    <StatLabel>รอตรวจให้คะแนน</StatLabel>
                  </StatInfo>
                </StatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <StatCard>
                  <StatIconBox $bg="rgba(37, 99, 235, 0.12)" $color="#2563eb">
                    <FileTextOutlined />
                  </StatIconBox>
                  <StatInfo>
                    <StatValue>{reports.length}</StatValue>
                    <StatLabel>รายงาน Journal</StatLabel>
                  </StatInfo>
                </StatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <StatCard>
                  <StatIconBox $bg="rgba(168, 85, 247, 0.15)" $color="#9333ea">
                    <SolutionOutlined />
                  </StatIconBox>
                  <StatInfo>
                    <StatValue>{students.length}</StatValue>
                    <StatLabel>นักเรียนในระบบ</StatLabel>
                  </StatInfo>
                </StatCard>
              </Col>
            </Row>

            <ContentPanel>
              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    key: "1",
                    label: (
                      <span>
                        <CalendarOutlined /> เช็คชื่อ (Attendance)
                      </span>
                    ),
                    children: (
                      <div>
                        {/* Control Header */}
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            marginBottom: 16,
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                              alignItems: "center",
                              width: "100%",
                              maxWidth: 400,
                            }}
                          >
                            <DatePicker
                              value={attendanceDate}
                              onChange={(d) => d && setAttendanceDate(d)}
                              format="DD/MM/YYYY"
                              size="middle"
                              style={{ flex: 1 }}
                            />
                            <Select
                              value={selectedClassroom}
                              onChange={(val) => setSelectedClassroom(val)}
                              size="middle"
                              style={{ flex: 1, minWidth: 120 }}
                            >
                              <Select.Option value="all">
                                ทุกห้องเรียน
                              </Select.Option>
                              {classroomsList.map((cls) => (
                                <Select.Option key={cls} value={cls}>
                                  {cls}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>

                          <Button
                            type="primary"
                            size="middle"
                            icon={<SaveOutlined />}
                            loading={savingAttendance}
                            style={{
                              background: "#0a192f",
                              border: "1px solid #d4af37",
                              borderRadius: 10,
                            }}
                            block={window.innerWidth <= 768}
                            onClick={handleSaveAttendance}
                          >
                            บันทึกเช็คชื่อ ({displayStudents.length} คน)
                          </Button>
                        </div>

                        {/* 🖥️ View สำหรับจอคอม/แท็บเล็ต */}
                        <DesktopTableView>
                          <StyledTable
                            dataSource={displayStudents}
                            columns={attendanceColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                          />
                        </DesktopTableView>

                        {/* 📱 View สำหรับจอมือถือ (Mobile Touch Cards) */}
                        <MobileCardView>
                          {displayStudents.length === 0 ? (
                            <Empty description="ไม่พบรายชื่อนักเรียน" />
                          ) : (
                            displayStudents.map((student) => (
                              <MobileStudentCard key={student.id}>
                                <StudentHeaderRow>
                                  <StudentNameText>
                                    {student.first_name} {student.last_name}
                                  </StudentNameText>
                                  <Tag color="blue">
                                    {student.classroom || "ทั่วไป"}
                                  </Tag>
                                </StudentHeaderRow>

                                <StudentMetaTag>
                                  รหัสนักศึกษา:{" "}
                                  {student.student_code || student.username}
                                </StudentMetaTag>

                                <TouchRadioGroup
                                  value={attendanceMap[student.id] || "present"}
                                  onChange={(e) =>
                                    handleAttendanceChange(
                                      student.id,
                                      e.target.value
                                    )
                                  }
                                  optionType="button"
                                  buttonStyle="solid"
                                >
                                  <Radio.Button
                                    value="present"
                                    style={{
                                      color:
                                        attendanceMap[student.id] === "present"
                                          ? "#fff"
                                          : "#059669",
                                    }}
                                  >
                                    มา
                                  </Radio.Button>
                                  <Radio.Button value="late">สาย</Radio.Button>
                                  <Radio.Button value="leave">ลา</Radio.Button>
                                  <Radio.Button value="absent">
                                    ขาด
                                  </Radio.Button>
                                </TouchRadioGroup>
                              </MobileStudentCard>
                            ))
                          )}
                        </MobileCardView>
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <span>
                        <CheckCircleOutlined /> ตรวจงาน (
                        {pendingStep1Count + pendingStep2Count})
                      </span>
                    ),
                    children: (
                      <StyledTable
                        dataSource={tasks}
                        columns={taskColumns}
                        rowKey="id"
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 650 }}
                      />
                    ),
                  },
                  {
                    key: "3",
                    label: (
                      <span>
                        <ReadOutlined /> รายงาน Journal
                      </span>
                    ),
                    children: (
                      <Row gutter={[12, 12]}>
                        {reports.length === 0 ? (
                          <Col span={24}>
                            <Empty description="ยังไม่มีการส่งรายงานประจำวัน" />
                          </Col>
                        ) : (
                          reports.map((item: any) => {
                            let images: string[] = [];
                            try {
                              images = item.image_url
                                ? JSON.parse(item.image_url)
                                : [];
                            } catch {
                              if (item.image_url) images = [item.image_url];
                            }

                            return (
                              <Col xs={24} sm={12} md={8} key={item.id}>
                                <Card
                                  size="small"
                                  style={{
                                    borderRadius: 14,
                                    border: "1px solid rgba(212, 175, 55, 0.3)",
                                    background: "rgba(255,255,255,0.9)",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: "#0a192f",
                                      marginBottom: 2,
                                    }}
                                  >
                                    {item.first_name} {item.last_name} (
                                    {item.student_code})
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#64748b",
                                      marginBottom: 8,
                                    }}
                                  >
                                    วันที่: {item.report_date}
                                  </div>
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: "#334155",
                                      margin: 0,
                                    }}
                                  >
                                    {item.details}
                                  </p>

                                  {images.length > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 6,
                                        flexWrap: "wrap",
                                        marginTop: 10,
                                      }}
                                    >
                                      <Image.PreviewGroup>
                                        {images.map((imgUrl, idx) => (
                                          <Image
                                            key={idx}
                                            width={50}
                                            height={50}
                                            style={{
                                              objectFit: "cover",
                                              borderRadius: 6,
                                            }}
                                            src={`${
                                              process.env.NEXT_PUBLIC_API_URL ||
                                              "http://localhost:3000"
                                            }${imgUrl}`}
                                            alt="รูปปฏิบัติงาน"
                                          />
                                        ))}
                                      </Image.PreviewGroup>
                                    </div>
                                  )}
                                </Card>
                              </Col>
                            );
                          })
                        )}
                      </Row>
                    ),
                  },
                  {
                    key: "4",
                    label: (
                      <span>
                        <TrophyOutlined /> เสนอเลื่อนขั้น ({promotions.length})
                      </span>
                    ),
                    children: (
                      <StyledTable
                        dataSource={promotions}
                        columns={promotionColumns}
                        rowKey="id"
                        pagination={{ pageSize: 6 }}
                        scroll={{ x: 550 }}
                      />
                    ),
                  },
                ]}
              />
            </ContentPanel>

            <Modal
              title="มอบหมายภารกิจใหม่ให้นักเรียน"
              open={createTaskModal}
              onCancel={() => setCreateTaskModal(false)}
              footer={null}
              centered
              width={520}
            >
              <Form
                form={taskForm}
                layout="vertical"
                onFinish={handleCreateTask}
              >
                <Form.Item
                  label="เลือกนักเรียนเป้าหมาย"
                  name="student_ids"
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกนักเรียนอย่างน้อย 1 คน",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="เลือกนักเรียน..."
                    optionFilterProp="label"
                    size="middle"
                    options={students.map((s) => ({
                      value: s.id,
                      label: `${s.first_name} ${s.last_name} (${
                        s.student_code || s.username
                      })`,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="ชื่องาน / โครงงาน"
                  name="title"
                  rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
                >
                  <Input
                    placeholder="เช่น ประกอบชุดฝึกนิวแมติกส์ควบคุมด้วย PLC"
                    size="middle"
                  />
                </Form.Item>

                <Form.Item label="คำอธิบายเพิ่มเติม" name="description">
                  <Input.TextArea
                    rows={3}
                    placeholder="รายละเอียดหรือเงื่อนไข..."
                  />
                </Form.Item>

                <Form.Item
                  label="ทักษะวิชาชีพที่จะได้รับ"
                  name="target_skill"
                  rules={[{ required: true, message: "กรุณาเลือกทักษะ" }]}
                >
                  <Select placeholder="เลือกทักษะ" size="middle">
                    <Select.Option value="PLC Programming">
                      PLC Programming
                    </Select.Option>
                    <Select.Option value="Pneumatics System">
                      Pneumatics System
                    </Select.Option>
                    <Select.Option value="Robotics Control">
                      Robotics Control
                    </Select.Option>
                    <Select.Option value="Electrical Circuit">
                      Electrical Circuit
                    </Select.Option>
                    <Select.Option value="Sensor & Actuator">
                      Sensor & Actuator
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="คะแนน EXP"
                  name="points"
                  initialValue={10}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={5}
                    max={100}
                    style={{ width: "100%" }}
                    size="middle"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{
                    background: "#0a192f",
                    border: "1px solid #d4af37",
                    borderRadius: 10,
                    height: 42,
                  }}
                >
                  ยืนยันสั่งงาน
                </Button>
              </Form>
            </Modal>

            <Modal
              title="เสนอเลื่อนขั้นนักเรียน"
              open={promotionModal}
              onCancel={() => setPromotionModal(false)}
              footer={null}
              centered
              width={480}
            >
              <Form
                form={promotionForm}
                layout="vertical"
                onFinish={handleSendPromotion}
              >
                <Form.Item
                  label="เลือกนักเรียน"
                  name="student_id"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="เลือกนักเรียน..."
                    optionFilterProp="label"
                    size="middle"
                    options={students.map((s) => ({
                      value: s.id,
                      label: `${s.first_name} ${
                        s.last_name
                      } (ปัจจุบัน Rank Lv.${s.rank_level || 1})`,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Rank Level ที่เสนอขึ้นไป"
                  name="proposed_rank"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={2}
                    max={10}
                    style={{ width: "100%" }}
                    size="middle"
                    placeholder="เช่น Rank 3"
                  />
                </Form.Item>

                <Form.Item label="เหตุผล / ผลงานโดดเด่น" name="reason">
                  <Input.TextArea
                    rows={3}
                    placeholder="อธิบายผลงานที่สมควรได้รับการเลื่อนขั้น..."
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  block
                  style={{
                    background: "#0a192f",
                    border: "1px solid #d4af37",
                    borderRadius: 10,
                    height: 42,
                  }}
                >
                  ส่งเสนอแอดมิน
                </Button>
              </Form>
            </Modal>
          </DashboardContainer>
        )}
      </MainLayout>
    </>
  );
}
