import React, { useMemo, useState } from "react";
import { Table, Input, Tag, Badge, Modal, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InboxOutlined } from "@ant-design/icons";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Payments.css";

const { Dragger } = Upload;

type TopTabKey = "purchase" | "commission";
type PurchaseTabKey = "applications" | "history";
type CommissionTabKey = "earned" | "history";

interface PurchaseApplicationRecord {
  key: string;
  applicationId: string;
  studentName: string;
  fee: number;
  waiverPercent: number;
  payable: number;
  status: "Paid" | "Under Review" | "Unpaid";
}

interface PurchaseTransactionRecord {
  key: string;
  transactionId: string;
  date: string;
  applicationId: string;
  amount: number;
  status: "Completed" | "Pending";
}

interface CommissionEarnedRecord {
  key: string;
  applicationId: string;
  studentName: string;
  earned: number;
  status: "Paid" | "Pending" | "Unpaid";
}

interface CommissionTransactionRecord {
  key: string;
  transactionId: string;
  date: string;
  applicationId: string;
  amount: number;
  status: "Completed" | "Pending";
}

const PURCHASE_APPLICATIONS: PurchaseApplicationRecord[] = [
  { key: "1", applicationId: "62145321", studentName: "John Doe", fee: 100, waiverPercent: 30, payable: 70, status: "Paid" },
  { key: "2", applicationId: "62145322", studentName: "John Doe", fee: 100, waiverPercent: 30, payable: 70, status: "Under Review" },
  { key: "3", applicationId: "62145323", studentName: "John Doe", fee: 100, waiverPercent: 30, payable: 70, status: "Unpaid" },
  { key: "4", applicationId: "62145324", studentName: "John Doe", fee: 100, waiverPercent: 30, payable: 70, status: "Paid" },
];

const PURCHASE_TRANSACTIONS: PurchaseTransactionRecord[] = [
  { key: "1", transactionId: "TXN001", date: "2024-01-15", applicationId: "62145321", amount: 70, status: "Completed" },
  { key: "2", transactionId: "TXN002", date: "2024-01-15", applicationId: "62145321", amount: 70, status: "Completed" },
  { key: "3", transactionId: "TXN003", date: "2024-01-15", applicationId: "62145321", amount: 70, status: "Completed" },
  { key: "4", transactionId: "TXN004", date: "2024-01-15", applicationId: "62145321", amount: 70, status: "Completed" },
];

const COMMISSION_EARNED: CommissionEarnedRecord[] = [
  { key: "1", applicationId: "62145321", studentName: "John Doe", earned: 200, status: "Pending" },
  { key: "2", applicationId: "62145322", studentName: "John Doe", earned: 200, status: "Unpaid" },
  { key: "3", applicationId: "62145323", studentName: "John Doe", earned: 200, status: "Paid" },
  { key: "4", applicationId: "62145324", studentName: "John Doe", earned: 200, status: "Paid" },
];

const COMMISSION_TRANSACTIONS: CommissionTransactionRecord[] = [
  { key: "1", transactionId: "TXN001", date: "2024-01-15", applicationId: "62145321", amount: 200, status: "Completed" },
  { key: "2", transactionId: "TXN002", date: "2024-01-15", applicationId: "62145321", amount: 200, status: "Completed" },
  { key: "3", transactionId: "TXN003", date: "2024-01-15", applicationId: "62145321", amount: 200, status: "Completed" },
  { key: "4", transactionId: "TXN004", date: "2024-01-15", applicationId: "62145321", amount: 200, status: "Completed" },
];

