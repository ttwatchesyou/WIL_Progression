// src/pages/dashboard/student.tsx
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Progress,
  Tag,
  Table,
  Button,
  Spin,
  Empty,
  message,
} from "antd";
import {
  TrophyOutlined,
  FormOutlined,
  RocketOutlined,
  StarOutlined,
  CalendarOutlined,
  BookOutlined,
  SendOutlined,
  CrownFilled,
} from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { studentService } from "@/services/studentService";
import { attendanceService } from "@/services/attendanceService";
import Head from "next/head";

// ---------------------------------------------------------
// 🎭 KEYFRAME ANIMATIONS
// ---------------------------------------------------------

const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(250, 204, 21, 0.4); }
  50% { box-shadow: 0 0 28px rgba(250, 204, 21, 0.85); }
`;

const rotateWiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
`;

// ---------------------------------------------------------
// 🎨 SOFT CLAYMORPHISM STYLED COMPONENTS
// ---------------------------------------------------------

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-family: "Prompt", sans-serif;
  position: relative;
`;

const FloatingClayBlob = styled.div<{ size: number; top: string; left: string; bg: string }>`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  background: ${(props) => props.bg};
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.65;
  filter: blur(4px);
  animation: ${floatAnim} 6s ease-in-out infinite;
  box-shadow: 
    inset -8px -8px 16px rgba(0, 0, 0, 0.1),
    inset 8px 8px 16px rgba(255, 255, 255, 0.8);
`;

const ClayBanner = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 32px;
  padding: 32px 36px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  z-index: 1;

  box-shadow: 
    16px 16px 32px rgba(37, 99, 235, 0.3),
    -12px -12px 28px #ffffff,
    inset 4px 4px 8px rgba(255, 255, 255, 0.45),
    inset -6px -6px 12px rgba(15, 23, 42, 0.35);

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 24px 20px;
  }
`;

const GreetingTitle = styled.h2`
  color: #ffffff;
  font-size: clamp(1.35rem, 4vw, 1.8rem);
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  span.highlight {
    color: #facc15;
    text-shadow: 0 0 12px rgba(250, 204, 21, 0.5);
  }
`;

const StudentMetaText = styled.p`
  color: #cbd5e1;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  margin: 6px 0 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-weight: 500;
`;

const ClayActionButton = styled(Button)`
  height: 52px !important;
  border-radius: 20px !important;
  background: linear-gradient(135deg, #facc15 0%, #eab308 100%) !important;
  border: none !important;
  color: #0f172a !important;
  font-weight: 800 !important;
  font-size: 0.98rem !important;
  padding: 0 28px !important;

  box-shadow: 
    8px 8px 18px rgba(234, 179, 8, 0.4),
    -4px -4px 12px #ffffff,
    inset 3px 3px 6px rgba(255, 255, 255, 0.9),
    inset -3px -3px 6px rgba(180, 83, 9, 0.3) !important;

  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 
      12px 12px 24px rgba(234, 179, 8, 0.5),
      -6px -6px 16px #ffffff,
      inset 3px 3px 6px rgba(255, 255, 255, 0.9),
      inset -3px -3px 6px rgba(180, 83, 9, 0.3) !important;
  }

  &:active {
    transform: translateY(2px) scale(0.96) !important;
    box-shadow: 
      2px 2px 6px rgba(234, 179, 8, 0.4),
      inset 4px 4px 8px rgba(180, 83, 9, 0.4) !important;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClayStatCard = styled.div`
  background: #ffffff;
  border-radius: 26px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  position: relative;
  z-index: 1;

  box-shadow: 
    12px 12px 24px rgba(166, 180, 200, 0.45),
    -10px -10px 22px #ffffff,
    inset -3px -3px 6px rgba(15, 23, 42, 0.02),
    inset 3px 3px 6px rgba(255, 255, 255, 1);

  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      18px 18px 32px rgba(166, 180, 200, 0.6),
      -12px -12px 28px #ffffff,
      inset -3px -3px 6px rgba(15, 23, 42, 0.02),
      inset 3px 3px 6px rgba(255, 255, 255, 1);

    .stat-icon {
      animation: ${rotateWiggle} 0.5s ease-in-out;
    }
  }
`;

const ClayIconBox = styled.div<{ $color?: string; $bg?: string }>`
  width: 52px;
  height: 52px;
  border-radius: 20px;
  background: ${(props) => props.$bg || "#eff6ff"};
  color: ${(props) => props.$color || "#1d4ed8"};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  flex-shrink: 0;

  box-shadow: 
    4px 4px 12px rgba(0, 0, 0, 0.06),
    inset 3px 3px 6px rgba(255, 255, 255, 0.9),
    inset -3px -3px 6px rgba(0, 0, 0, 0.08);
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StatValue = styled.span`
  font-size: clamp(1.2rem, 3.5vw, 1.5rem);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
`;

