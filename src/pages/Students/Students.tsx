import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Students.css";

interface StudentRecord {
  key: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  appliedDate: string;
}

const MOCK_STUDENTS: StudentRecord[] = [
  {
    key: "1",
    name: "Md Abdul Khalak",
    email: "md.abdulkhalak@example.com",
    phone: "+880 1712345678",
    course: "MBA",
    status: "Active",
    appliedDate: "2025-01-15",
  },
  {
    key: "2",
    name: "Md Abdul Khaliq",
    email: "abdul.khaliq@example.com",
    phone: "+880 1812345678",
    course: "BSc Computer Science",
    status: "Pending",
    appliedDate: "2025-02-01",
  },
  {
    key: "3",
    name: "Tareeq Mahmud",
    email: "tareeq.mahmud@example.com",
    phone: "+880 1912345678",
    course: "MSc Data Science",
    status: "Active",
    appliedDate: "2025-01-20",
  },
  {
    key: "4",
    name: "Fatima Rahman",
    email: "fatima.rahman@example.com",
    phone: "+880 1612345678",
    course: "LLB",
    status: "Accepted",
    appliedDate: "2024-12-10",
  },
  {
    key: "5",
    name: "Hassan Ahmed",
    email: "hassan.ahmed@example.com",
    phone: "+880 1512345678",
    course: "BBA",
    status: "Active",
    appliedDate: "2025-02-05",
  },
  {
    key: "6",
    name: "Suman Thapa",
    email: "suman@example.com",
    phone: "+977 9812345678",
    course: "MBA",
    status: "Pending",
    appliedDate: "2025-01-28",
  },
  {
    key: "7",
    name: "Anish Maharjan",
    email: "anish@example.com",
    phone: "+977 9712345678",
    course: "BSc IT",
    status: "Accepted",
    appliedDate: "2024-11-20",
  },
  {
    key: "8",
    name: "Bikash Rai",
    email: "bikash@example.com",
    phone: "+977 9612345678",
    course: "MSc Engineering",
    status: "Active",
    appliedDate: "2025-02-10",
  },
];

export default function Students() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return MOCK_STUDENTS;
    const q = searchText.toLowerCase();
    return MOCK_STUDENTS.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.course.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q) ||
        row.phone.includes(searchText),
    );
  }, [searchText]);

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
    { title: "Course", dataIndex: "course", key: "course", width: 180 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "Active"
              ? "bg-green-100 text-green-800"
              : status === "Accepted"
                ? "bg-blue-100 text-blue-800"
                : status === "Pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "appliedDate",
      key: "appliedDate",
      width: 120,
    },
  ];

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
            Easily manage every student you onboard and support.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + Add student
        </button>
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by name, email, course, status or phone"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <Table
          className="students-table"
          dataSource={filteredData}
          columns={columns}
          rowKey="key"
          onRow={(record) => ({
            onClick: () => navigate(`/students/${record.key}/profile`, { state: { student: record } }),
            style: { cursor: "pointer" },
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} students`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
}
