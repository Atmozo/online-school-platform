import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnails: string;
  lessons: any[];
  resources: any[];
}

const LandingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  
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
  
  // Function to get appropriate thumbnail for each course
  const getCourseThumbnail = (course: Course) => {
    // If course has a specific thumbnail, use it
    if (course.thumbnails) {
      return course.thumbnails;
    }
    
    // If no thumbnail is set, return a placeholder based on course ID
    return `https://placeholdit.imgix.net/~text?txtsize=33&txt=Course%20${course.id}&w=400&h=225`;
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
                <img 
                  src={getCourseThumbnail(course)} 
                  alt={`${course.title} thumbnail`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x225?text=Course+${course.id}`;
                  }}
                />
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
