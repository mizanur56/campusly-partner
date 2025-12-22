import PageMeta from "../../components/common/Meta/PageMeta";

const Dashboard = () => {
  return (
    <>
      <PageMeta
        title="Dashboard | Campus Transfer"
        description="Welcome to Campus Transfer Dashboard"
      />

      <div className="space-y-6 px-2 sm:px-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hi Mark Johnson
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-1">Welcome Back.</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
