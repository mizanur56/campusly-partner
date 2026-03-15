import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Table, Input, Tooltip, Spin, Alert } from "antd";
import { FiEye } from "react-icons/fi";
import { FileText, ArrowLeft } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import dayjs from "dayjs";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { useStudentProfile } from "../../../context/StudentProfileContext";
import {
  useGetStudentProfileQuery,
  useGetStudentApplicationsQuery,
} from "../../../redux/features/profile/studentProfileApi";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useSelector } from "react-redux";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";
import GeneralInformationTab from "./tabs/GeneralInformationTab";
import EducationHistoryTab from "./tabs/EducationHistoryTab";
import BackgroundTab from "./tabs/BackgroundTab";
import UploadDocumentsTab from "./tabs/UploadDocumentsTab";
import ApplyNowTab from "./tabs/ApplyNowTab";
import "../../../components/common/Tables/AntTable.css";
import "./StudentProfile.css";

type ProfileTabKey =
  | "general"
  | "education"
  | "background"
  | "documents"
  | "apply-now";

interface ApplicationRecord {
  key: string;
  id: string;
  applicationId: string;
  studentName: string;
  course: string;
  university: string;
  status: string;
  submittedDate: string;
}

const statusColors: Record<string, string> = {
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Under Review": "bg-blue-100 text-blue-800",
  Pending: "bg-amber-100 text-amber-800",
  REVIEW: "bg-blue-100 text-blue-800",
  APPLY: "bg-cyan-100 text-cyan-800",
  PENDING_OFFER_LETTER: "bg-amber-100 text-amber-800",
  PENDING_TRAVEL_LETTER: "bg-amber-100 text-amber-800",
  SUCCESS: "bg-green-100 text-green-800",
};

