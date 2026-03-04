import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Table, Input, Tooltip } from "antd";
import { FiEye } from "react-icons/fi";
import { Search, FileText, ArrowLeft } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import PageMeta from "../../../components/common/Meta/PageMeta";
import { useStudentProfile } from "../../../context/StudentProfileContext";
import "../../../components/common/Tables/AntTable.css";
import "./StudentProfile.css";

type ProfileTabKey =
  | "general"
  | "education"
  | "background"
  | "documents"
  | "apply";

// Mock student data - in real app, fetch by id
const MOCK_STUDENT = {
  id: "1",
  name: "Md Abdul Khaleq",
  email: "abc.123@gmail.com",
  phone: "+8801915600718",
  address: "Dhaka North City Corporation, Dhaka",
  status: "SQL",
  avatar: "https://i.pravatar.cc/120?u=mdabdul",
  fullName: "Md Abdul",
  lastName: "Khaleq",
  gender: "Male",
  dateOfBirth: "11-12-1998",
  country: "Bangladesh",
  passportNo: "12312132",
  passportExpiry: "12/12/2025",
  lastQualification: "Undergraduate",
  passingYear: "2023-2024",
};

// Mock education history
const MOCK_EDUCATION = [
  { level: "Secondary (SSC)", institution: "Dhaka Board", year: "2016", gpa: "5.00", subject: "Science" },
  { level: "Higher Secondary (HSC)", institution: "Dhaka College", year: "2018", gpa: "4.80", subject: "Science" },
  { level: "Undergraduate (BSc)", institution: "University of Dhaka", year: "2023", gpa: "3.45", subject: "Computer Science" },
];

// Mock English tests
const MOCK_ENGLISH_TESTS = [
  { type: "IELTS", overall: "6.5", listening: "6.5", reading: "6.0", writing: "6.5", speaking: "7.0", date: "2024-01-15" },
];

// Mock background info
const MOCK_WORK_EXPERIENCE = {
  company: "Tech Solutions Ltd",
  role: "Junior Developer",
  duration: "Jan 2022 - Dec 2023",
  description: "Worked on web applications using React and Node.js.",
};

const MOCK_VISA_REJECTION = { hasRejection: false, country: null, reason: null };
// For demo: { hasRejection: true, country: "UK", reason: "Financial documentation" }

// Mock documents status
const MOCK_DOCUMENTS = {
  personal: [
    { id: "photo", name: "Photo", status: "submitted" as const },
    { id: "passport", name: "Passport", status: "submitted" as const },
    { id: "resume", name: "Resume", status: "submitted" as const },
  ],
  academic: [
    { id: "ssc-marksheet", name: "SSC Marksheet", level: "Secondary", status: "submitted" as const },
    { id: "ssc-cert", name: "SSC Certificate", level: "Secondary", status: "submitted" as const },
    { id: "hsc-marksheet", name: "HSC Marksheet", level: "Higher Secondary", status: "submitted" as const },
    { id: "hsc-cert", name: "HSC Certificate", level: "Higher Secondary", status: "submitted" as const },
    { id: "bsc-marksheet", name: "BSc Marksheet", level: "Undergraduate", status: "pending" as const },
    { id: "bsc-cert", name: "BSc Certificate", level: "Undergraduate", status: "pending" as const },
  ],
  englishTests: [{ id: "ielts", name: "IELTS", status: "submitted" as const }],
  additional: [
    { id: "work-exp", name: "Work Experience", status: "submitted" as const },
    { id: "sop", name: "Statement of Purpose", status: "submitted" as const },
  ],
};

