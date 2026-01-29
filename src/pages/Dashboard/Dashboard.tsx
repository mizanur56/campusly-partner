import PageMeta from "../../components/common/Meta/PageMeta";
import StatCards from "./ui/StatCards";
import TaskByStatus from "./ui/TaskByStatus";
import TaskList from "./ui/TaskList";
import UpcomingEvents from "./ui/UpcomingEvents";
import ImportantNotice from "./ui/ImportantNotice";
import Statistics from "./ui/Statistics";

const Dashboard = () => {
  // Mock user for design
  const user = { name: "Mark Johnson" };

  return (
    <>
      <PageMeta title="Dashboard | Campus Transfer" description="Welcome to Campus Transfer Dashboard" />
      
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hi {user.name}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-1">
            Welcome Back.
          </p>
        </div>

        {/* Stat Cards */}
        <StatCards />

        {/* Task Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="col-span-1">
            <TaskByStatus />
          </div>
          <div className="col-span-2">
            <TaskList />
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <UpcomingEvents />
          <ImportantNotice />
        </div>

        {/* Statistics */}
        <div className="mt-6">
          <Statistics />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
