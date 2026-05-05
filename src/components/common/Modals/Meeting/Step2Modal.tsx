import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import { Button as PrimaryButton } from "../../../ui/button";

const { TextArea } = Input;

interface Step2ModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (preferences: string[], additionalInfo: string) => void | Promise<void>;
  isLoading?: boolean;
}

const preferences = [
  "Application process",
  "Travel",
  "Accommodation",
  "Universities",
  "Courses",
  "Documents",
  "Careers",
  "Visa",
  "Funds",
  "Others",
  "Scholarships",
];

const Step2Modal: React.FC<Step2ModalProps> = ({
  open,
  onClose,
  onBack,
  onNext,
  isLoading = false,
}) => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handlePreferenceClick = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference],
    );
  };

  const handleNext = async () => {
    if (selectedPreferences.length > 0 && !isLoading) {
      await onNext(selectedPreferences, additionalInfo);
    }
  };

  const handleClose = () => {
    setSelectedPreferences([]);
    setAdditionalInfo("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={650}
      closable={false}
      className="book-session-modal"
      styles={{ content: { padding: "24px", borderRadius: "12px" } }}
    >
      <div className="space-y-6">
        <h2 className="text-center text-[30px] font-semibold text-[#20242A]">
          What are your application preference?
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {preferences.map((preference) => (
              <button
                key={preference}
                onClick={() => handlePreferenceClick(preference)}
                className={`cursor-pointer rounded-[50px] px-4 py-3 text-[14px] transition-all ${
                  selectedPreferences.includes(preference)
                    ? "border border-[#237D3B] bg-[#E9F2EB] font-semibold text-[#237D3B]"
                    : "border border-transparent bg-[#EDEEEF] text-[#4B5563]"
                }`}
              >
                <span className="whitespace-nowrap text-[14px]">{preference}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-[#20242A]">
            Tell us more
          </label>
          <TextArea
            rows={4}
            placeholder="Share any additional details..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="resize-none"
            style={{ marginTop: "8px", padding: "12px", fontSize: "14px" }}
          />
          <p className="mt-2 text-[12px] font-medium text-[#4B5563]">
            This will help your counsellor prepare for your meeting
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onBack}
            size="large"
            className="border-[#237D3B] px-6 py-2 text-[#237D3B] hover:bg-green-50"
            disabled={isLoading}
          >
            Back
          </Button>
          <PrimaryButton
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={selectedPreferences.length === 0 || isLoading}
            className="px-6 py-2"
          >
            {isLoading ? "Booking..." : "Book session"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default Step2Modal;
