import { useSelector } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Academy from "../pages/Academy/Academy";
import AcademyCourseDetail from "../pages/Academy/AcademyCourseDetail";
import ChangePassword from "../pages/Auth/ChangePassword";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RegistrationWelcomePage from "../pages/Auth/RegistrationWelcomePage";
import ResetPassword from "../pages/Auth/ResetPassword";
import SetPasswordByInvite from "../pages/Auth/SetPasswordByInvite";
import ContractPage from "../pages/Contract/ContractPage";
import ContractSignedPage from "../pages/Contract/ContractSignedPage";
import MeetingPage from "../pages/Meeting/MeetingPage";
import Applications from "../pages/Applications/Applications";
import ApplicationDetails from "../pages/Applications/ApplicationDetails";
import VisaRejectPage from "../pages/Applications/ApplicationStep/VisaRejectPage";
import VisaSuccessPage from "../pages/Applications/ApplicationStep/VisaSuccessPage";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import HotOffers from "../pages/HotOffers/HotOffers";
import AllMediaList from "../pages/Media/Media";
import MyTasks from "../pages/MyTasks/MyTasks";
import TaskManagement from "../pages/TaskManagement/TaskManagement";
import Notifications from "../pages/Notifications/Notifications";
import AnnouncementsDetailsPage from "../pages/Announcements/AnnouncementsDetailsPage";
import { OnboardingPage } from "../pages/Onboarding";
import RegularCompliancePage from "../pages/Onboarding/RegularCompliancePage";
import NotFound from "../pages/OtherPage/NotFound";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import Payments from "../pages/Payments/Payments";
import ProgramsSchools from "../pages/ProgramsSchools/ProgramsSchools";
import ProfileSettings from "../pages/Settings/ProfileSettings";
import StudentProfile from "../pages/Students/StudentProfile/StudentProfile";
import Students from "../pages/Students/Students";
import TeamMembers from "../pages/TeamMembers/TeamMembers";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import GuestOnlyAuthRoute from "./GuestOnlyAuthRoute";
import ProtectedRoute from "./ProtectedRoute";
import CourseDetails from "../pages/courseDetails/CourseDetails.tsx";
import UniversityDetails from "../pages/universityDetails/UniversityDetails.tsx";

function StudentProfileRedirect() {
  const { id } = useParams();
  return <Navigate to={`/students/${id}/profile`} replace />;
}

function DashboardOrRedirect() {
  return <Dashboard />;
}

function TeamMembersOrRedirect() {
  const currentUser = useSelector(selectCurrentUser);
  if (currentUser?.role === "PARTNER_TEAM_MEMBER") {
    return <Navigate to="/" replace />;
  }
  return <TeamMembers />;
}

function AppRoutes() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/404" element={<NotFound />} />
        <Route
          path="/login"
          element={
            <GuestOnlyAuthRoute>
              <Login />
            </GuestOnlyAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyAuthRoute>
              <Register />
            </GuestOnlyAuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnlyAuthRoute>
              <ForgetPassword />
            </GuestOnlyAuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestOnlyAuthRoute>
              <ResetPassword />
            </GuestOnlyAuthRoute>
          }
        />
        <Route
          path="/set-password"
          element={
            <GuestOnlyAuthRoute>
              <SetPasswordByInvite />
            </GuestOnlyAuthRoute>
          }
        />
        <Route
          path="/register/welcome"
          element={
            <ProtectedRoute>
              <RegistrationWelcomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
          errorElement={<NotFound />}
        >
          <Route index element={<DashboardOrRedirect />} />
          <Route path="media" element={<AllMediaList />} />
          <Route
            path="onboarding/compliance"
            element={<RegularCompliancePage />}
          />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="contract" element={<ContractPage />} />
          <Route path="contract/signed" element={<ContractSignedPage />} />
          <Route path="meeting" element={<MeetingPage />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="programs-schools" element={<ProgramsSchools />} />
          <Route
            path="programs-schools/courses/:universitySlug/:courseSlug"
            element={<CourseDetails />}
          />
          <Route
            path="programs-schools/universities/:slug"
            element={<UniversityDetails />}
          />

          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfileRedirect />} />
          <Route path="students/:id/profile" element={<StudentProfile />} />
          <Route path="students/:id/activity" element={<StudentProfile />} />
          <Route
            path="students/:id/applications"
            element={<StudentProfile />}
          />
          <Route path="students/:id/tasks" element={<StudentProfile />} />
          <Route path="applications" element={<Applications />} />
          <Route path="visa-reject" element={<VisaRejectPage />} />
          <Route path="visa-success" element={<VisaSuccessPage />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
          <Route path="team-members" element={<TeamMembersOrRedirect />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="announcements" element={<AnnouncementsDetailsPage />} />
          <Route
            path="payments"
            element={<Navigate to="/payments/commission" replace />}
          />
          <Route
            path="payments/purchase"
            element={<Navigate to="/payments/commission" replace />}
          />
          <Route path="payments/commission" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="academy" element={<Academy />} />
          <Route path="academy/:courseId" element={<AcademyCourseDetail />} />
          <Route path="hot-offers" element={<HotOffers />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="chat" element={<Navigate to="/" replace />} />
          <Route
            path="chat/:conversationId"
            element={<Navigate to="/" replace />}
          />
          <Route path="*" element={<UnderDevelopment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
