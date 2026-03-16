import { Image } from "antd";
import PrimaryButton from "../../../components/common/Button/PrimaryButton";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VisaRejectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-4xl mx-auto">
      <div className="w-82.5 h-82.5 rounded-lg overflow-hidden">
        <Image src="/images/visa_reject.png" alt="Visa Rejected" className="w-full h-auto" preview={false} />
      </div>
      <h1 className="text-[#20242A] text-[24px] max-w-2xl text-center font-semibold">Your visa application has unfortunately been declined.</h1>
      <p className="text-[#4B5563] text-[18px] text-center">
        However, this isn't the end of your journey. Our team will thoroughly review the outcome, identify the reasons behind the rejection, and guide you on the next steps for improvement.
      </p>
      <p className="text-[#4B5563] text-[18px] text-center">
        In the meantime, you can also explore alternative universities that may offer a better fit for your profile and goals. We're here to support you every step of the way.
      </p>

      <div className="flex justify-center gap-4 mt-4">
        <CustomActionButton size="large" text="Back to Home" icon={<ArrowLeftIcon />} onClick={() => navigate("/")} />
        <PrimaryButton text="Check Applications" to="/applications" />
      </div>
    </div>
  );
};

export default VisaRejectPage;
