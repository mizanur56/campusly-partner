import { Button, Select, Table } from "antd";

const Statistics = () => {
  const statisticsData = [
    { key: "1", month: "July", app: 5, ol: 4, cvu: 2, agent: 1 },
    { key: "2", month: "June", app: 6, ol: 3, cvu: 2, agent: 3 },
    { key: "3", month: "May", app: 1, ol: 3, cvu: 2, agent: 3 },
    { key: "4", month: "April", app: 2, ol: 3, cvu: 2, agent: 3 },
  ];

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      width: 50,
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
    <div className="bg-[#FFFFFF] rounded-lg border border-primary-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Statistics</h2>
        <div className="flex items-center gap-2">
          <Select
            defaultValue="2025"
            size="large"
            style={{ width: 100 }}
            options={[
              { label: "2025", value: "2025" },
              { label: "2026", value: "2026" },
              { label: "2027", value: "2027" },
            ]}
          />
          <Button type="link">View All</Button>
        </div>
      </div>
      <Table
        dataSource={statisticsData}
        columns={columns}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default Statistics;
