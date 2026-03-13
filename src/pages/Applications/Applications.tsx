import React, { useState } from "react";
import { Table, Input, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Applications.css";
import { useGetMyAllApplicationsQuery } from "../../redux/features/application/applicationApi";
import { config } from "../../config";

interface ApplicationRecord {
  id: string;
  applicationId: string;
  status: string;
  course?: { university?: { name: string; UniversityLogo?: { url: string } }; course?: { name: string } };
  intake?: string;
  createdAt?: string;
}

const getLogoSrc = (logoUrl?: string | null) => {
  if (!logoUrl) return undefined;
  // If backend already returns full URL, use it directly
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  // Otherwise, prefix with configured image base URL when available
  if (config.image_access_url) {
    return `${config.image_access_url}${logoUrl}`;
  }
  // Fallback: return as-is so at least relative URLs can work in dev
  return logoUrl;
};

const statusColors: Record<string, string> = {
  REVIEW: "blue",
  APPLY: "cyan",
  PENDING_OFFER_LETTER: "magenta",
  PENDING_TRAVEL_LETTER: "gold",
  SUCCESS: "green",
  REJECTED: "red",
};

export default function Applications() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, isFetching } = useGetMyAllApplicationsQuery({
    page: currentPage,
    limit,
    status: statusFilter,
    search,
  });

  const tableData = data?.data || [];
  const total = data?.meta?.total ?? 0;

  const columns: ColumnsType<ApplicationRecord> = [
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
      render: (applicationId: string, record: ApplicationRecord) => (
        <span
          onClick={() => navigate(`/applications/${record.id}`)}
          className="hover:underline cursor-pointer hover:font-semibold"
        >
          {applicationId}
        </span>
      ),
    },
    {
      title: "School / University",
      dataIndex: "course",
      key: "university",
      width: 220,
      render: (course: ApplicationRecord["course"]) => {
        const logoUrl = course?.university?.UniversityLogo?.url || undefined;
        const logoSrc = getLogoSrc(logoUrl);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={course?.university?.name || ""}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <span className="text-sm font-medium">
              {course?.university?.name || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Program",
      dataIndex: "course",
      key: "program",
      width: 180,
      render: (course: ApplicationRecord["course"]) => (
        <span className="text-sm font-medium">{course?.course?.name || "N/A"}</span>
      ),
    },
    {
      title: "Intake",
      dataIndex: "intake",
      key: "intake",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const color = statusColors[status] || "default";
        return (
          <Tag color={color}>{status}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_: unknown, record: ApplicationRecord) => (
        <Tooltip title="View" placement="top">
          <button
            onClick={() => navigate(`/applications/${record.id}`)}
            className="flex cursor-pointer items-center justify-center w-8 h-8 rounded border border-gray-300 transition-all text-gray-600 hover:text-primary-500 hover:border-primary-500"
          >
            <FiEye size={16} />
          </button>
        </Tooltip>
      ),
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
          placeholder="Search by ID, course, university or status"
          allowClear
          size="large"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        <Table
          className="applications-table"
          dataSource={tableData}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t} applications`,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setLimit(pageSize || 20);
            },
          }}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
}
