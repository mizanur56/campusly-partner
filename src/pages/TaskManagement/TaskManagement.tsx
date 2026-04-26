import { useMemo, useState } from "react";
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FireOutlined,
  InboxOutlined,
  MinusOutlined,
  RedoOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import PageMeta from "../../components/common/Meta/PageMeta";
import DataTable from "../../components/common/Tables/DataTable";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  CreateTaskBody,
  PartnerTaskListItem,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "../../redux/features/tasks/partnerTasksApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";
import { useGetTeamMembersQuery } from "../../redux/features/teams/partnerTeamsApi";
import { useAppSelector } from "../../redux/features/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import "../../components/common/Tables/AntTable.css";
import "../MyTasks/MyTasks.css";

type PartnerTaskStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
type PartnerTaskPriority = "LOW" | "MEDIUM" | "HIGH";

const STATUS_OPTIONS: PartnerTaskStatus[] = ["PENDING", "IN_PROGRESS", "SUBMITTED", "COMPLETED"];
const PRIORITY_OPTIONS: PartnerTaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
const TASK_TYPE_OPTIONS: NonNullable<CreateTaskBody["taskType"]>[] = [
  "TO_DO",
  "FOLLOW_UP",
  "REMINDER",
  "INTERNAL_TASK",
];

const priorityColor: Record<PartnerTaskPriority, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
};

const statusColor: Record<PartnerTaskStatus, string> = {
  PENDING: "default",
  IN_PROGRESS: "processing",
  SUBMITTED: "purple",
  COMPLETED: "success",
};

function StatCardIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base leading-none ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function TaskManagement() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<PartnerTaskStatus | "">("");
  const [priority, setPriority] = useState<PartnerTaskPriority | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PartnerTaskListItem | null>(null);
  const [viewTask, setViewTask] = useState<PartnerTaskListItem | null>(null);
  const [reviewTask, setReviewTask] = useState<PartnerTaskListItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"COMPLETE" | "REASSIGN">("COMPLETE");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewReassignTo, setReviewReassignTo] = useState<string>();
  const [form] = Form.useForm();
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: profile } = useGetPartnerProfileQuery();
  const { data: teamMembersData } = useGetTeamMembersQuery({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const { data: tasksData, isLoading, isFetching } = useGetPartnerTasksQuery({
    page,
    limit,
    createdByMe: true,
    status: status || undefined,
  });

  const { data: taskDetail, isLoading: detailLoading } = useGetTaskByIdQuery(
    viewTask?.id ?? editingTask?.id ?? "",
    { skip: !viewTask?.id && !editingTask?.id },
  );
  const { data: reviewTaskDetail } = useGetTaskByIdQuery(reviewTask?.id ?? "", {
    skip: !reviewTask?.id,
  });

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [updateTaskStatus, { isLoading: updatingStatus }] = useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const assigneeOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    if (profile?.userId) {
      const selfName = String(currentUser?.name || "Me").trim();
      const selfEmail = String(currentUser?.email || "").trim();
      options.push({
        value: profile.userId,
        label: selfEmail ? `${selfName} (${selfEmail})` : selfName,
      });
    }
    const members = teamMembersData?.data ?? [];
    members
      .filter((m) => m.status === "ACTIVE" && m.userId)
      .forEach((m) => {
        const memberName = [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
        const memberEmail = String(m.email || "").trim();
        const label = memberEmail
          ? `${memberName || memberEmail} (${memberEmail})`
          : memberName || "Unknown";
        options.push({ value: m.userId!, label });
      });
    return options;
  }, [profile, currentUser?.name, currentUser?.email, teamMembersData?.data]);

  const allRows = tasksData?.data ?? [];
  const rows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allRows.filter((r) => {
      const passPriority = !priority || r.priority === priority;
      const passSearch =
        !q ||
        r.task_title?.toLowerCase().includes(q) ||
        r.assigned_member_name?.toLowerCase().includes(q) ||
        r.taskType?.toLowerCase().includes(q);
      return passPriority && passSearch;
    });
  }, [allRows, searchTerm, priority]);

  const stats = useMemo(() => {
    const apiStats = tasksData?.meta?.stats;
    if (apiStats) {
      return {
        total: apiStats.total,
        pending: apiStats.byStatus.PENDING,
        inProgress: apiStats.byStatus.IN_PROGRESS,
        submitted: apiStats.byStatus.SUBMITTED,
        completed: apiStats.byStatus.COMPLETED,
        reviewOpen: apiStats.byStatus.SUBMITTED,
        low: apiStats.byPriority.LOW,
        medium: apiStats.byPriority.MEDIUM,
        high: apiStats.byPriority.HIGH,
        cancelled: apiStats.byStatus.CANCELLED,
        urgent: apiStats.byPriority.URGENT,
      };
    }
    return allRows.reduce(
      (acc, r) => {
          acc.total += 1;
          if (r.status === "PENDING") acc.pending += 1;
          if (r.status === "IN_PROGRESS") acc.inProgress += 1;
          if (r.status === "SUBMITTED") acc.submitted += 1;
          if (r.status === "COMPLETED") acc.completed += 1;
          if (r.status === "SUBMITTED") acc.reviewOpen += 1;
          if (r.priority === "LOW") acc.low += 1;
          if (r.priority === "MEDIUM") acc.medium += 1;
          if (r.priority === "HIGH") acc.high += 1;
          return acc;
        },
        {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          submitted: 0,
          reviewOpen: 0,
          low: 0,
          medium: 0,
          high: 0,
          cancelled: 0,
          urgent: 0,
        },
      );
  }, [allRows, tasksData?.meta?.stats]);

  const onOpenCreate = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({ priority: "MEDIUM" });
    setOpenFormModal(true);
  };

  const onOpenEdit = (task: PartnerTaskListItem) => {
    const mergedDue = task.dueDate
      ? dayjs(
          task.dueTime
            ? `${task.dueDate} ${task.dueTime}`
            : task.dueDate,
          task.dueTime ? ["YYYY-MM-DD h:mm A", "YYYY-MM-DD HH:mm"] : ["YYYY-MM-DD"],
        )
      : undefined;
    setEditingTask(task);
    form.setFieldsValue({
      title: task.task_title,
      taskType: task.taskType || undefined,
      priority: task.priority || undefined,
      dueDateTime: mergedDue && mergedDue.isValid() ? mergedDue : undefined,
      assignedToUserId: taskDetail?.assignedTo?.id || undefined,
      description: taskDetail?.task_description || "",
    });
    setOpenFormModal(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const dueDateTime = values.dueDateTime ? dayjs(values.dueDateTime) : null;
    const payload: CreateTaskBody = {
      title: values.title,
      description: values.description || undefined,
      assignedToUserId: values.assignedToUserId,
      taskType: values.taskType || undefined,
      priority: values.priority || undefined,
      dueDate: dueDateTime ? dueDateTime.format("YYYY-MM-DD") : undefined,
      dueTime: dueDateTime ? dueDateTime.format("hh:mm A") : undefined,
    };
    if (editingTask) {
      await updateTask({ id: editingTask.id, body: payload }).unwrap();
    } else {
      await createTask(payload).unwrap();
    }
    setOpenFormModal(false);
    form.resetFields();
    setEditingTask(null);
  };

  const disabledPastDate = (current: dayjs.Dayjs) =>
    current && current.startOf("day").isBefore(dayjs().startOf("day"));

  const disabledPastTimeForToday = (current: dayjs.Dayjs | null) => {
    if (!current || !current.isSame(dayjs(), "day")) return {};
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    return {
      disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
      disabledMinutes: (selectedHour: number) =>
        selectedHour === currentHour
          ? Array.from({ length: currentMinute + 1 }, (_, i) => i)
          : [],
    };
  };

  const statCardClass = (
    active: boolean,
    idleBorder: string,
    idleBg: string,
    accent: "indigo" | "violet",
  ) => {
    const activeCls =
      accent === "indigo"
        ? "border-indigo-500 bg-indigo-50/90"
        : "border-violet-600 bg-violet-50/90";
    return `rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
      accent === "indigo"
        ? "focus-visible:ring-indigo-300"
        : "focus-visible:ring-violet-300"
    } ${
      active
        ? activeCls
        : `${idleBorder} ${idleBg} hover:border-slate-300`
    }`;
  };

  const columns = [
    { title: "Title", dataIndex: "task_title", width: 240 },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (p: PartnerTaskPriority | null) => (p ? <Tag color={priorityColor[p]}>{p}</Tag> : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: PartnerTaskStatus) => <Tag color={statusColor[s]}>{s.replace(/_/g, " ")}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "taskType",
      render: (t: string | null) => (t ? t.replace(/_/g, " ") : "—"),
    },
    { title: "Assigned To", dataIndex: "assigned_member_name" },
    {
      title: "Actions",
      width: 140,
      render: (_: unknown, row: PartnerTaskListItem) => (
        <Space>
          {row.status === "SUBMITTED" && (
            <Tooltip title="Review submission">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setReviewTask(row);
                  setReviewDecision("COMPLETE");
                  setReviewNote("");
                  setReviewReassignTo(undefined);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit task">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onOpenEdit(row)} />
          </Tooltip>
          <Tooltip title="View details">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setViewTask(row)} />
          </Tooltip>
          <Popconfirm title="Delete this task?" onConfirm={() => deleteTask(row.id)}>
            <Tooltip title="Delete task">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 my-tasks-page">
      <PageMeta title="Task Management - Campus Transfer Partner" description="Create, assign and review team tasks." />
      <PageHeader
        title="Task Management"
        subtitle="See what you assigned, monitor progress and track pending reviews."
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Task Management" },
        ]}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <header className="mb-3 flex items-start gap-3 border-b border-slate-100 pb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-600">
            <CheckCircleOutlined />
          </span>
          <div>
            <Typography.Title level={5} className="!mb-0.5 !text-base">
              Task status
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs">
              Click a stage to filter the table. Numbers here are overall totals for this view and do not change when you filter.
            </Typography.Text>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <button type="button" onClick={() => setStatus("")} className={statCardClass(!status, "border-slate-200", "bg-slate-50/90", "indigo")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-slate-100 text-slate-600"><AppstoreOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">All statuses</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.total}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setStatus("PENDING")} className={statCardClass(status === "PENDING", "border-slate-200", "bg-slate-50/90", "indigo")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-slate-200/80 text-slate-700"><InboxOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">To do</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.pending}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setStatus("IN_PROGRESS")} className={statCardClass(status === "IN_PROGRESS", "border-sky-200", "bg-sky-50/80", "indigo")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-sky-100 text-sky-700"><ClockCircleOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">In progress</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-sky-950">{stats.inProgress}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setStatus("SUBMITTED")} className={statCardClass(status === "SUBMITTED", "border-violet-200", "bg-violet-50/80", "indigo")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-violet-100 text-violet-700"><SendOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">Submitted</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-violet-950">{stats.submitted}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setStatus("COMPLETED")} className={statCardClass(status === "COMPLETED", "border-emerald-200", "bg-emerald-50/80", "indigo")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-emerald-100 text-emerald-700"><CheckCircleOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">Completed</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-emerald-950">{stats.completed}</p></div>
            </div>
          </button>
          <button type="button" disabled className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-left opacity-70 cursor-not-allowed">
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-rose-100 text-rose-700"><CloseCircleOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-rose-800">Cancelled</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-rose-950">{stats.cancelled}</p></div>
            </div>
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <header className="mb-3 flex items-start gap-3 border-b border-slate-100 pb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-600">
            <FireOutlined />
          </span>
          <div>
            <Typography.Title level={5} className="!mb-0.5 !text-base">
              Priority
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs">
              Click a level to filter by urgency. Counts stay as overall totals; they do not change when status or priority filters are applied.
            </Typography.Text>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <button type="button" onClick={() => setPriority("")} className={statCardClass(!priority, "border-slate-200", "bg-slate-50/90", "violet")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-slate-100 text-slate-600"><ControlOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">All priorities</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.total}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setPriority("LOW")} className={statCardClass(priority === "LOW", "border-slate-200", "bg-slate-50/90", "violet")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-slate-200/80 text-slate-600"><ArrowDownOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Low</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.low}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setPriority("MEDIUM")} className={statCardClass(priority === "MEDIUM", "border-blue-200", "bg-blue-50/80", "violet")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-blue-100 text-blue-700"><MinusOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">Medium</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-blue-950">{stats.medium}</p></div>
            </div>
          </button>
          <button type="button" onClick={() => setPriority("HIGH")} className={statCardClass(priority === "HIGH", "border-amber-200", "bg-amber-50/80", "violet")}>
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-amber-100 text-amber-800"><ArrowUpOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">High</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-amber-950">{stats.high}</p></div>
            </div>
          </button>
          <button type="button" disabled className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2.5 text-left opacity-70 cursor-not-allowed">
            <div className="flex items-start gap-2.5">
              <StatCardIcon className="bg-red-100 text-red-700"><ThunderboltOutlined /></StatCardIcon>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-red-800">Urgent</p><p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-red-950">{stats.urgent}</p></div>
            </div>
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input.Search
          placeholder="Search task title/type/assignee"
          allowClear
          className="max-w-xs"
          onSearch={(v) => {
            setSearchTerm(v.trim());
            setPage(1);
          }}
        />
        <Button type="primary" onClick={onOpenCreate}>
          Create Task
        </Button>
      </div>

      <div className="my-tasks-table-wrapper overflow-hidden rounded-[24px] border border-neutral-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          rowKey="id"
          data={rows}
          columns={columns}
          loading={isLoading || isFetching || deleting || updatingStatus}
          currentPage={page}
          limit={limit}
          setCurrentPage={setPage}
          total={tasksData?.meta?.total ?? 0}
          isPaginate
          showHeader
          noInnerBorder
          pagination={{
            current: page,
            pageSize: limit,
            total: tasksData?.meta?.total ?? 0,
            onChange: (p: number) => setPage(p),
            showSizeChanger: false,
          }}
        />
      </div>

      <Modal
        title={editingTask ? "Update task" : "Create new task"}
        open={openFormModal}
        onCancel={() => {
          setOpenFormModal(false);
          setEditingTask(null);
        }}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        destroyOnHidden
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Task title" rules={[{ required: true, message: "Task title is required" }]}>
            <Input placeholder="Ex: Follow up with student" />
          </Form.Item>
          <Form.Item
            name="assignedToUserId"
            label="Assign to team member"
            rules={[{ required: true, message: "Please select team member" }]}
          >
            <Select showSearch optionFilterProp="label" options={assigneeOptions} />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item name="priority" label="Priority" rules={[{ required: true, message: "Priority is required" }]}>
              <Select options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} />
            </Form.Item>
            <Form.Item name="taskType" label="Task type">
              <Select options={TASK_TYPE_OPTIONS.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))} allowClear />
            </Form.Item>
          </div>
          <Form.Item
            name="dueDateTime"
            label="Due date & time"
            rules={[
              { required: true, message: "Due date and time is required" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (dayjs(value).isBefore(dayjs())) {
                    return Promise.reject(new Error("Current or future time is required."));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: "HH:mm" }}
              disabledDate={disabledPastDate}
              disabledTime={disabledPastTimeForToday}
              minuteStep={5}
            />
          </Form.Item>
          <Form.Item name="description" label="Task description">
            <Input.TextArea rows={4} placeholder="Write detailed task instructions..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Task details"
        open={!!viewTask}
        onCancel={() => setViewTask(null)}
        footer={null}
        width={760}
      >
        {detailLoading && !taskDetail ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : taskDetail ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{taskDetail.task_title}</h3>
                <Space>
                  {taskDetail.priority ? <Tag color={priorityColor[taskDetail.priority as PartnerTaskPriority]}>{taskDetail.priority}</Tag> : null}
                  <Tag color={statusColor[taskDetail.status as PartnerTaskStatus]}>{taskDetail.status.replace(/_/g, " ")}</Tag>
                </Space>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{taskDetail.task_description || "No description added."}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[11px] uppercase text-slate-500">Assigned to</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{taskDetail.assignedTo?.name || taskDetail.assignedTo?.email || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[11px] uppercase text-slate-500">Created by</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{taskDetail.created_by || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-[11px] uppercase text-slate-500">Due</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskDetail.due_date ? dayjs(taskDetail.due_date).format("YYYY-MM-DD") : "—"}{" "}
                  {taskDetail.due_time || ""}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-purple-700">Submission Note</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-purple-900">
                  {taskDetail.submissionNote || "No submission note provided."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-700">Review Note</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                  {taskDetail.reviewNote || "No review note provided."}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <p className="mb-2 text-xs uppercase text-gray-500">Update status / review</p>
              <Select
                value={taskDetail.status}
                onChange={(nextStatus) =>
                  updateTaskStatus({ id: taskDetail.id, status: nextStatus }).unwrap()
                }
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                loading={updatingStatus}
                style={{ minWidth: 220 }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Review submitted task"
        open={!!reviewTask}
        onCancel={() => setReviewTask(null)}
        onOk={async () => {
          if (!reviewTask) return;
          if (reviewDecision === "COMPLETE") {
            await updateTaskStatus({
              id: reviewTask.id,
              status: "COMPLETED",
              note: reviewNote || undefined,
            }).unwrap();
          } else {
            if (!reviewReassignTo) return;
            await updateTaskStatus({
              id: reviewTask.id,
              status: "IN_PROGRESS",
              note: reviewNote || undefined,
              reassignToUserId: reviewReassignTo,
            }).unwrap();
          }
          setReviewTask(null);
        }}
        confirmLoading={updatingStatus}
        okText={reviewDecision === "COMPLETE" ? "Mark Complete" : "Reassign"}
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Task</p>
            <p className="font-medium text-gray-800">{reviewTask?.task_title}</p>
            <p className="text-xs text-gray-500 mt-1">
              Current assignee: {reviewTaskDetail?.assignedTo?.name || "N/A"}
            </p>
            {reviewTaskDetail?.submissionNote ? (
              <>
                <Divider className="my-2" />
                <p className="text-xs text-purple-700">
                  Submission note: {reviewTaskDetail.submissionNote}
                </p>
              </>
            ) : null}
          </div>
          <Tabs
            activeKey={reviewDecision}
            onChange={(k) => setReviewDecision(k as "COMPLETE" | "REASSIGN")}
            items={[
              {
                key: "COMPLETE",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <CheckCircleOutlined />
                    Complete
                  </span>
                ),
                children: (
                  <Input.TextArea
                    rows={4}
                    placeholder="Add completion/review note..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                ),
              },
              {
                key: "REASSIGN",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <RedoOutlined />
                    Reassign
                  </span>
                ),
                children: (
                  <div className="space-y-3">
                    <Select
                      className="w-full mb-3"
                      placeholder="Select team member (same or different)"
                      value={reviewReassignTo}
                      onChange={(value) => setReviewReassignTo(value)}
                      options={assigneeOptions.map((opt) => ({
                        value: opt.value,
                        label:
                          opt.value === reviewTaskDetail?.assignedTo?.id
                            ? `${opt.label} - current`
                            : opt.label,
                      }))}
                    />
                    <Input.TextArea
                      rows={4}
                      placeholder="Add reassign/rework note..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