export default function StudentProfile() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useLocation();
  const { setStudent } = useStudentProfile();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(
    ["general", "education", "background", "documents", "apply-now"].includes(tabFromUrl)
      ? (tabFromUrl as ProfileTabKey)
      : "general"
  );
  const [applicationsSearch, setApplicationsSearch] = useState("");
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsLimit, setApplicationsLimit] = useState(20);

  const section = pathname.split("/")[3] || "profile";
  const isApplicationsSection = section === "applications";

  useEffect(() => {
    const urlTab = searchParams.get("tab") || "general";
    if (["general", "education", "background", "documents", "apply-now"].includes(urlTab)) {
      setActiveTab(urlTab as ProfileTabKey);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isApplicationsSection) setApplicationsPage(1);
  }, [applicationsSearch, isApplicationsSection]);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorDetail,
    refetch: refetchProfile,
  } = useGetStudentProfileQuery(studentId!, { skip: !studentId });

  const {
    data: applicationsResponse,
    isLoading: applicationsLoading,
  } = useGetStudentApplicationsQuery(
    {
      studentId: studentId!,
      page: applicationsPage,
      limit: applicationsLimit,
      status: "",
      search: applicationsSearch,
    },
    {
      skip: !studentId || !isApplicationsSection,
    }
  );

  const applicationsPayload = applicationsResponse as
    | { data?: unknown[]; meta?: { total?: number } }
    | undefined;
  const applicationsList = applicationsPayload?.data ?? [];
  const applicationsTotal = applicationsPayload?.meta?.total ?? 0;

  const applicationsTableData: ApplicationRecord[] = useMemo(() => {
    return (applicationsList as {
      id: string;
      applicationId?: string;
      course?: { course?: { name?: string }; university?: { name?: string } };
      status?: string;
      createdAt?: string;
      student?: { user?: { name?: string } };
    }[]).map((app, idx) => ({
      key: app.id || `app-${idx}`,
      id: app.id,
      applicationId: app.applicationId ?? "—",
      studentName: app.student?.user?.name ?? "—",
      course: app.course?.course?.name ?? "—",
      university: app.course?.university?.name ?? "—",
      status: app.status ?? "—",
      submittedDate: app.createdAt
        ? dayjs(app.createdAt).format("DD MMM YYYY")
        : "—",
    }));
  }, [applicationsList]);

  const passedStudent = (
    state as { student?: { id?: string; name?: string; email?: string; phone?: string } }
  )?.student;

  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : profile?.user?.name ?? passedStudent?.name ?? "Student";
  const displayEmail =
    profile?.email ?? profile?.user?.email ?? passedStudent?.email ?? "";
  const displayPhone = profile?.phone
    ? (profile.phone.startsWith("+") ? profile.phone : `+${profile.phone}`)
    : passedStudent?.phone ?? "";

  const studentForContext = {
    id: studentId ?? passedStudent?.id ?? "",
    name: displayName,
    email: displayEmail,
    phone: displayPhone,
    address: "",
    status: "",
    avatar: profile?.image
      ? getApiImageUrl(profile.image as { url?: string })
      : undefined,
  };

  useEffect(() => {
    if (studentId && (displayName || studentId)) {
      setStudent({
        ...studentForContext,
        avatar:
          studentForContext.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
      });
    }
    return () => setStudent(null);
  }, [studentId, displayName, displayEmail, displayPhone]);

  const profileTabs: { key: ProfileTabKey; label: string }[] = [
    { key: "general", label: "General Information" },
    { key: "education", label: "Education History" },
    { key: "background", label: "Background Information" },
    { key: "documents", label: "Upload Documents" },
    { key: "apply-now", label: "Apply Now" },
  ];

  const handleTabChange = (tabKey: ProfileTabKey) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams.toString());
    if (tabKey === "general") params.delete("tab");
    else params.set("tab", tabKey);
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const educations = useMemo(
    () => (profile as { educations?: unknown[] } | null)?.educations ?? [],
    [profile]
  );
  const visaRejections = useMemo(
    () => (profile as { visaRejections?: unknown[] } | null)?.visaRejections ?? [],
    [profile]
  );
  const documents = useMemo(
    () =>
      (profile as {
        documents?: { documentRelation?: { name?: string; category?: { name?: string } }; document?: string }[];
      } | null)?.documents ?? [],
    [profile]
  );
  const docByCategory = useMemo(() => {
    const map: Record<string, typeof documents> = {};
    documents.forEach((d) => {
      const cat =
        (d as { documentRelation?: { category?: { name?: string } } })
          ?.documentRelation?.category?.name ?? "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(d);
    });
    return map;
  }, [documents]);

  if (!studentId) {
    return (
      <div className="student-profile-layout">
        <Alert type="warning" message="No student selected." />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="student-profile-layout">
        <div className="student-profile-body">
          <main className="student-profile-main flex items-center justify-center min-h-[320px]">
            <Spin size="large" tip="Loading profile…" />
          </main>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="student-profile-layout">
        <Alert
          type="error"
          message="Failed to load profile"
          description={
            (profileErrorDetail as { data?: { message?: string } })?.data
              ?.message ?? "Please try again or go back to Students."
          }
        />
      </div>
    );
  }

  return (
    <div className="student-profile-layout">
      <PageMeta
        title={`${displayName} - Student Profile | Campus Transfer Partner`}
        description={`View and manage profile for ${displayName}.`}
      />

      <div className="student-profile-body">
        <main className="student-profile-main">
          {section === "profile" && (
            <>
              <PageHeader
                title="Profile"
                subtitle="View student profile and personal information."
              />

              <div className="border-b border-gray-300 overflow-hidden">
                <div className="flex gap-3 sm:gap-6 min-w-max sm:min-w-0">
                  {profileTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`px-2 sm:px-0 py-2 sm:py-3 cursor-pointer text-[15px] font-normal transition-colors duration-200 relative whitespace-nowrap ${
                        activeTab === tab.key
                          ? "text-[#237D3B] font-medium"
                          : "text-[#4B5563] hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#237D3B]"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
              {activeTab === "general" && (
                <GeneralInformationTab
                  studentId={studentId}
                  profile={profile as Parameters<typeof GeneralInformationTab>[0]["profile"]}
                  canEdit={!isTeamMember}
                  onUpdated={() => refetchProfile()}
                />
              )}

              {activeTab === "education" && (
                <EducationHistoryTab
                  studentId={studentId}
                  profile={profile as Parameters<typeof EducationHistoryTab>[0]["profile"]}
                  educations={educations as Parameters<typeof EducationHistoryTab>[0]["educations"]}
                  canEdit={!isTeamMember}
                  onUpdated={() => refetchProfile()}
                />
              )}

              {activeTab === "background" && (
                <BackgroundTab
                  studentId={studentId}
                  visaRejections={visaRejections as Parameters<typeof BackgroundTab>[0]["visaRejections"]}
                  cv={(profile as { cv?: string }).cv}
                  statementOfPurpose={(profile as { statementOfPurpose?: string }).statementOfPurpose}
                  canEdit={!isTeamMember}
                  onUpdated={() => refetchProfile()}
                />
              )}

              {activeTab === "documents" && (
                <UploadDocumentsTab
                  studentId={studentId}
                  profile={profile as Parameters<typeof UploadDocumentsTab>[0]["profile"]}
                  canEdit={!isTeamMember}
                  onUpdated={() => refetchProfile()}
                />
              )}

              {activeTab === "apply-now" && <ApplyNowTab />}
              </div>
            </>
          )}

          {section === "activity" && (
            <div className="student-profile-activity">
              <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  Activity
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  Recent activity and timeline for this student.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-[#4B5563]">Activity timeline coming soon.</p>
              </div>
            </div>
          )}

          {section === "applications" && (
            <div className="student-profile-applications">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                    Applications
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Manage applications for this student.
                  </p>
                </div>
              </div>

              <div className="mb-6 max-w-sm">
                <Input
                  placeholder="Search by ID, course, university or status"
                  allowClear
                  value={applicationsSearch}
                  onChange={(e) => setApplicationsSearch(e.target.value)}
                  size="large"
                />
              </div>

              <Spin spinning={applicationsLoading}>
                <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
                  <Table<ApplicationRecord>
                    className="student-applications-table"
                    dataSource={applicationsTableData}
                    columns={[
                    {
                      title: "Application ID",
                      dataIndex: "applicationId",
                      key: "applicationId",
                      width: 140,
                      render: (applicationId: string, record: ApplicationRecord) => (
                        <span
                          onClick={() =>
                            navigate(`/applications/${record.id}`)}
                          className="hover:underline cursor-pointer hover:font-semibold"
                        >
                          {applicationId}
                        </span>
                      ),
                    },
                    {
                      title: "University",
                      dataIndex: "university",
                      key: "university",
                      width: 220,
                    },
                    {
                      title: "Program",
                      dataIndex: "course",
                      key: "course",
                      width: 180,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      width: 120,
                      render: (status: string) => (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status}
                        </span>
                      ),
                    },
                    {
                      title: "Submitted",
                      dataIndex: "submittedDate",
                      key: "submittedDate",
                      width: 120,
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      width: 100,
                      align: "center" as const,
                      render: (_: unknown, record: ApplicationRecord) => (
                        <Tooltip title="View" placement="top">
                          <button
                            onClick={() =>
                              navigate(`/applications/${record.id}`)}
                            className="flex cursor-pointer items-center justify-center w-8 h-8 rounded border border-gray-300 transition-all text-gray-600 hover:text-primary-500 hover:border-primary-500"
                          >
                            <FiEye size={16} />
                          </button>
                        </Tooltip>
                      ),
                    },
                  ]}
                    rowKey="key"
                    pagination={{
                      current: applicationsPage,
                      pageSize: applicationsLimit,
                      total: applicationsTotal,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} applications`,
                      pageSizeOptions: ["10", "20", "50"],
                      onChange: (page, pageSize) => {
                        setApplicationsPage(page);
                        setApplicationsLimit(pageSize ?? 20);
                      },
                    }}
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText:
                        applicationsLoading
                          ? ""
                          : "No applications found for this student.",
                    }}
                  />
                </div>
              </Spin>
            </div>
          )}

          {section === "tasks" && (
            <div className="student-profile-tasks">
              <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  Tasks
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  Pending and completed tasks for this student.
                </p>
              </div>
              <p className="text-[#4B5563]">
                View tasks from My Tasks and filter by this student.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
