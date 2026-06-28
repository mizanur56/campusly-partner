import { Form } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  countActiveFilters,
  type FilterField,
  type FilterValues,
} from "../../../components/common/Filters/AdminFilterDrawer";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useAppSelector } from "../../../redux/features/hooks";
import {
  CreateTaskBody,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAssigneesQuery,
  useGetPartnerTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "../../../redux/features/tasks/partnerTasksApi";
import TaskActivityTimeline from "../ui/TaskActivityTimeline";
import TaskCalendarView from "../ui/TaskCalendarView";
import TaskFiltersBar from "../ui/TaskFiltersBar";
import TaskKanbanView from "../ui/TaskKanbanView";
import TaskListView from "../ui/TaskListView";
import TaskNotificationCenter from "../ui/TaskNotificationCenter";
import TaskOverviewMetrics from "../ui/TaskOverviewMetrics";
import TaskPagination from "../ui/TaskPagination";
import TaskQuickActions from "../ui/TaskQuickActions";
import TaskTimelineView from "../ui/TaskTimelineView";
import {
  CancelTaskModal,
  CompleteTaskModal,
  SummaryModal,
  TaskFormModal,
  ViewTaskModal,
} from "../ui/TaskModals";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type TaskViewMode,
} from "../ui/taskConstants";
import {
  buildTaskSummary,
  deriveDepartment,
  exportTasksToCsv,
  isTaskOverdue,
} from "../ui/taskUtils";
import {
  combinePartnerDue,
  enrichWithDetail,
  normalizePartnerTask,
  type EmployeeTask,
  type EmployeeTaskPriority,
  type EmployeeTaskStatus,
} from "../ui/types";
import GlassCard from "../ui/GlassCard";

type BoardMode = "all" | "my";

interface Props {
  mode?: BoardMode;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createSignal?: number;
}

const PAGE_LIMIT = 10;
const FETCH_LIMIT = 500;

const DEFAULT_TASK_FILTERS: FilterValues = {
  dueDateRange: [null, null],
  assignedToUserId: "",
  assignedByUserId: "",
  completionState: "",
};

const KANBAN_STATUSES: EmployeeTaskStatus[] = [
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "CANCELLED",
];

function countTasksByStatus(tasks: EmployeeTask[]) {
  return KANBAN_STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status).length;
      return acc;
    },
    {} as Record<EmployeeTaskStatus, number>,
  );
}

