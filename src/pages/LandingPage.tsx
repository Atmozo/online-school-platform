import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  lessons: any[];
  resources: any[];
}

const LandingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Fetch courses from the backend
    const fetchCourses = async () => {
      try {
        const response = await axios.get("https://online-school-platform.onrender.com/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Helper function to validate and format thumbnail URLs
  const getThumbnailUrl = (url: string) => {
    if (!url) return "";
    
    // Check if the URL is already a complete URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // If the path contains a slash, it might be a relative path in Cloudinary
    if (url.includes("/")) {
      return `https://res.cloudinary.com/dxhwlcqmk/image/upload/${url}`;
    }
    
    // For other cases, assume it's a Cloudinary public ID
    return `https://res.cloudinary.com/dxhwlcqmk/image/upload/${url}`;
  };

  // Handle image error
  const handleImageError = (courseId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [courseId]: true
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">DEMO MVP LEARNING SITE</h1>
          <p className="mt-2 text-lg">
            Discover courses and grow your skills!
          </p>
        </div>
      </header>

      {/* Courses Overview Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 flex flex-col h-full"
            >
              {/* Thumbnail image */}
              <div className="h-48 overflow-hidden">
                {course.thumbnail && !imageErrors[course.id] ? (
                  <img
                    src={getThumbnailUrl(course.thumbnail)}
                    alt={`${course.title} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(course.id)}
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-grow">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="text-sm text-gray-500 mb-2">
                  {course.lessons && (
                    <p>{course.lessons.length} lessons available</p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/courses/${course.id}/lessons`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block text-center"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
