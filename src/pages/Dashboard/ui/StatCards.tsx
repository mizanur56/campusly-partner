import { useNavigate } from "react-router-dom";
import { FileText, BookOpen, Calendar, UserRound } from "lucide-react";

interface StatCard {
  id: number;
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

const StatCards = () => {
  const navigate = useNavigate();

  // Mock data for design migration
  const articlesCount = 120;
  const guidesCount = 45;
  const eventsCount = 8;
  const officesCount = 12;


  const statCards: StatCard[] = [
    {
      id: 1,
      title: "Articles",
      value: articlesCount,
      icon: <FileText size={24} />,
      gradient: "linear-gradient(135.58deg, #387DF5 0.49%, #3F3FD1 99.51%)",
      onClick: () => navigate("/articles"),
    },
    {
      id: 2,
      title: "Guides",
      value: guidesCount,
      icon: <BookOpen size={24} />,
      gradient: "linear-gradient(135.58deg, #99A5FF 0.49%, #6B7AED 99.51%)",
      onClick: () => navigate("/guides"),
    },
    {
      id: 3,
      title: "Events",
      value: eventsCount,
      icon: <Calendar size={24} />,
      gradient: "linear-gradient(135.58deg, #61BF7A 0.49%, #237D3B 99.51%)",
      onClick: () => navigate("/events"),
    },
    {
      id: 4,
      title: "Contact name",
      value: officesCount,
      icon: <UserRound size={24} />,
      gradient: "linear-gradient(135.58deg, #FF8A65 0.49%, #FF6B35 99.51%)",
      onClick: () => navigate("/offices"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((card) => (
        <div
          key={card.id}
          onClick={card.onClick}
          className="rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
          style={{
            background: card.gradient,
          }}
        >
          {/* Decorative background element */}
          <div
            className="absolute rounded-full"
            style={{
              width: "347.5859375px",
              height: "347.5859375px",
              opacity: 0.25,
              top: "-131.45px",
              right: "80.41px",
              mixBlendMode: "soft-light",
              background: "#FFFFFF",
            }}
          />

          {/* Number badge */}
          <div className="absolute top-6 right-5 w-10 h-10 flex items-center justify-center z-10">
            <span className="text-white font-bold text-[30px]">{card.value}</span>
          </div>

          {/* Icon */}
          <div className="mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white">{card.icon}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-lg relative z-10">{card.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
