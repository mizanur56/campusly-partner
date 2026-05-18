import { PlusOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageCard from "../../components/common/Card/PageCard";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import "../../components/common/Tables/AntTable.css";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useGetAllStudentsByPartnerIdQuery } from "../../redux/features/profile/studentProfileApi";
import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
import "./Students.css";

interface StudentRecord {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNo: string;
  assignedTo: string;
  status: string;
  lastLogin: string;
}

interface AssignedStudentRecord {
  key: string;
  id: string;
  studentId: string;
  studentName: string;
  activeTaskCount: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Students() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createStudentOpen, setCreateStudentOpen] = useState(false);

  const { data: assignedStudents = [], isFetching: isFetchingAssigned } =
    useGetStudentsWithActiveTasksQuery(
      isTeamMember ? { assignedToMe: true } : undefined,
      { skip: !isTeamMember },
    );

  const {
    data: allStudents,
    isLoading: isPartnerStudentsLoading,
    isFetching: isPartnerStudentsFetching,
  } = useGetAllStudentsByPartnerIdQuery(
    { partnerId: user?.id as string },
    { skip: !user?.id || isTeamMember },
  );

  const tableData: StudentRecord[] = useMemo(() => {
    const rows: StudentRecord[] = ((allStudents?.data as any[]) ?? []).map(
      (student: any) => ({
        key: student.id,
        id: student.id,
        name:
          [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
          student.user?.name ||
          student.email ||
          "-",
        email: student.email ?? student.user?.email ?? "-",
        phone: student.phone ?? student.user?.phone ?? "-",
        passportNo: student.passportNo ?? "-",
        assignedTo: student.advisor?.name ?? "-",
        status:
          student.user?.isActive === false
            ? "Inactive"
            : student.status ?? "Active",
        lastLogin: formatDate(student.lastLogin ?? null),
      }),
    );

    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.passportNo.toLowerCase().includes(q) ||
        row.assignedTo.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [allStudents?.data, searchText]);

  const assignedTableData: AssignedStudentRecord[] = useMemo(() => {
    const rows = assignedStudents.map((student) => ({
      key: student.studentId,
      id: student.studentId,
      studentId: student.studentId,
      studentName: student.studentName,
      activeTaskCount: student.activeTaskCount,
    }));

    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter((row) => row.studentName.toLowerCase().includes(q));
  }, [assignedStudents, searchText]);

  const handleViewProfile = (record: StudentRecord | AssignedStudentRecord) => {
    const studentId = "studentId" in record ? record.studentId : record.id;
    navigate(`/students/${studentId}/profile`, {
      state: { student: record },
    });
  };

  const columns: ColumnsType<StudentRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 250,
      render: (name: string, record: StudentRecord) => (
        <span
          onClick={() => handleViewProfile(record)}
          className="hover:underline whitespace-nowrap hover:text-primary-500 cursor-pointer"
        >
          {name}
        </span>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 150 },
    {
      title: "Passport No",
      dataIndex: "passportNo",
      key: "passportNo",
      width: 130,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 160,
    },
    { title: "Status", dataIndex: "status", key: "status", width: 120 },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 140,
    },
  ];

  const assignedColumns: ColumnsType<AssignedStudentRecord> = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      width: 280,
      render: (name: string, record: AssignedStudentRecord) => (
        <span
          onClick={() => handleViewProfile(record)}
          className="hover:underline whitespace-nowrap hover:text-primary-500 cursor-pointer"
        >
          {name}
        </span>
      ),
    },
    {
      title: "Active tasks",
      dataIndex: "activeTaskCount",
      key: "activeTaskCount",
      width: 120,
      render: (n: number) => (
        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          {n} task{n !== 1 ? "s" : ""}
        </span>
      ),
    },
  ];

  const activeColumns = isTeamMember ? assignedColumns : columns;
  const activeTableData = isTeamMember ? assignedTableData : tableData;
  const loading = isTeamMember
    ? isFetchingAssigned
    : Boolean(user?.id) &&
      (isPartnerStudentsLoading || isPartnerStudentsFetching);

  return (
    <div className="students-page">
      <PageMeta
        title="Students - Campus Transfer Partner"
        description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
      />
      <PageHeader
        title="Students"
        subtitle="Easily manage every student in your team."
        extra={
          !isTeamMember ? (
            <Button
              type="primary"
              onClick={() => setCreateStudentOpen(true)}
              icon={<PlusOutlined />}
            >
              Add student
            </Button>
          ) : null
        }
        breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Students" }]}
      />

      {!isTeamMember && (
        <CreateStudentModal
          open={createStudentOpen}
          onClose={() => setCreateStudentOpen(false)}
        />
      )}

      <PageCard>
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Search by name, email, status or phone"
            allowClear
            value={searchText}
            prefix={<Search size={16} className="text-[#4B5563]" />}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
          />
        </div>

        <DataTable
          data={activeTableData}
          columns={activeColumns}
          rowKey="key"
          loading={loading}
          actions={[
            {
              key: "view-profile",
              label: "View Profile",
              icon: <Eye size={16} />,
              onClick: handleViewProfile,
            },
          ]}
          showHeader
          isPaginate
          noInnerBorder
          currentPage={page}
          setCurrentPage={setPage}
          limit={pageSize}
          setLimit={setPageSize}
          showSizeChanger
          onRow={() => ({})}
          pagination={{
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total: number) => `Total ${total} students`,
          }}
        />
      </PageCard>
    </div>
  );
}
