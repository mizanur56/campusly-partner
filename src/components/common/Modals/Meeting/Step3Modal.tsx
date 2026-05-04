import { ClockCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import dayjs from "dayjs";
import React from "react";
import { IoClose } from "react-icons/io5";
import { Button as PrimaryButton } from "../../../ui/button";

interface Step3ModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  time: string;
}

const Step3Modal: React.FC<Step3ModalProps> = ({
  open,
  onClose,
  date,
  time,
}) => {
  const formattedDate = dayjs(date);
  const day = formattedDate.format("D");
  const monthYear = formattedDate.format("MMM YYYY");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      closable={false}
      className="book-session-modal"
      styles={{ content: { padding: "24px", borderRadius: "12px" } }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="whitesapce-nowrap text-[20px] font-semibold text-[#20242A]">
            Book a session
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <IoClose size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Session Confirmed
            </h2>
            <p className="text-gray-600">
              The link to join the session will be emailed to you
            </p>
          </div>

          <div className="w-full space-y-4 rounded-lg border border-primary-border bg-[#FFFFFF] p-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center rounded-lg border border-primary-border bg-[#FAFAFA]">
                <div className="rounded-lg bg-white px-4 py-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {day}
                  </span>
                </div>
                <div className="mt-1 rounded-b-lg bg-[#237D3B] px-4 py-1">
                  <span className="text-sm font-medium text-white">
                    {monthYear}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-semibold text-gray-900">
                  Counselling Session
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <ClockCircleOutlined className="text-gray-500" />
                  <span className="text-sm text-gray-600">{time}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-end pt-4">
            <PrimaryButton
              variant="primary"
              size="md"
              onClick={onClose}
              className="px-8"
            >
              Done
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Step3Modal;
