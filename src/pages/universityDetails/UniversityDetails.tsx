import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import Spinner from "../../components/common/Loading/Spinner";
import {
  useGetUniversityBySlugQuery,
  useGetUniversityFaqsQuery,
} from "../../redux/features/universityApi";
import UniversityDetailsPage from "./components/UniversityDetailsPage";

export default function UniversityDetails() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: universityData,
    isLoading: isUniversityLoading,
    isFetching: isUniversityFetching,
    isError: isUniversityError,
  } = useGetUniversityBySlugQuery(slug || "", { skip: !slug });

  const { data: faqsData, isLoading: isFaqLoading } = useGetUniversityFaqsQuery(
    slug || "",
    { skip: !slug },
  );

  const isLoading = isUniversityLoading || isUniversityFetching || isFaqLoading;
  const university = universityData?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isUniversityError || !university) {
    return (
      <div className="rounded-2xl border border-primary-border bg-white py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">University not found</h2>
        <p className="mt-2 text-sm text-gray-500">This university page is unavailable.</p>
      </div>
    );
  }

  const faqs = faqsData?.data || [];

  return (
    <>
      <Helmet>
        <title>{university.name} | Partner Portal</title>
        <meta
          name="description"
          content={university.shortDescription || university.description || university.name}
        />
      </Helmet>

      <UniversityDetailsPage data={university} faqs={faqs} />
    </>
  );
}
