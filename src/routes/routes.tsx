import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../layout/MainLayout";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import ChangePassword from "../pages/Auth/ChangePassword";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import SetPasswordByInvite from "../pages/Auth/SetPasswordByInvite";
import RegistrationWelcomePage from "../pages/Auth/RegistrationWelcomePage";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import AllMediaList from "../pages/Media/Media";
import Academy from "../pages/Academy/Academy";
import HotOffers from "../pages/HotOffers/HotOffers";
import NotFound from "../pages/OtherPage/NotFound";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import ProgramsSchools from "../pages/ProgramsSchools/ProgramsSchools";
import ProtectedRoute from "./ProtectedRoute";
import GuestOnlyAuthRoute from "./GuestOnlyAuthRoute";
import { OnboardingPage } from "../pages/Onboarding";
import RegularCompliancePage from "../pages/Onboarding/RegularCompliancePage";
import ContractPage from "../pages/Contract/ContractPage";
import ContractSignedPage from "../pages/Contract/ContractSignedPage";
import Students from "../pages/Students/Students";
import StudentProfile from "../pages/Students/StudentProfile/StudentProfile";
import Applications from "../pages/Applications/Applications";
import ApplicationDetails from "../pages/Applications/ApplicationDetails";
import Admission from "../pages/Applications/ApplicationStep/Admission";
import Apply from "../pages/Applications/ApplicationStep/Apply";
import ChecklistUpload from "../pages/Applications/ApplicationStep/ChecklistUpload";
import FinalLetter from "../pages/Applications/ApplicationStep/FinalLetter";
import EmbassySubmission from "../pages/Applications/ApplicationStep/EmbassySubmission";
import VisaOutcome from "../pages/Applications/ApplicationStep/VisaOutcome";
import Enroll from "../pages/Applications/ApplicationStep/Enroll";
import VisaRejectPage from "../pages/Applications/ApplicationStep/VisaRejectPage";
import VisaSuccessPage from "../pages/Applications/ApplicationStep/VisaSuccessPage";
import MyTasks from "../pages/MyTasks/MyTasks";
import TeamMembers from "../pages/TeamMembers/TeamMembers";
import Payments from "../pages/Payments/Payments";
import ProfileSettings from "../pages/Settings/ProfileSettings";
import Notifications from "../pages/Notifications/Notifications";

function StudentProfileRedirect() {
  const { id } = useParams();
  return <Navigate to={`/students/${id}/profile`} replace />;
}

function DashboardOrRedirect() {
  const user = useSelector(selectCurrentUser);
  if (user?.role === "PARTNER_TEAM_MEMBER") {
    return <Navigate to="/my-tasks" replace />;
  }
  return <Dashboard />;
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
          <Route path="onboarding/compliance" element={<RegularCompliancePage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="contract" element={<ContractPage />} />
          <Route path="contract/signed" element={<ContractSignedPage />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="programs-schools" element={<ProgramsSchools />} />
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
          <Route path="applications/:id" element={<ApplicationDetails />}>
            <Route index element={<Admission />} />
            <Route path="admission" element={<Admission />} />
            <Route path="apply" element={<Apply />} />
            <Route path="checklist" element={<ChecklistUpload />} />
            <Route path="final-letter" element={<FinalLetter />} />
            <Route path="embassy" element={<EmbassySubmission />} />
            <Route path="visa" element={<VisaOutcome />} />
            <Route path="enroll" element={<Enroll />} />
          </Route>
          <Route path="team-members" element={<TeamMembers />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="notifications" element={<Notifications />} />
          <Route
            path="payments"
            element={<Navigate to="/payments/purchase" replace />}
          />
          <Route path="payments/purchase" element={<Payments />} />
          <Route path="payments/commission" element={<Payments />} />
          <Route path="academy" element={<Academy />} />
          <Route path="hot-offers" element={<HotOffers />} />
          <Route path="settings/profile" element={<ProfileSettings />} />
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