const PartnerTaskBoard = ({
  mode = "all",
  canCreate,
  canUpdate,
  canDelete,
  createSignal = 0,
}: Props) => {
  const isAllMode = mode === "all";
  const currentUser = useAppSelector(selectCurrentUser);

  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [kanbanStatus, setKanbanStatus] =
    useState<EmployeeTaskStatus>("IN_PROGRESS");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EmployeeTaskStatus | "">("");
  const [priority, setPriority] = useState<EmployeeTaskPriority | "">("");
  const [filterValues, setFilterValues] =
    useState<FilterValues>(DEFAULT_TASK_FILTERS);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<EmployeeTask | null>(null);
  const [viewTask, setViewTask] = useState<EmployeeTask | null>(null);
  const [completeModalTask, setCompleteModalTask] =
    useState<EmployeeTask | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [cancelModalTask, setCancelModalTask] = useState<EmployeeTask | null>(
    null,
  );
  const [cancelNote, setCancelNote] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [form] = Form.useForm();

  const handleSearchChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 600);
  }, []);

  const dueRange = filterValues.dueDateRange as
    | [Dayjs | null, Dayjs | null]
    | undefined;

  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: FETCH_LIMIT,
      ...(isAllMode ? { createdByMe: true } : { assignedToMe: true }),
      searchTerm: searchTerm || undefined,
      dueDateFrom: dueRange?.[0]
        ? dueRange[0].startOf("day").toISOString()
        : undefined,
      dueDateTo: dueRange?.[1]
        ? dueRange[1].endOf("day").toISOString()
        : undefined,
    }),
    [dueRange, isAllMode, searchTerm],
  );

  const {
    data: tasksData,
    isLoading,
    isFetching,
  } = useGetPartnerTasksQuery(queryArgs);

  const { data: assigneesData } = useGetAssigneesQuery();

  const detailId = editingTask?.id ?? viewTask?.id ?? "";
  const { data: taskDetail, isFetching: detailFetching } = useGetTaskByIdQuery(
    detailId,
    { skip: !detailId },
  );

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [updateTaskStatus, { isLoading: updatingStatus }] =
    useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const allRows = useMemo<EmployeeTask[]>(
    () => (tasksData?.data ?? []).map(normalizePartnerTask),
    [tasksData?.data],
  );

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      if (priority && r.priority !== priority) return false;
      if (
        filterValues.assignedToUserId &&
        r.assignedTo?.email !== filterValues.assignedToUserId
      )
        return false;
      if (
        filterValues.assignedByUserId &&
        r.assignedBy?.email !== filterValues.assignedByUserId
      )
        return false;
      if (departmentFilter && deriveDepartment(r) !== departmentFilter)
        return false;
      if (
        filterValues.completionState === "COMPLETED" &&
        r.status !== "COMPLETED"
      )
        return false;
      if (filterValues.completionState === "DELAYED" && !isTaskOverdue(r))
        return false;
      return true;
    });
  }, [allRows, priority, filterValues, departmentFilter]);

  const statusTotals = useMemo(() => countTasksByStatus(filtered), [filtered]);

  const overviewStats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === "COMPLETED").length;
    const inProgress = filtered.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const overdue = filtered.filter(isTaskOverdue).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const teamProductivity =
      inProgress + completed > 0
        ? Math.round((completed / (inProgress + completed)) * 100)
        : 0;
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate,
      teamProductivity,
    };
  }, [filtered]);

  const pageSlice = useCallback(
    <T,>(arr: T[]) => arr.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT),
    [page],
  );

  const kanbanRows = useMemo(
    () => pageSlice(filtered.filter((t) => t.status === kanbanStatus)),
    [filtered, kanbanStatus, pageSlice],
  );

  const listAll = useMemo(
    () => (status ? filtered.filter((t) => t.status === status) : filtered),
    [filtered, status],
  );
  const listRows = useMemo(() => pageSlice(listAll), [listAll, pageSlice]);
  const calendarRows = useMemo(() => pageSlice(filtered), [filtered, pageSlice]);

  const formAssigneeOptions = useMemo(() => {
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

  const filterPeopleOptions = useMemo(() => {
    const seen = new Set<string>();
    return (assigneesData ?? [])
      .filter((a) => {
        if (!a.email || seen.has(a.email)) return false;
        seen.add(a.email);
        return true;
      })
      .map((a) => ({ value: a.email, label: `${a.name} (${a.email})` }));
  }, [assigneesData]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    allRows.forEach((t) => set.add(deriveDepartment(t)));
    return Array.from(set).sort();
  }, [allRows]);

  const drawerValue = useMemo<FilterValues>(
    () => ({ ...filterValues, status, priority }),
    [filterValues, priority, status],
  );

  const filterFields = useMemo<FilterField[]>(() => {
    const commonFields: FilterField[] = [
      {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "All status",
        includeAllOption: true,
        options: STATUS_OPTIONS.map((item) => ({
          value: item,
          label: item.replace(/_/g, " "),
        })),
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        placeholder: "All priority",
        includeAllOption: true,
        options: PRIORITY_OPTIONS.map((item) => ({ value: item, label: item })),
      },
      {
        key: "dueDateRange",
        label: "Due date range",
        type: "dateRange",
      },
    ];

    if (!isAllMode) return commonFields;

    return [
      ...commonFields,
      {
        key: "assignedToUserId",
        label: "Assignee",
        type: "select",
        placeholder: "All members",
        includeAllOption: true,
        showSearch: true,
        options: filterPeopleOptions,
      },
      {
        key: "assignedByUserId",
        label: "Created by",
        type: "select",
        placeholder: "All creators",
        includeAllOption: true,
        showSearch: true,
        options: filterPeopleOptions,
      },
      {
        key: "completionState",
        label: "Completed / delayed",
        type: "select",
        placeholder: "All tasks",
        includeAllOption: true,
        options: [
          { value: "COMPLETED", label: "Completed" },
          { value: "DELAYED", label: "Delayed" },
        ],
      },
    ];
  }, [filterPeopleOptions, isAllMode]);

  const handleApplyFilters = (nextValues: FilterValues) => {
    setStatus((nextValues.status || "") as EmployeeTaskStatus | "");
    setPriority((nextValues.priority || "") as EmployeeTaskPriority | "");
    setFilterValues({
      dueDateRange: nextValues.dueDateRange || [null, null],
      assignedToUserId: nextValues.assignedToUserId || "",
      assignedByUserId: nextValues.assignedByUserId || "",
      completionState: nextValues.completionState || "",
    });
    setPage(1);
  };

  const summaryText = useMemo(
    () => buildTaskSummary(overviewStats),
    [overviewStats],
  );

  const editDetailPending =
    editingTask != null && (!taskDetail || taskDetail.id !== editingTask.id);
  const loadingDetail = editDetailPending && detailFetching;

  useEffect(() => {
    const row = editingTask;
    if (!openCreate || !row || !taskDetail) return;
    if (taskDetail.id !== row.id) return;
    const due = combinePartnerDue(taskDetail.due_date, taskDetail.due_time);
    form.setFieldsValue({
      title: taskDetail.task_title,
      priority: taskDetail.priority ?? undefined,
      assignedToUserId: taskDetail.assignedTo?.id,
      description: taskDetail.task_description ?? "",
      dueDate: due ? dayjs(due) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate, editingTask?.id, taskDetail]);

  const viewTaskEnriched = useMemo<EmployeeTask | null>(() => {
    if (!viewTask) return null;
    if (taskDetail && taskDetail.id === viewTask.id) {
      return enrichWithDetail(viewTask, taskDetail);
    }
    return viewTask;
  }, [viewTask, taskDetail]);

  const handleOpenCreate = () => {
    setViewTask(null);
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({ priority: "MEDIUM" });
    setOpenCreate(true);
  };

  useEffect(() => {
    if (createSignal > 0 && canCreate) {
      handleOpenCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createSignal]);

  const handleOpenEdit = (task: EmployeeTask) => {
    setViewTask(null);
    setEditingTask(task);
    form.resetFields();
    const quickDue = task.dueDate ? dayjs(task.dueDate) : undefined;
    form.setFieldsValue({
      title: task.title,
      priority: task.priority,
      dueDate: quickDue?.isValid() ? quickDue : undefined,
    });
    setOpenCreate(true);
  };

  const handleFormSubmit = async () => {
    const values = await form.validateFields();
    const due = values.dueDate ? dayjs(values.dueDate) : null;
    const payload: CreateTaskBody = {
      title: values.title,
      description: values.description || undefined,
      assignedToUserId: values.assignedToUserId,
      priority: values.priority || undefined,
      dueDate: due ? due.format("YYYY-MM-DD") : undefined,
      dueTime: due ? due.format("hh:mm A") : undefined,
    };
    if (editingTask) {
      await updateTask({ id: editingTask.id, body: payload }).unwrap();
    } else {
      await createTask(payload).unwrap();
    }
    setOpenCreate(false);
    form.resetFields();
    setEditingTask(null);
  };

  const handleCompleteTask = async () => {
    if (!completeModalTask) return;
    await updateTaskStatus({
      id: completeModalTask.id,
      status: "COMPLETED",
      note: completeNote || undefined,
    }).unwrap();
    setCompleteModalTask(null);
    setCompleteNote("");
  };

  const handleCancelTask = async () => {
    if (!cancelModalTask) return;
    await updateTaskStatus({
      id: cancelModalTask.id,
      status: "CANCELLED",
      note: cancelNote || undefined,
    }).unwrap();
    setCancelModalTask(null);
    setCancelNote("");
  };

  const handleDelete = async (task: EmployeeTask) => {
    await deleteTask(task.id).unwrap();
  };

  const handleExport = () => {
    exportTasksToCsv(filtered, `tasks-export-${dayjs().format("YYYY-MM-DD")}.csv`);
  };

  const tableLoading = isLoading || isFetching || deleting || updatingStatus;

  const taskActions = {
    onView: setViewTask,
    onEdit: isAllMode && canUpdate ? handleOpenEdit : undefined,
    onComplete: canUpdate
      ? (t: EmployeeTask) => {
          setCompleteModalTask(t);
          setCompleteNote("");
        }
      : undefined,
    onCancel:
      isAllMode && canUpdate
        ? (t: EmployeeTask) => {
            setCancelModalTask(t);
            setCancelNote("");
          }
        : undefined,
    onDelete: isAllMode && canDelete ? handleDelete : undefined,
  };

  return (
    <div className="space-y-4">
      <TaskOverviewMetrics {...overviewStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <GlassCard padding="md">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Smart Task Board
              </h2>
              <p className="text-xs text-slate-500">
                Kanban, list, calendar, and timeline views
              </p>
            </div>
            <TaskFiltersBar
              mode={mode}
              viewMode={viewMode}
              onViewModeChange={(v) => {
                setViewMode(v);
                setPage(1);
              }}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterFields={filterFields}
              drawerValue={drawerValue}
              defaultFilters={{
                ...DEFAULT_TASK_FILTERS,
                status: "",
                priority: "",
              }}
              onApplyFilters={handleApplyFilters}
              activeFilterCount={countActiveFilters(drawerValue)}
              departments={departments}
              departmentFilter={departmentFilter}
              onDepartmentChange={(v) => {
                setDepartmentFilter(v);
                setPage(1);
              }}
              showAdvancedFilters={
                viewMode !== "kanban" && viewMode !== "calendar"
              }
            />
          </GlassCard>

          <div className="min-h-[400px]">
            {viewMode === "kanban" && (
              <TaskKanbanView
                tasks={kanbanRows}
                statusTotals={statusTotals}
                loading={tableLoading}
                canUpdate={canUpdate}
                canDelete={isAllMode && canDelete}
                showAssigner={isAllMode}
                deleting={deleting}
                page={page}
                limit={PAGE_LIMIT}
                activeStatus={kanbanStatus}
                onActiveStatusChange={(nextStatus) => {
                  setKanbanStatus(nextStatus);
                  setPage(1);
                }}
                onPageChange={setPage}
                {...taskActions}
              />
            )}
            {viewMode === "list" && (
              <TaskListView
                tasks={listRows}
                loading={tableLoading}
                page={page}
                limit={PAGE_LIMIT}
                total={listAll.length}
                onPageChange={setPage}
                canUpdate={canUpdate}
                canDelete={isAllMode && canDelete}
                mode={mode}
                deleting={deleting}
                {...taskActions}
              />
            )}
            {viewMode === "calendar" && (
              <>
                <TaskCalendarView tasks={calendarRows} onView={setViewTask} />
                <GlassCard padding="none" className="mt-4 overflow-hidden">
                  <TaskPagination
                    page={page}
                    limit={PAGE_LIMIT}
                    total={filtered.length}
                    onPageChange={setPage}
                  />
                </GlassCard>
              </>
            )}
            {viewMode === "timeline" && (
              <>
                <TaskTimelineView tasks={calendarRows} onView={setViewTask} />
                <GlassCard padding="none" className="mt-4 overflow-hidden">
                  <TaskPagination
                    page={page}
                    limit={PAGE_LIMIT}
                    total={filtered.length}
                    onPageChange={setPage}
                  />
                </GlassCard>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <TaskQuickActions
            canCreate={isAllMode && canCreate}
            onCreateTask={handleOpenCreate}
            onAssignTask={handleOpenCreate}
            onExport={handleExport}
            onSummary={() => setSummaryOpen(true)}
          />
          <TaskNotificationCenter tasks={allRows} onView={setViewTask} />
          <TaskActivityTimeline tasks={allRows} onView={setViewTask} />
        </aside>
      </div>

      <TaskFormModal
        open={openCreate}
        editingTask={editingTask}
        form={form}
        assigneeOptions={formAssigneeOptions}
        creating={creating}
        updating={updating}
        loadingDetail={loadingDetail}
        onCancel={() => {
          setOpenCreate(false);
          setEditingTask(null);
        }}
        onOk={handleFormSubmit}
      />

      <ViewTaskModal task={viewTaskEnriched} onClose={() => setViewTask(null)} />

      <CompleteTaskModal
        task={completeModalTask}
        note={completeNote}
        loading={updatingStatus}
        onNoteChange={setCompleteNote}
        onCancel={() => {
          setCompleteModalTask(null);
          setCompleteNote("");
        }}
        onOk={handleCompleteTask}
      />

      <CancelTaskModal
        task={cancelModalTask}
        note={cancelNote}
        loading={updatingStatus}
        onNoteChange={setCancelNote}
        onCancel={() => {
          setCancelModalTask(null);
          setCancelNote("");
        }}
        onOk={handleCancelTask}
      />

      <SummaryModal
        open={summaryOpen}
        summary={summaryText}
        onClose={() => setSummaryOpen(false)}
      />
    </div>
  );
};

export default PartnerTaskBoard;
