import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChangePassword from "../pages/Auth/ChangePassword";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import AllMediaList from "../pages/Media/Media";
import Academy from "../pages/Academy/Academy";
import NotFound from "../pages/OtherPage/NotFound";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import ProgramsSchools from "../pages/ProgramsSchools/ProgramsSchools";
import ProtectedRoute from "./ProtectedRoute";
import { OnboardingPage } from "../pages/Onboarding";
import ContractPage from "../pages/Contract/ContractPage";
import ContractSignedPage from "../pages/Contract/ContractSignedPage";
import Students from "../pages/Students/Students";
import Applications from "../pages/Applications/Applications";
import MyTasks from "../pages/MyTasks/MyTasks";
import Payments from "../pages/Payments/Payments";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      // Dashboard & Core
      { path: "/", element: <Dashboard /> },
      { path: "/media", element: <AllMediaList /> },
      { path: "/onboarding", element: <OnboardingPage /> },
      { path: "/contract", element: <ContractPage /> },
      { path: "/contract/signed", element: <ContractSignedPage /> },
      { path: "/change-password", element: <ChangePassword /> },
      // Signed sidebar — default/under-development pages
      { path: "/programs-schools", element: <ProgramsSchools /> },
      { path: "/students", element: <Students /> },
      { path: "/applications", element: <Applications /> },
      { path: "/my-tasks", element: <MyTasks /> },
      { path: "/payments", element: <Navigate to="/payments/purchase" replace /> },
      { path: "/payments/purchase", element: <Payments /> },
      { path: "/payments/commission", element: <Payments /> },
      { path: "/academy", element: <Academy /> },
      { path: "/hot-offers", element: <UnderDevelopment /> },
      // Fallback for undefined child routes
      { path: "*", element: <UnderDevelopment /> },
    ],
  },

  // Global fallback routes
  { path: "/404", element: <NotFound /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgetPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

const router = createBrowserRouter(routes);

export default router;
