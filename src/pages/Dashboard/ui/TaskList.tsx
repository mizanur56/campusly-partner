import { Table, Tag } from "antd";

const TaskList = () => {
  const taskData = [
    {
      key: "1",
      name: "Akash Basnet",
      passport: "PA123123",
      businessName: "Global Dreams",
      status: "Completed",
      task: "Passport Missing",
    },
    {
      key: "2",
      name: "Saifur Rahman",
      passport: "PA123123",
      businessName: "Global Dreams",
      status: "Pending",
      task: "Passport Missing",
    },
    {
      key: "3",
      name: "Abul Karim",
      passport: "PA123123",
      businessName: "Global Dreams",
      status: "Incomplete",
      task: "Passport Missing",
    },
    {
      key: "4",
      name: "Golam Mostafa",
      passport: "PA123123",
      businessName: "Global Dreams",
      status: "Pending",
      task: "Passport Missing",
    },
    {
      key: "5",
      name: "Sumaiya Jahan",
      passport: "PA123123",
      businessName: "Global Dreams",
      status: "Pending",
      task: "Passport Missing",
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Passport",
      dataIndex: "passport",
      key: "passport",
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          Completed: "green",
          Pending: "orange",
          Incomplete: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Task",
      dataIndex: "task",
      key: "task",
    },
  ];

  // Different colors for each row's left border (matching image: Green, Blue, Red, Orange, Orange)
  const borderColors = [
    "#10B981", // Green
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#F59E0B", // Orange
    "#F59E0B", // Orange
  ];

  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-primary-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Task List</h2>
        <a
          href="#"
          className="text-[#237D3B] hover:text-[#1e6b32] font-medium text-sm underline"
        >
          View All
        </a>
      </div>
      <style>{`
        .task-list-table .ant-table {
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
        }
        .task-list-table .ant-table-thead > tr > th {
          background: transparent !important;
          border: none !important;
          padding: 12px 16px !important;
          padding-bottom: 8px !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }
        .task-list-table .ant-table-tbody > tr {
          background: white !important;
          border-radius: 8px !important;
        }
        .task-list-table .ant-table-tbody > tr > td {
          border: none !important;
          padding: 12px 16px !important;
          border-radius: 0 !important;
          color: #374151 !important;
        }
        .task-list-table .ant-table-tbody > tr > td:first-child {
          padding-left: 16px !important;
        }
        .task-list-table .ant-table-tbody > tr > td:last-child {
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }
        .task-list-row-0 td:first-child {
          border-left: 8px solid ${borderColors[0]} !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          padding-left: 8px !important;
        }
        .task-list-row-1 td:first-child {
          border-left: 8px solid ${borderColors[1]} !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          padding-left: 8px !important;
        }
        .task-list-row-2 td:first-child {
          border-left: 8px solid ${borderColors[2]} !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          padding-left: 8px !important;
        }
        .task-list-row-3 td:first-child {
          border-left: 8px solid ${borderColors[3]} !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          padding-left: 8px !important;
        }
        .task-list-row-4 td:first-child {
          border-left: 8px solid ${borderColors[4]} !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          padding-left: 8px !important;
        }
      `}</style>
      <Table
        className="task-list-table"
        dataSource={taskData}
        columns={columns}
        pagination={false}
        size="small"
        rowClassName={(record, index) => `task-list-row-${index}`}
      />
    </div>
  );
};

export default TaskList;
