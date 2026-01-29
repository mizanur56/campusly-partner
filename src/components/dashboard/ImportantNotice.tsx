import { Card, List } from "antd";

interface ImportantNoticeProps {
  data?: string[];
}

const ImportantNotice: React.FC<ImportantNoticeProps> = ({ data = [] }) => {
  return (
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
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="px-0 py-3 border-b border-gray-100 last:border-0">
            <span className="text-gray-700">{item}</span>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ImportantNotice;
