import { Spin } from "antd";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const isLoading = false;

  // Mock Data
  const upcomingEvents = [
    { id: 1, title: "University Fair 2026", eventDate: "2026-03-15T10:00:00" },
    { id: 2, title: "Study Abroad Seminar", eventDate: "2026-03-20T14:30:00" },
    { id: 3, title: "IELTS Workshop", eventDate: "2026-04-05T09:00:00" },
  ];

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return { day, month: `${month} ${year}` };
  };

  // Format full date with time
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-[#FFFFFF] border border-primary-border p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
        <button
          onClick={() => navigate("/events")}
          className="text-[#237D3B] hover:text-[#1e6b32] font-medium text-[18px] underline cursor-pointer"
        >
          View All
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No upcoming events</div>
      ) : (
        <div className="space-y-4">
          {upcomingEvents.map((event: any) => {
            const { day, month } = formatDate(event.eventDate);
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-4 border border-primary-border rounded-[16px]"
              >
                <div className=" flex bg-[#FAFAFA] border border-primary-border rounded-[16px] flex-col items-center justify-center text-white text-sm font-medium  text-center">
                  <p className=" text-[#000000] text-[24px] font-semibold py-2 px-3">
                    {day}
                  </p>
                  <p className="bg-[#237D3B] text-[#E9F2EB] text-[18px] font-semibold py-2 px-3 rounded-b-[16px] text-center">
                    {month}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[20px] text-[#20242A] mb-1">
                    {event.title || "Event"}
                  </h3>
                  <div className="flex items-center gap-1 text-[16px] text-[#4B5563]">
                    <CalendarIcon size={16} />
                    <span>{formatFullDate(event.eventDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
