import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import PartnerTaskBoard from "../TaskManagement/components/PartnerTaskBoard";

const MyTasks = () => {
  return (
    <>
      <PageMeta
        title="My Tasks - Campus Transfer Partner"
        description="Track and update tasks assigned to your account."
      />

      <PageHeader
        title="My Tasks"
        subtitle="Track and update tasks assigned to your account"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Task Management", path: "/task-management" },
          { title: "My Tasks" },
        ]}
      />

      <PartnerTaskBoard mode="my" canCreate={false} canUpdate canDelete={false} />
    </>
  );
};

export default MyTasks;
