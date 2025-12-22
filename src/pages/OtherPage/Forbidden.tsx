import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta
        title="403 Access Denied | Campus Transfer"
        description="You don't have permission to access this page. Contact your administrator if you believe this is an error."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gray-50">
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md xl:text-title-2xl">
            ERROR 403
          </h1>

          <div className="flex items-center justify-center mb-8">
            <svg
              className="w-full h-auto max-w-[300px]"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lock icon */}
              <circle cx="200" cy="150" r="80" fill="#FEF3F2" />
              <path
                d="M200 100C183.431 100 170 113.431 170 130V145H230V130C230 113.431 216.569 100 200 100Z"
                fill="#D92D20"
              />
              <rect
                x="160"
                y="145"
                width="80"
                height="60"
                rx="8"
                fill="#D92D20"
              />
              <circle cx="200" cy="170" r="8" fill="white" />
              <rect x="196" y="170" width="8" height="20" rx="4" fill="white" />
            </svg>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Access Denied
          </h2>

          <p className="mb-2 text-base text-gray-700 sm:text-lg">
            Sorry, you don't have permission to access this page.
          </p>

          <p className="mb-8 text-sm text-gray-600">
            Please contact your administrator if you believe this is an error.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-primary-700"
            >
              Go to Dashboard
            </button>
          </div>

          <p className="text-sm text-center text-gray-500 mt-5">
            &copy; {new Date().getFullYear()} - Campus Transfer
          </p>
        </div>
      </div>
    </>
  );
}
