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

import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import DestinationCard from "./signed/components/DestinationCard";
import KpiCards from "./signed/components/KpiCards";
import RecentAnnouncementsCard from "./signed/components/RecentAnnouncementsCard";
import SupportPanelCard from "./signed/components/SupportPanelCard";
import TeamMembersCard from "./signed/components/TeamMembersCard";
import TopSubjectsCard from "./signed/components/TopSubjectsCard";
import UniversitiesCard from "./signed/components/UniversitiesCard";

export default function SignedDashboardView() {
  const user = useSelector(selectCurrentUser);
  const userName = user?.name ?? "Partner User";
  const navigate = useNavigate();
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const { data: dashboard, isLoading } = useGetPartnerDashboardQuery(
    undefined,
    {
      /** Refetch every time this view mounts (e.g. each navigation to dashboard). */
      refetchOnMountOrArgChange: true,
    },
  );

  const supportPanel = dashboard?.supportPanel ?? [];

  const teamMembers = dashboard?.teamMembers ?? [];
  const topDestinations: PartnerDashboardDestination[] =
    dashboard?.topDestinations ?? [];
  const topUniversities: PartnerDashboardUniversity[] =
    dashboard?.topUniversities ?? [];
  const topSubjects: PartnerDashboardSubject[] = dashboard?.topSubjects ?? [];

  const handleCreateStudentSuccess = () => {
    navigate("/students");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 px-4 pb-8 pt-0 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
            Welcome, {userName} !
          </h1>
          <Button
            type="primary"
            onClick={() => setCreateStudentOpen(true)}
            icon={<PlusOutlined />}
          >
            Add Student
          </Button>
        </div>
        <CreateStudentModal
          open={createStudentOpen}
          onClose={() => setCreateStudentOpen(false)}
          onSuccess={handleCreateStudentSuccess}
        />

        <KpiCards topStats={dashboard?.topStats as any} isLoading={isLoading} />

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <SupportPanelCard people={supportPanel} isLoading={isLoading} />
            <TeamMembersCard teamMembers={teamMembers} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <RecentAnnouncementsCard />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <DestinationCard
            destinations={topDestinations}
            isLoading={isLoading}
          />
          <UniversitiesCard
            universities={topUniversities}
            isLoading={isLoading}
          />
          <TopSubjectsCard subjects={topSubjects} isLoading={isLoading} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"></div>
        </div>
      </div>
    </div>
  );
}
