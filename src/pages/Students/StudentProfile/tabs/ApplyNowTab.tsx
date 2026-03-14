import { Image } from "antd";
import { Link } from "react-router-dom";
import PrimaryButton from "../../../../components/common/Button/PrimaryButton";
import { ArrowLeft } from "lucide-react";

export default function ApplyNowTab() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-82.5 h-82.5 rounded-lg overflow-hidden max-w-[330px]">
        <Image
          src="/images/home/apply.png"
          alt="Apply Now"
          className="w-full h-auto"
          preview={false}
        />
      </div>
      <h1 className="text-[#20242A] text-[24px] max-w-2xl text-center font-semibold mt-6">
        All your documents have been successfully uploaded. Now, please choose a program.
      </h1>
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <Link to="/students">
          <span className="inline-flex items-center gap-2 px-4 py-2 border border-[#C7CACF] rounded-lg text-[#20242A] hover:border-[#237D3B] hover:text-[#237D3B] transition-colors">
            <ArrowLeft size={18} />
            Back to Students
          </span>
        </Link>
        <PrimaryButton text="Choose Program" to="/programs-schools" />
      </div>
    </div>
  );
}
