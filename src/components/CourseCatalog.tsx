// src/pages/CourseCatalog.tsx
import React, { useEffect, useState } from "react";
import CourseThumbnail from "../components/CourseThumbnail";

interface Course {
  id: number;
  title: string;
  thumbnailUrl: string;
}

const CourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/courses");
        const data = await response.json();
        // Expecting an array of courses with id, title, and thumbnailUrl
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseThumbnail
            key={course.id}
            id={course.id}
            title={course.title}
            thumbnailUrl={course.thumbnailUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseCatalog;
