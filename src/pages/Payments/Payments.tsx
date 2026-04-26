import React, { useMemo, useState } from "react";
import { Input, Tag, Badge, Modal, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InboxOutlined } from "@ant-design/icons";
import { Search } from "lucide-react";
import PageMeta from "../../components/common/Meta/PageMeta";
import "../../components/common/Tables/AntTable.css";
import "./Payments.css";
import { DataTable } from "../../components/common/Tables";
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
import { config } from "../../config";

const { Dragger } = Upload;

type PurchaseTabKey = "applications" | "history";
type CommissionTabKey = "all" | "history";

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
  const resolveMediaUrl = (raw?: string | null) => {
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = config.image_access_url || "";
    if (!base) return raw;
    return `${base}${raw}`;
  };

  const [purchaseTab, setPurchaseTab] =
    useState<PurchaseTabKey>("applications");
  const [commissionTab, setCommissionTab] =
    useState<CommissionTabKey>("all");
  const [searchText, setSearchText] = useState("");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCommissionId, setUploadCommissionId] = useState<string | null>(
    null,
  );
  const [uploadApplicationId, setUploadApplicationId] = useState<string | null>(
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
  const handleConfirmInvoiceUpload = async () => {
    if (!uploadCommissionId || !uploadInvoiceFile) return;
    try {
      await claimCommission({
        commissionId: uploadCommissionId,
        invoice: uploadInvoiceFile,
      }).unwrap();
      setIsUploadModalOpen(false);
      setUploadCommissionId(null);
      setUploadApplicationId(null);
      setUploadInvoiceFile(null);
    } catch {
      // errors handled globally
    }
  };


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
    if (!isPurchaseTxLoading && items.length === 0) {
      return [
        {
          key: "static-ptx-1",
          transactionId: "TXN-PUR-12001",
          date: "2026-04-18",
          applicationId: "APP-10234",
          amount: 420,
          status: "Completed",
          raw: null,
        },
        {
          key: "static-ptx-2",
          transactionId: "TXN-PUR-12009",
          date: "2026-04-20",
          applicationId: "APP-10210",
          amount: 300,
          status: "Pending",
          raw: null,
        },
        {
          key: "static-ptx-3",
          transactionId: "TXN-PUR-12015",
          date: "2026-04-21",
          applicationId: "APP-10198",
          amount: 250,
          status: "Completed",
          raw: null,
        },
      ];
    }
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
  }, [purchaseTransactionsData, isPurchaseTxLoading]);

  const commissionEarned: CommissionEarnedRecord[] = useMemo(() => {
    const items = commissionEarnedData?.data || [];
    if (!isCommissionEarnedLoading && items.length === 0) {
      return [
        {
          key: "static-earned-1",
          commissionId: "COM-0001",
          applicationId: "APP-10234",
          studentName: "John Doe",
          earned: 120,
          status: "Pending",
          raw: null,
        },
        {
          key: "static-earned-2",
          commissionId: "COM-0002",
          applicationId: "APP-10210",
          studentName: "Ayesha Rahman",
          earned: 85,
          status: "Paid",
          raw: null,
        },
        {
          key: "static-earned-3",
          commissionId: "COM-0003",
          applicationId: "APP-10198",
          studentName: "Sabbir Hossain",
          earned: 60,
          status: "Unpaid",
          raw: null,
        },
      ];
    }
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
  }, [commissionEarnedData, isCommissionEarnedLoading]);

  const commissionTransactions: CommissionTransactionRecord[] = useMemo(() => {
    const items = commissionTransactionsData?.data || [];
    if (!isCommissionTxLoading && items.length === 0) {
      return [
        {
          key: "static-ctx-1",
          transactionId: "TXN-COM-9812",
          date: "2026-04-18",
          applicationId: "APP-10210",
          amount: 85,
          status: "Completed",
          raw: null,
        },
        {
          key: "static-ctx-2",
          transactionId: "TXN-COM-9827",
          date: "2026-04-20",
          applicationId: "APP-10234",
          amount: 120,
          status: "Pending",
          raw: null,
        },
        {
          key: "static-ctx-3",
          transactionId: "TXN-COM-9833",
          date: "2026-04-21",
          applicationId: "APP-10198",
          amount: 60,
          status: "Completed",
          raw: null,
        },
      ];
    }
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
  }, [commissionTransactionsData, isCommissionTxLoading]);

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

  const purchaseApplicationsColumns: ColumnsType<PurchaseApplicationRecord> = [

  
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
      width: 140,
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
      width: 100,
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
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
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      ellipsis: true,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => `€${value}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
      render: (_: unknown, record) => {
        const fileUrl = resolveMediaUrl(record.raw?.receiptUrl);
        if (!fileUrl) return <span className="text-xs text-gray-400">-</span>;
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="payments-link-button"
          >
            Download
          </a>
        );
      },
    },
  ];

  const commissionEarnedColumns: ColumnsType<CommissionEarnedRecord> = [
   
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
    // Action column intentionally removed per updated requirements.
  ];

  const commissionTransactionsColumns: ColumnsType<CommissionTransactionRecord> =
    [
     
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
      {
        title: "Receipt",
        key: "receipt",
        render: (_: unknown, record) => {
          const fileUrl = resolveMediaUrl(record.raw?.receiptUrl);
          if (!fileUrl) return <span className="text-xs text-gray-400">-</span>;
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="payments-link-button"
            >
              Download
            </a>
          );
        },
      },
    ];

  const renderPurchaseApplicationsToolbar = () => (
    <div className="payments-toolbar">
      <Input
        placeholder="Search application ID, name"
        prefix={<Search size={16} className="text-[#4B5563]" />}
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
          <span className="payments-filter-icon" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="payments-filter-label">Filter</span>
          <span className="payments-filter-badge-wrap">
            <Badge count={0} size="small" className="payments-filter-badge" />
          </span>
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
        <button type="button" className="payments-primary-button" disabled>
          Download Invoice
        </button>
      </div>
    </div>
  );

  const renderSimpleToolbar = (placeholder: string) => (
    <div className="payments-toolbar">
      <Input
        placeholder={placeholder}
        prefix={<Search size={16} className="text-[#4B5563]" />}
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="payments-search"
        size="large"
      />
      <div className="payments-toolbar-actions">
        <button type="button" className="payments-filter-button">
          <span className="payments-filter-icon" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="payments-filter-label">Filter</span>
          <span className="payments-filter-badge-wrap">
            <Badge count={0} size="small" className="payments-filter-badge" />
          </span>
        </button>
      </div>
    </div>
  );

  const renderTopCards = () => {
    if (commissionTab === "all") {
      const stats = commissionStats || {};
      return (
        <div className="payments-kpi-grid payments-kpi-grid--3">
          <div className="payments-kpi-card">
            <div className="payments-kpi-row">
            <img
                    src="/money-bag.png"
                    alt="Total Commission Earned"
                    className="h-7 w-7 object-contain"
                  />
              <div>
                <p className="payments-kpi-label">All</p>
                <p className="payments-kpi-value">
                  €{(stats.total ?? 0).toFixed?.(2) ?? "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="payments-kpi-card">
            <div className="payments-kpi-row">
            <img
                    src="/hourglass.png"
                    alt="Pending Commission"
                    className="h-7 w-7 object-contain"
                  />
                
              <div>
                <p className="payments-kpi-label">Unpaid</p>
                <p className="payments-kpi-value">
                  €{(stats.unpaid ?? 0).toFixed?.(2) ?? "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="payments-kpi-card">
            <div className="payments-kpi-row">
            <img
                    src="/dollar.png"
                    alt="Paid Commission"
                    className="h-7 w-7 object-contain"
                  />
              
              <div>
                <p className="payments-kpi-label">Paid</p>
                <p className="payments-kpi-value">
                  €{(stats.paid ?? 0).toFixed?.(2) ?? "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderInnerTabs = () => {
    return (
      <div className="payments-inner-tabs">
        <button
          type="button"
          className={
            commissionTab === "all"
              ? "payments-inner-tab payments-inner-tab--active"
              : "payments-inner-tab"
          }
          onClick={() => {
            setCommissionTab("all");
            handleResetSearchOnTabChange();
          }}
        >
          All Commissions
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
    if (commissionTab === "all") {
      return (
        <>
          <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#C7CACF] space-y-4">
            {renderSimpleToolbar("Search application ID, name")}
            <DataTable
              data={commissionEarned}
              columns={commissionEarnedColumns}
              rowKey="key"
              loading={isCommissionEarnedLoading}
              currentPage={commissionPage}
              setCurrentPage={setCommissionPage}
              limit={commissionPageSize}
              setLimit={setCommissionPageSize}
              total={commissionEarnedData?.meta?.total ?? 0}
              isPaginate
              showHeader
              showSizeChanger
              noInnerBorder
              pagination={{
                showTotal: (total: number) => `Total ${total} records`,
              }}
            />
          </div>
        </>
      );
    }

    // commission / history
    return (
      <>
        <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#C7CACF] space-y-4">
          {renderSimpleToolbar("Search application ID, transaction ID")}
          <DataTable
            data={commissionTransactions}
            columns={commissionTransactionsColumns}
            rowKey="key"
            loading={isCommissionTxLoading}
            currentPage={commissionHistoryPage}
            setCurrentPage={setCommissionHistoryPage}
            limit={commissionHistoryPageSize}
            setLimit={setCommissionHistoryPageSize}
            total={commissionTransactionsData?.meta?.total ?? 0}
            isPaginate
            showHeader
            showSizeChanger
            noInnerBorder
            pagination={{
              showTotal: (total: number) => `Total ${total} transactions`,
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div className="payments-page">
      <PageMeta
        title="Commission - Payments | Campus Transfer Partner"
        description="View earned commissions and commission transaction history."
      />
      

      <header className="payments-header">
        <div>
          <h1 className="payments-title">
          Payments
          </h1>
          <p className="payments-subtitle">Manage commission status and transaction history.</p>
        </div>
      </header>

      {/* Inner tabs: Applications / Transaction History or Earned Commissions / Transaction History */}
      <div className="payments-inner-tabs-wrapper">{renderInnerTabs()}</div>

      {/* KPI cards */}
      {renderTopCards()}

      {/* Table + toolbar */}
      <section className="payments-section">{renderTableSection()}</section>

      {/* Bank transfer / Pay selected modal */}
      <Modal
        open={isUploadModalOpen}
        title="Upload Invoice"
        onCancel={() => {
          setIsUploadModalOpen(false);
          setUploadInvoiceFile(null);
          setUploadCommissionId(null);
          setUploadApplicationId(null);
        }}
        onOk={handleConfirmInvoiceUpload}
        okText={isClaiming ? "Submitting..." : "Confirm"}
        cancelText="Cancel"
        centered
        width={560}
        okButtonProps={{ disabled: !uploadInvoiceFile || isClaiming }}
      >
        <div className="payments-upload-modal">
          {uploadApplicationId && (
            <p className="payments-upload-application">
              Application ID : <span>{uploadApplicationId}</span>
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
