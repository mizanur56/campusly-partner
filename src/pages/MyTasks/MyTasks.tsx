import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  EyeOutlined,
  FireOutlined,
  InboxOutlined,
  MinusOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import PageMeta from "../../components/common/Meta/PageMeta";
import DataTable from "../../components/common/Tables/DataTable";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  PartnerTaskListItem,
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
} from "../../redux/features/tasks/partnerTasksApi";
import { useGetPartnerProfileQuery } from "../../redux/features/profile/partnerProfileApi";
import { useGetTeamMembersQuery } from "../../redux/features/teams/partnerTeamsApi";
import { useAppSelector } from "../../redux/features/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import "../../components/common/Tables/AntTable.css";
import "./MyTasks.css";

type PartnerTaskStatus = "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
type PartnerTaskPriority = "LOW" | "MEDIUM" | "HIGH";

const STATUS_OPTIONS: PartnerTaskStatus[] = ["IN_PROGRESS", "SUBMITTED", "COMPLETED"];
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
};

function StatCardIcon({
  children,
  className = "",
}: {
  children: ReactNode;
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

export default function MyTasks() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<PartnerTaskStatus | "">("");
  const [priority, setPriority] = useState<PartnerTaskPriority | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const [viewTask, setViewTask] = useState<PartnerTaskListItem | null>(null);
  const [submitModalTask, setSubmitModalTask] = useState<PartnerTaskListItem | null>(null);
  const [submitNote, setSubmitNote] = useState("");
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: tasksData, isLoading, isFetching } = useGetPartnerTasksQuery({
    page,
    limit,
    assignedToMe: true,
    createdByMe: false,
    status: status || undefined,
  });

  // Debug: Log the query and response
  console.log('MyTasks Debug - Current User ID:', currentUser?.id);
  console.log('MyTasks Debug - Query Params:', {
    page,
    limit,
    assignedToMe: true,
    createdByMe: false,
    status: status || undefined,
  });
  console.log('MyTasks Debug - Tasks Response:', tasksData);

  const { data: taskDetail, isLoading: detailLoading } = useGetTaskByIdQuery(viewTask?.id ?? "", {
    skip: !viewTask?.id,
  });

  const { data: profile } = useGetPartnerProfileQuery();
  const { data: teamMembersData } = useGetTeamMembersQuery({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const [updateTaskStatus, { isLoading: updatingStatus }] = useUpdateTaskStatusMutation();

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
        total: apiStats.total || 0,
        inProgress: (apiStats as any).inProgress || 0,
        submitted: (apiStats as any).submitted || 0,
        completed: (apiStats as any).completed || 0,
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
          submitted: 0,
          completed: 0,
          low: 0,
          medium: 0,
          high: 0,
          cancelled: 0,
          urgent: 0,
        },
      );
  }, [allRows, tasksData?.meta?.stats]);

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
    { title: "Assigned To", dataIndex: "assigned_member_name" },
    {
      title: "Actions",
      width: 180,
      render: (_: unknown, row: PartnerTaskListItem) => (
        <Space>
          <Tooltip title="View details">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setViewTask(row)} />
          </Tooltip>
          {row.status === "IN_PROGRESS" && (
            <Tooltip title="Submit task">
              <Button
                type="text"
                size="small"
                icon={<SendOutlined />}
                onClick={() => {
                  setSubmitModalTask(row);
                  setSubmitNote("");
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  
  return (
    <div className="space-y-4 my-tasks-page">
      <PageMeta title="My Tasks - Campus Transfer Partner" description="Tasks assigned to me by team members and managers." />
      <PageHeader
        title="My Tasks"
        subtitle="Track tasks assigned to you and update progress."
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "My Tasks" },
        ]}
      />

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 pt-4 pb-3 flex items-center border-b border-slate-100">
          <Typography.Title level={5} className="!mb-0 !text-gray-800 font-semibold">Task Status</Typography.Title>
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
              <SendOutlined className="text-[10px]" /> Submitted
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "SUBMITTED" ? "text-violet-600" : "text-slate-800"}`}>{stats.submitted}</p>
          </button>
          <button type="button" onClick={() => { setStatus("COMPLETED"); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 ${status === "COMPLETED" ? "bg-emerald-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <CheckCircleOutlined className="text-[10px]" /> Completed
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "COMPLETED" ? "text-emerald-600" : "text-slate-800"}`}>{stats.completed}</p>
          </button>
          <button type="button" onClick={() => { setStatus("CANCELLED" as PartnerTaskStatus); setPage(1); }} className={`relative flex-1 px-3 py-4 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400 ${status === "CANCELLED" ? "bg-rose-50" : "bg-white hover:bg-slate-50"}`}>
            <span className="absolute right-2 top-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              <CloseCircleOutlined className="text-[10px]" /> Cancelled
            </span>
            <p className={`text-2xl font-bold tabular-nums ${status === "CANCELLED" ? "text-rose-600" : "text-slate-800"}`}>{stats.cancelled}</p>
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 pt-4 pb-3 flex items-center border-b border-slate-100">
          <Typography.Title level={5} className="!mb-0 !text-gray-800 font-semibold">Priority</Typography.Title>
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

      <div className="flex flex-wrap items-center gap-2">
        <Input.Search
          placeholder="Search task title/type/assignee"
          allowClear
          className="max-w-xs"
          onSearch={(v) => {
            setSearchTerm(v.trim());
            setPage(1);
          }}
        />
      </div>

      <div className="my-tasks-table-wrapper overflow-hidden rounded-[24px] border border-neutral-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          rowKey="id"
          data={rows}
          columns={columns}
          loading={isLoading || isFetching || updatingStatus}
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
                      </div>
        ) : null}
      </Modal>

      <Modal
        title="Submit task update"
        open={!!submitModalTask}
        onCancel={() => setSubmitModalTask(null)}
        onOk={async () => {
          if (!submitModalTask) return;
          try {
            await updateTaskStatus({
              id: submitModalTask.id,
              status: "SUBMITTED",
              note: submitNote || undefined,
            }).unwrap();
          } catch {
            await updateTaskStatus({
              id: submitModalTask.id,
              status: "IN_PROGRESS",
              note: submitNote || undefined,
            }).unwrap();
          }
          setSubmitModalTask(null);
        }}
        confirmLoading={updatingStatus}
        okText="Submit for Review"
      >
        <Typography.Paragraph type="secondary">
          Add a brief note about what you completed or any blocker.
        </Typography.Paragraph>
        <Input.TextArea
          rows={4}
          placeholder="Submission note..."
          value={submitNote}
          onChange={(e) => setSubmitNote(e.target.value)}
        />
      </Modal>

          </div>
  );
}
