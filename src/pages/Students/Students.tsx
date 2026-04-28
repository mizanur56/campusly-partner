// import { Input } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { Search } from "lucide-react";
// import { useMemo, useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import PageMeta from "../../components/common/Meta/PageMeta";
// import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
// import PageHeader from "../../components/common/Navigation/PageHeader";
// import { DataTable } from "../../components/common/Tables";
// <<<<<<<<< Temporary merge branch 1
// import { useGetStudentsQuery } from "../../redux/features/users/usersApi";
// =========
// import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
// import { selectCurrentUser } from "../../redux/features/auth/authSlice";
// >>>>>>>>> Temporary merge branch 2
// import "./Students.css";
// import PageHeader from "../../components/common/Navigation/PageHeader";
// import { Search } from "lucide-react";
// import { useGetAllStudentsByPartnerIdQuery } from "../../redux/features/profile/studentProfileApi";
// import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
// import "./Students.css";

// interface StudentRecord {
//   key: string;
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   status: string;
//   lastLogin: string;
// }

// interface AssignedStudentRecord {
//   key: string;
//   studentId: string;
//   studentName: string;
//   activeTaskCount: number;
// }

// function formatDate(iso: string | null): string {
//   if (!iso) return "—";
//   try {
//     const d = new Date(iso);
//     return d.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return "—";
//   }
// }

// export default function Students() {
//   const navigate = useNavigate();
//   const user = useSelector(selectCurrentUser);
//   const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

//   const [searchText, setSearchText] = useState("");
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [createStudentOpen, setCreateStudentOpen] = useState(false);

// <<<<<<<<< Temporary merge branch 1
//   const { data, isFetching } = useGetStudentsQuery(
//     { page, limit: pageSize }
//   );

//   const tableData: StudentRecord[] = useMemo(() => {
//     if (!data?.data) return [];
//     const rows = data.data.map((u) => ({
// =========
//   const { data: assignedStudents = [], isFetching: isFetchingAssigned } =
//     useGetStudentsWithActiveTasksQuery(
//       isTeamMember ? { assignedToMe: true } : undefined,
//       { skip: !isTeamMember }
//     );
//   const {
//     data: allStudents,
//     isLoading: isPartnerStudentsLoading,
//     isFetching: isPartnerStudentsFetching,
//   } = useGetAllStudentsByPartnerIdQuery(
//     { partnerId: user?.id as string },
//     { skip: !user?.id || isTeamMember }
//   );

  

//   console.log(allStudents)

//   const tableData: StudentRecord[] = useMemo(() => {
//     if (isTeamMember) return [];
//     if (!allStudents?.data) return [];
//     const rows = allStudents.data.map((u: any) => ({
// >>>>>>>>> Temporary merge branch 2
//       key: u.id,
//       id: u.id,
//       name: u.user.name,
//       email: u.email,
//       phone: u.phone ?? "—",
//       passportNo: u.passportNo ?? "—",
//       AssignedTo: u?.advisor?.name ?? "—",
//     }));
//     if (!searchText.trim()) return rows;
//     const q = searchText.toLowerCase();
//     return rows.filter(
//       (row: StudentRecord) =>
//         row.name.toLowerCase().includes(q) ||
//         row.email.toLowerCase().includes(q) ||
//         row.phone.includes(searchText) 
//     );
// <<<<<<<<< Temporary merge branch 1
//   }, [data?.data, searchText]);
// =========
//   }, [allStudents, searchText, isTeamMember]);

//   const assignedTableData: AssignedStudentRecord[] = useMemo(() => {
//     if (!isTeamMember) return [];
//     const rows = assignedStudents.map((s) => ({
//       key: s.studentId,
//       studentId: s.studentId,
//       studentName: s.studentName,
//       activeTaskCount: s.activeTaskCount,
//     }));
//     if (!searchText.trim()) return rows;
//     const q = searchText.toLowerCase();
//     return rows.filter((row) => row.studentName.toLowerCase().includes(q));
//   }, [assignedStudents, searchText, isTeamMember]);
// >>>>>>>>> Temporary merge branch 2

//   const columns: ColumnsType<StudentRecord> = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       sorter: (a, b) => a.name.localeCompare(b.name),
//       width: 180,
//     },
//     { title: "Email", dataIndex: "email", key: "email", width: 220 },
//     { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
//     { title: "Passport No", dataIndex: "passportNo", key: "passportNo", width: 140 },
//     { title: "Assigned To", dataIndex: "AssignedTo", key: "AssignedTo", width: 140 },
 
//   ];