// Mock applications - filter by student name (matches Applications page data)
const MOCK_APPLICATIONS = [
  { key: "1", id: "1", applicationId: "APP-2025-001", studentName: "Md Abdul Khaleq", course: "MBA", university: "University of London", status: "Pending", submittedDate: "2025-02-15" },
  { key: "1b", id: "1b", applicationId: "APP-2025-008", studentName: "Md Abdul Khaleq", course: "MSc Finance", university: "University of Cambridge", status: "Under Review", submittedDate: "2025-03-01" },
  { key: "2", id: "2", applicationId: "APP-2025-002", studentName: "Fatima Rahman", course: "LLB", university: "University of Manchester", status: "Accepted", submittedDate: "2025-02-10" },
  { key: "3", id: "3", applicationId: "APP-2025-003", studentName: "Tareeq Mahmud", course: "MSc Data Science", university: "Imperial College London", status: "Under Review", submittedDate: "2025-02-12" },
  { key: "4", id: "4", applicationId: "APP-2025-004", studentName: "Hassan Ahmed", course: "BBA", university: "University of Birmingham", status: "Rejected", submittedDate: "2025-02-08" },
  { key: "5", id: "5", applicationId: "APP-2025-005", studentName: "Suman Thapa", course: "MBA", university: "University of Edinburgh", status: "Pending", submittedDate: "2025-02-14" },
  { key: "6", id: "6", applicationId: "APP-2024-120", studentName: "Anish Maharjan", course: "BSc IT", university: "University of Bristol", status: "Accepted", submittedDate: "2024-12-20" },
  { key: "7", id: "7", applicationId: "APP-2025-006", studentName: "Rita Islam", course: "MSc Engineering", university: "University of Leeds", status: "Under Review", submittedDate: "2025-02-18" },
  { key: "8", id: "8", applicationId: "APP-2025-007", studentName: "Md Ashiqur Rahman", course: "BSc Computer Science", university: "University of Glasgow", status: "Pending", submittedDate: "2025-02-20" },
];

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
};

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useLocation();
  const { setStudent } = useStudentProfile();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("general");
  const [applicationsSearch, setApplicationsSearch] = useState("");
  const section = pathname.split("/")[3] || "profile";
  const passedStudent = (
    state as { student?: { id?: string; name: string; email: string; phone: string } }
  )?.student;
  const nameParts =
    passedStudent?.name?.split(" ") ?? MOCK_STUDENT.name.split(" ");
  const student = {
    ...MOCK_STUDENT,
    id: id ?? passedStudent?.id ?? MOCK_STUDENT.id,
    ...(passedStudent && {
      name: passedStudent.name,
      email: passedStudent.email,
      phone: passedStudent.phone,
      fullName: nameParts[0] ?? MOCK_STUDENT.fullName,
      lastName: nameParts.slice(1).join(" ") || MOCK_STUDENT.lastName,
      avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(passedStudent.name)}`,
    }),
  };

  // Filter applications by current student name (fuzzy match for mock data)
  const studentApplications = useMemo(() => {
    const q = student.name.toLowerCase();
    return MOCK_APPLICATIONS.filter((app) =>
      app.studentName.toLowerCase().includes(q) ||
      q.split(" ").some((part) => app.studentName.toLowerCase().includes(part))
    );
  }, [student.name]);

  const filteredApplications = useMemo(() => {
    if (!applicationsSearch.trim()) return studentApplications;
    const q = applicationsSearch.toLowerCase();
    return studentApplications.filter(
      (row) =>
        row.applicationId.toLowerCase().includes(q) ||
        row.course.toLowerCase().includes(q) ||
        row.university.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q)
    );
  }, [studentApplications, applicationsSearch]);

  useEffect(() => {
    setStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      status: student.status,
      avatar: student.avatar,
    });
    return () => setStudent(null);
  }, [id]);

  const profileTabs: { key: ProfileTabKey; label: string }[] = [
    { key: "general", label: "General Information" },
    { key: "education", label: "Education History" },
    { key: "background", label: "Background Information" },
    { key: "documents", label: "Upload Documents" },
    { key: "apply", label: "Apply Now" },
  ];

  return (
    <div className="student-profile-layout">
      <PageMeta
        title={`${student.name} - Student Profile | Campus Transfer Partner`}
        description={`View and manage profile for ${student.name}.`}
      />

      <div className="student-profile-body">
        <main className="student-profile-main">
          {section === "profile" && (
            <>
              <div className="student-profile-main-header">
                <h1 className="student-profile-main-title">Profile</h1>
                <p className="student-profile-main-subtitle">
                  View student profile and personal information.
                </p>
              </div>

              <div className="student-profile-tabs">
                {profileTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`student-profile-tab ${
                      activeTab === tab.key ? "student-profile-tab--active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "general" && (
                <div className="student-profile-content">
                  <div className="student-profile-general">
                    <div className="student-profile-photo-section">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="student-profile-photo"
                      />
                    </div>
                    <div className="student-profile-fields">
                      {[
                        { label: "Full Name", value: student.fullName },
                        { label: "Last Name", value: student.lastName },
                        { label: "Gender", value: student.gender },
                        { label: "Date of Birth", value: student.dateOfBirth },
                        { label: "Country", value: student.country },
                        { label: "Passport No", value: student.passportNo },
                        {
                          label: "Passport Expiry Date",
                          value: student.passportExpiry,
                        },
                        { label: "Contact Number", value: student.phone },
                        { label: "Email", value: student.email },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="student-profile-field"
                        >
                          <div className="student-profile-field-left">
                            <span className="student-profile-field-label">
                              {field.label}
                            </span>
                            <span className="student-profile-field-value">
                              {field.value}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="student-profile-field student-profile-field--qualification">
                        <div className="student-profile-field-left">
                          <span className="student-profile-field-label">
                            Last Qualification
                          </span>
                          <span className="student-profile-field-value">
                            {student.lastQualification} (Passing Year:{" "}
                            {student.passingYear})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "education" && (
                <div className="student-profile-content student-profile-tab-content">
                  <h2 className="student-profile-section-title">Last Qualifications</h2>
                  <div className="space-y-4">
                    {MOCK_EDUCATION.map((edu, idx) => (
                      <div key={idx} className="student-profile-edu-card">
                        <h3 className="student-profile-edu-level">{edu.level}</h3>
                        <div className="student-profile-edu-grid">
                          <div><span className="text-[#4B5563] text-sm">Institution</span><p className="font-medium">{edu.institution}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Year</span><p className="font-medium">{edu.year}</p></div>
                          <div><span className="text-[#4B5563] text-sm">GPA / Grade</span><p className="font-medium">{edu.gpa}</p></div>
                          {edu.subject && <div><span className="text-[#4B5563] text-sm">Subject</span><p className="font-medium">{edu.subject}</p></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <h2 className="student-profile-section-title mt-4">English Language Tests</h2>
                  <div className="space-y-4">
                    {MOCK_ENGLISH_TESTS.map((test, idx) => (
                      <div key={idx} className="student-profile-edu-card">
                        <h3 className="student-profile-edu-level">{test.type}</h3>
                        <div className="student-profile-edu-grid">
                          <div><span className="text-[#4B5563] text-sm">Overall</span><p className="font-medium">{test.overall}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Listening</span><p className="font-medium">{test.listening}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Reading</span><p className="font-medium">{test.reading}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Writing</span><p className="font-medium">{test.writing}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Speaking</span><p className="font-medium">{test.speaking}</p></div>
                          <div><span className="text-[#4B5563] text-sm">Test Date</span><p className="font-medium">{test.date}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h2 className="student-profile-section-title mt-4">Medium of Instruction</h2>
                  <div className="student-profile-edu-card">
                    <p className="text-[#20242A] font-medium">English</p>
                    <p className="text-[#4B5563] text-sm mt-1">All previous education was conducted in English.</p>
                  </div>
                  <h2 className="student-profile-section-title mt-4">Standardized Tests</h2>
                  <div className="student-profile-edu-card">
                    <p className="text-[#4B5563] text-sm">IELTS (Academic) - 6.5 overall</p>
                  </div>
                </div>
              )}

              {activeTab === "background" && (
                <div className="student-profile-content student-profile-tab-content">
                  <h2 className="student-profile-section-title">Work Experience</h2>
                  <div className="student-profile-edu-card">
                    <h3 className="student-profile-edu-level">{MOCK_WORK_EXPERIENCE.role}</h3>
                    <p className="text-[#237D3B] font-medium">{MOCK_WORK_EXPERIENCE.company}</p>
                    <p className="text-[#4B5563] text-sm mt-1">{MOCK_WORK_EXPERIENCE.duration}</p>
                    <p className="text-[#20242A] mt-3">{MOCK_WORK_EXPERIENCE.description}</p>
                  </div>
                  <h2 className="student-profile-section-title mt-4">Visa Rejection History</h2>
                  <div className="student-profile-edu-card">
                    {MOCK_VISA_REJECTION.hasRejection ? (
                      <>
                        <p className="font-medium text-[#20242A]">Country: {MOCK_VISA_REJECTION.country}</p>
                        <p className="text-[#4B5563] text-sm mt-1">Reason: {MOCK_VISA_REJECTION.reason}</p>
                      </>
                    ) : (
                      <p className="text-[#4B5563]">No visa rejection history.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="student-profile-content student-profile-tab-content">
                  <h2 className="student-profile-section-title">Personal Documents</h2>
                  <div className="space-y-2 mb-4">
                    {MOCK_DOCUMENTS.personal.map((doc) => (
                      <div key={doc.id} className="student-profile-doc-item">
                        <FileText className="text-[#4B5563] w-5 h-5" />
                        <span className="font-medium">{doc.name}</span>
                        {doc.status === "submitted" ? (
                          <span className="student-profile-doc-badge submitted"><FaCircleCheck /></span>
                        ) : (
                          <span className="student-profile-doc-badge pending">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <h2 className="student-profile-section-title">Academic Certificates</h2>
                  <div className="space-y-3 mb-4">
                    {["Secondary", "Higher Secondary", "Undergraduate"].map((level) => {
                      const items = MOCK_DOCUMENTS.academic.filter((d) => d.level === level);
                      if (items.length === 0) return null;
                      return (
                        <div key={level}>
                          <h4 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider mb-2">{level}</h4>
                          <div className="space-y-2">
                            {items.map((doc) => (
                              <div key={doc.id} className="student-profile-doc-item">
                                <FileText className="text-[#4B5563] w-5 h-5" />
                                <span className="font-medium">{doc.name}</span>
                                {doc.status === "submitted" ? (
                                  <span className="student-profile-doc-badge submitted"><FaCircleCheck /></span>
                                ) : (
                                  <span className="student-profile-doc-badge pending">Pending</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <h2 className="student-profile-section-title">English Language Tests</h2>
                  <div className="space-y-2 mb-4">
                    {MOCK_DOCUMENTS.englishTests.map((doc) => (
                      <div key={doc.id} className="student-profile-doc-item">
                        <FileText className="text-[#4B5563] w-5 h-5" />
                        <span className="font-medium">{doc.name}</span>
                        {doc.status === "submitted" ? (
                          <span className="student-profile-doc-badge submitted"><FaCircleCheck /></span>
                        ) : (
                          <span className="student-profile-doc-badge pending">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <h2 className="student-profile-section-title">Additional Documents</h2>
                  <div className="space-y-3">
                    {MOCK_DOCUMENTS.additional.map((doc) => (
                      <div key={doc.id} className="student-profile-doc-item">
                        <FileText className="text-[#4B5563] w-5 h-5" />
                        <span className="font-medium">{doc.name}</span>
                        {doc.status === "submitted" ? (
                          <span className="student-profile-doc-badge submitted"><FaCircleCheck /></span>
                        ) : (
                          <span className="student-profile-doc-badge pending">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "apply" && (
                <div className="student-profile-content student-profile-tab-content student-profile-apply">
                  <div className="student-profile-apply-image">
                    <div className="student-profile-apply-placeholder">
                      <FileText size={64} className="text-[#237D3B] opacity-60" />
                    </div>
                  </div>
                  <h2 className="student-profile-apply-title">
                    All documents have been successfully uploaded. Student can choose a program.
                  </h2>
                  <div className="student-profile-apply-actions">
                    <Link
                      to="/programs-schools"
                      className="student-profile-apply-btn secondary"
                    >
                      <ArrowLeft size={18} />
                      <span>Programs & Schools</span>
                    </Link>
                    <Link
                      to="/applications"
                      className="student-profile-apply-btn primary"
                    >
                      <span>View Applications</span>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {section === "activity" && (
            <div className="student-profile-activity">
              <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Activity</h1>
                <p className="mt-1 text-sm text-neutral-500">Recent activity and timeline for this student.</p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "fa-solid fa-file-lines", color: "bg-blue-100 text-blue-600", title: "Application Submitted", desc: "Applied to MBA at University of London", time: "2 hours ago" },
                  { icon: "fa-solid fa-upload", color: "bg-green-100 text-green-600", title: "Document Uploaded", desc: "Uploaded IELTS certificate", time: "5 hours ago" },
                  { icon: "fa-solid fa-user-pen", color: "bg-purple-100 text-purple-600", title: "Profile Updated", desc: "Updated passport expiry date", time: "1 day ago" },
                  { icon: "fa-solid fa-file-lines", color: "bg-blue-100 text-blue-600", title: "Application Submitted", desc: "Applied to MSc Finance at University of Cambridge", time: "2 days ago" },
                  { icon: "fa-solid fa-comment", color: "bg-amber-100 text-amber-600", title: "Note Added", desc: "Partner added a note about visa documentation", time: "3 days ago" },
                  { icon: "fa-solid fa-graduation-cap", color: "bg-emerald-100 text-emerald-600", title: "Education Added", desc: "Added BSc Computer Science from University of Dhaka", time: "5 days ago" },
                  { icon: "fa-solid fa-upload", color: "bg-green-100 text-green-600", title: "Document Uploaded", desc: "Uploaded SSC & HSC marksheets", time: "1 week ago" },
                  { icon: "fa-solid fa-user-plus", color: "bg-indigo-100 text-indigo-600", title: "Student Registered", desc: "Account created by partner", time: "2 weeks ago" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                      <i className={`${item.icon} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 truncate">{item.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
                  </div>
                ))}
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

              <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
                <Table<ApplicationRecord>
                  className="student-applications-table"
                  dataSource={filteredApplications}
                  columns={[
                    {
                      title: "Application ID",
                      dataIndex: "applicationId",
                      key: "applicationId",
                      width: 140,
                      render: (applicationId: string) => (
                        <span
                          onClick={() => navigate("/applications")}
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
                      render: (_: unknown) => (
                        <Tooltip title="View" placement="top">
                          <button
                            onClick={() => navigate("/applications")}
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
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} applications`,
                    pageSizeOptions: ["10", "20", "50"],
                  }}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "No applications found for this student." }}
                />
              </div>
            </div>
          )}

          {section === "tasks" && (
            <div className="student-profile-tasks">
              <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Tasks</h1>
                <p className="mt-1 text-sm text-neutral-500">Pending and completed tasks for this student.</p>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Upload Passport Copy", priority: "High", status: "Pending", due: "Mar 10, 2026", icon: "fa-solid fa-upload", priorityColor: "bg-red-100 text-red-600", statusColor: "bg-amber-100 text-amber-800" },
                  { title: "Submit IELTS Score", priority: "High", status: "Pending", due: "Mar 12, 2026", icon: "fa-solid fa-file-lines", priorityColor: "bg-red-100 text-red-600", statusColor: "bg-amber-100 text-amber-800" },
                  { title: "Complete Education History", priority: "Medium", status: "In Progress", due: "Mar 15, 2026", icon: "fa-solid fa-graduation-cap", priorityColor: "bg-amber-100 text-amber-600", statusColor: "bg-blue-100 text-blue-800" },
                  { title: "Upload Statement of Purpose", priority: "Medium", status: "Pending", due: "Mar 18, 2026", icon: "fa-solid fa-pen", priorityColor: "bg-amber-100 text-amber-600", statusColor: "bg-amber-100 text-amber-800" },
                  { title: "Fill Background Information", priority: "Low", status: "Completed", due: "Feb 28, 2026", icon: "fa-solid fa-clipboard-check", priorityColor: "bg-green-100 text-green-600", statusColor: "bg-green-100 text-green-800" },
                  { title: "Upload Profile Photo", priority: "Low", status: "Completed", due: "Feb 25, 2026", icon: "fa-solid fa-camera", priorityColor: "bg-green-100 text-green-600", statusColor: "bg-green-100 text-green-800" },
                  { title: "Verify Email Address", priority: "Low", status: "Completed", due: "Feb 20, 2026", icon: "fa-solid fa-envelope-circle-check", priorityColor: "bg-green-100 text-green-600", statusColor: "bg-green-100 text-green-800" },
                ].map((task, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-3 rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${task.status === "Completed" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      <i className={`${task.icon} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "Completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Due: {task.due}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${task.priorityColor}`}>{task.priority}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${task.statusColor}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
