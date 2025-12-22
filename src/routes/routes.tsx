import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ChangePassword from "../pages/Auth/ChangePassword";
import ForgetPassword from "../pages/Auth/ForgetPassword";
import Login from "../pages/Auth/Login";
import ResetPassword from "../pages/Auth/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import AllMediaList from "../pages/Media/Media";
import NotFound from "../pages/OtherPage/NotFound";
import UnderDevelopment from "../pages/OtherPage/UnderDevelopment";
import ProtectedRoute from "./ProtectedRoute";

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
      { path: "/change-password", element: <ChangePassword /> },
      // Fallback for undefined child routes
      { path: "*", element: <UnderDevelopment /> },
    ],
  },

  // Global fallback routes
  { path: "/404", element: <NotFound /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgetPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

const router = createBrowserRouter(routes);

export default router;
