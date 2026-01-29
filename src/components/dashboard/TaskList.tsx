import { Card, Tag } from "antd";
import { DataTable } from "../common/Tables";
import type { ColumnsType } from "antd/es/table";

export interface TaskItem {
  key: string;
  name: string;
  passport: string;
  businessName: string;
  status: "Completed" | "Pending" | "Incomplete";
  task: string;
}

interface TaskListProps {
  data?: TaskItem[];
}

const TaskList: React.FC<TaskListProps> = ({ data = [] }) => {
  const columns: ColumnsType<TaskItem> = [
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
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Task",
      dataIndex: "task",
      key: "task",
    },
  ];

  return (
    <Card
      title="Task List"
      className="shadow-sm"
      headStyle={{ fontSize: "18px", fontWeight: 600 }}
      extra={
        <a href="#" className="text-blue-600 hover:text-blue-800">
          View All
        </a>
      }
    >
      <DataTable data={data} columns={columns} showHeader={true} />
    </Card>
  );
};

export default TaskList;
