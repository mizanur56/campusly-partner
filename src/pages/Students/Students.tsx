import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import { useGetStudentsQuery } from "../../redux/features/users/usersApi";
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
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isFetching } = useGetStudentsQuery({
    page,
    limit: pageSize,
  });

  const tableData: StudentRecord[] = useMemo(() => {
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
        row.status.toLowerCase().includes(q),
    );
  }, [data?.data, searchText]);

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
          placeholder="Search by name, email, status or phone"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <Table
          className="students-table"
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          loading={isFetching}
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
      </div>
    </div>
  );
}