// <<<<<<<<< Temporary merge branch 1
//   const loading = isFetching;
// =========
//   const assignedColumns: ColumnsType<AssignedStudentRecord> = [
//     {
//       title: "Student",
//       dataIndex: "studentName",
//       key: "studentName",
//       width: 280,
//     },
//     {
//       title: "Active tasks",
//       dataIndex: "activeTaskCount",
//       key: "activeTaskCount",
//       width: 120,
//       render: (n: number) => (
//         <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
//           {n} task{n !== 1 ? "s" : ""}
//         </span>
//       ),
//     },
//   ];

//   const loading = isTeamMember
//     ? isFetchingAssigned
//     : Boolean(user?.id) && (isPartnerStudentsLoading || isPartnerStudentsFetching);
// >>>>>>>>> Temporary merge branch 2

//   return (
//     <div className="students-page">
//       <PageMeta
//         title="Students - Campus Transfer Partner"
//         description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
//       />
//       <PageHeader title="Students" subtitle={isTeamMember
//               ? "Students with tasks assigned to you."
//               : "Easily manage every student you onboard and support."}  extra={<button
//               type="button"
//               onClick={() => setCreateStudentOpen(true)}
//               className="inline cursor-pointer flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
//             >
//               + Add student
//             </button>} breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Students" }]}/>

//             {!isTeamMember && (
//               <CreateStudentModal
//                 open={createStudentOpen}
//                 onClose={() => setCreateStudentOpen(false)}
//               />
//             )}
    
//    <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#C7CACF]">
    
//    <div className="mb-6 max-w-sm">
//         <Input
//           placeholder={
//             isTeamMember
//               ? "Search by student name"
//               : "Search by name, email, status or phone"
//           }
//           allowClear
//           value={searchText}
//           prefix={<Search size={16} className="text-[#4B5563]" />}
//           onChange={(e) => setSearchText(e.target.value)}
//           size="large"
//         />
//       </div>

//       <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
// <<<<<<<<< Temporary merge branch 1
//         <DataTable
//           data={tableData}
//           columns={columns}
//           rowKey="key"
//           loading={loading}
//           showHeader
//           isPaginate
//           noInnerBorder
//           currentPage={page}
//           setCurrentPage={setPage}
//           limit={pageSize}
//           setLimit={setPageSize}
//           total={data?.meta?.total ?? 0}
//           showSizeChanger
//           onRow={(record: StudentRecord) => ({
//             onClick: () =>
//               navigate(`/students/${record.id}/profile`, {
//                 state: { student: record },
//               }),
//             style: { cursor: "pointer" },
//           })}
//           pagination={{
//             pageSizeOptions: ["10", "20", "50"],
//             // showTotal: (total: number) => `Total ${total} students`,
//           }}
//         />
// =========
//         {isTeamMember ? (
//           <DataTable
//             data={assignedTableData}
//             columns={assignedColumns}
//             rowKey="key"
//             loading={loading}
//             showHeader
//             isPaginate
//             noInnerBorder
//             onRow={(record: AssignedStudentRecord) => ({
//               onClick: () =>
//                 navigate(`/students/${record.studentId}/profile`, {
//                   state: { student: { id: record.studentId, name: record.studentName } },
//                 }),
//               style: { cursor: "pointer" },
//             })}
//             pagination={{
//               pageSize: 10,
//               showTotal: (total: number) => `Total ${total} students`,
//             }}
//           />
//         ) : (
//           <DataTable
//             data={tableData}
//             columns={columns}
//             rowKey="key"
//             loading={loading}
//             showHeader
//             isPaginate
//             noInnerBorder
//             currentPage={page}
//             setCurrentPage={setPage}
//             limit={pageSize}
//             setLimit={setPageSize}
//             showSizeChanger
//             onRow={(record: StudentRecord) => ({
//               onClick: () =>
//                 navigate(`/students/${record.id}/profile`, {
//                   state: { student: record },
//                 }),
//               style: { cursor: "pointer" },
//             })}
//             pagination={{
//               pageSizeOptions: ["10", "20", "50"],
//               // showTotal: (total: number) => `Total ${total} students`,
//             }}
//           />
//         )}
// >>>>>>>>> Temporary merge branch 2
//       </div>
//    </div>
//     </div>
//   );
// }



import { Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import "../../components/common/Tables/AntTable.css";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useGetAllStudentsByPartnerIdQuery } from "../../redux/features/profile/studentProfileApi";
import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
import "./Students.css";

interface StudentRecord {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastLogin: string;
}

