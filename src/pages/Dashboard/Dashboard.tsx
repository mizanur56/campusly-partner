import { Card, Select, Tag, Avatar, List } from "antd";
import { FileTextOutlined, AppstoreOutlined, DollarOutlined } from "@ant-design/icons";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import PageMeta from "../../components/common/Meta/PageMeta";
import DashboardStatsCard from "../../components/common/Card/DashboardStatsCard";
import { DataTable } from "../../components/common/Tables";
import type { ColumnsType } from "antd/es/table";

const Dashboard = () => {
  // Summary Cards Data
  const summaryCards = [
    {
      icon: <FileTextOutlined />,
      color: "blue" as const,
      title: "Offer Letter",
      value: 6,
      subtitle: "Pending",
    },
    {
      icon: <AppstoreOutlined />,
      color: "purple" as const,
      title: "CVU",
      value: 50,
      subtitle: "Pending",
    },
    {
      icon: <DollarOutlined />,
      color: "green" as const,
      title: "Invoice",
      value: 80,
      subtitle: "Pending",
    },
  ];

  // Task By Status Chart Data
  const taskStatusData = {
    series: [10, 10, 10], // Completed, Incomplete, Pending
    labels: ["Completed", "Incomplete", "Pending"],
    colors: ["#10b981", "#ef4444", "#f59e0b"],
  };

  const taskChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 300,
    },
    labels: taskStatusData.labels,
    colors: taskStatusData.colors,
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  // Task List Data
  interface TaskItem {
    key: string;
    name: string;
    passport: string;
    businessName: string;
    status: "Completed" | "Pending" | "Incomplete";
    task: string;
  }

  const taskListData: TaskItem[] = [
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

  const taskListColumns: ColumnsType<TaskItem> = [
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

  // Payments Data
  interface PaymentItem {
    key: string;
    transactionName: string;
    name: string;
    date: string;
    amount: number;
    status: "Completed" | "Pending" | "Incomplete";
  }

  const paymentData: PaymentItem[] = [
    {
      key: "1",
      transactionName: "Window Nepal",
      name: "Akash Basnet",
      date: "20/07/2025",
      amount: 0,
      status: "Completed",
    },
    {
      key: "2",
      transactionName: "Macroon Edu",
      name: "Sabbir Hossain",
      date: "20/07/2025",
      amount: 0,
      status: "Pending",
    },
    {
      key: "3",
      transactionName: "Shakil Edu Hub",
      name: "Shakil Sarker",
      date: "20/07/2025",
      amount: 0,
      status: "Incomplete",
    },
    {
      key: "4",
      transactionName: "NWC Education",
      name: "Prashant Thapa",
      date: "20/07/2025",
      amount: 100,
      status: "Incomplete",
    },
    {
      key: "5",
      transactionName: "Go Education Hub",
      name: "Rajesh Mondol",
      date: "20/07/2025",
      amount: 100,
      status: "Incomplete",
    },
  ];

  const paymentColumns: ColumnsType<PaymentItem> = [
    {
      title: "Transaction Name",
      dataIndex: "transactionName",
      key: "transactionName",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `${amount} Euro`,
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
  ];

  // New Agent Data
  const newAgents = [
    {
      name: "Akash Basnet",
      company: "Window Nepal",
      avatar: "AB",
    },
    {
      name: "Sabbir Hossain",
      company: "Macroon Edu",
      avatar: "SH",
    },
    {
      name: "Shakil Sarker",
      company: "Shakil Edu Hub",
      avatar: "SS",
    },
    {
      name: "Meghla Rani Sarker",
      company: "Meghla Education Ltd.",
      avatar: "MR",
    },
    {
      name: "Ranu Thapa",
      company: "Thapa Education Ltd.",
      avatar: "RT",
    },
  ];

  // Meeting Schedule Data
  const meetings = [
    {
      title: "Counselling Session",
      date: "27 Jun 2025",
      time: "09:00 AM",
      note: "Link to join the session will be enabled..",
    },
    {
      title: "Counselling Session",
      date: "27 Jun 2025",
      time: "09:00 AM",
      note: "Link to join the session will be enabled..",
    },
    {
      title: "Counselling Session",
      date: "27 Jun 2025",
      time: "09:00 AM",
      note: "Link to join the session will be enabled..",
    },
  ];

  // Important Notice Data
  const notices = [
    "Consultation with Akash Basnet",
    "Consultation with Sabbir Hossain",
    "Consultation with Meghla Rani Sarker",
    "Consultation with Ranu Thapa",
    "Consultation with Manvit Jakaria",
  ];

  // Statistics Data
  interface StatisticsItem {
    key: string;
    month: string;
    app: number;
    ol: number;
    cvu: number;
    agent: number;
  }

  const statisticsData: StatisticsItem[] = [
    {
      key: "1",
      month: "July",
      app: 5,
      ol: 4,
      cvu: 3,
      agent: 3,
    },
    {
      key: "2",
      month: "June",
      app: 6,
      ol: 3,
      cvu: 2,
      agent: 3,
    },
    {
      key: "3",
      month: "May",
      app: 1,
      ol: 3,
      cvu: 2,
      agent: 3,
    },
    {
      key: "4",
      month: "April",
      app: 2,
      ol: 3,
      cvu: 2,
      agent: 3,
    },
  ];

  const statisticsColumns: ColumnsType<StatisticsItem> = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      width: 60,
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "App",
      dataIndex: "app",
      key: "app",
    },
    {
      title: "OL",
      dataIndex: "ol",
      key: "ol",
    },
    {
      title: "CVU",
      dataIndex: "cvu",
      key: "cvu",
    },
    {
      title: "Agent",
      dataIndex: "agent",
      key: "agent",
    },
  ];

  return (
    <>
      <PageMeta
        title="Dashboard | Campus Transfer"
        description="Welcome to Campus Transfer Dashboard"
      />

      <div className="space-y-6 px-2 sm:px-4 pb-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hi Mark Johnson
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-1">Welcome Back.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summaryCards.map((card, index) => (
            <DashboardStatsCard
              key={index}
              icon={card.icon}
              color={card.color}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
            />
          ))}
        </div>

        {/* Task By Status and Task List Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Task By Status Chart */}
          <Card
            title="Task By Status"
            className="shadow-sm"
            headStyle={{ fontSize: "18px", fontWeight: 600 }}
          >
            <Chart
              options={taskChartOptions}
              series={taskStatusData.series}
              type="donut"
              height={300}
            />
          </Card>

          {/* Task List */}
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
            <DataTable
              data={taskListData}
              columns={taskListColumns}
              showHeader={true}
            />
          </Card>
        </div>

        {/* Payments and New Agent Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payments */}
          <Card
            title="Payments"
            className="shadow-sm"
            headStyle={{ fontSize: "18px", fontWeight: 600 }}
            extra={
              <div className="flex items-center gap-2">
                <Select
                  defaultValue="2025"
                  style={{ width: 100 }}
                  options={[{ value: "2025", label: "2025" }]}
                />
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>
            }
          >
            <div className="flex gap-2 mb-4">
              <Select
                placeholder="Amount"
                style={{ flex: 1 }}
                options={[
                  { value: "all", label: "All" },
                  { value: "0", label: "0 Euro" },
                  { value: "100", label: "100 Euro" },
                ]}
              />
              <Select
                placeholder="Status"
                style={{ flex: 1 }}
                options={[
                  { value: "all", label: "All" },
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "incomplete", label: "Incomplete" },
                ]}
              />
            </div>
            <DataTable
              data={paymentData}
              columns={paymentColumns}
              showHeader={true}
            />
          </Card>

          {/* New Agent */}
          <Card
            title="New Agent"
            className="shadow-sm"
            headStyle={{ fontSize: "18px", fontWeight: 600 }}
            extra={
              <a href="#" className="text-blue-600 hover:text-blue-800">
                View All
              </a>
            }
          >
            <List
              dataSource={newAgents}
              renderItem={(item) => (
                <List.Item className="px-0 py-3 border-b border-gray-100 last:border-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#1890ff" }}>
                        {item.avatar}
                      </Avatar>
                    }
                    title={item.name}
                    description={item.company}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Meeting Schedule and Important Notice Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Meeting Schedule */}
          <Card
            title="Meeting Schedule"
            className="shadow-sm"
            headStyle={{ fontSize: "18px", fontWeight: 600 }}
            extra={
              <a href="#" className="text-blue-600 hover:text-blue-800">
                View All
              </a>
            }
          >
            <List
              dataSource={meetings}
              renderItem={(item) => (
                <List.Item className="px-0 py-4 border-b border-gray-100 last:border-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <Tag color="green">{item.date.split(" ")[1]} {item.date.split(" ")[2]}</Tag>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Time:</span> {item.time}
                    </p>
                    <p className="text-gray-500 text-sm">{item.note}</p>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* Important Notice */}
          <Card
            title="Important Notice"
            className="shadow-sm"
            headStyle={{ fontSize: "18px", fontWeight: 600 }}
            extra={
              <a href="#" className="text-blue-600 hover:text-blue-800">
                View All
              </a>
            }
          >
            <List
              dataSource={notices}
              renderItem={(item) => (
                <List.Item className="px-0 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{item}</span>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Statistics Table */}
        <Card
          title="Statistics"
          className="shadow-sm"
          headStyle={{ fontSize: "18px", fontWeight: 600 }}
          extra={
            <div className="flex items-center gap-2">
              <Select
                defaultValue="2025"
                style={{ width: 100 }}
                options={[{ value: "2025", label: "2025" }]}
              />
              <a href="#" className="text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
          }
        >
          <DataTable
            data={statisticsData}
            columns={statisticsColumns}
            showHeader={true}
          />
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
