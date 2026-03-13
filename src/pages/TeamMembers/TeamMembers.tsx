import React, { useState } from "react";
import { Tag, Button, Modal, Form, Select, Space, Tooltip, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import DataTable from "../../components/common/Tables/DataTable";
import {
  useGetTeamMembersQuery,
  useGetTeamStatsQuery,
  useInviteTeamMemberMutation,
  useResendTeamInviteMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  PartnerTeamMember,
} from "../../redux/features/teams/partnerTeamsApi";

const { Option } = Select;

export default function TeamMembers() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: stats } = useGetTeamStatsQuery();
  const {
    data,
    isLoading,
    isFetching,
  } = useGetTeamMembersQuery({
    page,
    limit,
    search: "",
    status: "",
  });

  const [inviteMember, { isLoading: isInviting }] =
    useInviteTeamMemberMutation();
  const [resendInvite, { isLoading: isResending }] =
    useResendTeamInviteMutation();
  const [updateMember, { isLoading: isUpdating }] =
    useUpdateTeamMemberMutation();
  const [deleteMember, { isLoading: isDeleting }] =
    useDeleteTeamMemberMutation();

  const members: PartnerTeamMember[] = data?.data || [];
  const meta = data?.meta;

  const handleInviteSubmit = async () => {
    try {
      const values = await form.validateFields();
      await inviteMember(values).unwrap();
      setIsInviteModalOpen(false);
      form.resetFields();
    } catch {
      // errors handled by baseApi toast
    }
  };

  const columns: ColumnsType<PartnerTeamMember> = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (_: any, record) =>
        `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
        record.email,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "contactNumber",
      key: "contactNumber",
      render: (value: string | null | undefined, record) =>
        value ? `${record.countryCode || ""} ${value}` : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PartnerTeamMember["status"]) => {
        const color =
          status === "ACTIVE"
            ? "green"
            : status === "PENDING"
            ? "orange"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Invited",
      dataIndex: "invitedAt",
      key: "invitedAt",
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_: any, record) => (
        <Space size="small">
          {record.status === "PENDING" && (
            <Button
              size="small"
              type="link"
              loading={isResending}
              onClick={async () => {
                await resendInvite({ id: record.id }).unwrap();
              }}
            >
              Resend invite
            </Button>
          )}
          <Select
            size="small"
            value={record.status}
            style={{ width: 120 }}
            loading={isUpdating}
            onChange={async (value) => {
              await updateMember({
                id: record.id,
                data: { status: value as PartnerTeamMember["status"] },
              }).unwrap();
            }}
          >
            <Option value="PENDING">PENDING</Option>
            <Option value="ACTIVE">ACTIVE</Option>
            <Option value="INACTIVE">INACTIVE</Option>
          </Select>
          <Tooltip title="Remove member">
            <Button
              size="small"
              danger
              loading={isDeleting}
              onClick={async () => {
                await deleteMember({ id: record.id }).unwrap();
              }}
            >
              Remove
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageMeta
        title="Team Members - Campus Transfer Partner"
        description="Manage your partner team members, invitations, and roles."
      />
      <PageHeader
        title="Team Members"
        subtitle="Invite and manage your partner team."
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Team Members" },
        ]}
        extra={
          <Button
            type="primary"
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Team Member
          </Button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Total Members</div>
          <div className="text-2xl font-semibold text-gray-900">
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Pending Invites</div>
          <div className="text-2xl font-semibold text-amber-600">
            {stats?.pending ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Active Members</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {stats?.active ?? 0}
          </div>
        </div>
      </div>

      <DataTable
        data={members}
        columns={columns}
        rowKey="id"
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total ?? 0}
        loading={isLoading || isFetching}
        isPaginate
        showHeader
        showSizeChanger
        pagination={{
          pageSizeOptions: ["10", "20", "50"],
        }}
      />

      <Modal
        open={isInviteModalOpen}
        title="Invite Team Member"
        onCancel={() => setIsInviteModalOpen(false)}
        onOk={handleInviteSubmit}
        okButtonProps={{ loading: isInviting }}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Country Code" name="countryCode">
            <Input placeholder="+880" />
          </Form.Item>
          <Form.Item label="Contact Number" name="contactNumber">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

