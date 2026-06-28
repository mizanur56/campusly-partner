import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  KeyRound,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useSelector } from "react-redux";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
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

const AVATAR_GRADIENTS = [
  "from-[#95d66d] to-[#5fa836]",
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-teal-400 to-cyan-600",
];

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % 997;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(name?: string): string {
  if (!name || name === "—") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: PartnerTeamMember["status"]): {
  dot: string;
  pill: string;
  label: string;
} {
  if (status === "ACTIVE")
    return {
      dot: "bg-emerald-500",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Active",
    };
  if (status === "PENDING")
    return {
      dot: "bg-amber-500",
      pill: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Pending",
    };
  return {
    dot: "bg-slate-400",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
    label: status,
  };
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30 sm:w-44";

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
  iconClass: string;
  accentClass: string;
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  accentClass,
}: StatCardProps) {
  return (
      <div className="group relative overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={clsx(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30",
          accentClass,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface AvatarProps {
  name: string;
  image?: string | null;
}

function Avatar({ name, image }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const src = image ? getApiImageUrl(image) : "";
  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }
  return (
    <span
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        gradientFor(name),
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export default function TeamMembers() {
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PartnerTeamMember | null>(
    null,
  );
  const [passwordMember, setPasswordMember] =
    useState<PartnerTeamMember | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaImage | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Role is derived (backend exposes a single team-member role); filter client-side.
  const roleOf = (_m: PartnerTeamMember) => "Team Member";
  const displayedMembers = roleFilter
    ? members.filter((m) => roleOf(m) === roleFilter)
    : members;

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
    // Upload to uploads/ root (same as admin payout receipts) — avoids subfolder rename on server.
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

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter || roleFilter,
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRoleFilter("");
    setPage(1);
  };

  const total = meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    meta?.totalPages || Math.ceil(total / limit) || 1,
  );
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const loading = isLoading || isFetching;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const inactiveCount = Math.max(
    0,
    (stats?.total ?? 0) - (stats?.active ?? 0) - (stats?.pending ?? 0),
  );

  const colSpan = isTeamMember ? 6 : 7;

  return (
    <div>
      <PageMeta
        title="Team Members - Campus Transfer Partner"
        description="Manage your partner team members, invitations, and roles."
      />

      <PageHeader
        title="Team Members"
        subtitle="Invite, organize, and manage everyone on your partner team."
        extra={
          !isTeamMember ? (
            <Button
              type="primary"
              onClick={() => setIsInviteModalOpen(true)}
              icon={<PlusOutlined />}
            >
              Create Team Member
            </Button>
          ) : null
        }
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Team Members" },
        ]}
      />

      {/* Stats cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats?.total ?? 0}
          description="All team members"
          icon={Users}
          iconClass="bg-[#e8f7df] text-[#5fa836]"
          accentClass="bg-[#95d66d]"
        />
        <StatCard
          label="Active Members"
          value={stats?.active ?? 0}
          description="Currently active"
          icon={UserCheck}
          iconClass="bg-emerald-50 text-emerald-600"
          accentClass="bg-emerald-400"
        />
        <StatCard
          label="Inactive Members"
          value={inactiveCount}
          description="No active access"
          icon={UserX}
          iconClass="bg-rose-50 text-rose-600"
          accentClass="bg-rose-400"
        />
        <StatCard
          label="Pending Invitations"
          value={stats?.pending ?? 0}
          description="Awaiting acceptance"
          icon={Clock}
          iconClass="bg-amber-50 text-amber-600"
          accentClass="bg-amber-400"
        />
      </div>

      {/* Main card */}
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#7bc44e] focus:bg-white focus:ring-2 focus:ring-[#95d66d]/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className={SELECT_CLASS}
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">All roles</option>
              <option value="Team Member">Team Member</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              hasActiveFilters ? resetFilters() : searchRef.current?.focus()
            }
            className={clsx(
              "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all",
              hasActiveFilters
                ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                : "bg-[#5fa836] text-white shadow-sm hover:bg-[#4f9762]",
            )}
          >
            {hasActiveFilters ? (
              <>
                <X size={16} />
                Clear
              </>
            ) : (
              <>
                <Filter size={16} />
                Filter
              </>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Member</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Invited</th>
                {!isTeamMember && (
                  <th className="w-16 px-4 py-3.5 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: colSpan }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayedMembers.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-slate-50">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No team members found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters."
                          : "Invite your first team member to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedMembers.map((record, idx) => {
                  const name =
                    `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
                    record.email;
                  const phone = record.contactNumber
                    ? `${record.countryCode || ""} ${record.contactNumber}`.trim()
                    : "—";
                  const sb = statusBadge(record.status);
                  const isOpen = openMenuId === record.id;
                  return (
                    <tr
                      key={record.id}
                      className={clsx(
                        "group transition-colors hover:bg-slate-50/70",
                        idx % 2 === 1 && "bg-slate-50/30",
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} image={record.profilePhoto} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800">
                              {name}
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              ID: {record.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{record.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          <ShieldCheck size={13} className="text-slate-400" />
                          {roleOf(record)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            sb.pill,
                          )}
                        >
                          <span
                            className={clsx("h-1.5 w-1.5 rounded-full", sb.dot)}
                          />
                          {sb.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {formatDateTime(record.invitedAt)}
                      </td>
                      {!isTeamMember && (
                        <td className="px-4 py-3.5 text-right">
                          <div
                            className="relative inline-block"
                            ref={isOpen ? menuRef : undefined}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isOpen ? null : record.id);
                              }}
                              className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
                                isOpen && "bg-slate-100 text-slate-600",
                              )}
                              aria-label="Row actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {isOpen && (
                              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openEditModal(record);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                  <Pencil size={16} className="text-slate-400" />
                                  Edit
                                </button>
                                {record.status === "PENDING" && (
                                  <button
                                    type="button"
                                    disabled={isResending}
                                    onClick={(e) => {
                                      setOpenMenuId(null);
                                      handleResend(e, record);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    <Send size={16} className="text-slate-400" />
                                    Resend invite
                                  </button>
                                )}
                                {record.status === "ACTIVE" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setPasswordMember(record);
                                      passwordForm.resetFields();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                  >
                                    <KeyRound
                                      size={16}
                                      className="text-slate-400"
                                    />
                                    Change password
                                  </button>
                                )}
                                <div className="my-1 h-px bg-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleRemove(record);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                  <Trash2 size={16} className="text-rose-500" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">
              {total === 0
                ? "No members"
                : `Showing ${rangeStart}-${rangeEnd} of ${total} members`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rows</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`e-${i}`}
                  className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={clsx(
                    "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                    p === page
                      ? "bg-[#5fa836] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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
                  className="h-16 w-16 rounded-full object-cover border border-primary-border"
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
                  /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
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
                  /^[\\+]?[(]?[0-9]{3}[)]?[-\s\\.]?[0-9]{3}[-\s\\.]?[0-9]{4,6}$/,
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
