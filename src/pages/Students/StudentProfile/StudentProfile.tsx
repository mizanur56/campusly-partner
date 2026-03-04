import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import PageMeta from "../../../components/common/Meta/PageMeta";
import { useStudentProfile } from "../../../context/StudentProfileContext";
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

export default function StudentProfile() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { state } = useLocation();
  const { setStudent } = useStudentProfile();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("general");
  const section = pathname.split("/")[3] || "profile";
  const passedStudent = (
    state as { student?: { name: string; email: string; phone: string } }
  )?.student;
  const nameParts =
    passedStudent?.name?.split(" ") ?? MOCK_STUDENT.name.split(" ");
  const student = {
    ...MOCK_STUDENT,
    id: id ?? MOCK_STUDENT.id,
    ...(passedStudent && {
      name: passedStudent.name,
      email: passedStudent.email,
      phone: passedStudent.phone,
      fullName: nameParts[0] ?? MOCK_STUDENT.fullName,
      lastName: nameParts.slice(1).join(" ") || MOCK_STUDENT.lastName,
      avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(passedStudent.name)}`,
    }),
  };

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

      {/* Back bar - uses same layout as other pages */}
      <div className="student-profile-back-bar">
        <Link to="/students" className="student-profile-back">
          <i className="fa-solid fa-arrow-left" />
          <span>Back</span>
        </Link>
        <div className="student-profile-back-divider" />
        <button type="button" className="student-profile-actions-btn">
          Actions
          <i className="fa-solid fa-chevron-down ml-1 text-xs" />
        </button>
        <div className="student-profile-back-student">
          <img
            src={student.avatar}
            alt=""
            className="student-profile-back-avatar"
          />
          <span className="student-profile-back-name">{student.name}</span>
        </div>
      </div>

      <div className="student-profile-body">
        <main className="student-profile-main">
          {section === "profile" && (
            <>
              <div className="student-profile-main-header">
                <h1 className="student-profile-main-title">Profile</h1>
                <p className="student-profile-main-subtitle">
                  Manage your personal information and preferences.
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
                      <button
                        type="button"
                        className="student-profile-change-photo"
                      >
                        Change Photo
                      </button>
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
                          <button
                            type="button"
                            className="student-profile-field-edit"
                            aria-label="Edit"
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
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
                        <button
                          type="button"
                          className="student-profile-field-edit"
                          aria-label="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "education" && (
                <div className="student-profile-content">
                  <p className="student-profile-placeholder">
                    Education History content will go here.
                  </p>
                </div>
              )}

              {activeTab === "background" && (
                <div className="student-profile-content">
                  <p className="student-profile-placeholder">
                    Background Information content will go here.
                  </p>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="student-profile-content">
                  <p className="student-profile-placeholder">
                    Upload Documents content will go here.
                  </p>
                </div>
              )}

              {activeTab === "apply" && (
                <div className="student-profile-content">
                  <p className="student-profile-placeholder">
                    Apply Now content will go here.
                  </p>
                </div>
              )}
            </>
          )}

          {section === "activity" && (
            <div className="student-profile-content">
              <h1 className="student-profile-main-title">Activity</h1>
              <p className="student-profile-placeholder">
                Activity timeline will go here.
              </p>
            </div>
          )}

          {section === "applications" && (
            <div className="student-profile-content">
              <h1 className="student-profile-main-title">Applications</h1>
              <p className="student-profile-placeholder">
                Applications list will go here.
              </p>
            </div>
          )}

          {section === "tasks" && (
            <div className="student-profile-content">
              <h1 className="student-profile-main-title">Tasks</h1>
              <p className="student-profile-placeholder">
                Tasks list will go here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
