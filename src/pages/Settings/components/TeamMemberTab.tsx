import { Input, Tag } from "antd";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../../components/common/Tables";
import { useGetPartnerDashboardQuery } from "../../../redux/features/profile/partnerProfileApi";

type TeamMemberRow = {
  key: string;
  idNo: string;
  name: string;
  contact: string;
  email: string;
  status: "Active" | "Pending";
};

const FALLBACK_TEAM: TeamMemberRow[] = [
  {
    key: "tm-1",
    idNo: "32145321",
    name: "Narayan Regmi",
    contact: "+01787919166",
    email: "narayanregmi1999@gmail.com",
    status: "Active",
  },
  {
    key: "tm-2",
    idNo: "21452313",
    name: "Suman Thapa",
    contact: "+01787919166",
    email: "suman.thapa@gmail.com",
    status: "Pending",
  },
  {
    key: "tm-3",
    idNo: "13421532",
    name: "Anish Maharjan",
    contact: "+01787919166",
    email: "anish.mj1995@gmail.com",
    status: "Pending",
  },
  {
    key: "tm-4",
    idNo: "21533421",
    name: "Bikash Rai",
    contact: "+01787919166",
    email: "bikashrai21@yahoo.com",
    status: "Pending",
  },
];

export default function TeamMemberTab() {
  const { data: dashboard } = useGetPartnerDashboardQuery();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const rows: TeamMemberRow[] = useMemo(() => {
    const apiItems = dashboard?.teamMembers || [];

    const mapped: TeamMemberRow[] = apiItems.map((m, idx: number) => {
      const phone =
        m.contactNumber && m.countryCode
          ? `${m.countryCode}${m.contactNumber}`
          : m.contactNumber || "—";
      return {
        key: m.id || `${idx}`,
        idNo:
          (m.id || "").replace(/\W/g, "").slice(-8).padStart(8, "0") ||
          String(idx + 10000000),
        name: m.fullName || `${m.firstName} ${m.lastName}`.trim(),
        contact: phone,
        email: m.email || "—",
        status:
          (m.status || "").toString().toLowerCase() === "active"
            ? "Active"
            : "Pending",
      };
    });

    const base = mapped.length > 0 ? mapped : FALLBACK_TEAM;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) => {
      return (
        r.idNo.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    });
  }, [dashboard?.teamMembers, search]);

  const columns = [
    { title: "ID No", dataIndex: "idNo", key: "idNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Contract Number", dataIndex: "contact", key: "contact" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TeamMemberRow["status"]) => (
        <Tag color={status === "Active" ? "success" : "default"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="account-team">
      <div className="account-team-card">
        <div className="mb-6 max-w-sm">
          <Input
            placeholder="Search id,name,email"
            allowClear
            value={search}
            prefix={<Search size={16} className="text-[#4B5563]" />}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            size="large"
          />
        </div>

        <div className="account-team-table">
          <DataTable
            data={rows}
            columns={columns}
            rowKey="key"
            currentPage={page}
            setCurrentPage={setPage}
            limit={limit}
            setLimit={setLimit}
            total={rows.length}
            isPaginate
            showHeader
            showSizeChanger={false}
            noInnerBorder
          />
        </div>
      </div>
    </div>
  );
}
