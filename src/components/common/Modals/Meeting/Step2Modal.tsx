import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import { Button as PrimaryButton } from "../../../ui/button";

const { TextArea } = Input;

interface Step2ModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (additionalInfo: string) => void | Promise<void>;
  isLoading?: boolean;
}

const Step2Modal: React.FC<Step2ModalProps> = ({
  open,
  onClose,
  onBack,
  onNext,
  isLoading = false,
}) => {
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleNext = async () => {
    if (isLoading) return;
    await onNext(additionalInfo);
  };

  const handleClose = () => {
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
      <div className="space-y-5">
        <h2 className="text-center text-xl font-semibold text-[#20242A]">
          Add note
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#20242A]">
            Notes (optional)
          </label>
          <TextArea
            rows={3}
            placeholder="Optional notes for your advisor"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="resize-none"
            style={{ marginTop: "6px", padding: "12px", fontSize: "14px" }}
          />
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
            disabled={isLoading}
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
