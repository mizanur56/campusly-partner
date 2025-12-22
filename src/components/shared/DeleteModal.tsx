import { Modal, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { IoIosCloseCircleOutline } from "react-icons/io";


interface DeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

const DeleteModal = ({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  itemName = "this item",
  loading = false,
}: DeleteModalProps) => {
  const defaultTitle = title || `Delete ${itemName}?`;
  const defaultMessage = message || `This action cannot be undone. Are you sure you want to permanently delete ${itemName}?`;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      closable={false}
      className="delete-modal"
      styles={{
        content: {
          padding: "24px",
          borderRadius: "8px",
        },
      }}
    >
      <div className="flex flex-col items-center">
        {/* Red Circle Icon */}
        <div className=" rounded-full flex items-center justify-center mb-4">
          <IoIosCloseCircleOutline className="text-red-500 size-32" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
          {defaultTitle}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {defaultMessage}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 w-full">
          <Button
            onClick={onCancel}
            className=" h-10 border-gray-300 text-black font-bold hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={onConfirm}
            loading={loading}
            className=" h-10 bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;

