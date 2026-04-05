import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Input, Tag, Badge, Modal, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InboxOutlined } from "@ant-design/icons";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Payments.css";
import {
  useGetActiveBankAccountQuery,
  useGetPurchaseStatsQuery,
  useGetPurchaseApplicationsQuery,
  useGetPurchaseTransactionsQuery,
  useGetCommissionStatsQuery,
  useGetCommissionEarnedQuery,
  useGetCommissionTransactionsQuery,
  usePaySelectedApplicationsMutation,
  useClaimCommissionMutation,
} from "../../redux/features/payments/partnerPaymentsApi";

const { Dragger } = Upload;

type TopTabKey = "purchase" | "commission";
type PurchaseTabKey = "applications" | "history";
type CommissionTabKey = "earned" | "history";

interface PurchaseApplicationRecord {
  key: string;
  feeId: string;
  applicationId: string;
  studentName: string;
  fee: number;
  waiverPercent: number;
  payable: number;
  status: "Paid" | "Under Review" | "Unpaid";
  raw: any;
}

interface PurchaseTransactionRecord {
  key: string;
  transactionId: string;
  date: string;
  applicationId: string;
  amount: number;
  status: "Completed" | "Pending";
  raw: any;
}

interface CommissionEarnedRecord {
  key: string;
  commissionId: string;
  applicationId: string;
  studentName: string;
  earned: number;
  status: "Paid" | "Pending" | "Unpaid";
  raw: any;
}

interface CommissionTransactionRecord {
  key: string;
  transactionId: string;
  date: string;
  applicationId: string;
  amount: number;
  status: "Completed" | "Pending";
  raw: any;
}

