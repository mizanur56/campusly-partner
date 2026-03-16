import { Image } from "antd";
import { Link } from "react-router-dom";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import CustomActionButton from "../../../../components/common/Button/CustomActionButton";
import { ArrowLeftIcon } from "lucide-react";

const ApplyNowTab = () => {
  return (
    <div className=" flex flex-col items-center justify-center">
      {/* Header Image */}
      <div className="w-82.5 h-82.5 rounded-lg overflow-hidden">
        <Image
          src="/images/home/apply.png"
          alt="Apply Now"
          className="w-full h-auto"
          preview={false}
        />
      </div>
      <h1 className="text-[#20242A] text-[24px] max-w-2xl text-center font-semibold">
        All your documents have been successfully uploaded. Now, please choose a
        program.
      </h1>

      <div className="flex justify-center gap-4 mt-4 ">
        <Link to="/students">
          <CustomActionButton
            size="large"
            text="Back to Students"
            icon={<ArrowLeftIcon />}
          />
        </Link>
        <PrimaryButton text="Choose Program" to="/programs-schools" />
      </div>
    </div>
  );
};

export default ApplyNowTab;
