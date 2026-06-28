import { InboxOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tag, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import PageMeta from "../../components/common/Meta/PageMeta";
import { DataTable } from "../../components/common/Tables";
import { config } from "../../config";
import {
  useGetActiveBankAccountQuery,
  useGetCommissionEarnedQuery,
  useGetCommissionStatsQuery,
  useGetCommissionTransactionsQuery,
  useGetPurchaseApplicationsQuery,
  useGetPurchaseStatsQuery,
  useGetPurchaseTransactionsQuery,
  usePaySelectedApplicationsMutation,
} from "../../redux/features/payments/partnerPaymentsApi";
import EarningsChart from "./components/EarningsChart";
import PaymentStatCard from "./components/PaymentStatCard";
import PaymentsEmptyState from "./components/PaymentsEmptyState";
import "./Payments.css";

const { Dragger } = Upload;

type SectionKey = "purchases" | "commission";
type PurchaseTabKey = "applications" | "history";
type CommissionTabKey = "unpaid" | "history";

const CURRENCY = "€";
const ACCENT_GREEN = "#4bb032";

const formatMoney = (value: unknown) =>
  `${CURRENCY}${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

  const [section, setSection] = useState<SectionKey>("purchases");
  const [purchaseTab, setPurchaseTab] =
    useState<PurchaseTabKey>("applications");
  const [commissionTab, setCommissionTab] =
    useState<CommissionTabKey>("unpaid");
  const [searchText, setSearchText] = useState("");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [selectedPurchaseRecords, setSelectedPurchaseRecords] = useState<
    PurchaseApplicationRecord[]
  >([]);
  const [clearSelection, setClearSelection] = useState(0);

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
      status: commissionTab === "unpaid" ? "UNPAID" : undefined,
      search: searchText || undefined,
    });
  const { data: commissionTransactionsData, isLoading: isCommissionTxLoading } =
    useGetCommissionTransactionsQuery({
      page: commissionHistoryPage,
      limit: commissionHistoryPageSize,
      status: "COMPLETED",
      search: searchText || undefined,
    });

  const [paySelectedApplications, { isLoading: isPaying }] =
    usePaySelectedApplicationsMutation();

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

  /* ---- Stats (defensive reads — preserve existing data shapes) ---- */
  const pStats = purchaseStats || {};
  const purchasePayable = Number(
    pStats.payable ?? pStats.unpaid ?? pStats.totalPayable ?? 0,
  );
  const purchasePaid = Number(pStats.paid ?? pStats.totalPaid ?? 0);
  const purchaseAppCount = Number(
    purchaseApplicationsData?.meta?.total ?? purchaseApplications.length ?? 0,
  );

  const cStats = commissionStats || {};
  const commissionUnpaid = Number(cStats.unpaid ?? 0);
  const commissionPaid = Number(cStats.paid ?? 0);
  const commissionUnpaidCount = Number(cStats?.counts?.unpaid ?? 0);
  const commissionPaidCount = Number(cStats?.counts?.paid ?? 0);
  const commissionTotal = commissionUnpaid + commissionPaid;

  const handleSectionChange = (next: SectionKey) => {
    setSection(next);
    setSearchText("");
  };

  const handlePurchaseTabChange = (next: PurchaseTabKey) => {
    setPurchaseTab(next);
    setSearchText("");
    if (next === "applications") setPurchasePage(1);
    else setPurchaseHistoryPage(1);
  };

  const handleCommissionTabChange = (next: CommissionTabKey) => {
    setCommissionTab(next);
    setSearchText("");
    if (next === "unpaid") setCommissionPage(1);
    else setCommissionHistoryPage(1);
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
      setSelectedPurchaseRecords([]);
      setClearSelection((n) => n + 1);
    } catch {
      // errors are handled globally by baseApi
    }
  };

  /* ---------------------------- Columns ---------------------------- */
  const statusTag = (
    text: string,
    tone: "success" | "warning" | "default",
  ) => (
    <Tag className="payments-status-tag" color={tone}>
      {text}
    </Tag>
  );

  const purchaseApplicationsColumns: ColumnsType<PurchaseApplicationRecord> = [
    {
      title: "Application ID",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 140,
      render: (value: string) => (
        <span className="font-medium text-neutral-800 dark:text-neutral-100">
          {value || "—"}
        </span>
      ),
    },
    { title: "Student Name", dataIndex: "studentName", key: "studentName", width: 160 },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      width: 100,
      render: (value: number) => `${CURRENCY}${value}`,
    },
    {
      title: "Waiver",
      dataIndex: "waiverPercent",
      key: "waiverPercent",
      width: 100,
      render: (value: number) => `${value}%`,
    },
    {
      title: "Payable",
      dataIndex: "payable",
      key: "payable",
      width: 110,
      render: (value: number) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {CURRENCY}
          {value}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: PurchaseApplicationRecord["status"]) =>
        statusTag(
          status,
          status === "Paid"
            ? "success"
            : status === "Under Review"
              ? "warning"
              : "default",
        ),
    },
  ];

  const purchaseTransactionsColumns: ColumnsType<PurchaseTransactionRecord> = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      ellipsis: true,
      render: (value: string) => (
        <span className="font-medium text-neutral-800 dark:text-neutral-100">
          {value || "—"}
        </span>
      ),
    },
    { title: "Date", dataIndex: "date", key: "date", width: 130 },
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
      width: 120,
      render: (value: number) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {CURRENCY}
          {value}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: PurchaseTransactionRecord["status"]) =>
        statusTag(status, status === "Completed" ? "success" : "default"),
    },
    {
      title: "Receipt",
      key: "receipt",
      width: 110,
      render: (_: unknown, record) => {
        const fileUrl = resolveMediaUrl(record.raw?.receiptUrl);
        if (!fileUrl)
          return <span className="text-xs text-neutral-400">—</span>;
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="payments-link"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
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
      render: (value: string) => (
        <span className="font-medium text-neutral-800 dark:text-neutral-100">
          {value || "—"}
        </span>
      ),
    },
    { title: "Student Name", dataIndex: "studentName", key: "studentName", width: 180 },
    {
      title: "Earned",
      dataIndex: "earned",
      key: "earned",
      width: 120,
      render: (value: number) => (
        <span className="font-semibold text-primary-700 dark:text-primary-300">
          {CURRENCY}
          {value}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: CommissionEarnedRecord["status"]) =>
        statusTag(
          status,
          status === "Paid"
            ? "success"
            : status === "Pending"
              ? "warning"
              : "default",
        ),
    },
  ];

  const commissionTransactionsColumns: ColumnsType<CommissionTransactionRecord> =
    [
      {
        title: "Transaction ID",
        dataIndex: "transactionId",
        key: "transactionId",
        width: 150,
        render: (value: string) => (
          <span className="font-medium text-neutral-800 dark:text-neutral-100">
            {value || "—"}
          </span>
        ),
      },
      { title: "Date", dataIndex: "date", key: "date", width: 130 },
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
        render: (value: number) => (
          <span className="font-semibold text-neutral-900 dark:text-white">
            {CURRENCY}
            {value}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: CommissionTransactionRecord["status"]) =>
          statusTag(status, status === "Completed" ? "success" : "default"),
      },
      {
        title: "Receipt",
        key: "receipt",
        width: 110,
        render: (_: unknown, record) => {
          const fileUrl = resolveMediaUrl(record.raw?.receiptUrl);
          if (!fileUrl)
            return <span className="text-xs text-neutral-400">—</span>;
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="payments-link"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Download
            </a>
          );
        },
      },
    ];

  /* ---------------------------- Sub-tabs ---------------------------- */
  const renderSubTab = (
    label: string,
    active: boolean,
    onClick: () => void,
    count?: number,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`payments-subtab ${active ? "payments-subtab--active" : ""}`}
    >
      {label}
      {count != null ? (
        <span
          className={`ml-2 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
            active
              ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );

  /* --------------------------- Search bar -------------------------- */
  const renderSearch = (placeholder: string, onChange?: () => void) => (
    <Input
      placeholder={placeholder}
      prefix={<Search size={16} className="text-neutral-400" />}
      allowClear
      value={searchText}
      onChange={(e) => {
        setSearchText(e.target.value);
        onChange?.();
      }}
      className="payments-search"
      size="large"
    />
  );

  /* ----------------------------- Tables ---------------------------- */
  const renderTable = () => {
    if (section === "purchases") {
      if (purchaseTab === "applications") {
        const isEmpty = !isPurchaseAppsLoading && purchaseApplications.length === 0;
        return (
          <>
            <div className="payments-toolbar">
              {renderSearch("Search application ID, name", () =>
                setPurchasePage(1),
              )}
              <div className="payments-toolbar-actions">
                <Button
                  type="primary"
                  disabled={
                    selectedPurchaseRecords.length === 0 ||
                    selectedTotalPayable <= 0
                  }
                  onClick={() => setIsBankModalOpen(true)}
                >
                  {selectedTotalPayable > 0
                    ? `Pay Selected (${formatMoney(selectedTotalPayable)})`
                    : "Pay Selected"}
                </Button>
                <Button icon={<FileText className="h-4 w-4" />} disabled>
                  Download Invoice
                </Button>
              </div>
            </div>
            {isEmpty ? (
              <PaymentsEmptyState
                icon={<Wallet className="h-7 w-7" />}
                title="No applications to pay"
                description="Applications with outstanding fees will appear here, ready for you to settle."
              />
            ) : (
              <DataTable
                data={purchaseApplications}
                columns={purchaseApplicationsColumns}
                rowKey="key"
                loading={isPurchaseAppsLoading}
                selectRow
                onSelectRowsChange={(rows: PurchaseApplicationRecord[]) =>
                  setSelectedPurchaseRecords(rows)
                }
                clearSelectionTrigger={clearSelection}
                currentPage={purchasePage}
                setCurrentPage={setPurchasePage}
                limit={purchasePageSize}
                setLimit={setPurchasePageSize}
                total={purchaseApplicationsData?.meta?.total ?? 0}
                isPaginate
                showHeader
                showSizeChanger
                noInnerBorder
                pagination={{
                  showTotal: (total: number) => `Total ${total} applications`,
                }}
              />
            )}
          </>
        );
      }

      // purchases / history
      const isEmpty = !isPurchaseTxLoading && purchaseTransactions.length === 0;
      return (
        <>
          <div className="payments-toolbar">
            {renderSearch("Search application ID, transaction ID", () =>
              setPurchaseHistoryPage(1),
            )}
          </div>
          {isEmpty ? (
            <PaymentsEmptyState
              icon={<Receipt className="h-7 w-7" />}
              title="No purchase transactions"
              description="Your completed and pending fee payments will be listed here."
            />
          ) : (
            <DataTable
              data={purchaseTransactions}
              columns={purchaseTransactionsColumns}
              rowKey="key"
              loading={isPurchaseTxLoading}
              currentPage={purchaseHistoryPage}
              setCurrentPage={setPurchaseHistoryPage}
              limit={purchaseHistoryPageSize}
              setLimit={setPurchaseHistoryPageSize}
              total={purchaseTransactionsData?.meta?.total ?? 0}
              isPaginate
              showHeader
              showSizeChanger
              noInnerBorder
              pagination={{
                showTotal: (total: number) => `Total ${total} transactions`,
              }}
            />
          )}
        </>
      );
    }

    // ---------------------------- Commission ------------------------
    if (commissionTab === "unpaid") {
      const isEmpty =
        !isCommissionEarnedLoading && commissionEarned.length === 0;
      return (
        <>
          <div className="payments-toolbar">
            {renderSearch("Search application ID, name", () =>
              setCommissionPage(1),
            )}
          </div>
          {isEmpty ? (
            <PaymentsEmptyState
              icon={<Coins className="h-7 w-7" />}
              title="No unpaid commission"
              description="Commissions you've earned and are awaiting payout will show up here."
            />
          ) : (
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
          )}
        </>
      );
    }

    const isEmpty =
      !isCommissionTxLoading && commissionTransactions.length === 0;
    return (
      <>
        <div className="payments-toolbar">
          {renderSearch("Search application ID, transaction ID", () =>
            setCommissionHistoryPage(1),
          )}
        </div>
        {isEmpty ? (
          <PaymentsEmptyState
            icon={<Receipt className="h-7 w-7" />}
            title="No payout transactions"
            description="Completed commission payouts will appear in this history."
          />
        ) : (
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
        )}
      </>
    );
  };

  const isPurchases = section === "purchases";

  return (
    <div className="payments-page">
      <PageMeta
        title="Payments | Campus Transfer Partner"
        description="Settle application fees and track your commission earnings."
      />

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Payments
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Settle outstanding fees and track your commission earnings in one
            place.
          </p>
        </div>

        {/* Section switch */}
        <div className="payments-segment">
          <button
            type="button"
            onClick={() => handleSectionChange("purchases")}
            className={`payments-segment-btn ${
              isPurchases ? "payments-segment-btn--active" : ""
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Purchases
          </button>
          <button
            type="button"
            onClick={() => handleSectionChange("commission")}
            className={`payments-segment-btn ${
              !isPurchases ? "payments-segment-btn--active" : ""
            }`}
          >
            <Coins className="h-4 w-4" />
            Commission
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isPurchases ? (
          <>
            <PaymentStatCard
              label="Outstanding"
              value={formatMoney(purchasePayable)}
              sub={`${purchaseAppCount} application${purchaseAppCount === 1 ? "" : "s"} to pay`}
              icon={<Wallet className="h-5 w-5" />}
              accent="amber"
            />
            <PaymentStatCard
              label="Total Paid"
              value={formatMoney(purchasePaid)}
              sub="Lifetime fee payments"
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent="green"
            />
            <PaymentStatCard
              label="Applications"
              value={purchaseAppCount.toLocaleString()}
              sub="Awaiting settlement"
              icon={<FileText className="h-5 w-5" />}
              accent="blue"
            />
            <PaymentStatCard
              label="Selected"
              value={formatMoney(selectedTotalPayable)}
              sub={`${selectedPurchaseRecords.length} selected`}
              icon={<Banknote className="h-5 w-5" />}
              accent="violet"
              highlight={selectedTotalPayable > 0}
            />
          </>
        ) : (
          <>
            <PaymentStatCard
              label="Unpaid Commission"
              value={formatMoney(commissionUnpaid)}
              sub={`${commissionUnpaidCount} pending`}
              icon={<Clock className="h-5 w-5" />}
              accent="amber"
            />
            <PaymentStatCard
              label="Paid Commission"
              value={formatMoney(commissionPaid)}
              sub={`${commissionPaidCount} paid out`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent="green"
            />
            <PaymentStatCard
              label="Total Earned"
              value={formatMoney(commissionTotal)}
              sub="Unpaid + paid"
              icon={<Coins className="h-5 w-5" />}
              accent="blue"
            />
            <PaymentStatCard
              label="Payout Rate"
              value={
                commissionTotal > 0
                  ? `${Math.round((commissionPaid / commissionTotal) * 100)}%`
                  : "0%"
              }
              sub="Of total earnings"
              icon={<Wallet className="h-5 w-5" />}
              accent="violet"
            />
          </>
        )}
      </section>

      {/* Chart */}
      <section>
        {isPurchases ? (
          <EarningsChart
            title="Spending overview"
            subtitle="Application fee payments over time"
            data={purchaseTransactions
              .filter((t) => t.status === "Completed")
              .map((t) => ({ date: t.date, amount: t.amount }))}
            color="#3b82f6"
          />
        ) : (
          <EarningsChart
            title="Earnings overview"
            subtitle="Commission payouts over time"
            data={commissionTransactions
              .filter((t) => t.status === "Completed")
              .map((t) => ({ date: t.date, amount: t.amount }))}
            color={ACCENT_GREEN}
          />
        )}
      </section>

      {/* Table card */}
      <section className="payments-table-wrap rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-800">
        <div className="flex flex-wrap items-center gap-1 border-b border-neutral-100 px-4 pt-2 dark:border-neutral-800">
          {isPurchases ? (
            <>
              {renderSubTab(
                "Applications",
                purchaseTab === "applications",
                () => handlePurchaseTabChange("applications"),
                purchaseApplicationsData?.meta?.total,
              )}
              {renderSubTab(
                "Transaction History",
                purchaseTab === "history",
                () => handlePurchaseTabChange("history"),
              )}
            </>
          ) : (
            <>
              {renderSubTab(
                "Unpaid Commission",
                commissionTab === "unpaid",
                () => handleCommissionTabChange("unpaid"),
                commissionUnpaidCount || undefined,
              )}
              {renderSubTab(
                "Transaction History",
                commissionTab === "history",
                () => handleCommissionTabChange("history"),
              )}
            </>
          )}
        </div>

        <div className="p-4">{renderTable()}</div>
      </section>

      {/* Bank transfer modal */}
      <Modal
        open={isBankModalOpen}
        title="Bank Transfer Payment"
        onCancel={() => setIsBankModalOpen(false)}
        onOk={handleConfirmBankPayment}
        okText={isPaying ? "Submitting..." : "Confirm Payment"}
        cancelText="Cancel"
        centered
        width={600}
        rootClassName="payments-modal"
        okButtonProps={{
          disabled:
            !receiptFile || selectedPurchaseRecords.length === 0 || isPaying,
        }}
      >
        <div className="mt-2 space-y-4 text-sm">
          <section className="rounded-2xl bg-primary-50 p-4 ring-1 ring-primary-100 dark:bg-primary-500/10 dark:ring-primary-500/20">
            <p className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
              Bank Details
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Bank Name", value: bankAccount?.bankName },
                { label: "Account Name", value: bankAccount?.accountName },
                { label: "Account Number", value: bankAccount?.accountNumber },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-medium text-neutral-900 dark:text-white">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100 dark:bg-neutral-800/50 dark:ring-neutral-800">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Applications
              </p>
              <p className="mt-0.5 font-medium text-neutral-900 dark:text-white">
                {selectedPurchaseRecords.length > 0
                  ? `${selectedPurchaseRecords.length} application(s)`
                  : "No applications selected"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Total Amount
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary-700 dark:text-primary-300">
                {formatMoney(selectedTotalPayable)}
              </p>
            </div>
          </section>

          <section>
            <Dragger
              multiple={false}
              showUploadList={!!receiptFile}
              beforeUpload={(file) => {
                setReceiptFile(file);
                return false;
              }}
              onRemove={() => setReceiptFile(null)}
              className="payments-dragger"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="payments-dragger-title">
                Drag &amp; drop your Payment Receipt
              </p>
              <Button type="default" style={{ marginTop: 8 }}>
                Choose file
              </Button>
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
