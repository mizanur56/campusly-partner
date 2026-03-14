import React, { useState } from "react";
import {
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Space,
  Tooltip,
  Input,
  message,
} from "antd";
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

export default function TeamMembers() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PartnerTeamMember | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: stats } = useGetTeamStatsQuery();
  const {
    data,
    isLoading,
    isFetching,
  } = useGetTeamMembersQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  });

  const [inviteMember, { isLoading: isInviting }] = useInviteTeamMemberMutation();
  const [resendInvite, { isLoading: isResending }] = useResendTeamInviteMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation();

  const members: PartnerTeamMember[] = data?.data || [];
  const meta = data?.meta;

  const handleInviteSubmit = async () => {
    try {
      const values = await form.validateFields();
      await inviteMember({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName ?? "",
        contactNumber: values.contactNumber,
        countryCode: values.countryCode,
      }).unwrap();
      message.success("Team member invited successfully. They will receive an email.");
      setIsInviteModalOpen(false);
      form.resetFields();
    } catch {
      // errors handled by baseApi toast
    }
  };

  const openEditModal = (record: PartnerTeamMember) => {
    setEditingMember(record);
    editForm.setFieldsValue({
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      contactNumber: record.contactNumber ?? "",
      countryCode: record.countryCode ?? "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;
    try {
      const values = await editForm.validateFields();
      await updateMember({
        id: editingMember.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          contactNumber: values.contactNumber || undefined,
          countryCode: values.countryCode || undefined,
        },
      }).unwrap();
      message.success("Team member updated successfully.");
      setEditingMember(null);
      editForm.resetFields();
    } catch {
      // errors handled by baseApi toast
    }
  };

  const handleResend = async (record: PartnerTeamMember) => {
    try {
      await resendInvite({ id: record.id }).unwrap();
      message.success("Invitation resent successfully.");
    } catch {
      // errors handled by baseApi toast
    }
  };

  const handleRemove = (record: PartnerTeamMember) => {
    const name = `${record.firstName || ""} ${record.lastName || ""}`.trim() || record.email;
    Modal.confirm({
      title: "Remove team member",
      content: `Are you sure you want to remove ${name}? They will no longer have access.`,
      okText: "Remove",
      okButtonProps: { danger: true, loading: isDeleting },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteMember({ id: record.id }).unwrap();
          message.success("Team member removed successfully.");
        } catch {
          // errors handled by baseApi toast
        }
      },
    });
  };

  const columns: ColumnsType<PartnerTeamMember> = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (_: unknown, record: PartnerTeamMember) =>
        `${record.firstName || ""} ${record.lastName || ""}`.trim() || record.email,
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
      render: (value: string | null | undefined, record: PartnerTeamMember) =>
        value ? `${record.countryCode || ""} ${value}`.trim() : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PartnerTeamMember["status"]) => {
        const color =
          status === "ACTIVE" ? "green" : status === "PENDING" ? "orange" : "default";
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
      render: (_: unknown, record: PartnerTeamMember) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          {record.status === "PENDING" && (
            <Button
              size="small"
              type="link"
              loading={isResending}
              onClick={() => handleResend(record)}
            >
              Resend invite
            </Button>
          )}
          <Tooltip title="Remove member">
            <Button
              size="small"
              danger
              onClick={() => handleRemove(record)}
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
          <Button type="primary" onClick={() => setIsInviteModalOpen(true)}>
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

      {/* Search and filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email"
          allowClear
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 280 }}
        />
        <Select
          placeholder="Filter by status"
          allowClear
          value={statusFilter || undefined}
          onChange={(value) => {
            setStatusFilter(value ?? "");
            setPage(1);
          }}
          style={{ width: 160 }}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "ACTIVE", label: "Active" },
          ]}
        />
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

      {/* Invite modal */}
      <Modal
        open={isInviteModalOpen}
        title="Invite Team Member"
        onCancel={() => {
          setIsInviteModalOpen(false);
          form.resetFields();
        }}
        onOk={handleInviteSubmit}
        okText="Send invitation"
        okButtonProps={{ loading: isInviting }}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input placeholder="e.g. John" />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Last name is required" }]}
          >
            <Input placeholder="e.g. Doe" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input type="email" placeholder="e.g. john@example.com" />
          </Form.Item>
          <Form.Item label="Country Code" name="countryCode">
            <Input placeholder="+880" />
          </Form.Item>
          <Form.Item label="Contact Number" name="contactNumber">
            <Input placeholder="Phone number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editingMember}
        title="Edit Team Member"
        onCancel={() => {
          setEditingMember(null);
          editForm.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Save"
        okButtonProps={{ loading: isUpdating }}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm}>
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
            rules={[{ required: true, message: "Last name is required" }]}
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
