import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import { ArrowLeftIcon } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VisaSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen justify-center gap-4 max-w-4xl mx-auto">
      <div className="rounded-lg overflow-hidden">
        <FaCheckCircle className="text-[#00B561]" size={120} />
      </div>
      <h1 className="text-[#20242A] text-[24px] max-w-2xl text-center font-semibold">Thanks for the journey</h1>
      <p className="text-[#4B5563] text-[18px] text-center">
        Your application has been verified and enrollment is complete. Proceed to view your dashboard or track your applications.
      </p>

      <div className="flex justify-center gap-4 mt-4">
        <CustomActionButton size="large" text="Back to Home" icon={<ArrowLeftIcon />} onClick={() => navigate("/")} />
        <PrimaryButton text="Check Applications" to="/applications" />
      </div>
    </div>
  );
};

export default VisaSuccessPage;
