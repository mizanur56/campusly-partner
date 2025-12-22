import { Wrench } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";

const UnderDevelopment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center  px-4 text-center">
      <PageMeta
        title="Under Development | Campus Transfer"
        description="This page is currently under development."
      />
      <Wrench size={96} className="text-primary-500 mb-4" />

      <h2 className="mb-4 text-4xl font-bold text-neutral-800">
        Page Under Development
      </h2>

      <p className="mb-2 text-neutral-500">
        You are trying to access:{" "}
        <code className="text-primary-500 font-medium">{location.pathname}</code>
      </p>

      <p className="mb-8 max-w-md text-neutral-500">
        We're working hard to bring you this feature. Please check back soon or
        contact support if you need help.
      </p>

      <button
        onClick={() => navigate("/")}
        className="rounded-md bg-primary-500 px-6 py-3 text-white font-medium shadow hover:bg-primary-600 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default UnderDevelopment;
