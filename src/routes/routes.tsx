import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChangePassword from "../pages/Auth/ChangePassword";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import SetPasswordByInvite from "../pages/Auth/SetPasswordByInvite";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import AllMediaList from "../pages/Media/Media";
import Academy from "../pages/Academy/Academy";
import HotOffers from "../pages/HotOffers/HotOffers";
import NotFound from "../pages/OtherPage/NotFound";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import ProgramsSchools from "../pages/ProgramsSchools/ProgramsSchools";
import ProtectedRoute from "./ProtectedRoute";
import { OnboardingPage } from "../pages/Onboarding";
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

function StudentProfileRedirect() {
  const { id } = useParams();
  return <Navigate to={`/students/${id}/profile`} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/404" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPasswordByInvite />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
          errorElement={<NotFound />}
        >
          <Route index element={<Dashboard />} />
          <Route path="media" element={<AllMediaList />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="contract" element={<ContractPage />} />
          <Route path="contract/signed" element={<ContractSignedPage />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="programs-schools" element={<ProgramsSchools />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfileRedirect />} />
          <Route path="students/:id/profile" element={<StudentProfile />} />
          <Route path="students/:id/activity" element={<StudentProfile />} />
          <Route path="students/:id/applications" element={<StudentProfile />} />
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
          <Route path="payments" element={<Navigate to="/payments/purchase" replace />} />
          <Route path="payments/purchase" element={<Payments />} />
          <Route path="payments/commission" element={<Payments />} />
          <Route path="academy" element={<Academy />} />
          <Route path="hot-offers" element={<HotOffers />} />
          <Route path="*" element={<UnderDevelopment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
