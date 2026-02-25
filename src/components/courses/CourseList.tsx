import React from "react";
import CourseCard from "./CourseCard";

interface Course {
  id: string;
  title: string;
  level: string;
  institution: {
    name: string;
    logo?: string;
    location: string;
  };
  price: string;
  intake?: string;
  duration?: string;
  startDates?: string;
}

interface CourseListProps {
  courses: Course[];
  onStartApplication?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onStartApplication,
  onViewDetails,
}) => {
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          title={course.title}
          level={course.level}
          institution={course.institution}
          price={course.price}
          intake={course.intake}
          duration={course.duration}
          startDates={course.startDates}
          onStartApplication={() => onStartApplication?.(course.id)}
          onViewDetails={() => onViewDetails?.(course.id)}
        />
      ))}
    </div>
  );
};

export default CourseList;
