import { Link } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="404 Page Not Found | Campus Transfer"
        description="The page you are looking for cannot be found in Campus Transfer. Return to the dashboard or check the URL."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gray-50">
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md xl:text-title-2xl">
            ERROR 404
          </h1>

          <img src="/images/error/404.svg" alt="404" className="mx-auto" />

          <p className="mt-10 mb-4 text-base text-gray-700 sm:text-lg">
            Oops! We can’t seem to find the page you are looking for.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800"
            >
              Refresh
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
