import React, { useState } from "react";
import { Tag, Input, Space, Dropdown, Select, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { Search } from "lucide-react";
import { IoFilterSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PrimaryButton from "../../components/common/Button/PrimaryButton";
import DataTable from "../../components/common/Tables/DataTable";
import DeleteModal from "../../components/shared/DeleteModal";
import { useGetMyAllApplicationsQuery } from "../../redux/features/application/applicationApi";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { config } from "../../config";

const { Option } = Select;

interface ApplicationRecord {
  id: string;
  applicationId: string;
  status: string;
  course?: {
    university?: { name: string; UniversityLogo?: { url: string } };
    course?: { name: string };
  };
  campus?: string;
  intake?: string;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  REVIEW: "blue",
  APPLY: "cyan",
  PENDING_OFFER_LETTER: "magenta",
  PENDING_TRAVEL_LETTER: "gold",
  SUCCESS: "green",
  REJECTED: "red",
};

const getLogoSrc = (logoUrl?: string | null) => {
  if (!logoUrl) return undefined;
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  if (config.image_access_url) {
    return `${config.image_access_url}${logoUrl}`;
  }
  return logoUrl;
};

export default function Applications() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined,
  );
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetMyAllApplicationsQuery({
    page: currentPage,
    limit,
    status: selectedStatus ?? "",
    search: searchText,
  });

  const tableData: ApplicationRecord[] = data?.data || [];
  const total = data?.meta?.total ?? 0;

  const handleStatusFilterChange = (value: string | undefined) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

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
      key: "course",
      width: 260,
      render: (course: ApplicationRecord["course"]) => {
        const logoUrl = course?.university?.UniversityLogo?.url || undefined;
        const logoSrc = getLogoSrc(logoUrl);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={course?.university?.name || "University Logo"}
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
      width: 220,
      render: (course: ApplicationRecord["course"]) => (
        <span className="text-sm font-medium">
          {course?.course?.name || "N/A"}
        </span>
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
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_: unknown, record: ApplicationRecord) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="View" placement="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/applications/${record.id}`);
              }}
              className="flex cursor-pointer items-center justify-center w-8 h-8 rounded border border-gray-300 transition-all text-gray-600 hover:text-primary-500 hover:border-primary-500"
            >
              <FiEye size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedApplication(record);
                setDeleteModalOpen(true);
              }}
              className="flex cursor-pointer items-center justify-center w-8 h-8 rounded border border-gray-300 transition-all text-gray-600 hover:text-primary-500 hover:border-primary-500"
            >
              <FiTrash2 size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Applications - Campus Transfer Partner"
        description="View and manage student applications, status, and submissions in the Campus Transfer Partner panel."
      />
      <PageHeader
        title="Applications"
        subtitle={
          isTeamMember
            ? "Applications for students assigned to you"
            : "Manage your applications"
        }
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Applications" },
        ]}
        extra={
          <PrimaryButton
            text="Find More Programs"
            onClick={() => navigate("/programs-schools")}
          />
        }
      />

      <div className="bg-[#FFFFFF] rounded-lg border border-[#C7CACF] p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-1/2">
            <Input
              placeholder="Search by ID, course, university or status"
              prefix={<Search size={16} className="text-[#4B5563]" />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full search-input"
              styles={{
                input: {
                  padding: "10px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#4B5563",
                },
              }}
            />
          </div>

          <Space>
            <Dropdown
              open={isFilterDropdownOpen}
              onOpenChange={setIsFilterDropdownOpen}
              menu={{
                items: [
                  {
                    key: "status_filter",
                    label: (
                      <div
                        className="px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <Select
                          placeholder="Select status"
                          value={selectedStatus}
                          onChange={handleStatusFilterChange}
                          style={{ width: 200 }}
                          allowClear
                        >
                          <Option value="REVIEW">Review</Option>
                          <Option value="PENDING">Pending</Option>
                          <Option value="SUCCESS">Success</Option>
                          <Option value="REJECTED">Rejected</Option>
                        </Select>
                      </div>
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <IoFilterSharp size={16} />
                <span>Filter</span>
              </button>
            </Dropdown>
          </Space>
        </div>

        <DataTable
          data={tableData}
          columns={columns}
          rowKey="id"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          total={total}
          loading={isLoading || isFetching}
          isPaginate
          showHeader={false}
          showSizeChanger
          pagination={{
            pageSizeOptions: ["10", "20", "50"],
          }}
        />
      </div>

      <DeleteModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Application"
        description="Are you sure you want to delete this application?"
        handleDelete={async () => {
          // TODO: hook up partner delete API when available
          setDeleteModalOpen(false);
        }}
      />
    </div>
  );
}
