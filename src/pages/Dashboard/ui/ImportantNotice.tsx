import { Button } from "antd";
import { MdErrorOutline } from "react-icons/md";

const ImportantNotice = () => {
  const notices = [
    "Consultation with Akash Basnet",
    "Consultation with Sabbir Hossain",
    "Consultation with Meghla Rani Sarker",
    "Consultation with Ranu Thapa",
    "Consultation with Manvit Jakaria",
  ];

  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-primary-border p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <p className="text-[#FF9100] text-[24px] font-semibold">
            {" "}
            <MdErrorOutline />
          </p>
          <h2 className="text-xl font-semibold text-gray-900">
            Important Notice
          </h2>
        </div>
        <Button type="link">View All</Button>
      </div>
      <div className="space-y-3">
        {notices.map((notice, index) => (
          <div
            key={index}
            className="text-[20px] text-[#20242A] font-semibold py-6 px-[18px] border border-primary-border rounded-[8px] cursor-pointer hover:text-[#237D3B] transition-colors"
          >
            {notice}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportantNotice;
