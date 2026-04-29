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
  StopOutlined,
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

type PartnerTaskStatus = "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "CANCELLED";
type PartnerTaskPriority = "LOW" | "MEDIUM" | "HIGH";

const STATUS_OPTIONS: PartnerTaskStatus[] = ["IN_PROGRESS", "SUBMITTED", "COMPLETED", "CANCELLED"];
const PRIORITY_OPTIONS: PartnerTaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

const priorityColor: Record<PartnerTaskPriority, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
};

const statusColor: Record<PartnerTaskStatus, string> = {
  IN_PROGRESS: "processing",
  SUBMITTED: "purple",
  COMPLETED: "success",
  CANCELLED: "error",
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
  const [cancelTask, setCancelTask] = useState<PartnerTaskListItem | null>(null);
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
    status: status || undefined,
    createdByMe: true,
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
    const currentUserId = currentUser?.id;
    const partnerUserId = profile?.userId;

    // 1. Add current user as "Me"
    if (currentUserId) {
      const selfName = String(currentUser?.name || "Me").trim();
      const selfEmail = String(currentUser?.email || "").trim();
      options.push({
        value: currentUserId,
        label: selfEmail ? `${selfName} (Me - ${selfEmail})` : `${selfName} (Me)`,
      });
    }

    // 2. Add Partner Owner if different from current user
    if (partnerUserId && partnerUserId !== currentUserId) {
      const partnerName = String(profile?.contactPersonName || profile?.businessName || "Partner Owner").trim();
      const partnerEmail = String(profile?.businessEmail || "").trim();
      options.push({
        value: partnerUserId,
        label: partnerEmail ? `${partnerName} (Owner - ${partnerEmail})` : `${partnerName} (Owner)`,
      });
    }

    // 3. Add team members, skipping current user and partner owner to avoid duplicates
    const members = teamMembersData?.data ?? [];
    members
      .filter((m) => m.status === "ACTIVE" && m.userId && m.userId !== currentUserId && m.userId !== partnerUserId)
      .forEach((m) => {
        const memberName = [m.firstName, m.lastName].filter(Boolean).join(" ").trim();
        const memberEmail = String(m.email || "").trim();
        const label = memberEmail
          ? `${memberName || memberEmail} (${memberEmail})`
          : memberName || "Unknown";
        options.push({ value: m.userId!, label });
      });
    return options;
  }, [currentUser?.id, currentUser?.name, currentUser?.email, profile, teamMembersData?.data]);

  const allRows = tasksData?.data ?? [];
  const rows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allRows.filter((r) => {
      const passPriority = !priority || r.priority === priority;
      const passSearch =
        !q ||
        r.task_title?.toLowerCase().includes(q) ||
        r.assigned_member_name?.toLowerCase().includes(q);
      return passPriority && passSearch;
    });
  }, [allRows, searchTerm, priority]);

  const stats = useMemo(() => {
    const apiStats = tasksData?.meta?.stats;
    if (apiStats && typeof apiStats === 'object') {
      return {
        total: (apiStats as any).total || 0,
        inProgress: (apiStats as any).inProgress || 0,
        submitted: (apiStats as any).submitted || 0,
        completed: (apiStats as any).completed || 0,
        reviewOpen: (apiStats as any).submitted || 0,
        low: (apiStats as any).low || 0,
        medium: (apiStats as any).medium || 0,
        high: (apiStats as any).high || 0,
        cancelled: (apiStats as any).cancelled || 0,
        urgent: (apiStats as any).urgent || 0,
      };
    }
    return allRows.reduce(
      (acc, r) => {
          acc.total += 1;
          if (r.status === "IN_PROGRESS") acc.inProgress += 1;
          if (r.status === "SUBMITTED") acc.submitted += 1;
          if (r.status === "COMPLETED") acc.completed += 1;
          if (r.status === "SUBMITTED") acc.reviewOpen += 1;
          if (r.status !== "COMPLETED" && r.status !== "CANCELLED") {
            if (r.priority === "LOW") acc.low += 1;
            if (r.priority === "MEDIUM") acc.medium += 1;
            if (r.priority === "HIGH") acc.high += 1;
          }
          if (r.status === "CANCELLED") acc.cancelled += 1;
          return acc;
        },
        {
          total: 0,
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
      render: (s: PartnerTaskStatus) => (
        <Tag color={statusColor[s]}>
          {s === "SUBMITTED" ? "IN REVIEW" : s.replace(/_/g, " ")}
        </Tag>
      ),
    },
    { title: "Assigned To", dataIndex: "assigned_member_name" },
    {
      title: "Actions",
      width: 180,
      render: (_: unknown, row: PartnerTaskListItem) => (
        <Space>
          {(row.status === "IN_PROGRESS" || row.status === "SUBMITTED") && (
            <Tooltip title="Cancel task">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => {
                  setCancelTask(row);
                }}
              />
            </Tooltip>
          )}
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

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 pt-4 pb-3 flex items-center border-b border-slate-100">
          <Typography.Title level={4} className="!mb-0 !text-gray-800 font-semibold">Task Status</Typography.Title>
        </header>
        <div className="flex divide-x divide-slate-200">
          <button type="button" onClick={() => { setStatus(""); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 ${!status ? "bg-indigo-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <AppstoreOutlined className="text-[10px]" /> All
            </span>
            <p className={`text-2xl font-bold tabular-nums ${!status ? "text-indigo-600" : "text-slate-800"}`}>{stats.total}</p>
          </button>
          <button type="button" onClick={() => { setStatus("IN_PROGRESS"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${status === "IN_PROGRESS" ? "bg-sky-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <ClockCircleOutlined className="text-[10px]" /> In Progress
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "IN_PROGRESS" ? "text-sky-600" : "text-slate-800"}`}>{stats.inProgress}</p>
          </button>
          <button type="button" onClick={() => { setStatus("SUBMITTED"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400 ${status === "SUBMITTED" ? "bg-violet-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <SendOutlined className="text-[10px]" /> In Review
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "SUBMITTED" ? "text-violet-600" : "text-slate-800"}`}>{stats.submitted}</p>
          </button>
          <button type="button" onClick={() => { setStatus("COMPLETED"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 ${status === "COMPLETED" ? "bg-emerald-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <CheckCircleOutlined className="text-[10px]" /> Completed
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "COMPLETED" ? "text-emerald-600" : "text-slate-800"}`}>{stats.completed}</p>
          </button>
          <button type="button" onClick={() => { setStatus("CANCELLED"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400 ${status === "CANCELLED" ? "bg-rose-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <CloseCircleOutlined className="text-[10px]" /> Cancelled
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "CANCELLED" ? "text-rose-600" : "text-slate-800"}`}>{stats.cancelled}</p>
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 pt-4 pb-3 flex items-center border-b border-slate-100">
          <Typography.Title level={4} className="!mb-0 !text-gray-800 font-semibold">Priority</Typography.Title>
        </header>
        <div className="flex divide-x divide-slate-200">
          <button type="button" onClick={() => { setPriority(""); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400 ${!priority ? "bg-violet-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <ControlOutlined className="text-[10px]" /> All
            </span>
            <p className={`text-2xl font-bold tabular-nums ${!priority ? "text-violet-600" : "text-slate-800"}`}>{stats.low + stats.medium + stats.high}</p>
          </button>
          <button type="button" onClick={() => { setPriority("LOW"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 ${priority === "LOW" ? "bg-slate-100" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <ArrowDownOutlined className="text-[10px]" /> Low
            </span>
            <p className={`text-2xl font-bold tabular-nums ${priority === "LOW" ? "text-slate-700" : "text-slate-800"}`}>{stats.low}</p>
          </button>
          <button type="button" onClick={() => { setPriority("MEDIUM"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${priority === "MEDIUM" ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <MinusOutlined className="text-[10px]" /> Medium
            </span>
            <p className={`text-2xl font-bold tabular-nums ${priority === "MEDIUM" ? "text-blue-600" : "text-slate-800"}`}>{stats.medium}</p>
          </button>
          <button type="button" onClick={() => { setPriority("HIGH"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 ${priority === "HIGH" ? "bg-amber-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <ArrowUpOutlined className="text-[10px]" /> High
            </span>
            <p className={`text-2xl font-bold tabular-nums ${priority === "HIGH" ? "text-amber-600" : "text-slate-800"}`}>{stats.high}</p>
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
        <Button type="primary" onClick={onOpenCreate}>Create Task</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            <Form.Item name="priority" label="Priority" rules={[{ required: true, message: "Priority is required" }]}>
              <Select options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} />
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

      <Modal
        title="Cancel task"
        open={!!cancelTask}
        onCancel={() => setCancelTask(null)}
        onOk={async () => {
          if (!cancelTask) return;
          await updateTaskStatus({
            id: cancelTask.id,
            status: "CANCELLED",
            note: "Task cancelled by creator",
          }).unwrap();
          setCancelTask(null);
        }}
        okText="Cancel Task"
        okButtonProps={{ danger: true }}
      >
        <Typography.Paragraph type="secondary">
          Are you sure you want to cancel this task? This action cannot be undone.
        </Typography.Paragraph>
        <Typography.Text strong>Task: {cancelTask?.task_title || 'Unknown Task'}</Typography.Text>
      </Modal>
    </div>
  );
}
