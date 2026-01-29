import { Card } from "antd";
import TaskStatusRadialChart from "../common/Charts/TaskStatusRadialChart";

interface TaskByStatusProps {
  completed?: number;
  incomplete?: number;
  pending?: number;
}

const TaskByStatus: React.FC<TaskByStatusProps> = ({
  completed = 50,
  incomplete = 90,
  pending = 70,
}) => {
  return (
    <Card
      title="Task By Status"
      className="shadow-sm"
      headStyle={{ fontSize: "18px", fontWeight: 600 }}
    >
      <TaskStatusRadialChart
        completed={completed}
        incomplete={incomplete}
        pending={pending}
      />
    </Card>
  );
};

export default TaskByStatus;
