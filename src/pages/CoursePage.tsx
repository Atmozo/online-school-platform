import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Define the types for lessons and courses
interface Lesson {
  id: number;
  title: string;
  description: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  resources: string[];
}

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get course ID from the URL
  const [course, setCourse] = useState<Course | null>(null); // State for course details
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch course details on component mount
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`https://online-school-platform.onrender.com/api/courses/${id}`);
        setCourse(response.data); // Set course state
        setLoading(false); // Done loading
      } catch (error) {
        console.error("Error fetching course details:", error);
        setLoading(false); // Done loading even if there's an error
      }
    };

    fetchCourseDetails();
  }, [id]); // Re-run if the course ID changes

  // Show loading text while waiting for the API response
  if (loading) {
    return <div className="text-center text-lg mt-10">Loading...</div>;
  }

  // If no course is found, show a "Course not found" message
  if (!course) {
    return <div className="text-center text-lg mt-10">Course not found.</div>;
  }

  // Render course details, lessons, and resources
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description}</p>

        {/* Lessons Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Lessons</h2>
          <ul className="space-y-4">
            {course.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="p-4 bg-gray-50 shadow rounded-lg border"
              >
                <h3 className="text-xl font-semibold">{lesson.title}</h3>
                <p className="text-gray-600">{lesson.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Resources Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Resources</h2>
          <ul className="list-disc ml-8">
            {course.resources.map((resource, index) => (
              <li key={index} className="text-blue-500 underline">
                <a href={resource} target="_blank" rel="noopener noreferrer">
                  {resource}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CoursePage;
