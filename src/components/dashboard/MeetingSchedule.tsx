import { Card, List, Tag } from "antd";

export interface MeetingItem {
  title: string;
  date: string;
  time: string;
  note: string;
}

interface MeetingScheduleProps {
  data?: MeetingItem[];
}

const MeetingSchedule: React.FC<MeetingScheduleProps> = ({ data = [] }) => {
  return (
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
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="px-0 py-4 border-b border-gray-100 last:border-0">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <Tag color="green">
                  {item.date.split(" ")[1]} {item.date.split(" ")[2]}
                </Tag>
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
  );
};

export default MeetingSchedule;
