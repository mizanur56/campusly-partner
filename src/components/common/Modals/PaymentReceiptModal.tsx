import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload } from "antd";
import { FiUpload } from "react-icons/fi";
import type { UploadFile } from "antd/es/upload/interface";
import { useSubmitPaymentReceiptMutation } from "../../../redux/features/application/applicationApi";
import { useCreateMediaMutation } from "../../../redux/features/media/mediaApi";
import { config } from "../../../config";
import { toast } from "react-toastify";

interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  currency?: string;
  [key: string]: any;
}

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ open, onClose, invoice }) => {
  const invoiceId = invoice?.id;
  const studentId = invoice?.studentId;
  const amount = invoice?.amount;
  const currency = invoice?.currency || "USD";
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [submitPaymentReceipt, { isLoading: isSubmitting }] = useSubmitPaymentReceiptMutation();
  const [createMedia] = useCreateMediaMutation();

  const handleFileChange = (info: any) => {
    const { fileList: newFileList } = info;
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        const isPDF = file.type === "application/pdf";
        const isImage = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
        if (!isPDF && !isImage) {
          toast.error("You can only upload PDF or image files!");
          return;
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
          toast.error("File must be smaller than 10MB!");
          return;
        }
      }
    }
    setFileList(newFileList);
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      toast.error("Please upload payment receipt");
      return;
    }
    setIsUploadingReceipt(true);
    try {
      const file = fileList[0].originFileObj;
      if (!file) {
        toast.error("File not found");
        setIsUploadingReceipt(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "document");
      const mediaResponse = await createMedia(formData).unwrap();
      const paymentReceiptUrl = `${config.image_access_url}${mediaResponse.data.url.startsWith("/") ? mediaResponse.data.url : `/${mediaResponse.data.url}`}`;
      const payload = {
        invoiceId,
        studentId,
        amount,
        paymentReceipt: paymentReceiptUrl,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
      };
      const res = await submitPaymentReceipt(payload).unwrap();
      if (res?.success || res) {
        toast.success("Payment receipt submitted successfully");
        form.resetFields();
        setFileList([]);
        onClose();
      } else {
        toast.error(res.message || "Failed to submit payment receipt");
      }
    } catch (error: any) {
      console.error("Payment receipt submission failed:", error);
      toast.error(error?.data?.message || "Failed to submit payment receipt");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={null} centered width={600} title={<div className="text-xl font-semibold text-gray-900">Submit Payment Receipt</div>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item label="Amount">
            <Input value={`${amount} ${currency}`} disabled />
          </Form.Item>
          <Form.Item name="bankName" label="Bank Name" rules={[{ required: true, message: "Please enter bank name" }, { min: 2, message: "Bank name must be at least 2 characters" }]}>
            <Input placeholder="Enter bank name" />
          </Form.Item>
        </div>
        <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true, message: "Please enter account number" }, { min: 5, message: "Account number must be at least 5 characters" }]}>
          <Input placeholder="Enter account number" />
        </Form.Item>
        <Form.Item
          label="Payment Receipt"
          required
          rules={[{ validator: () => (fileList.length === 0 ? Promise.reject("Please upload payment receipt") : Promise.resolve()) }]}
        >
          <Upload style={{ width: "100%", marginTop: "4px" }} beforeUpload={() => false} maxCount={1} listType="picture" fileList={fileList} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png">
            <Button icon={<FiUpload />} className="w-full" loading={isSubmitting || isUploadingReceipt}>
              Select File
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item className="mb-0 mt-2">
          <div className="flex justify-end gap-3">
            <Button onClick={handleCancel} disabled={isSubmitting || isUploadingReceipt}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting || isUploadingReceipt} className="bg-[#237D3B] hover:bg-[#1a5d2a]">
              Submit Payment Receipt
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentReceiptModal;