const ClayContentPanel = styled.div`
  background: #ffffff;
  border-radius: 32px;
  padding: 28px;
  height: 100%;
  position: relative;
  z-index: 1;

  box-shadow: 
    14px 14px 28px rgba(166, 180, 200, 0.4),
    -12px -12px 28px #ffffff,
    inset -4px -4px 8px rgba(15, 23, 42, 0.02),
    inset 4px 4px 8px rgba(255, 255, 255, 1);

  @media (max-width: 576px) {
    padding: 20px 16px;
  }
`;

const PanelTitle = styled.h3`
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkillItem = styled.div`
  margin-bottom: 20px;
  background: #f8fafc;
  padding: 14px 18px;
  border-radius: 20px;
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.04),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8);

  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const PulseRankBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
  color: #0f172a;
  padding: 6px 16px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.85rem;
  animation: ${pulseGlow} 3s infinite ease-in-out;
  box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.6);
`;

const TableWrapper = styled.div`
  .ant-table {
    background: transparent !important;
  }
  .ant-table-thead > tr > th {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    font-weight: 800 !important;
    border-bottom: none !important;
    border-radius: 14px;
  }
  .ant-table-tbody > tr > td {
    padding: 14px !important;
    border-bottom: 1px solid #f1f5f9 !important;
  }
