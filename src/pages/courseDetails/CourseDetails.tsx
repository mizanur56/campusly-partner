import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Spinner from "../../components/common/Loading/Spinner";
import CourseDetailsPage from "../../components/courses/CourseDetailsPage";
import { useGetCourseBySlugQuery } from "../../redux/features/courseApi";

export default function CourseDetails() {
  const { universitySlug, courseSlug } = useParams<{
    universitySlug: string;
    courseSlug: string;
  }>();

  // Combine university slug and course slug: "university-slug/course-slug"
  const slug = `${universitySlug}/${courseSlug}`;

  const { data, isLoading, error } = useGetCourseBySlugQuery(slug, {
    skip: !universitySlug || !courseSlug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Spinner />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container pt-6 pb-24">
        <p className="text-center text-neutral-600">Course not found</p>
      </div>
    );
  }

  const course = data.data.course;
  const university = data.data.university;

  const title = course?.name
    ? `${course.name} | ${university?.name || "Campus Transfer"}`
    : "Course Details | Campus Transfer";

  const description =
    data.data?.description ||
    course?.description ||
    `Study ${course?.name} at ${university?.name}. Explore course details, tuition fees, and application requirements.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <CourseDetailsPage data={data.data} />
    </>
  );
}
