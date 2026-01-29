import { Card, Select } from "antd";
import { DataTable } from "../common/Tables";
import type { ColumnsType } from "antd/es/table";

export interface StatisticsItem {
  key: string;
  month: string;
  app: number;
  ol: number;
  cvu: number;
  agent: number;
}

interface StatisticsProps {
  data?: StatisticsItem[];
  year?: string;
}

const Statistics: React.FC<StatisticsProps> = ({
  data = [],
  year = "2025",
}) => {
  const columns: ColumnsType<StatisticsItem> = [
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
    <Card
      title="Statistics"
      className="shadow-sm"
      headStyle={{ fontSize: "18px", fontWeight: 600 }}
      extra={
        <div className="flex items-center gap-2">
          <Select
            defaultValue={year}
            style={{ width: 100 }}
            options={[{ value: year, label: year }]}
          />
          <a href="#" className="text-blue-600 hover:text-blue-800">
            View All
          </a>
        </div>
      }
    >
      <DataTable data={data} columns={columns} showHeader={true} />
    </Card>
  );
};

export default Statistics;