export default function Payments() {
  const { pathname } = useLocation();
  const topTab: TopTabKey = pathname.includes("/commission")
    ? "commission"
    : "purchase";
  const [purchaseTab, setPurchaseTab] =
    useState<PurchaseTabKey>("applications");
  const [commissionTab, setCommissionTab] =
    useState<CommissionTabKey>("earned");
  const [searchText, setSearchText] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [uploadCommissionId, setUploadCommissionId] = useState<string | null>(
    null,
  );
  const [uploadInvoiceFile, setUploadInvoiceFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [selectedPurchaseKeys, setSelectedPurchaseKeys] = useState<React.Key[]>(
    [],
  );
  const [selectedPurchaseRecords, setSelectedPurchaseRecords] = useState<
    PurchaseApplicationRecord[]
  >([]);

  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePageSize, setPurchasePageSize] = useState(10);
  const [purchaseHistoryPage, setPurchaseHistoryPage] = useState(1);
  const [purchaseHistoryPageSize, setPurchaseHistoryPageSize] = useState(10);
  const [commissionPage, setCommissionPage] = useState(1);
  const [commissionPageSize, setCommissionPageSize] = useState(10);
  const [commissionHistoryPage, setCommissionHistoryPage] = useState(1);
  const [commissionHistoryPageSize, setCommissionHistoryPageSize] =
    useState(10);

  const { data: bankAccount } = useGetActiveBankAccountQuery();
  const { data: purchaseStats } = useGetPurchaseStatsQuery();
  const { data: purchaseApplicationsData, isLoading: isPurchaseAppsLoading } =
    useGetPurchaseApplicationsQuery({
      page: purchasePage,
      limit: purchasePageSize,
      search: searchText || undefined,
    });
  const { data: purchaseTransactionsData, isLoading: isPurchaseTxLoading } =
    useGetPurchaseTransactionsQuery({
      page: purchaseHistoryPage,
      limit: purchaseHistoryPageSize,
      search: searchText || undefined,
    });
  const { data: commissionStats } = useGetCommissionStatsQuery();
  const { data: commissionEarnedData, isLoading: isCommissionEarnedLoading } =
    useGetCommissionEarnedQuery({
      page: commissionPage,
      limit: commissionPageSize,
      search: searchText || undefined,
    });
  const { data: commissionTransactionsData, isLoading: isCommissionTxLoading } =
    useGetCommissionTransactionsQuery({
      page: commissionHistoryPage,
      limit: commissionHistoryPageSize,
      search: searchText || undefined,
    });

  const [paySelectedApplications, { isLoading: isPaying }] =
    usePaySelectedApplicationsMutation();
  const [claimCommission, { isLoading: isClaiming }] =
    useClaimCommissionMutation();

  const handleResetSearchOnTabChange = () => {
    setSearchText("");
  };

  const purchaseApplications: PurchaseApplicationRecord[] = useMemo(() => {
    const items = purchaseApplicationsData?.data || [];
    return items.map((fee: any, index: number) => {
      const app = fee.application;
      const studentName =
        app?.student?.user?.name ||
        `${app?.student?.firstName || ""} ${app?.student?.lastName || ""}`.trim() ||
        "N/A";
      const statusRaw = fee.status as string;
      const status: PurchaseApplicationRecord["status"] =
        statusRaw === "PAID"
          ? "Paid"
          : statusRaw === "UNDER_REVIEW"
            ? "Under Review"
            : "Unpaid";
      return {
        key: fee.id || `${index}`,
        feeId: fee.id,
        applicationId: String(app?.applicationId ?? ""),
        studentName,
        fee: fee.originalFee ?? 0,
        waiverPercent: fee.waiverPercentage ?? 0,
        payable: fee.payableAmount ?? 0,
        status,
        raw: fee,
      };
    });
  }, [purchaseApplicationsData]);

  const purchaseTransactions: PurchaseTransactionRecord[] = useMemo(() => {
    const items = purchaseTransactionsData?.data || [];
    return items.map((txn: any, index: number) => {
      const firstApp = txn.appFees?.[0]?.application;
      return {
        key: txn.id || `${index}`,
        transactionId: txn.txnRef || "",
        date: txn.createdAt
          ? new Date(txn.createdAt).toISOString().slice(0, 10)
          : "",
        applicationId: firstApp?.applicationId
          ? String(firstApp.applicationId)
          : "—",
        amount: txn.totalAmount ?? 0,
        status: txn.status === "COMPLETED" ? "Completed" : "Pending",
        raw: txn,
      };
    });
  }, [purchaseTransactionsData]);

  const commissionEarned: CommissionEarnedRecord[] = useMemo(() => {
    const items = commissionEarnedData?.data || [];
    return items.map((c: any, index: number) => {
      const app = c.application;
      const studentName =
        app?.student?.user?.name ||
        `${app?.student?.firstName || ""} ${app?.student?.lastName || ""}`.trim() ||
        "N/A";
      const statusRaw = c.status as string;
      const status: CommissionEarnedRecord["status"] =
        statusRaw === "PAID"
          ? "Paid"
          : statusRaw === "PENDING"
            ? "Pending"
            : "Unpaid";
      return {
        key: c.id || `${index}`,
        commissionId: c.id,
        applicationId: String(app?.applicationId ?? ""),
        studentName,
        earned: c.earnedAmount ?? 0,
        status,
        raw: c,
      };
    });
  }, [commissionEarnedData]);

  const commissionTransactions: CommissionTransactionRecord[] = useMemo(() => {
    const items = commissionTransactionsData?.data || [];
    return items.map((p: any, index: number) => ({
      key: p.id || `${index}`,
      transactionId: p.txnRef || "",
      date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
      applicationId:
        p.commissions?.[0]?.application?.applicationId != null
          ? String(p.commissions[0].application.applicationId)
          : "—",
      amount: p.totalAmount ?? 0,
      status: p.status === "COMPLETED" ? "Completed" : "Pending",
      raw: p,
    }));
  }, [commissionTransactionsData]);

  const selectedTotalPayable = useMemo(
    () =>
      selectedPurchaseRecords.reduce(
        (sum, row) => sum + (row.status === "Unpaid" ? row.payable : 0),
        0,
      ),
    [selectedPurchaseRecords],
  );

  const handlePurchaseRowSelectionChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: PurchaseApplicationRecord[],
  ) => {
    setSelectedPurchaseKeys(newSelectedRowKeys);
    setSelectedPurchaseRecords(selectedRows);
  };

  const handleConfirmBankPayment = async () => {
    if (!receiptFile || selectedPurchaseRecords.length === 0) return;
    const applicationIds = selectedPurchaseRecords.map(
      (row) => row.raw?.applicationId,
    );
    try {
      await paySelectedApplications({
        applicationIds,
        currency: "USD",
        receipt: receiptFile,
      }).unwrap();
      setIsBankModalOpen(false);
      setReceiptFile(null);
      setSelectedPurchaseKeys([]);
      setSelectedPurchaseRecords([]);
    } catch {
      // errors are handled globally by baseApi
    }
  };

  const handleConfirmInvoiceUpload = async () => {
    if (!uploadCommissionId || !uploadInvoiceFile) return;
    try {
      await claimCommission({
        commissionId: uploadCommissionId,
        invoice: uploadInvoiceFile,
      }).unwrap();
      setIsUploadModalOpen(false);
      setUploadCommissionId(null);
      setUploadInvoiceFile(null);
    } catch {
      // errors handled globally
    }
  };

  const purchaseApplicationsColumns: ColumnsType<PurchaseApplicationRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 180,
    },
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
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 140,
    },
    { title: "Date", dataIndex: "date", key: "date", width: 140 },
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
    },
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
        <Tag
          className="payments-status-tag"
          color={status === "Completed" ? "success" : "default"}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Receipt",
      key: "receipt",
      width: 120,
      render: () => (
        <button type="button" className="payments-link-button">
          Download
        </button>
      ),
    },
  ];

  const commissionEarnedColumns: ColumnsType<CommissionEarnedRecord> = [
    { title: "#", dataIndex: "key", key: "key", width: 60 },
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 180,
    },
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
            setUploadCommissionId(record.commissionId);
            setIsUploadModalOpen(true);
            setUploadInvoiceFile(null);
          }}
        >
          Upload Invoice
        </button>
      ),
    },
  ];

  const commissionTransactionsColumns: ColumnsType<CommissionTransactionRecord> =
    [
      { title: "#", dataIndex: "key", key: "key", width: 60 },
      {
        title: "Transaction ID",
        dataIndex: "transactionId",
        key: "transactionId",
        width: 140,
      },
      { title: "Date", dataIndex: "date", key: "date", width: 140 },
      {
        title: "Application ID",
        dataIndex: "applicationId",
        key: "applicationId",
        width: 140,
      },
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
          <Tag
            className="payments-status-tag"
            color={status === "Completed" ? "success" : "default"}
          >
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
        onChange={(e) => {
          setSearchText(e.target.value);
          setPurchasePage(1);
        }}
        className="payments-search"
        size="large"
      />
      <div className="payments-toolbar-actions">
        <button type="button" className="payments-filter-button">
          <span>Filter</span>
          <Badge count={0} size="small" className="payments-filter-badge" />
        </button>
        <button
          type="button"
          className="payments-primary-button"
          disabled={
            selectedPurchaseRecords.length === 0 || selectedTotalPayable <= 0
          }
          onClick={() => setIsBankModalOpen(true)}
        >
          {selectedTotalPayable > 0
            ? `Pay Selected (€${selectedTotalPayable.toFixed(2)})`
            : "Pay Selected"}
        </button>
        <button type="button" className="payments-outline-button" disabled>
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
        <button type="button" className="payments-filter-button" disabled>
          <span>Filter</span>
          <Badge count={0} size="small" className="payments-filter-badge" />
        </button>
      </div>
    </div>
  );

  const renderTopCards = () => {
    if (topTab === "purchase") {
      if (purchaseTab === "applications") {
        const stats = purchaseStats || {};
        return (
          <div className="payments-kpi-grid">
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Applications</p>
              <p className="payments-kpi-value">
                {stats.totalApplications ?? 0}
              </p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Before Discount</p>
              <p className="payments-kpi-value">
                €{(stats.totalBeforeDiscount ?? 0).toFixed?.(2) ?? "0.00"}
              </p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Waiver (30%)</p>
              <p className="payments-kpi-value">
                {stats.avgWaiver != null
                  ? `${stats.avgWaiver.toFixed?.(1) ?? stats.avgWaiver}%`
                  : "0%"}
              </p>
            </div>
            <div className="payments-kpi-card">
              <p className="payments-kpi-label">Total Due</p>
              <p className="payments-kpi-value">
                €{(stats.totalDue ?? 0).toFixed?.(2) ?? "0.00"}
              </p>
            </div>
          </div>
        );
      }
      return null;
    }

    // commission tab
    if (commissionTab === "earned") {
      const stats = commissionStats || {};
      return (
        <div className="payments-kpi-grid">
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Total Commission Earned</p>
            <p className="payments-kpi-value">
              €{(stats.totalEarned ?? 0).toFixed?.(2) ?? "0.00"}
            </p>
          </div>
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Pending Payments</p>
            <p className="payments-kpi-value">
              €{(stats.pending ?? 0).toFixed?.(2) ?? "0.00"}
            </p>
          </div>
          <div className="payments-kpi-card">
            <p className="payments-kpi-label">Paid</p>
            <p className="payments-kpi-value">
              €{(stats.paid ?? 0).toFixed?.(2) ?? "0.00"}
            </p>
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
                dataSource={purchaseApplications}
                columns={purchaseApplicationsColumns}
                rowKey="key"
                loading={isPurchaseAppsLoading}
                rowSelection={{
                  selectedRowKeys: selectedPurchaseKeys,
                  onChange: handlePurchaseRowSelectionChange,
                }}
                pagination={{
                  current: purchasePage,
                  pageSize: purchasePageSize,
                  total: purchaseApplicationsData?.meta?.total ?? 0,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} applications`,
                  pageSizeOptions: ["10", "20", "50"],
                  onChange: (page, pageSize) => {
                    setPurchasePage(page);
                    setPurchasePageSize(pageSize || 10);
                  },
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
              dataSource={purchaseTransactions}
              columns={purchaseTransactionsColumns}
              rowKey="key"
              loading={isPurchaseTxLoading}
              pagination={{
                current: purchaseHistoryPage,
                pageSize: purchaseHistoryPageSize,
                total: purchaseTransactionsData?.meta?.total ?? 0,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} transactions`,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, pageSize) => {
                  setPurchaseHistoryPage(page);
                  setPurchaseHistoryPageSize(pageSize || 10);
                },
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
              dataSource={commissionEarned}
              columns={commissionEarnedColumns}
              rowKey="key"
              loading={isCommissionEarnedLoading}
              pagination={{
                current: commissionPage,
                pageSize: commissionPageSize,
                total: commissionEarnedData?.meta?.total ?? 0,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} records`,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, pageSize) => {
                  setCommissionPage(page);
                  setCommissionPageSize(pageSize || 10);
                },
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
            dataSource={commissionTransactions}
            columns={commissionTransactionsColumns}
            rowKey="key"
            loading={isCommissionTxLoading}
            pagination={{
              current: commissionHistoryPage,
              pageSize: commissionHistoryPageSize,
              total: commissionTransactionsData?.meta?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} transactions`,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (page, pageSize) => {
                setCommissionHistoryPage(page);
                setCommissionHistoryPageSize(pageSize || 10);
              },
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
        title={`${topTab === "purchase" ? "Purchase" : "Commission"} - Payments | Campus Transfer Partner`}
        description={
          topTab === "purchase"
            ? "Manage application payments and transaction history."
            : "View earned commissions and commission transaction history."
        }
      />

      <header className="payments-header">
        <div>
          <h1 className="payments-title">
            {topTab === "purchase" ? "Purchase" : "Commission"}
          </h1>
          <p className="payments-subtitle">
            {topTab === "purchase"
              ? "Manage application payments and transaction history."
              : "View earned commissions and commission transaction history."}
          </p>
        </div>
      </header>

      {/* Inner tabs: Applications / Transaction History or Earned Commissions / Transaction History */}
      <div className="payments-inner-tabs-wrapper">{renderInnerTabs()}</div>

      {/* KPI cards */}
      {renderTopCards()}

      {/* Table + toolbar */}
      <section className="payments-section">{renderTableSection()}</section>

      {/* Upload Invoice modal */}
      <Modal
        open={isUploadModalOpen}
        title="Upload Invoice"
        onCancel={() => setIsUploadModalOpen(false)}
        onOk={handleConfirmInvoiceUpload}
        okText={isClaiming ? "Submitting..." : "Confirm"}
        cancelText="Cancel"
        centered
        width={560}
        okButtonProps={{ disabled: !uploadInvoiceFile || isClaiming }}
      >
        <div className="payments-upload-modal">
          {uploadCommissionId && (
            <p className="payments-upload-application">
              Commission ID : <span>{uploadCommissionId}</span>
            </p>
          )}
          <Dragger
            multiple={false}
            showUploadList={!!uploadInvoiceFile}
            beforeUpload={(file) => {
              setUploadInvoiceFile(file);
              return false;
            }}
            onRemove={() => {
              setUploadInvoiceFile(null);
            }}
            className="payments-dragger"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="payments-dragger-title">
              Drag &amp; drop your Invoice
            </p>
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
        onOk={handleConfirmBankPayment}
        okText={isPaying ? "Submitting..." : "Confirm Payment"}
        cancelText="Cancel"
        centered
        width={600}
        okButtonProps={{
          disabled:
            !receiptFile || selectedPurchaseRecords.length === 0 || isPaying,
        }}
      >
        <div className="payments-bank-modal space-y-5 text-sm">
          <section className="payments-bank-section payments-bank-section--highlight">
            <p className="payments-bank-section-title">Bank Details</p>
            <div className="payments-bank-grid">
              <div>
                <p className="payments-bank-label">Bank Name</p>
                <p className="payments-bank-value">
                  {bankAccount?.bankName || "—"}
                </p>
              </div>
              <div>
                <p className="payments-bank-label">Account Name</p>
                <p className="payments-bank-value">
                  {bankAccount?.accountName || "—"}
                </p>
              </div>
              <div>
                <p className="payments-bank-label">Account Number</p>
                <p className="payments-bank-value">
                  {bankAccount?.accountNumber || "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="payments-bank-section">
            <p className="payments-bank-section-title">Payment Summary</p>
            <div className="payments-bank-summary">
              <div>
                <p className="payments-bank-label">Student</p>
                <p className="payments-bank-value">
                  {selectedPurchaseRecords.length > 0
                    ? `${selectedPurchaseRecords.length} application(s)`
                    : "No applications selected"}
                </p>
              </div>
              <div>
                <p className="payments-bank-label">Total Amount</p>
                <p className="payments-bank-value">
                  €{selectedTotalPayable.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          <section className="payments-bank-section">
            <Dragger
              multiple={false}
              showUploadList={!!receiptFile}
              beforeUpload={(file) => {
                setReceiptFile(file);
                return false;
              }}
              onRemove={() => {
                setReceiptFile(null);
              }}
              className="payments-dragger"
            >
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