export default function Payments() {
  const [topTab, setTopTab] = useState<TopTabKey>("purchase");
  const [purchaseTab, setPurchaseTab] = useState<PurchaseTabKey>("applications");
  const [commissionTab, setCommissionTab] = useState<CommissionTabKey>("earned");
  const [searchText, setSearchText] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [uploadApplicationId, setUploadApplicationId] = useState<string | null>(null);

  const handleResetSearchOnTabChange = () => {
    setSearchText("");
  };

  const filteredPurchaseApplications = useMemo(() => {
    if (!searchText.trim()) return PURCHASE_APPLICATIONS;
    const q = searchText.toLowerCase();
    return PURCHASE_APPLICATIONS.filter(
      (row) =>
        row.applicationId.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q)
    );
  }, [searchText]);

  const filteredPurchaseTransactions = useMemo(() => {
    if (!searchText.trim()) return PURCHASE_TRANSACTIONS;
    const q = searchText.toLowerCase();
    return PURCHASE_TRANSACTIONS.filter(
      (row) =>
        row.transactionId.toLowerCase().includes(q) ||
        row.applicationId.toLowerCase().includes(q)
    );
  }, [searchText]);

  const filteredCommissionEarned = useMemo(() => {
    if (!searchText.trim()) return COMMISSION_EARNED;
    const q = searchText.toLowerCase();
    return COMMISSION_EARNED.filter(
      (row) =>
        row.applicationId.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q)
    );
  }, [searchText]);

  const filteredCommissionTransactions = useMemo(() => {
    if (!searchText.trim()) return COMMISSION_TRANSACTIONS;
    const q = searchText.toLowerCase();
    return COMMISSION_TRANSACTIONS.filter(
      (row) =>
        row.transactionId.toLowerCase().includes(q) ||
        row.applicationId.toLowerCase().includes(q)
    );
  }, [searchText]);

  const purchaseApplicationsColumns: ColumnsType<PurchaseApplicationRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    { title: "Application ID", dataIndex: "applicationId", key: "applicationId", width: 140 },
    { title: "Student Name", dataIndex: "studentName", key: "studentName", width: 180 },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      width: 100,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Waiver",
      dataIndex: "waiverPercent",
      key: "waiverPercent",
      width: 110,
      render: (value: number) => `${value}%`,
    },
    {
      title: "Payable",
      dataIndex: "payable",
      key: "payable",
      width: 120,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: PurchaseApplicationRecord["status"]) => (
        <Tag
          className="payments-status-tag"
          color={
            status === "Paid"
              ? "success"
              : status === "Under Review"
              ? "warning"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  const purchaseTransactionsColumns: ColumnsType<PurchaseTransactionRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    { title: "Transaction ID", dataIndex: "transactionId", key: "transactionId", width: 140 },
    { title: "Date", dataIndex: "date", key: "date", width: 140 },
    { title: "Application ID", dataIndex: "applicationId", key: "applicationId", width: 140 },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: PurchaseTransactionRecord["status"]) => (
        <Tag className="payments-status-tag" color={status === "Completed" ? "success" : "default"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Receipt",
      key: "receipt",
      width: 120,
      render: () => (
        <button
          type="button"
          className="payments-link-button"
        >
          Download
        </button>
      ),
    },
  ];

  const commissionEarnedColumns: ColumnsType<CommissionEarnedRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    { title: "Application ID", dataIndex: "applicationId", key: "applicationId", width: 140 },
    { title: "Student Name", dataIndex: "studentName", key: "studentName", width: 180 },
    {
      title: "Earned",
      dataIndex: "earned",
      key: "earned",
      width: 120,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: CommissionEarnedRecord["status"]) => (
        <Tag
          className="payments-status-tag"
          color={
            status === "Paid"
              ? "success"
              : status === "Pending"
              ? "warning"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_: unknown, record) => (
        <button
          type="button"
          className="payments-primary-button"
          onClick={() => {
            setUploadApplicationId(record.applicationId);
            setIsUploadModalOpen(true);
          }}
        >
          Upload Invoice
        </button>
      ),
    },
  ];

  const commissionTransactionsColumns: ColumnsType<CommissionTransactionRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    { title: "Transaction ID", dataIndex: "transactionId", key: "transactionId", width: 140 },
    { title: "Date", dataIndex: "date", key: "date", width: 140 },
    { title: "Application ID", dataIndex: "applicationId", key: "applicationId", width: 140 },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: CommissionTransactionRecord["status"]) => (
        <Tag className="payments-status-tag" color={status === "Completed" ? "success" : "default"}>
          {status}
        </Tag>
      ),
    },
  ];

  const renderPurchaseApplicationsToolbar = () => (
    <div className="payments-toolbar">
      <Input
        placeholder="Search application ID, name"
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="payments-search"
        size="large"
      />
      <div className="payments-toolbar-actions">
        <button type="button" className="payments-filter-button">
          <span>Filter</span>
          <Badge count={1} size="small" className="payments-filter-badge" />
        </button>
        <button
          type="button"
          className="payments-primary-button"
          onClick={() => setIsBankModalOpen(true)}
        >
          Pay Selected (€70)
        </button>
        <button type="button" className="payments-outline-button">
          Download Invoice
        </button>
      </div>
    </div>
  );

  const renderSimpleToolbar = (placeholder: string) => (
    <div className="payments-toolbar">
      <Input
        placeholder={placeholder}
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="payments-search"
        size="large"
      />
      <div className="payments-toolbar-actions">
        <button type="button" className="payments-filter-button">
          <span>Filter</span>
          <Badge count={1} size="small" className="payments-filter-badge" />
        </button>
      </div>
    </div>
  );

  const renderTopCards = () => {
    if (topTab === "purchase") {
      if (purchaseTab === "applications") {
        return (
          <div className="payments-kpi-grid">
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Applications</p>
              <p className="payments-kpi-value">4</p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Before Discount</p>
              <p className="payments-kpi-value">€400</p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Waiver (30%)</p>
              <p className="payments-kpi-value">€120</p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Due</p>
              <p className="payments-kpi-value">€280</p>
            </div>
          </div>
        );
      }
      return null;
    }

    // commission tab
    if (commissionTab === "earned") {
      return (
        <div className="payments-kpi-grid">
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Total Commission Earned</p>
            <p className="payments-kpi-value">€400</p>
          </div>
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Pending Payments</p>
            <p className="payments-kpi-value">€300</p>
          </div>
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Paid</p>
            <p className="payments-kpi-value">€500</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderInnerTabs = () => {
    if (topTab === "purchase") {
      return (
        <div className="payments-inner-tabs">
          <button
            type="button"
            className={
              purchaseTab === "applications"
                ? "payments-inner-tab payments-inner-tab--active"
                : "payments-inner-tab"
            }
            onClick={() => {
              setPurchaseTab("applications");
              handleResetSearchOnTabChange();
            }}
          >
            Applications
          </button>
          <button
            type="button"
            className={
              purchaseTab === "history"
                ? "payments-inner-tab payments-inner-tab--active"
                : "payments-inner-tab"
            }
            onClick={() => {
              setPurchaseTab("history");
              handleResetSearchOnTabChange();
            }}
          >
            Transaction History
          </button>
        </div>
      );
    }

    return (
      <div className="payments-inner-tabs">
        <button
          type="button"
          className={
            commissionTab === "earned"
              ? "payments-inner-tab payments-inner-tab--active"
              : "payments-inner-tab"
          }
          onClick={() => {
            setCommissionTab("earned");
            handleResetSearchOnTabChange();
          }}
        >
          Earned Commissions
        </button>
        <button
          type="button"
          className={
            commissionTab === "history"
              ? "payments-inner-tab payments-inner-tab--active"
              : "payments-inner-tab"
          }
          onClick={() => {
            setCommissionTab("history");
            handleResetSearchOnTabChange();
          }}
        >
          Transaction History
        </button>
      </div>
    );
  };

  const renderTableSection = () => {
    if (topTab === "purchase") {
      if (purchaseTab === "applications") {
        return (
          <>
            {renderPurchaseApplicationsToolbar()}
            <div className="payments-table-card">
              <Table
                className="payments-table"
                dataSource={filteredPurchaseApplications}
                columns={purchaseApplicationsColumns}
                rowKey="key"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} applications`,
                  pageSizeOptions: ["10", "20", "50"],
                }}
                scroll={{ x: 900 }}
              />
            </div>
          </>
        );
      }

      // purchase / history
      return (
        <>
          {renderSimpleToolbar("Search application ID, transaction ID")}
          <div className="payments-table-card">
            <Table
              className="payments-table"
              dataSource={filteredPurchaseTransactions}
              columns={purchaseTransactionsColumns}
              rowKey="key"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} transactions`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 900 }}
            />
          </div>
        </>
      );
    }

    // Commission
    if (commissionTab === "earned") {
      return (
        <>
          {renderSimpleToolbar("Search application ID, name")}
          <div className="payments-table-card">
            <Table
              className="payments-table"
              dataSource={filteredCommissionEarned}
              columns={commissionEarnedColumns}
              rowKey="key"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} records`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 900 }}
            />
          </div>
        </>
      );
    }

    // commission / history
    return (
      <>
        {renderSimpleToolbar("Search application ID, transaction ID")}
        <div className="payments-table-card">
          <Table
            className="payments-table"
            dataSource={filteredCommissionTransactions}
            columns={commissionTransactionsColumns}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} transactions`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            scroll={{ x: 900 }}
          />
        </div>
      </>
    );
  };

  return (
    <div className="payments-page">
      <PageMeta
        title="Payments - Campus Transfer Partner"
        description="Manage your application payments and commissions."
      />

      <header className="payments-header">
        <div>
          <h1 className="payments-title">Payments</h1>
          <p className="payments-subtitle">
            Manage your application payments and commissions.
          </p>
        </div>
      </header>

      {/* Top tabs: Purchase / Commission */}
      <div className="payments-top-tabs">
        <button
          type="button"
          className={
            topTab === "purchase"
              ? "payments-top-tab payments-top-tab--active"
              : "payments-top-tab"
          }
          onClick={() => {
            setTopTab("purchase");
            handleResetSearchOnTabChange();
          }}
        >
          Purchase
        </button>
        <button
          type="button"
          className={
            topTab === "commission"
              ? "payments-top-tab payments-top-tab--active"
              : "payments-top-tab"
          }
          onClick={() => {
            setTopTab("commission");
            handleResetSearchOnTabChange();
          }}
        >
          Commission
        </button>
      </div>

      {/* Inner tabs: Applications / Transaction History or Earned Commissions / Transaction History */}
      <div className="payments-inner-tabs-wrapper">
        {renderInnerTabs()}
      </div>

      {/* KPI cards */}
      {renderTopCards()}

      {/* Table + toolbar */}
      <section className="payments-section">
        {renderTableSection()}
      </section>

      {/* Upload Invoice modal */}
      <Modal
        open={isUploadModalOpen}
        title="Upload Invoice"
        onCancel={() => setIsUploadModalOpen(false)}
        onOk={() => setIsUploadModalOpen(false)}
        okText="Confirm"
        cancelText="Cancel"
        centered
        width={560}
      >
        <div className="payments-upload-modal">
          {uploadApplicationId && (
            <p className="payments-upload-application">
              Application ID : <span>{uploadApplicationId}</span>
            </p>
          )}
          <Dragger multiple={false} showUploadList={false} className="payments-dragger">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="payments-dragger-title">Drag &amp; drop your Invoice</p>
            <button type="button" className="payments-primary-button mt-2">
              Choose file
            </button>
            <p className="payments-dragger-hint">
              Supported formats: PDF, JPG, PNG (max. 10MB)
            </p>
          </Dragger>
        </div>
      </Modal>

      {/* Bank transfer / Pay selected modal */}
      <Modal
        open={isBankModalOpen}
        title="Bank Transfer Payment"
        onCancel={() => setIsBankModalOpen(false)}
        onOk={() => setIsBankModalOpen(false)}
        okText="Confirm"
        cancelText="Cancel"
        centered
        width={600}
      >
        <div className="payments-bank-modal space-y-5 text-sm">
          <section className="payments-bank-section payments-bank-section--highlight">
            <p className="payments-bank-section-title">Bank Details</p>
            <div className="payments-bank-grid">
              <div>
                <p className="payments-bank-label">Bank Name</p>
                <p className="payments-bank-value">Brac Bank</p>
              </div>
              <div>
                <p className="payments-bank-label">Account Name</p>
                <p className="payments-bank-value">Campus Transfer LTD</p>
              </div>
              <div>
                <p className="payments-bank-label">Account Number</p>
                <p className="payments-bank-value">168365603976</p>
              </div>
            </div>
          </section>

          <section className="payments-bank-section">
            <p className="payments-bank-section-title">Payment Summary</p>
            <div className="payments-bank-summary">
              <div>
                <p className="payments-bank-label">Student</p>
                <p className="payments-bank-value">John Smith (APP001)</p>
              </div>
              <div>
                <p className="payments-bank-label">Total Amount</p>
                <p className="payments-bank-value">€70</p>
              </div>
            </div>
          </section>

          <section className="payments-bank-section">
            <Dragger multiple={false} showUploadList={false} className="payments-dragger">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="payments-dragger-title">
                Drag &amp; drop your Payment Receipt
              </p>
              <button type="button" className="payments-primary-button mt-2">
                Choose file
              </button>
              <p className="payments-dragger-hint">
                Supported formats: PDF, JPG, PNG (max. 10MB)
              </p>
            </Dragger>
          </section>
        </div>
      </Modal>
    </div>
  );
}

