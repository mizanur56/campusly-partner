import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  PartnerDashboardDestination,
  PartnerDashboardSubject,
  PartnerDashboardUniversity,
  useGetPartnerDashboardQuery,
} from "../../redux/features/profile/partnerProfileApi";

import AnnouncementsCenter from "./signed/dashboard/AnnouncementsCenter";
import DiscoverRow from "./signed/dashboard/DiscoverRow";
import KpiGrid from "./signed/dashboard/KpiGrid";
import NotificationCenter from "./signed/dashboard/NotificationCenter";
import PerformanceAnalytics from "./signed/dashboard/PerformanceAnalytics";
import QuickActions from "./signed/dashboard/QuickActions";
import RecentApplications from "./signed/dashboard/RecentApplications";
import StatusDonut from "./signed/dashboard/StatusDonut";
import TaskWidget from "./signed/dashboard/TaskWidget";
import WelcomeHero from "./signed/dashboard/WelcomeHero";
import SupportPanelCard from "./signed/components/SupportPanelCard";

export default function SignedDashboardView() {
  const user = useSelector(selectCurrentUser);
  const userName = user?.name ?? "Partner User";
  const navigate = useNavigate();
  const [createStudentOpen, setCreateStudentOpen] = useState(false);

  const { data: dashboard, isLoading } = useGetPartnerDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });


  const topDestinations: PartnerDashboardDestination[] =
    dashboard?.topDestinations ?? [];
  const topUniversities: PartnerDashboardUniversity[] =
    dashboard?.topUniversities ?? [];
  const topSubjects: PartnerDashboardSubject[] = dashboard?.topSubjects ?? [];

  const handleCreateStudentSuccess = () => navigate("/students");

  return (
    <div className="-mx-4 min-h-[calc(100vh-4rem)] px-4 pb-10 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
        {/* 1. Welcome hero banner */}
        <WelcomeHero
          userName={userName}
          topStats={dashboard?.topStats}
          isLoading={isLoading}
          onAddStudent={() => setCreateStudentOpen(true)}
          onNewApplication={() => navigate("/applications")}
        />

        {/* 2. KPI cards */}
        <KpiGrid topStats={dashboard?.topStats} isLoading={isLoading} />

        {/* 3. Quick actions */}
        <QuickActions onAddStudent={() => setCreateStudentOpen(true)} />
         

        {/* 4. Performance analytics + status breakdown */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">'
          <SupportPanelCard people={dashboard?.supportPanel ?? []} isLoading={isLoading} />'
            <PerformanceAnalytics />
            
          </div>
          <StatusDonut topStats={dashboard?.topStats} isLoading={isLoading} />
        </div>

        {/* 5. Recent applications + task management */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentApplications />
          </div>
          <TaskWidget />
        </div>

        {/* 6. Popular universities, programs & destinations */}
        <DiscoverRow
          universities={topUniversities}
          subjects={topSubjects}
          destinations={topDestinations}
          isLoading={isLoading}
        />

        {/* 7. Announcements + notifications */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnnouncementsCenter />
          </div>
          <NotificationCenter />
        </div>
      </div>

      <CreateStudentModal
        open={createStudentOpen}
        onClose={() => setCreateStudentOpen(false)}
        onSuccess={handleCreateStudentSuccess}
      />
    </div>
  );
}
