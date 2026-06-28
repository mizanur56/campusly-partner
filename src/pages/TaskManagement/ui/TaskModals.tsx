import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import DateTimeHighlight from "../../../components/common/DateTimeHighlight";
import RichTextEditor from "../../../components/common/Forms/RichTextEditor";
import type {
  EmployeeTask,
  EmployeeTaskPriority,
  EmployeeTaskStatus,
} from "./types";
import { PRIORITY_OPTIONS } from "./taskConstants";
import { TASK_RADIUS } from "./taskStyles";

const PRIORITY_COLOR: Record<EmployeeTaskPriority, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const STATUS_COLOR: Record<EmployeeTaskStatus, string> = {
  IN_PROGRESS: "processing",
  SUBMITTED: "purple",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface AssigneeOption {
  value: string;
  label: string;
}

interface TaskFormModalProps {
  open: boolean;
  editingTask: EmployeeTask | null;
  form: ReturnType<typeof Form.useForm>[0];
  assigneeOptions: AssigneeOption[];
  creating: boolean;
  updating: boolean;
  loadingDetail?: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export function TaskFormModal({
  open,
  editingTask,
  form,
  assigneeOptions,
  creating,
  updating,
  loadingDetail = false,
  onCancel,
  onOk,
}: TaskFormModalProps) {
  const disabledPastDate = (current: dayjs.Dayjs) =>
    current && current.startOf("day").isBefore(dayjs().startOf("day"));

  const disabledPastTimeForToday = (current: dayjs.Dayjs | null) => {
    if (!current || !current.isSame(dayjs(), "day")) return {};
    const now = dayjs();
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (h: number) =>
        h === now.hour()
          ? Array.from({ length: now.minute() + 1 }, (_, i) => i)
          : [],
    };
  };

  return (
    <Modal
      title={
        <span className="text-lg font-bold">
          {editingTask ? "Update task" : "Create new task"}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={creating || updating}
      okButtonProps={{
        disabled: loadingDetail,
        className: "!bg-[#95d66d] !border-[#95d66d] hover:!bg-[#7bc44e]",
      }}
      width={860}
      destroyOnClose
      className="task-module-modal"
      styles={{ content: { borderRadius: 6 } }}
    >
      <Typography.Paragraph type="secondary" className="mb-4">
        Write full task details clearly, set priority, and deadline.
      </Typography.Paragraph>
      <div className="relative min-h-[120px]">
        {loadingDetail ? (
          <div className="absolute inset-0 z-[1] flex items-center justify-center rounded-lg bg-white/85 dark:bg-slate-900/85">
            <Spin tip="Loading task…" />
          </div>
        ) : null}
        <Form
          layout="vertical"
          form={form}
          className={loadingDetail ? "pointer-events-none opacity-50" : undefined}
        >
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              name="dueDate"
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
          <Form.Item
            name="description"
            label="Task description"
            rules={[
              {
                validator: async (_, value) => {
                  const text = value ? value.replace(/<[^>]*>/g, "").trim() : "";
                  if (!text)
                    return Promise.reject(
                      new Error("Task description is required"),
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RichTextEditor
              placeholder="Write detailed task instruction..."
              height={240}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

interface ViewTaskModalProps {
  task: EmployeeTask | null;
  onClose: () => void;
}

export function ViewTaskModal({ task, onClose }: ViewTaskModalProps) {
  return (
    <Modal
      title={<span className="text-lg font-bold">Task details</span>}
      open={!!task}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={880}
      className="task-module-modal"
      styles={{ content: { borderRadius: 6 } }}
    >
      {task && (
        <div className="space-y-4">
          <div className={`border border-[#95d66d]/20 bg-gradient-to-br from-[#f0fae8] to-white p-5 dark:from-slate-900 dark:to-slate-950 ${TASK_RADIUS}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5fa836]">
                  Task Title
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 break-words dark:text-white">
                  {task.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Tag color={PRIORITY_COLOR[task.priority]}>{task.priority}</Tag>
                <Tag color={STATUS_COLOR[task.status]}>
                  {task.status.replace(/_/g, " ")}
                </Tag>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { label: "Due", value: task.dueDate },
                  { label: "Created", value: task.createdAt },
                  { label: "Updated", value: task.updatedAt },
                ] as const
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className={`border border-white/80 bg-white/70 p-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70 ${TASK_RADIUS}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <div className="mt-1">
                    <DateTimeHighlight value={value} className="text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className={`border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30 ${TASK_RADIUS}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Assigned To
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                {task.assignedTo?.name || "N/A"}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {task.assignedTo?.email || "-"}
              </p>
            </div>
            <div className={`border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 ${TASK_RADIUS}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Assigned By
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {task.assignedBy?.name || "N/A"}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {task.assignedBy?.email || "-"}
              </p>
            </div>
          </div>

          <div className={`border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${TASK_RADIUS}`}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Task Description
            </p>
            {task.description ? (
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            ) : (
              <p className="text-sm text-slate-400">No description added.</p>
            )}
          </div>

          {task.reviewNote && (
            <div className={`border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 ${TASK_RADIUS}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Note
              </p>
              <div
                className="mt-2 prose prose-sm max-w-none text-slate-900 leading-relaxed dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: task.reviewNote }}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

interface CompleteTaskModalProps {
  task: EmployeeTask | null;
  note: string;
  loading: boolean;
  onNoteChange: (v: string) => void;
  onCancel: () => void;
  onOk: () => void;
}

export function CompleteTaskModal({
  task,
  note,
  loading,
  onNoteChange,
  onCancel,
  onOk,
}: CompleteTaskModalProps) {
  return (
    <Modal
      title="Mark task as complete"
      open={!!task}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={loading}
      okText="Mark Complete"
      width={680}
      destroyOnClose
      styles={{ content: { borderRadius: 6 } }}
      okButtonProps={{
        className: "!bg-emerald-600 !border-emerald-600",
        icon: <CheckCircleOutlined />,
      }}
    >
      <div className={`mb-3 border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30 ${TASK_RADIUS}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Task
        </p>
        <p className="mt-0.5 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          {task?.title}
        </p>
      </div>
      <Typography.Paragraph type="secondary" className="mb-2">
        Add a completion note (optional) to summarize what was done.
      </Typography.Paragraph>
      <RichTextEditor
        placeholder="Describe what was completed..."
        value={note}
        onChange={onNoteChange}
        height={220}
      />
    </Modal>
  );
}

interface CancelTaskModalProps {
  task: EmployeeTask | null;
  note: string;
  loading: boolean;
  onNoteChange: (v: string) => void;
  onCancel: () => void;
  onOk: () => void;
}

export function CancelTaskModal({
  task,
  note,
  loading,
  onNoteChange,
  onCancel,
  onOk,
}: CancelTaskModalProps) {
  return (
    <Modal
      title="Cancel task"
      open={!!task}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={loading}
      okText="Cancel Task"
      okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
      width={560}
      destroyOnClose
    >
      <div className={`mb-3 border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30 ${TASK_RADIUS}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
          Task
        </p>
        <p className="mt-0.5 text-sm font-semibold text-red-900 dark:text-red-100">
          {task?.title}
        </p>
      </div>
      <Typography.Paragraph type="secondary" className="mb-2">
        Add a note explaining why this task is being cancelled. The assignee will
        be notified.
      </Typography.Paragraph>
      <Input.TextArea
        rows={4}
        placeholder="Cancellation reason..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
    </Modal>
  );
}

interface SummaryModalProps {
  open: boolean;
  summary: string;
  onClose: () => void;
}

export function SummaryModal({ open, summary, onClose }: SummaryModalProps) {
  return (
    <Modal
      title="Task Summary Report"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={640}
      styles={{ content: { borderRadius: 6 } }}
    >
      <div className={`whitespace-pre-wrap bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200 ${TASK_RADIUS}`}>
        {summary}
      </div>
    </Modal>
  );
}
