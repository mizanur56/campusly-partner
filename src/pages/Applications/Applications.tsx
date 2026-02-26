import React, { useMemo, useState } from "react";
import { Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Applications.css";

interface ApplicationRecord {
  key: string;
  applicationId: string;
  studentName: string;
  course: string;
  university: string;
  status: string;
  submittedDate: string;
}

const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    key: "1",
    applicationId: "APP-2025-001",
    studentName: "Md Abdul Khalak",
    course: "MBA",
    university: "University of London",
    status: "Pending",
    submittedDate: "2025-02-15",
  },
  {
    key: "2",
    applicationId: "APP-2025-002",
    studentName: "Fatima Rahman",
    course: "LLB",
    university: "University of Manchester",
    status: "Accepted",
    submittedDate: "2025-02-10",
  },
  {
    key: "3",
    applicationId: "APP-2025-003",
    studentName: "Tareeq Mahmud",
    course: "MSc Data Science",
    university: "Imperial College London",
    status: "Under Review",
    submittedDate: "2025-02-12",
  },
  {
    key: "4",
    applicationId: "APP-2025-004",
    studentName: "Hassan Ahmed",
    course: "BBA",
    university: "University of Birmingham",
    status: "Rejected",
    submittedDate: "2025-02-08",
  },
  {
    key: "5",
    applicationId: "APP-2025-005",
    studentName: "Suman Thapa",
    course: "MBA",
    university: "University of Edinburgh",
    status: "Pending",
    submittedDate: "2025-02-14",
  },
  {
    key: "6",
    applicationId: "APP-2024-120",
    studentName: "Anish Maharjan",
    course: "BSc IT",
    university: "University of Bristol",
    status: "Accepted",
    submittedDate: "2024-12-20",
  },
  {
    key: "7",
    applicationId: "APP-2025-006",
    studentName: "Rita Islam",
    course: "MSc Engineering",
    university: "University of Leeds",
    status: "Under Review",
    submittedDate: "2025-02-18",
  },
  {
    key: "8",
    applicationId: "APP-2025-007",
    studentName: "Md Ashiqur Rahman",
    course: "BSc Computer Science",
    university: "University of Glasgow",
    status: "Pending",
    submittedDate: "2025-02-20",
  },
];

export default function Applications() {
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return MOCK_APPLICATIONS;
    const q = searchText.toLowerCase();
    return MOCK_APPLICATIONS.filter(
      (row) =>
        row.applicationId.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q) ||
        row.course.toLowerCase().includes(q) ||
        row.university.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [searchText]);

  const columns: ColumnsType<ApplicationRecord> = [
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
      width: 180,
    },
    { title: "Course", dataIndex: "course", key: "course", width: 160 },
    {
      title: "University",
      dataIndex: "university",
      key: "university",
      width: 220,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "Accepted"
              ? "bg-green-100 text-green-800"
              : status === "Rejected"
                ? "bg-red-100 text-red-800"
                : status === "Under Review"
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
      title: "Submitted",
      dataIndex: "submittedDate",
      key: "submittedDate",
      width: 120,
    },
  ];

  return (
    <div className="applications-page">
      <PageMeta
        title="Applications - Campus Transfer Partner"
        description="View and manage student applications, status, and submissions in the Campus Transfer Partner panel."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Applications
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track and manage every application you submit.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + New application
        </button>
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by ID, student, course, university or status"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <Table
          className="applications-table"
          dataSource={filteredData}
          columns={columns}
          rowKey="key"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} applications`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
}