interface AssignedStudentRecord {
  key: string;
  studentId: string;
  studentName: string;
  activeTaskCount: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function Students() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createStudentOpen, setCreateStudentOpen] = useState(false);

  const { data: assignedStudents = [], isFetching: isFetchingAssigned } =
    useGetStudentsWithActiveTasksQuery(
      isTeamMember ? { assignedToMe: true } : undefined,
      { skip: !isTeamMember }
    );
  const {
    data: allStudents,
    isLoading: isPartnerStudentsLoading,
    isFetching: isPartnerStudentsFetching,
  } = useGetAllStudentsByPartnerIdQuery(
    { partnerId: user?.id as string },
    { skip: !user?.id || isTeamMember }
  );

  

  console.log(allStudents)

  const tableData: StudentRecord[] = useMemo(() => {
    if (isTeamMember) return [];
    if (!allStudents?.data) return [];
    const rows = allStudents.data.map((u: any) => ({
      key: u.id,
      id: u.id,
      name: u.user.name,
      email: u.email,
      phone: u.phone ?? "—",
      passportNo: u.passportNo ?? "—",
      AssignedTo: u?.advisor?.name ?? "—",
    }));
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(
      (row: StudentRecord) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.includes(searchText) 
    );
  }, [allStudents, searchText, isTeamMember]);

  const assignedTableData: AssignedStudentRecord[] = useMemo(() => {
    if (!isTeamMember) return [];
    const rows = assignedStudents.map((s) => ({
      key: s.studentId,
      studentId: s.studentId,
      studentName: s.studentName,
      activeTaskCount: s.activeTaskCount,
    }));
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter((row) => row.studentName.toLowerCase().includes(q));
  }, [assignedStudents, searchText, isTeamMember]);

  const columns: ColumnsType<StudentRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 180,
    },
    { title: "Email", dataIndex: "email", key: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    { title: "Passport No", dataIndex: "passportNo", key: "passportNo", width: 140 },
    { title: "Assigned To", dataIndex: "AssignedTo", key: "AssignedTo", width: 140 },
 
  ];

  const assignedColumns: ColumnsType<AssignedStudentRecord> = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      width: 280,
    },
    {
      title: "Active tasks",
      dataIndex: "activeTaskCount",
      key: "activeTaskCount",
      width: 120,
      render: (n: number) => (
        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          {n} task{n !== 1 ? "s" : ""}
        </span>
      ),
    },
  ];

  const loading = isTeamMember
    ? isFetchingAssigned
    : Boolean(user?.id) && (isPartnerStudentsLoading || isPartnerStudentsFetching);

  return (
    <div className="students-page">
      <PageMeta
        title="Students - Campus Transfer Partner"
        description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
      />
      <PageHeader title="Students" subtitle={isTeamMember
              ? "Students with tasks assigned to you."
              : "Easily manage every student you onboard and support."}  extra={<button
              type="button"
              onClick={() => setCreateStudentOpen(true)}
              className="inline cursor-pointer flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              + Add student
            </button>} breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Students" }]}/>

            {!isTeamMember && (
              <CreateStudentModal
                open={createStudentOpen}
                onClose={() => setCreateStudentOpen(false)}
              />
            )}
    
   <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#C7CACF]">
    
   <div className="mb-6 max-w-sm">
        <Input
          placeholder={
            isTeamMember
              ? "Search by student name"
              : "Search by name, email, status or phone"
          }
          allowClear
          value={searchText}
          prefix={<Search size={16} className="text-[#4B5563]" />}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
        {isTeamMember ? (
          <DataTable
            data={assignedTableData}
            columns={assignedColumns}
            rowKey="key"
            loading={loading}
            showHeader
            isPaginate
            noInnerBorder
            onRow={(record: AssignedStudentRecord) => ({
              onClick: () =>
                navigate(`/students/${record.studentId}/profile`, {
                  state: { student: { id: record.studentId, name: record.studentName } },
                }),
              style: { cursor: "pointer" },
            })}
            pagination={{
              pageSize: 10,
              showTotal: (total: number) => `Total ${total} students`,
            }}
          />
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            rowKey="key"
            loading={loading}
            showHeader
            isPaginate
            noInnerBorder
            currentPage={page}
            setCurrentPage={setPage}
            limit={pageSize}
            setLimit={setPageSize}
            showSizeChanger
            onRow={(record: StudentRecord) => ({
              onClick: () =>
                navigate(`/students/${record.id}/profile`, {
                  state: { student: record },
                }),
              style: { cursor: "pointer" },
            })}
            pagination={{
              pageSizeOptions: ["10", "20", "50"],
              // showTotal: (total: number) => `Total ${total} students`,
            }}
          />
        )}
      </div>
   </div>
    </div>
  );
}