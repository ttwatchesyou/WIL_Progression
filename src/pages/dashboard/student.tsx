// src/pages/dashboard/student.tsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Progress, Tag, Table, Button, Spin, Empty, message } from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  FormOutlined,
  RocketOutlined,
  StarOutlined,
  CalendarOutlined,
  BookOutlined,
  SendOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { studentService } from '@/services/studentService';
import { attendanceService } from '@/services/attendanceService';

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

const UserInfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

const StudentMetaText = styled.p`
  color: #94a3b8;
  font-size: clamp(0.78rem, 2.5vw, 0.88rem);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled(Button)`
  height: 44px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #d4af37 0%, #c5a059 100%) !important;
  border: none !important;
  color: #0a192f !important;
  font-weight: 700 !important;
  padding: 0 20px !important;
  width: auto;

  @media (max-width: 768px) {
    width: 100%;
  }
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
  background: ${(props) => props.$bg || 'rgba(10, 25, 47, 0.08)'};
  color: ${(props) => props.$color || '#0a192f'};
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
  height: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);

  @media (max-width: 576px) {
    padding: 16px 12px;
  }
`;

const PanelTitle = styled.h3`
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SkillItem = styled.div`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.85rem;
`;

const TableWrapper = styled.div`
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

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>({
    id: null,
    name: 'ผู้ใช้งาน',
    studentCode: '-',
    classroom: 'เมคคาทรอนิกส์และหุ่นยนต์',
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
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username,
          studentCode: student.student_code || student.username,
          classroom: student.classroom ? `ห้อง ${student.classroom}` : 'ปวช./ปวส. เมคคาทรอนิกส์',
          rankLevel: student.rank_level || 1,
        });

        const skillList = student.skills || [];
        setSkills(skillList);

        const totalScore = skillList.reduce((sum: number, item: any) => sum + (item.score || 0), 0);
        setStats((prev) => ({ ...prev, totalExp: totalScore }));
      }

      if (tasksRes?.data) {
        const taskList = tasksRes.data;
        setTasks(taskList);
        const completedCount = taskList.filter((t: any) => t.status === 'completed').length;
        setStats((prev) => ({ ...prev, completedTasks: completedCount }));
      }

      if (attendanceRes?.data) {
        setStats((prev) => ({ ...prev, attendanceRate: attendanceRes.data.attendance_rate }));
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
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
      message.success('ส่งงานเรียบร้อยแล้ว รออาจารย์ตรวจ');
      if (currentUser.id) fetchDashboardData(currentUser.id);
    } catch (error: any) {
      message.error(error.message || 'ไม่สามารถส่งงานได้');
    }
  };

  const taskColumns = [
    {
      title: 'ชื่องาน',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{text}</span>
          {record.description && (
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{record.description}</span>
          )}
        </div>
      ),
    },
    {
      title: 'ทักษะ',
      dataIndex: 'target_skill',
      key: 'target_skill',
      render: (skill: string) => <Tag color="gold">{skill}</Tag>,
    },
    {
      title: 'คะแนน',
      dataIndex: 'points',
      key: 'points',
      render: (pts: number) => <span style={{ color: '#059669', fontWeight: 600 }}>+{pts} EXP</span>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        if (status === 'completed') return <Tag color="success">เสร็จสิ้น</Tag>;
        if (status === 'submitted') return <Tag color="blue">รอตรวจ</Tag>;
        if (status === 'in_progress')
          return (
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              style={{ background: '#0a192f', border: '1px solid #d4af37' }}
              onClick={() => handleSubmitTask(record.id)}
            >
              ส่งงาน
            </Button>
          );
        return <Tag color="warning">รออนุมัติ</Tag>;
      },
    },
  ];

  return (
    <MainLayout userName={currentUser.name} rankLevel={currentUser.rankLevel}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 12 }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <DashboardContainer>
          <WelcomeBanner>
            <UserInfoGroup>
              <GreetingTitle>
                สวัสดี, <span>{currentUser.name}</span> 👋
              </GreetingTitle>
              <StudentMetaText>
                <span>รหัส: {currentUser.studentCode}</span>
                <span>•</span>
                <span>{currentUser.classroom}</span>
              </StudentMetaText>
            </UserInfoGroup>

            <ActionButton
              type="primary"
              icon={<FormOutlined />}
              onClick={() => router.push('/journal/new')}
            >
              เขียนรายงานประจำวัน (WIL Journal)
            </ActionButton>
          </WelcomeBanner>

          <Row gutter={[12, 12]}>
            <Col xs={12} sm={12} md={6}>
              <StatCard>
                <StatIconBox $bg="rgba(10, 25, 47, 0.08)" $color="#0a192f">
                  <TrophyOutlined />
                </StatIconBox>
                <StatInfo>
                  <StatValue>Rank {currentUser.rankLevel}</StatValue>
                  <StatLabel>ระดับปัจจุบัน</StatLabel>
                </StatInfo>
              </StatCard>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <StatCard>
                <StatIconBox $bg="rgba(212, 175, 55, 0.15)" $color="#c5a059">
                  <StarOutlined />
                </StatIconBox>
                <StatInfo>
                  <StatValue>{stats.totalExp}</StatValue>
                  <StatLabel>EXP สะสม</StatLabel>
                </StatInfo>
              </StatCard>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <StatCard>
                <StatIconBox $bg="rgba(16, 185, 129, 0.12)" $color="#059669">
                  <BookOutlined />
                </StatIconBox>
                <StatInfo>
                  <StatValue>{stats.completedTasks}</StatValue>
                  <StatLabel>ภารกิจที่ผ่าน</StatLabel>
                </StatInfo>
              </StatCard>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <StatCard>
                <StatIconBox $bg="rgba(37, 99, 235, 0.12)" $color="#2563eb">
                  <CalendarOutlined />
                </StatIconBox>
                <StatInfo>
                  <StatValue>{stats.attendanceRate}%</StatValue>
                  <StatLabel>การเข้าเรียน</StatLabel>
                </StatInfo>
              </StatCard>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={9}>
              <ContentPanel>
                <PanelTitle>
                  <TrophyOutlined style={{ color: '#c5a059' }} /> ทักษะวิชาชีพ (Skill Matrix)
                </PanelTitle>
                {skills.length === 0 ? (
                  <Empty description="ยังไม่มีคะแนนทักษะสะสม" style={{ padding: '12px 0' }} />
                ) : (
                  skills.map((skill, index) => (
                    <SkillItem key={index}>
                      <SkillHeader>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{skill.skill_name}</span>
                        <span style={{ color: '#c5a059', fontWeight: 700 }}>{skill.score}/100</span>
                      </SkillHeader>
                      <Progress
                        percent={Math.min(skill.score, 100)}
                        strokeColor={{ '0%': '#0a192f', '100%': '#c5a059' }}
                        showInfo={false}
                      />
                    </SkillItem>
                  ))
                )}
              </ContentPanel>
            </Col>

            <Col xs={24} lg={15}>
              <ContentPanel>
                <PanelTitle>
                  <RocketOutlined style={{ color: '#c5a059' }} /> ภารกิจปฏิบัติงาน (WIL Tasks)
                </PanelTitle>
                <TableWrapper>
                  <Table
                    dataSource={tasks}
                    columns={taskColumns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 450 }}
                    locale={{ emptyText: <Empty description="ยังไม่มีภารกิจที่ได้รับมอบหมาย" /> }}
                  />
                </TableWrapper>
              </ContentPanel>
            </Col>
          </Row>
        </DashboardContainer>
      )}
    </MainLayout>
  );
}