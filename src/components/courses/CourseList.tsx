import React from "react";
import CourseCard from "./CourseCard";

export interface Course {
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
  campus?: string;
  modeOfStudy?: string;
}

interface CourseListProps {
  courses: Course[];
  onStartApplication?: (course: Course) => void;
  onViewDetails?: (course: Course) => void;
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
          onStartApplication={() => onStartApplication?.(course)}
          onViewDetails={() => onViewDetails?.(course)}
        />
      ))}
    </div>
  );
};

export default CourseList;
