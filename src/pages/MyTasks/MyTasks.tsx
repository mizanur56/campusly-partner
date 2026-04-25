import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Modal,
  Form,
  Button,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../components/common/Meta/PageMeta";
import DataTable from "../../components/common/Tables/DataTable";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  PartnerTaskListItem,
  CreateTaskBody,
} from "../../redux/features/tasks/partnerTasksApi";
import { useGetTeamMembersQuery } from "../../redux/features/teams/partnerTeamsApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";
import { useGetStudentsQuery } from "../../redux/features/users/usersApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import "../../components/common/Tables/AntTable.css";
import "./MyTasks.css";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const TASK_TYPE_OPTIONS = [
  { value: "TO_DO", label: "To Do" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "REMINDER", label: "Reminder" },
  { value: "INTERNAL_TASK", label: "Internal Task" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}
// bb


function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function MyTasks() {
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [assignedToMe, setAssignedToMe] = useState<boolean | undefined>(undefined);
  const [createdByMe, setCreatedByMe] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (isTeamMember) setAssignedToMe(true);
  }, [isTeamMember]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [createForm] = Form.useForm();

  const { data: profile } = useGetPartnerProfileQuery();
  const { data: studentsResponse } = useGetStudentsQuery({ page: 1, limit: 100 });
  const { data: teamMembersData } = useGetTeamMembersQuery({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
  } = useGetPartnerTasksQuery({
    page,
    limit,
    status: statusFilter.trim() || undefined,
    assignedToMe: isTeamMember ? true : assignedToMe,
    createdByMe,
  });
  const { data: taskDetail, isLoading: detailLoading } = useGetTaskByIdQuery(
    selectedTaskId ?? "",
    { skip: !selectedTaskId }
  );

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const tasks: PartnerTaskListItem[] = tasksData?.data ?? [];
  const meta = tasksData?.meta;
  const total = meta?.total ?? 0;

  const assigneeOptions = React.useMemo(() => {
    const options: { value: string; label: string }[] = [];
    if (profile?.userId) {
      options.push({
        value: profile.userId,
        label: (profile as { name?: string }).name ?? "Me",
      });
    }
    const members = teamMembersData?.data ?? [];
    members
      .filter((m) => m.status === "ACTIVE" && m.userId)
      .forEach((m) => {
        const label = [m.firstName, m.lastName].filter(Boolean).join(" ").trim() || m.email;
        options.push({ value: m.userId!, label });
      });
    return options;
  }, [profile, teamMembersData?.data]);

  const studentOptions = React.useMemo(() => {
    const list = studentsResponse?.data ?? [];
    return list.map((s) => ({
      value: s.id,
      label: s.name ? `${s.name}${s.email ? ` (${s.email})` : ""}` : s.email || s.id,
    }));
  }, [studentsResponse?.data]);

  const openViewModal = (record: PartnerTaskListItem) => {
    setSelectedTaskId(record.id);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedTaskId(null);
    setIsViewModalOpen(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      message.success("Status updated.");
      if (selectedTaskId === taskId) {
        // Refetch will happen via invalidatesTags
      }
    } catch {
      // baseApi toast
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId).unwrap();
      message.success("Task removed.");
      setDeleteConfirmId(null);
      if (selectedTaskId === taskId) closeViewModal();
    } catch {
      // baseApi toast
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const body: CreateTaskBody = {
        title: values.title,
        description: values.description,
        assignedToUserId: values.assignedToUserId,
        taskType: values.taskType,
        priority: values.priority,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
      };
      if (values.studentId) body.studentId = values.studentId;
      await createTask(body).unwrap();
      message.success("Task created.");
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch {
      // validation or baseApi toast
    }
  };

  const columns: ColumnsType<PartnerTaskListItem> = [
    {
      title: "Task",
      dataIndex: "task_title",
      key: "task_title",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Assigned to",
      dataIndex: "assigned_member_name",
      key: "assigned_member_name",
      width: 140,
      render: (name: string) => (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
          {name || "—"}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_date_time",
      key: "created_date_time",
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: "Due",
      key: "due",
      width: 140,
      render: (_: unknown, r: PartnerTaskListItem) => {
        const d = formatDate(r.dueDate);
        const t = r.dueTime ? ` ${r.dueTime}` : "";
        return d !== "—" ? d + t : "—";
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p: string | null) => (p ? <Tag>{p}</Tag> : "—"),
    },
    {
      title: "Type",
      dataIndex: "taskType",
      key: "taskType",
      width: 120,
      render: (t: string | null) => (t ? String(t).replace(/_/g, " ") : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : status === "IN_PROGRESS"
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {status === "IN_PROGRESS" ? "In Progress" : status === "COMPLETED" ? "Completed" : "Pending"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_: unknown, record: PartnerTaskListItem) => (
        <Space size="small" wrap onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openViewModal(record);
            }}
          >
            View task
          </Button>
          <Tooltip title="Remove task">
            <Button
              size="small"
              danger
              loading={deleteConfirmId === record.id && isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmId(record.id);
                Modal.confirm({
                  title: "Remove task?",
                  content: "This task will be removed. This action cannot be undone.",
                  okText: "Remove",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: () => handleDelete(record.id),
                  onCancel: () => setDeleteConfirmId(null),
                });
              }}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="my-tasks-page">
      <PageMeta
        title="My Tasks - Campus Transfer Partner"
        description="View and manage your tasks. Filter by status, assigned to me, or created by me."
      />

      <PageHeader
        title="My Tasks"
        subtitle="View and manage your tasks"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "My Tasks" },
        ]}
        extra={<button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + Create task
        </button>}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select
          placeholder="Status"
          value={statusFilter || undefined}
          onChange={(v) => {
            setStatusFilter(v ?? "");
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          allowClear
          size="large"
          style={{ width: 200 }}
        />
        <button
          type="button"
          onClick={() => {
            setAssignedToMe(assignedToMe === true ? undefined : true);
            setPage(1);
          }}
          className={`flex h-10 items-center rounded-lg border px-4 py-2 text-sm ${
            assignedToMe === true
              ? "border-primary-500 bg-primary-500 text-white hover:bg-primary-600"
              : "border-gray-300 bg-white hover:bg-gray-50"
          }`}
        >
          Assigned to me
        </button>
        <button
          type="button"
          onClick={() => {
            setCreatedByMe(createdByMe === true ? undefined : true);
            setPage(1);
          }}
          className={`flex h-10 items-center rounded-lg border px-4 py-2 text-sm ${
            createdByMe === true
              ? "border-primary-500 bg-primary-500 text-white hover:bg-primary-600"
              : "border-gray-300 bg-white hover:bg-gray-50"
          }`}
        >
          Created by me
        </button>
      </div>

      <div className="my-tasks-table-wrapper overflow-hidden rounded-[24px] border border-neutral-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          data={tasks}
          columns={columns}
          rowKey="id"
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={total}
          loading={tasksLoading || tasksFetching}
          isPaginate
          showHeader
          showSizeChanger
          noInnerBorder
          pagination={{ pageSizeOptions: ["10", "20", "50"] }}
        />
      </div>

      {/* View / Detail modal */}
      <Modal
        open={isViewModalOpen}
        title="Task details"
        onCancel={closeViewModal}
        footer={null}
        centered
        width={520}
      >
        {detailLoading && !taskDetail ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : taskDetail ? (
          <div className="space-y-5 text-sm">
            <section className="space-y-1 border-b border-neutral-100 pb-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Task</p>
              <p className="font-medium text-gray-900">{taskDetail.task_title}</p>
              {taskDetail.task_description && (
                <p className="mt-1 leading-relaxed text-gray-600">{taskDetail.task_description}</p>
              )}
            </section>
            {taskDetail.associated_with && (
              <section className="rounded-lg bg-neutral-50 px-3 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Associated with</p>
                <p className="mt-1 text-gray-900">{taskDetail.associated_with}</p>
              </section>
            )}
            <section className="grid grid-cols-1 gap-4 border-t border-neutral-100 pt-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Created by</p>
                <p className="text-gray-900">{taskDetail.created_by ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Assigned to</p>
                <p className="text-gray-900">{taskDetail.assignedTo?.name ?? taskDetail.assignedTo?.email ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Due</p>
                <p className="text-gray-900">
                  {formatDate(taskDetail.due_date)}
                  {taskDetail.due_time ? ` ${taskDetail.due_time}` : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Status</p>
                <Space>
                  <Select
                    value={taskDetail.status}
                    onChange={(v) => handleStatusChange(taskDetail.id, v)}
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "COMPLETED", label: "Completed" },
                    ]}
                    loading={isUpdatingStatus}
                    style={{ minWidth: 140 }}
                  />
                </Space>
              </div>
            </section>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                danger
                loading={isDeleting && deleteConfirmId === taskDetail.id}
                onClick={() => {
                  Modal.confirm({
                    title: "Remove task?",
                    content: "This action cannot be undone.",
                    okText: "Remove",
                    okType: "danger",
                    onOk: () => handleDelete(taskDetail.id),
                  });
                }}
              >
                Delete task
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Create task modal */}
      <Modal
        open={isCreateModalOpen}
        title="Create task"
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Create"
        okButtonProps={{ loading: isCreating }}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g. Follow up with student" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description" />
          </Form.Item>
          <Form.Item
            name="assignedToUserId"
            label="Assign to"
            rules={[{ required: true, message: "Assign to is required" }]}
          >
            <Select
              placeholder="Select team member"
              options={assigneeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="studentId"
            label="Student (optional)"
            help="Link this task to a student. Same list as in Programs & Schools."
          >
            <Select
              placeholder="Select student"
              options={studentOptions}
              allowClear
              showSearch
              optionFilterProp="label"
              notFoundContent={studentsResponse?.data?.length === 0 ? "No students found." : undefined}
            />
          </Form.Item>
          <Form.Item name="taskType" label="Type">
            <Select placeholder="Task type" options={TASK_TYPE_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select placeholder="Priority" options={PRIORITY_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="dueTime" label="Due time">
            <Input placeholder="e.g. 12:04 PM" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
