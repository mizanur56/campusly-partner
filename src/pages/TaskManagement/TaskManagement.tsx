import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ControlOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MinusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import PageCard from "../../components/common/Card/PageCard";
import DateTimeHighlight from "../../components/common/DateTimeHighlight";
import RichTextEditor from "../../components/common/Forms/RichTextEditor";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import "../../components/common/Tables/AntTable.css";
import DataTable from "../../components/common/Tables/DataTable";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useAppSelector } from "../../redux/features/hooks";
import {
  CreateTaskBody,
  PartnerTaskListItem,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAssigneesQuery,
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "../../redux/features/tasks/partnerTasksApi";
import "../MyTasks/MyTasks.css";

type PartnerTaskStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "CANCELLED";
type PartnerTaskPriority = "LOW" | "MEDIUM" | "HIGH";

const PRIORITY_OPTIONS: PartnerTaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

const priorityColor: Record<PartnerTaskPriority, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
};

const statusColor: Record<string, string> = {
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
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PartnerTaskListItem | null>(
    null,
  );
  const [viewTask, setViewTask] = useState<PartnerTaskListItem | null>(null);
  const [cancelTask, setCancelTask] = useState<PartnerTaskListItem | null>(
    null,
  );
  const [completeModalTask, setCompleteModalTask] =
    useState<PartnerTaskListItem | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [form] = Form.useForm();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: assigneesData } = useGetAssigneesQuery();

  const {
    data: tasksData,
    isLoading,
    isFetching,
  } = useGetPartnerTasksQuery({
    page,
    limit,
    status: status || undefined,
    createdByMe: true,
  });

  const { data: taskDetail, isLoading: detailLoading } = useGetTaskByIdQuery(
    viewTask?.id ?? editingTask?.id ?? "",
    { skip: !viewTask?.id && !editingTask?.id },
  );

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [updateTaskStatus, { isLoading: updatingStatus }] =
    useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const assigneeOptions = useMemo(() => {
    const currentUserId = currentUser?.id;
    return (assigneesData ?? []).map((a) => ({
      value: a.userId,
      label:
        a.role === "OWNER"
          ? `${a.name} (Owner - ${a.email})`
          : a.userId === currentUserId
            ? `${a.name} (Me - ${a.email})`
            : `${a.name} (${a.email})`,
    }));
  }, [assigneesData, currentUser?.id]);

  const allRows = tasksData?.data ?? [];
  const rows = useMemo(
    () =>
      allRows.filter((r) => {
        if (priority && (r.status === "COMPLETED" || r.status === "CANCELLED"))
          return false;
        return !priority || r.priority === priority;
      }),
    [allRows, priority],
  );

  const stats = useMemo(() => {
    const apiStats = tasksData?.meta?.stats;
    if (apiStats && typeof apiStats === "object") {
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
          task.dueTime ? `${task.dueDate} ${task.dueTime}` : task.dueDate,
          task.dueTime
            ? ["YYYY-MM-DD h:mm A", "YYYY-MM-DD HH:mm"]
            : ["YYYY-MM-DD"],
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

  const columns = [
    { title: "Title", dataIndex: "task_title", width: 240 },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (p: PartnerTaskPriority | null) =>
        p ? <Tag color={priorityColor[p]}>{p}</Tag> : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={statusColor[s] ?? "default"}>
          {s === "SUBMITTED" ? "IN REVIEW" : s.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Assigned To",
      render: (_: unknown, r: PartnerTaskListItem) =>
        `${r.assigned_member_name || "N/A"} (${r.assigned_member_email || "-"})`,
    },
    {
      title: "Assigned By",
      render: (_: unknown, r: PartnerTaskListItem) =>
        `${r.created_by_name || "N/A"} (${r.created_by_email || "-"})`,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (v: string | null | undefined) => <DateTimeHighlight value={v} />,
    },
    {
      title: "Actions",
      width: 200,
      render: (_: unknown, row: PartnerTaskListItem) => (
        <Space>
          {row.status === "IN_PROGRESS" && (
            <Tooltip title="Cancel task">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => setCancelTask(row)}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit task">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onOpenEdit(row)}
            />
          </Tooltip>
          <Tooltip title="View details">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => setViewTask(row)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this task?"
            onConfirm={() => deleteTask(row.id)}
          >
            <Tooltip title="Delete task">
              <Button type="default" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 my-tasks-page">
      <PageMeta
        title="Task Management - Campus Transfer Partner"
        description="Create, assign and review team tasks."
      />
      <PageHeader
        title="Task Management"
        subtitle="See what you assigned, monitor progress and track pending reviews."
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Task Management" },
        ]}
      />

      {/* ── Task Status ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "All Tasks",
            value: stats.total,
            icon: <AppstoreOutlined />,
            isActive: !status,
            activeColor: "border-[#237D3B] bg-[#DFF2E6]",
            activeText: "text-[#237D3B]",
            activeIcon: "bg-[#237D3B]/10 text-[#237D3B]",
            onClick: () => { setStatus(""); setPage(1); },
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: <ClockCircleOutlined />,
            isActive: status === "IN_PROGRESS",
            activeColor: "border-sky-500 bg-sky-50",
            activeText: "text-sky-600",
            activeIcon: "bg-sky-100 text-sky-600",
            onClick: () => { setStatus("IN_PROGRESS"); setPage(1); },
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <CheckCircleOutlined />,
            isActive: status === "COMPLETED",
            activeColor: "border-emerald-500 bg-emerald-50",
            activeText: "text-emerald-600",
            activeIcon: "bg-emerald-100 text-emerald-600",
            onClick: () => { setStatus("COMPLETED"); setPage(1); },
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            icon: <CloseCircleOutlined />,
            isActive: status === "CANCELLED",
            activeColor: "border-rose-500 bg-rose-50",
            activeText: "text-rose-600",
            activeIcon: "bg-rose-100 text-rose-600",
            onClick: () => { setStatus("CANCELLED"); setPage(1); },
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={`rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer focus:outline-none ${
              item.isActive ? item.activeColor : "border-primary-border bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-[18px] transition-colors ${
                item.isActive ? item.activeIcon : "bg-gray-100 text-gray-500"
              }`}>
                {item.icon}
              </span>
              <span className={`text-[12px] font-semibold ${item.isActive ? item.activeText : "text-gray-400"}`}>
                {item.label}
              </span>
            </div>
            <p className={`text-[32px] font-bold tabular-nums leading-none ${
              item.isActive ? item.activeText : "text-[#20242A]"
            }`}>
              {item.value}
            </p>
          </button>
        ))}
      </div>

      {/* ── Priority ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "All Priority",
            value: stats.low + stats.medium + stats.high,
            icon: <ControlOutlined />,
            isActive: !priority,
            activeColor: "border-violet-500 bg-violet-50",
            activeText: "text-violet-600",
            activeIcon: "bg-violet-100 text-violet-600",
            onClick: () => { setPriority(""); setPage(1); },
          },
          {
            label: "Low",
            value: stats.low,
            icon: <ArrowDownOutlined />,
            isActive: priority === "LOW",
            activeColor: "border-slate-400 bg-slate-50",
            activeText: "text-slate-600",
            activeIcon: "bg-slate-200 text-slate-600",
            onClick: () => { setPriority("LOW"); setPage(1); },
          },
          {
            label: "Medium",
            value: stats.medium,
            icon: <MinusOutlined />,
            isActive: priority === "MEDIUM",
            activeColor: "border-blue-500 bg-blue-50",
            activeText: "text-blue-600",
            activeIcon: "bg-blue-100 text-blue-600",
            onClick: () => { setPriority("MEDIUM"); setPage(1); },
          },
          {
            label: "High",
            value: stats.high,
            icon: <ArrowUpOutlined />,
            isActive: priority === "HIGH",
            activeColor: "border-amber-500 bg-amber-50",
            activeText: "text-amber-600",
            activeIcon: "bg-amber-100 text-amber-600",
            onClick: () => { setPriority("HIGH"); setPage(1); },
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={`rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer focus:outline-none ${
              item.isActive ? item.activeColor : "border-primary-border bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-[18px] transition-colors ${
                item.isActive ? item.activeIcon : "bg-gray-100 text-gray-500"
              }`}>
                {item.icon}
              </span>
              <span className={`text-[12px] font-semibold ${item.isActive ? item.activeText : "text-gray-400"}`}>
                {item.label}
              </span>
            </div>
            <p className={`text-[32px] font-bold tabular-nums leading-none ${
              item.isActive ? item.activeText : "text-[#20242A]"
            }`}>
              {item.value}
            </p>
          </button>
        ))}
      </div>

      <PageCard>
        <div className="flex justify-end mb-4">
          <Button type="primary" onClick={onOpenCreate}>
            Create Task
          </Button>
        </div>

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
      </PageCard>
      <Modal
        title={editingTask ? "Update task" : "Create new task"}
        open={openFormModal}
        onCancel={() => {
          setOpenFormModal(false);
          setEditingTask(null);
        }}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        width={860}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary" className="mb-4">
          Write full task details clearly, set priority, and deadline.
        </Typography.Paragraph>
        <Form layout="vertical" form={form}>
          <Form.Item
            name="title"
            label="Task title"
            rules={[{ required: true, message: "Task title is required" }]}
          >
            <Input placeholder="Ex: Follow up with student application" />
          </Form.Item>
          <Form.Item
            name="assignedToUserId"
            label="Assign to team member"
            rules={[{ required: true, message: "Please select team member" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={assigneeOptions}
            />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: "Priority is required" }]}
            >
              <Select
                options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))}
              />
            </Form.Item>
            <Form.Item
              name="dueDateTime"
              label="Due date & time"
              rules={[
                { required: true, message: "Due date and time is required" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (dayjs(value).isBefore(dayjs())) {
                      return Promise.reject(
                        new Error(
                          "Please select current/future time for today or a future date.",
                        ),
                      );
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
          </div>
          <Form.Item name="description" label="Task description">
            <RichTextEditor
              placeholder="Write detailed task instruction..."
              height={240}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Task details"
        open={!!viewTask}
        onCancel={() => setViewTask(null)}
        footer={[
          taskDetail?.status === "IN_PROGRESS" ? (
            <Button
              key="complete"
              type="primary"
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              onClick={() => {
                setCompleteModalTask(viewTask);
                setViewTask(null);
              }}
            >
              Mark as Complete
            </Button>
          ) : null,
          <Button key="close" onClick={() => setViewTask(null)}>
            Close
          </Button>,
        ]}
        width={880}
      >
        {detailLoading && !taskDetail ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : taskDetail ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary-border bg-gradient-to-r from-slate-50 to-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Task Title
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 break-words">
                    {taskDetail.task_title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {taskDetail.priority ? (
                    <Tag
                      color={
                        priorityColor[
                          taskDetail.priority as PartnerTaskPriority
                        ]
                      }
                    >
                      {taskDetail.priority}
                    </Tag>
                  ) : null}
                  <Tag color={statusColor[taskDetail.status] ?? "default"}>
                    {taskDetail.status === "SUBMITTED"
                      ? "IN REVIEW"
                      : taskDetail.status.replace(/_/g, " ")}
                  </Tag>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-primary-border bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Due
                  </p>
                  <div className="mt-1">
                    <DateTimeHighlight
                      value={taskDetail.due_date}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-primary-border bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Created
                  </p>
                  <div className="mt-1">
                    <DateTimeHighlight
                      value={taskDetail.createdAt}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-primary-border bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Updated
                  </p>
                  <div className="mt-1">
                    <DateTimeHighlight
                      value={taskDetail.updatedAt}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Assigned To
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-900">
                  {taskDetail.assignedTo?.name || "—"}
                </p>
                <p className="text-xs text-blue-700">
                  {taskDetail.assignedTo?.email || ""}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Assigned By
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">
                  {taskDetail.created_by || "—"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-primary-border bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Task Description
              </p>
              {taskDetail.task_description ? (
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: taskDetail.task_description,
                  }}
                />
              ) : (
                <p className="text-sm text-gray-400">No description added.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-purple-700">
                  Submission Note
                </p>
                {taskDetail.submissionNote ? (
                  <div
                    className="mt-2 text-sm leading-relaxed text-purple-900 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: taskDetail.submissionNote,
                    }}
                  />
                ) : (
                  <p className="mt-2 text-sm text-purple-400">
                    No submission note provided.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-primary-border bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-700">
                  Completion Note
                </p>
                {taskDetail.reviewNote ? (
                  <div
                    className="mt-2 text-sm leading-relaxed text-slate-900 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: taskDetail.reviewNote }}
                  />
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    No completion note provided.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
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
          Are you sure you want to cancel this task? This action cannot be
          undone.
        </Typography.Paragraph>
        <Typography.Text strong>
          Task: {cancelTask?.task_title || "Unknown Task"}
        </Typography.Text>
      </Modal>

      <Modal
        title="Mark task as complete"
        open={!!completeModalTask}
        onCancel={() => setCompleteModalTask(null)}
        onOk={async () => {
          if (!completeModalTask) return;
          await updateTaskStatus({
            id: completeModalTask.id,
            status: "COMPLETED",
            note: completeNote || undefined,
          }).unwrap();
          setCompleteModalTask(null);
        }}
        confirmLoading={updatingStatus}
        okText="Mark Complete"
        width={680}
        destroyOnClose
      >
        <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Task
          </p>
          <p className="mt-0.5 text-sm font-semibold text-emerald-900">
            {completeModalTask?.task_title}
          </p>
        </div>
        <Typography.Paragraph type="secondary" className="mb-2">
          Add a completion note (optional) to summarize what was done.
        </Typography.Paragraph>
        <RichTextEditor
          placeholder="Describe what was completed..."
          value={completeNote}
          onChange={(v: string) => setCompleteNote(v)}
          height={220}
        />
      </Modal>
    </div>
  );
}
