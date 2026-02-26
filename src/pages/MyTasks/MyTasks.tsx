import React, { useMemo, useState } from "react";
import { Table, Input, Select, Modal, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./MyTasks.css";

interface TaskRecord {
  key: string;
  taskId: string;
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  description: string;
  createdBy: string;
  createdAt: string;
  assignedTo: string;
  status: string;
}

const MOCK_TASKS: TaskRecord[] = [
  {
    key: "1",
    taskId: "T-001",
    studentId: "STU-2025-001",
    studentName: "Md Abdul Khalak",
    email: "md.abdulkhalak@example.com",
    phone: "+880 1712345678",
    description: "Passport copy required for visa application.",
    createdBy: "Tahsan Tamim",
    createdAt: "06 Jul 2025, 1:16 PM",
    assignedTo: "Suchita Roxy",
    status: "Pending",
  },
  {
    key: "2",
    taskId: "T-002",
    studentId: "STU-2025-002",
    studentName: "Fatima Rahman",
    email: "fatima.rahman@example.com",
    phone: "+880 1612345678",
    description: "Hey! create fir tgusadf",
    createdBy: "Tahsan Tamim",
    createdAt: "05 Jul 2025, 10:30 AM",
    assignedTo: "Ramesh Khadka",
    status: "In Progress",
  },
  {
    key: "3",
    taskId: "T-003",
    studentId: "STU-2025-003",
    studentName: "Tareeq Mahmud",
    email: "tareeq.mahmud@example.com",
    phone: "+880 1912345678",
    description: "Verify academic documents with university.",
    createdBy: "Dipak Sharma",
    createdAt: "04 Jul 2025, 3:45 PM",
    assignedTo: "Suchita Roxy",
    status: "Completed",
  },
  {
    key: "4",
    taskId: "T-004",
    studentId: "STU-2025-004",
    studentName: "Hassan Ahmed",
    email: "hassan.ahmed@example.com",
    phone: "+880 1512345678",
    description: "Follow up on offer letter.",
    createdBy: "Tahsan Tamim",
    createdAt: "03 Jul 2025, 11:00 AM",
    assignedTo: "Dipak Sharma",
    status: "Pending",
  },
  {
    key: "5",
    taskId: "T-005",
    studentId: "STU-2025-005",
    studentName: "Suman Thapa",
    email: "suman@example.com",
    phone: "+977 9812345678",
    description: "IELTS result upload pending.",
    createdBy: "Ramesh Khadka",
    createdAt: "02 Jul 2025, 2:20 PM",
    assignedTo: "Suchita Roxy",
    status: "In Progress",
  },
  {
    key: "6",
    taskId: "T-006",
    studentId: "STU-2024-120",
    studentName: "Anish Maharjan",
    email: "anish@example.com",
    phone: "+977 9712345678",
    description: "CAS request submitted – awaiting response.",
    createdBy: "Dipak Sharma",
    createdAt: "01 Jul 2025, 9:15 AM",
    assignedTo: "Ramesh Khadka",
    status: "Completed",
  },
  {
    key: "7",
    taskId: "T-007",
    studentId: "STU-2025-006",
    studentName: "Rita Islam",
    email: "rita.islam@example.com",
    phone: "+880 1812345678",
    description: "Bank statement for visa.",
    createdBy: "Tahsan Tamim",
    createdAt: "30 Jun 2025, 4:00 PM",
    assignedTo: "Suchita Roxy",
    status: "Pending",
  },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export default function MyTasks() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    let list = MOCK_TASKS;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (row) =>
          row.studentId.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.phone.includes(searchText) ||
          row.studentName.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      list = list.filter((row) => row.status === statusFilter);
    }
    return list;
  }, [searchText, statusFilter]);

  const columns: ColumnsType<TaskRecord> = [
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      width: 120,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 160,
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    {
      title: "Task",
      dataIndex: "description",
      key: "description",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Created by",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120,
    },
    { title: "Date", dataIndex: "createdAt", key: "createdAt", width: 140 },
    {
      title: "Assigned to",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 120,
      render: (name: string) => (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
          {name}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "Completed"
              ? "bg-green-100 text-green-800"
              : status === "In Progress"
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
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_: unknown, record) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-700"
            onClick={() => {
              setSelectedTask(record);
              setIsModalOpen(true);
            }}
          >
            View task
          </button>
          <Tooltip title="View student profile">
            <button
              type="button"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-gray-500 hover:border-primary-500 hover:text-primary-600"
              onClick={() => {}}
            >
              <UserOutlined className="text-xs" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="my-tasks-page">
      <PageMeta
        title="My Tasks - Campus Transfer Partner"
        description="View your latest task updates and alerts. Find tasks by student ID, email or phone."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            View your latest task updates and alerts.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + Create task
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Search by Student ID, email or phone"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
          size="large"
        />
        <Select
          placeholder="Status"
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v ?? "")}
          options={STATUS_OPTIONS}
          className="w-full sm:w-40"
          size="large"
          allowClear
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <Table
          className="my-tasks-table"
          dataSource={filteredData}
          columns={columns}
          rowKey="key"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 1200 }}
        />
      </div>

      <Modal
        open={isModalOpen}
        title="Task details"
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={520}
      >
        {selectedTask && (
          <div className="space-y-5 text-sm">
            {/* Task summary */}
            <section className="space-y-1 border-b border-neutral-100 pb-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Task
              </p>
              <p className="leading-relaxed text-gray-900">
                {selectedTask.description}
              </p>
            </section>

            {/* Student info */}
            <section className="rounded-lg bg-neutral-50 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Student
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedTask.studentName}
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-neutral-600">
                <p>ID: {selectedTask.studentId}</p>
                <p>{selectedTask.email}</p>
                <p>{selectedTask.phone}</p>
              </div>
            </section>

            {/* Meta info */}
            <section className="grid grid-cols-1 gap-4 border-t border-neutral-100 pt-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Created by
                </p>
                <p className="text-gray-900">{selectedTask.createdBy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Created at
                </p>
                <p className="text-gray-900">{selectedTask.createdAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Assigned to
                </p>
                <p className="text-gray-900">{selectedTask.assignedTo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Status
                </p>
                <p className="text-gray-900">{selectedTask.status}</p>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}
