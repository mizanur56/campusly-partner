import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import "../../components/common/Tables/AntTable.css";
import { useGetStudentsQuery } from "../../redux/features/users/usersApi";
import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import "./Students.css";

interface StudentRecord {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastLogin: string;
}

interface AssignedStudentRecord {
  key: string;
  studentId: string;
  studentName: string;
  activeTaskCount: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function Students() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createStudentOpen, setCreateStudentOpen] = useState(false);

  const { data, isFetching } = useGetStudentsQuery(
    { page, limit: pageSize },
    { skip: isTeamMember }
  );
  const { data: assignedStudents = [], isFetching: isFetchingAssigned } =
    useGetStudentsWithActiveTasksQuery(
      isTeamMember ? { assignedToMe: true } : undefined,
      { skip: !isTeamMember }
    );

  const tableData: StudentRecord[] = useMemo(() => {
    if (isTeamMember) return [];
    if (!data?.data) return [];
    const rows = data.data.map((u) => ({
      key: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "—",
      status: u.isActive ? "Active" : "Inactive",
      lastLogin: formatDate(u.lastLogin),
    }));
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.includes(searchText) ||
        row.status.toLowerCase().includes(q)
    );
  }, [data?.data, searchText, isTeamMember]);

  const assignedTableData: AssignedStudentRecord[] = useMemo(() => {
    if (!isTeamMember) return [];
    const rows = assignedStudents.map((s) => ({
      key: s.studentId,
      studentId: s.studentId,
      studentName: s.studentName,
      activeTaskCount: s.activeTaskCount,
    }));
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter((row) => row.studentName.toLowerCase().includes(q));
  }, [assignedStudents, searchText, isTeamMember]);

  const columns: ColumnsType<StudentRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 180,
    },
    { title: "Email", dataIndex: "email", key: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 120,
    },
  ];

  const assignedColumns: ColumnsType<AssignedStudentRecord> = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      width: 280,
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

  const loading = isTeamMember ? isFetchingAssigned : isFetching;

  return (
    <div className="students-page">
      <PageMeta
        title="Students - Campus Transfer Partner"
        description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Students
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isTeamMember
              ? "Students with tasks assigned to you."
              : "Easily manage every student you onboard and support."}
          </p>
        </div>
        {!isTeamMember && (
          <>
            <button
              type="button"
              onClick={() => setCreateStudentOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              + Add student
            </button>
            <CreateStudentModal
              open={createStudentOpen}
              onClose={() => setCreateStudentOpen(false)}
            />
          </>
        )}
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder={
            isTeamMember
              ? "Search by student name"
              : "Search by name, email, status or phone"
          }
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        {isTeamMember ? (
          <Table<AssignedStudentRecord>
            className="students-table"
            dataSource={assignedTableData}
            columns={assignedColumns}
            rowKey="key"
            loading={loading}
            onRow={(record) => ({
              onClick: () =>
                navigate(`/students/${record.studentId}/profile`, {
                  state: { student: { id: record.studentId, name: record.studentName } },
                }),
              style: { cursor: "pointer" },
            })}
            pagination={
              assignedTableData.length > 10
                ? {
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} students`,
                  }
                : false
            }
            scroll={{ x: 500 }}
            locale={{
              emptyText: "No students with tasks assigned to you.",
            }}
          />
        ) : (
          <Table
            className="students-table"
            dataSource={tableData}
            columns={columns}
            rowKey="key"
            loading={loading}
            onRow={(record) => ({
              onClick: () =>
                navigate(`/students/${record.id}/profile`, {
                  state: { student: record },
                }),
              style: { cursor: "pointer" },
            })}
            pagination={{
              current: page,
              pageSize,
              total: data?.meta?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} students`,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize ?? 10);
              },
            }}
            scroll={{ x: 900 }}
          />
        )}
      </div>
    </div>
  );
}
