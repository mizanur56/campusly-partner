import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import "../../components/common/Tables/AntTable.css";
import { DataTable } from "../../components/common/Tables";
import { useGetStudentsQuery } from "../../redux/features/users/usersApi";
import "./Students.css";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { Search } from "lucide-react";

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
  const [createStudentOpen, setCreateStudentOpen] = useState(false);

  const { data, isFetching } = useGetStudentsQuery(
    { page, limit: pageSize }
  );

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
        row.status.toLowerCase().includes(q)
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

  const loading = isFetching;

  return (
    <div className="students-page">
      <PageMeta
        title="Students - Campus Transfer Partner"
        description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
      />
      <PageHeader title="Students" subtitle="Easily manage every student you onboard and support."  extra={<button
              type="button"
              onClick={() => setCreateStudentOpen(true)}
              className="inline cursor-pointer flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              + Add student
            </button>} breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Students" }]}/>

            <CreateStudentModal
              open={createStudentOpen}
              onClose={() => setCreateStudentOpen(false)}
            />
    
   <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#C7CACF]">
    
   <div className="mb-6 max-w-sm">
        <Input
          placeholder={
            "Search by name, email, status or phone"
          }
          allowClear
          value={searchText}
          prefix={<Search size={16} className="text-[#4B5563]" />}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          data={tableData}
          columns={columns}
          rowKey="key"
          loading={loading}
          showHeader
          isPaginate
          noInnerBorder
          currentPage={page}
          setCurrentPage={setPage}
          limit={pageSize}
          setLimit={setPageSize}
          total={data?.meta?.total ?? 0}
          showSizeChanger
          onRow={(record: StudentRecord) => ({
            onClick: () =>
              navigate(`/students/${record.id}/profile`, {
                state: { student: record },
              }),
            style: { cursor: "pointer" },
          })}
          pagination={{
            pageSizeOptions: ["10", "20", "50"],
            // showTotal: (total: number) => `Total ${total} students`,
          }}
        />
      </div>
   </div>
    </div>
  );
}
