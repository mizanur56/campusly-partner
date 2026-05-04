import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
} from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { ColumnsType } from "antd/es/table";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import PageCard from "../../components/common/Card/PageCard";
import PageMeta from "../../components/common/Meta/PageMeta";
import DataTable from "../../components/common/Tables/DataTable";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useUploadImageMutation } from "../../redux/features/media/mediaApi";
import {
  PartnerTeamMember,
  useChangeTeamMemberPasswordMutation,
  useDeleteTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetTeamStatsQuery,
  useInviteTeamMemberMutation,
  useResendTeamInviteMutation,
  useUpdateTeamMemberMutation,
} from "../../redux/features/teams/partnerTeamsApi";
import type { MediaImage } from "../../types/media";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import "./TeamMembers.css";

export default function TeamMembers() {
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PartnerTeamMember | null>(
    null,
  );
  const [passwordMember, setPasswordMember] =
    useState<PartnerTeamMember | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaImage | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const { data: stats } = useGetTeamStatsQuery();
  const { data, isLoading, isFetching } = useGetTeamMembersQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  });

  const [inviteMember, { isLoading: isInviting }] =
    useInviteTeamMemberMutation();
  const [resendInvite, { isLoading: isResending }] =
    useResendTeamInviteMutation();
  const [updateMember, { isLoading: isUpdating }] =
    useUpdateTeamMemberMutation();
  const [deleteMember, { isLoading: isDeleting }] =
    useDeleteTeamMemberMutation();
  const [changeMemberPassword, { isLoading: isChangingPassword }] =
    useChangeTeamMemberPasswordMutation();
  const [uploadImage, { isLoading: isUploadingPhoto }] =
    useUploadImageMutation();

  const members: PartnerTeamMember[] = data?.data || [];
  const meta = data?.meta;

  // Helper function to parse phone number from react-phone-input-2
  const parsePhoneNumber = (
    phoneValue: string,
  ): { countryCode: string; contactNumber: string } => {
    if (!phoneValue) return { countryCode: "", contactNumber: "" };

    // Remove all non-digit characters except the leading +
    const cleanPhone = phoneValue.replace(/\D/g, "");

    // Country codes are 1-3 digits, get first 1-3 digits as country code
    // Most common: +1 (US/CA), +44 (UK), +880 (BD), +91 (India), etc.
    let countryCode = "";
    let contactNumber = "";

    if (phoneValue.startsWith("+880")) {
      countryCode = "+880";
      contactNumber = cleanPhone.substring(3);
    } else if (phoneValue.startsWith("+1")) {
      countryCode = "+1";
      contactNumber = cleanPhone.substring(1);
    } else if (phoneValue.startsWith("+44")) {
      countryCode = "+44";
      contactNumber = cleanPhone.substring(2);
    } else if (phoneValue.startsWith("+91")) {
      countryCode = "+91";
      contactNumber = cleanPhone.substring(2);
    } else {
      // For other countries, assume 1-2 digit country code
      // Standard country codes are 1-3 digits
      if (cleanPhone.length > 10) {
        countryCode = "+" + cleanPhone.substring(0, 3);
        contactNumber = cleanPhone.substring(3);
      } else {
        countryCode = "+" + cleanPhone.substring(0, 1);
        contactNumber = cleanPhone.substring(1);
      }
    }

    return { countryCode, contactNumber };
  };

  const handleInviteSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { countryCode, contactNumber } = parsePhoneNumber(values.phone);

      await inviteMember({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName ?? "",
        contactNumber: contactNumber,
        countryCode: countryCode,
        password: values.password,
        profilePhotoId: selectedPhoto?.id,
      }).unwrap();
      message.success("Team member created successfully.");
      setIsInviteModalOpen(false);
      form.resetFields();
      setSelectedPhoto(null);
      setPage(1);
      setStatusFilter("");
      setSearch("");
    } catch (err: any) {
      const apiMessage =
        err?.data?.message || err?.error?.message || err?.message || "";
      const statusCode = err?.status || err?.data?.statusCode;
      if (
        statusCode === 409 ||
        String(apiMessage).toLowerCase().includes("already registered")
      ) {
        form.setFields([
          {
            name: "email",
            errors: ["This email is already registered in the system"],
          },
        ]);
        message.error("This email is already registered in the system");
        return;
      }
    }
  };

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder", "team-members");
    try {
      const res: any = await uploadImage(formData).unwrap();
      const uploaded = (
        Array.isArray(res?.data) ? res.data[0] : res?.data
      ) as MediaImage;
      if (uploaded?.id) {
        setSelectedPhoto(uploaded);
        message.success("Photo uploaded successfully.");
      } else {
        message.error("Upload succeeded but no file data returned.");
      }
    } catch {
      message.error("Failed to upload photo.");
    }
  };

  const openEditModal = (record: PartnerTeamMember) => {
    setEditingMember(record);
    editForm.setFieldsValue({
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      phone: record.countryCode
        ? `${record.countryCode}${record.contactNumber}`
        : "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;
    try {
      const values = await editForm.validateFields();
      const { countryCode, contactNumber } = parsePhoneNumber(values.phone);

      await updateMember({
        id: editingMember.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          contactNumber: contactNumber || undefined,
          countryCode: countryCode || undefined,
        },
      }).unwrap();
      message.success("Team member updated successfully.");
      setEditingMember(null);
      editForm.resetFields();
    } catch {
      // errors handled by baseApi toast
    }
  };

  const handleResend = async (
    e: React.MouseEvent,
    record: PartnerTeamMember,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await resendInvite({ id: record.id }).unwrap();
      message.success("Invitation resent successfully.");
    } catch {
      // errors handled by baseApi toast
    }
  };

  const handleRemove = (record: PartnerTeamMember) => {
    const name =
      `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
      record.email;
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
      render: (value: string | null | undefined, record: PartnerTeamMember) =>
        value ? `${record.countryCode || ""} ${value}`.trim() : "—",
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
      render: (_: unknown, record: PartnerTeamMember) =>
        isTeamMember ? null : (
          <Space size="small" wrap onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Edit">
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(record);
                }}
                icon={<EditOutlined />}
              />
            </Tooltip>
            {record.status === "PENDING" && (
              <Tooltip title="Resend invite">
                <Button
                  size="small"
                  loading={isResending}
                  onClick={(e) => handleResend(e, record)}
                  icon={<SendOutlined />}
                />
              </Tooltip>
            )}
            {record.status === "ACTIVE" && (
              <Tooltip title="Change password">
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPasswordMember(record);
                    passwordForm.resetFields();
                  }}
                  icon={<LockOutlined />}
                />
              </Tooltip>
            )}
            <Tooltip title="Remove member">
              <Button
                size="small"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(record);
                }}
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Space>
        ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Team Members - Campus Transfer Partner"
        description="Manage your partner team members, invitations, and roles."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Invite and manage your partner team.
          </p>
        </div>
        {!isTeamMember && (
          <Button
            type="primary"
            onClick={() => setIsInviteModalOpen(true)}
            icon={<PlusOutlined />}
          >
            Create Team Member
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#C7CACF] bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Total Members</div>
          <div className="text-2xl font-semibold text-gray-900">
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="rounded-xl border border-[#C7CACF] bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Active Members</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {stats?.active ?? 0}
          </div>
        </div>
      </div>
      <PageCard>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="max-w-sm">
            <Input
              placeholder="Search by name or email"
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              size="large"
              style={{ width: 200 }}
            />
          </div>
          <Select
            placeholder="Filter by status"
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => {
              setStatusFilter(value ?? "");
              setPage(1);
            }}
            style={{ width: 200 }}
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
          noInnerBorder
          pagination={{
            pageSizeOptions: ["10", "20", "50"],
          }}
        />
      </PageCard>

      {/* Invite modal */}
      <Modal
        open={isInviteModalOpen}
        title="Create Team Member"
        onCancel={() => {
          setIsInviteModalOpen(false);
          form.resetFields();
          setSelectedPhoto(null);
        }}
        onOk={handleInviteSubmit}
        okText="Send invitation"
        okButtonProps={{ loading: isInviting }}
        destroyOnHidden
        centered
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Photo">
            <div className="space-y-3">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoPick}
              />
              {selectedPhoto?.url ? (
                <img
                  src={getApiImageUrl(selectedPhoto.url)}
                  alt="Team member preview"
                  className="h-16 w-16 rounded-full object-cover border border-[#C7CACF]"
                />
              ) : null}
              <Button
                type="default"
                loading={isUploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {selectedPhoto ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </Form.Item>
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
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern:
                  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <PhoneInput
              country="bd"
              preferredCountries={["bd", "us", "gb", "in", "au"]}
              inputStyle={{
                width: "100%",
                height: 32,
                fontSize: 14,
                paddingLeft: 48,
              }}
              buttonStyle={{
                borderRadius: "2px 0 0 2px",
                borderRight: "1px solid #d9d9d9",
              }}
              inputProps={{
                required: true,
              }}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Set initial password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Confirm password is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!passwordMember}
        title="Change Team Member Password"
        onCancel={() => {
          setPasswordMember(null);
          passwordForm.resetFields();
        }}
        onOk={async () => {
          if (!passwordMember) return;
          try {
            const values = await passwordForm.validateFields();
            await changeMemberPassword({
              id: passwordMember.id,
              data: {
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
              },
            }).unwrap();
            message.success("Password changed successfully.");
            setPasswordMember(null);
            passwordForm.resetFields();
          } catch {
            // errors handled by baseApi toast
          }
        }}
        okText="Update Password"
        okButtonProps={{ loading: isChangingPassword }}
        destroyOnHidden
      >
        <Form layout="vertical" form={passwordForm}>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "New password is required" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm password is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
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
        destroyOnHidden
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
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern:
                  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <PhoneInput
              country="bd"
              preferredCountries={["bd", "us", "gb", "in", "au"]}
              inputStyle={{
                width: "100%",
                height: 32,
                fontSize: 14,
                paddingLeft: 48,
              }}
              buttonStyle={{
                borderRadius: "2px 0 0 2px",
                borderRight: "1px solid #d9d9d9",
              }}
              inputProps={{
                required: true,
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
