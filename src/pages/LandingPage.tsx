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
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

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
      // Add Cloudinary transformation parameters for better image quality and sizing
      if (url.includes('cloudinary.com')) {
        // Add c_fill to maintain aspect ratio while filling the area
        // Add w_800,h_450 for a high-quality image that will scale down nicely
        // Add q_auto for automatic quality optimization
        if (url.includes('/upload/')) {
          return url.replace('/upload/', '/upload/c_fill,w_800,h_450,q_auto/');
        }
      }
      return url;
    }
    
    // If the path contains a slash, it might be a relative path in Cloudinary
    if (url.includes("/")) {
      // Apply transformations directly when constructing the URL
      return `https://res.cloudinary.com/dxhwlcqmk/image/upload/c_fill,w_800,h_450,q_auto/${url}`;
    }
    
    // For other cases, assume it's a Cloudinary public ID
    return `https://res.cloudinary.com/dxhwlcqmk/image/upload/c_fill,w_800,h_450,q_auto/${url}`;
  };

  // Handle image error
  const handleImageError = (courseId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [courseId]: true
    }));
  };

  // Handle image load
  const handleImageLoad = (courseId: number) => {
    setImageLoaded(prev => ({
      ...prev,
      [courseId]: true
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold font-serif">DEMO MVP LEARNING SITE</h1>
          <p className="mt-2 text-lg font-light">
            Discover courses and grow your skills!
          </p>
        </div>
      </header>

      {/* Courses Overview Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8 font-serif">Our Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 flex flex-col h-full transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Thumbnail image with loading state */}
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                {/* Skeleton loader - shown while image is loading */}
                {course.thumbnail && !imageLoaded[course.id] && !imageErrors[course.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-10 h-10 text-gray-300 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Actual image */}
                {course.thumbnail && !imageErrors[course.id] ? (
                  <img
                    src={getThumbnailUrl(course.thumbnail)}
                    alt={`${course.title} thumbnail`}
                    className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${imageLoaded[course.id] ? 'opacity-100' : 'opacity-0'}`}
                    onError={() => handleImageError(course.id)}
                    onLoad={() => handleImageLoad(course.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      No image available
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-grow">
                <h3 className="text-xl font-bold mb-2 text-blue-800 font-serif tracking-wide">{course.title}</h3>
                <p className="text-gray-700 mb-4 font-medium leading-relaxed">{course.description}</p>
                <div className="text-sm text-gray-500 mb-2 italic">
                  {course.lessons && (
                    <p>{course.lessons.length} lessons available</p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/courses/${course.id}/lessons`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block text-center transition duration-300 font-medium"
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