`;

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>({
    id: null,
    name: "ผู้ใช้งาน",
    studentCode: "-",
    classroom: "เมคคาทรอนิกส์และหุ่นยนต์",
    rankLevel: 1,
  });

  const [skills, setSkills] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalExp: 0,
    completedTasks: 0,
    attendanceRate: 100,
  });

  const fetchDashboardData = async (userId: number) => {
    try {
      setLoading(true);
      const [profileRes, tasksRes, attendanceRes]: any = await Promise.all([
        studentService.getProfile(userId),
        studentService.getTasks(userId),
        attendanceService.getStudentSummary(userId),
      ]);

      if (profileRes?.data) {
        const student = profileRes.data;
        setCurrentUser({
          id: student.id,
          name:
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            student.username,
          studentCode: student.student_code || student.username,
          classroom: student.classroom
            ? `ห้อง ${student.classroom}`
            : "ปวช./ปวส. เมคคาทรอนิกส์",
          rankLevel: student.rank_level || 1,
        });

        const skillList = student.skills || [];
        setSkills(skillList);

        const totalScore = student.total_exp || skillList.reduce(
          (sum: number, item: any) => sum + (item.score || item.points || 0),
          0
        );
        setStats((prev) => ({ ...prev, totalExp: totalScore }));
      }

      if (tasksRes?.data) {
        const taskList = tasksRes.data;
        setTasks(taskList);
        const completedCount = taskList.filter(
          (t: any) => t.status === "completed"
        ).length;
        setStats((prev) => ({ ...prev, completedTasks: completedCount }));
      }

      if (attendanceRes?.data) {
        setStats((prev) => ({
          ...prev,
          attendanceRate: attendanceRes.data.attendance_rate,
        }));
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) fetchDashboardData(user.id);
      } catch (e) {}
    }
  }, []);

  const handleSubmitTask = async (taskId: number) => {
    try {
      await studentService.submitTask(taskId);
      message.success("ส่งงานเรียบร้อยแล้ว รออาจารย์ตรวจ");
      if (currentUser.id) fetchDashboardData(currentUser.id);
    } catch (error: any) {
      message.error(error.message || "ไม่สามารถส่งงานได้");
    }
  };

  const taskColumns = [
    {
      title: "ชื่องาน / ภารกิจ",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <span style={{ fontWeight: 800, color: "#0f172a", display: "block" }}>
            {text}
          </span>
          {record.description && (
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {record.description}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "ทักษะที่เกี่ยวข้อง",
      dataIndex: "target_skill",
      key: "target_skill",
      render: (skill: string, record: any) => (
        <Tag color="gold" style={{ borderRadius: 10, fontWeight: 700, padding: "2px 10px" }}>
          {skill || record.skill_name || "ทักษะวิชาชีพ"}
        </Tag>
      ),
    },
    {
      title: "คะแนน EXP",
      dataIndex: "points",
      key: "points",
      render: (pts: number) => (
        <span style={{ color: "#059669", fontWeight: 800 }}>+{pts || 10} EXP</span>
      ),
    },
    {
      title: "สถานะงาน",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        if (status === "completed") return <Tag color="success" style={{ borderRadius: 10, fontWeight: 700 }}>เสร็จสมบูรณ์</Tag>;
        if (status === "submitted") return <Tag color="blue" style={{ borderRadius: 10, fontWeight: 700 }}>รอตรวจ</Tag>;
        return (
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            style={{ 
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
              borderRadius: 12, 
              fontWeight: 800, 
              border: "none",
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)"
            }}
            onClick={() => handleSubmitTask(record.id)}
          >
            ส่งงาน
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Mechatronics and Robotics - Student Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/logo/MechaLogo.png" rel="icon" />
      </Head>
      <MainLayout userName={currentUser.name} rankLevel={currentUser.rankLevel}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 14, fontWeight: 600, color: "#64748b" }}>กำลังดึงข้อมูลระบบสะสมทักษะ...</p>
          </div>
        ) : (
          <DashboardContainer>
            <FloatingClayBlob size={140} top="-20px" left="5%" bg="linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)" />
            <FloatingClayBlob size={100} top="40%" left="88%" bg="linear-gradient(135deg, #fef08a 0%, #facc15 100%)" />

            <ClayBanner>
              <div>
                <GreetingTitle>
                  สวัสดี, <span className="highlight">{currentUser.name}</span> 👋
                </GreetingTitle>
                <StudentMetaText>
                  <span>รหัส: {currentUser.studentCode}</span>
                  <span>•</span>
                  <span>{currentUser.classroom}</span>
                  <span>•</span>
                  <PulseRankBadge>
                    <CrownFilled style={{ color: "#0f172a" }} /> Rank Lv.{currentUser.rankLevel}
                  </PulseRankBadge>
                </StudentMetaText>
              </div>

              <ClayActionButton
                type="primary"
                icon={<FormOutlined style={{ fontSize: 18 }} />}
                onClick={() => router.push("/journal/new")}
              >
                อัปรูป/วิดีโอ บันทึกประจำวัน (เช็คชื่อ)
              </ClayActionButton>
            </ClayBanner>

            {/* 🧱 Stat Cards ปรับแก้แท็กปิดให้ตรงกันเป็น ClayIconBox เรียบร้อยแล้ว */}
            <Row gutter={[18, 18]}>
              <Col xs={12} sm={12} md={6}>
                <ClayStatCard>
                  <ClayIconBox className="stat-icon" $bg="#eff6ff" $color="#1d4ed8">
                    <CrownFilled />
                  </ClayIconBox>
                  <StatInfo>
                    <StatValue>Rank {currentUser.rankLevel}</StatValue>
                    <StatLabel>ระดับยศปัจจุบัน</StatLabel>
                  </StatInfo>
                </ClayStatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <ClayStatCard>
                  <ClayIconBox className="stat-icon" $bg="#fef3c7" $color="#d97706">
                    <StarOutlined />
                  </ClayIconBox>
                  <StatInfo>
                    <StatValue>{stats.totalExp}</StatValue>
                    <StatLabel>EXP สะสมทั้งหมด</StatLabel>
                  </StatInfo>
                </ClayStatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <ClayStatCard>
                  <ClayIconBox className="stat-icon" $bg="#d1fae5" $color="#059669">
                    <BookOutlined />
                  </ClayIconBox>
                  <StatInfo>
                    <StatValue>{stats.completedTasks}</StatValue>
                    <StatLabel>ภารกิจที่ผ่านแล้ว</StatLabel>
                  </StatInfo>
                </ClayStatCard>
              </Col>

              <Col xs={12} sm={12} md={6}>
                <ClayStatCard>
                  <ClayIconBox className="stat-icon" $bg="#e0e7ff" $color="#4338ca">
                    <CalendarOutlined />
                  </ClayIconBox>
                  <StatInfo>
                    <StatValue>{stats.attendanceRate}%</StatValue>
                    <StatLabel>เปอร์เซ็นต์การเข้าเรียน</StatLabel>
                  </StatInfo>
                </ClayStatCard>
              </Col>
            </Row>

            <Row gutter={[22, 22]}>
              <Col xs={24} lg={9}>
                <ClayContentPanel>
                  <PanelTitle>
                    <TrophyOutlined style={{ color: "#d97706", fontSize: 22 }} /> ทักษะวิชาชีพ (Skill Matrix)
                  </PanelTitle>
                  {skills.length === 0 ? (
                    <Empty
                      description="ยังไม่มีคะแนนทักษะสะสมในระบบ"
                      style={{ padding: "20px 0" }}
                    />
                  ) : (
                    skills.map((skill, index) => {
                      const score = skill.score || skill.points || 0;
                      return (
                        <SkillItem key={index}>
                          <SkillHeader>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>
                              {skill.skill_name || skill.name}
                            </span>
                            <span style={{ color: "#2563eb", fontWeight: 800 }}>
                              {score}/100 แต้ม
                            </span>
                          </SkillHeader>
                          <Progress
                            percent={Math.min(score, 100)}
                            strokeColor={{ "0%": "#3b82f6", "100%": "#1d4ed8" }}
                            trailColor="#e2e8f0"
                            strokeWidth={14}
                            showInfo={false}
                          />
                        </SkillItem>
                      );
                    })
                  )}
                </ClayContentPanel>
              </Col>

              <Col xs={24} lg={15}>
                <ClayContentPanel>
                  <PanelTitle>
                    <RocketOutlined style={{ color: "#2563eb", fontSize: 22 }} /> ภารกิจปฏิบัติงาน (WIL Tasks)
                  </PanelTitle>
                  <TableWrapper>
                    <Table
                      dataSource={tasks}
                      columns={taskColumns}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 450 }}
                      locale={{
                        emptyText: (
                          <Empty description="ยังไม่มีภารกิจที่ได้รับมอบหมาย" />
                        ),
                      }}
                    />
                  </TableWrapper>
                </ClayContentPanel>
              </Col>
            </Row>
          </DashboardContainer>
        )}
      </MainLayout>
    </>
  );
}