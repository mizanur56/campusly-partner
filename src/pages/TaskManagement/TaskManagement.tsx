import { Button } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PartnerTaskBoard from "./components/PartnerTaskBoard";

const TaskManagement = () => {
  const [createSignal, setCreateSignal] = useState(0);

  return (
    <>
      <PageMeta
        title="Task Management - Campus Transfer Partner"
        description="Assign, prioritize, and monitor internal tasks and deadlines for your team."
      />

      <PageHeader
        title="Task Management"
        subtitle="Assign tasks to team members with clear priority and deadline"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Task Management" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateSignal((n) => n + 1)}
          >
            Create Task
          </Button>
        }
      />

      <PartnerTaskBoard
        canCreate
        canUpdate
        canDelete
        createSignal={createSignal}
      />
    </>
  );
};

export default TaskManagement;
