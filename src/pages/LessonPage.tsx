// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Alert } from "@mui/material";

// interface Lesson {
//   id: number;
//   title: string;
//   description: string;
//   resources: {
//     type: string; id: number; url: string; title: string 
// }[]; // Adjust based on backend response
// }

// const LessonPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [lessons, setLessons] = useState<Lesson[]>([]);

//   useEffect(() => {
//     const fetchLessons = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/courses/${id}/lessons`);
//         setLessons(response.data);
//       } catch (error) {
//         console.error("Error fetching lessons:", error);
//       }
//     };

//     fetchLessons();
//   }, [id]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-4">Lessons for Course {id}</h1>

//       {lessons.length === 0 ? (
//         <p className="text-gray-600">No lessons available for this course.</p>
//       ) : (
//         lessons.map((lesson) => (
//           <div key={lesson.id} className="mb-6">
//             <h2 className="text-2xl font-semibold">{lesson.title}</h2>
//             <p className="text-gray-700 mb-2">{lesson.description}</p>

//             {lesson.resources && lesson.resources.length > 0 ? (
//               <div className="mt-4">
//                 <h3 className="font-semibold">Resources:</h3>
//                 <ul className="list-disc list-inside">
//                   {lesson.resources.map((resource) => (
//                     <li 
//                     key={resource.id}
//                     className="flex items-center p-3 bg-white rounded-md shadow-sm"
//                   >
//                        {/* Resource Type Icon */}
//                 <span className="mr-3">
//                   {resource.type === 'video' && '📹'}
//                   {resource.type === 'pdf' && '📄'}
//                   {resource.type === 'link' && '🔗'}
//                 </span>

//                 {/* Resource Title and Link */}
//                 <a
//                   href={resource.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:text-blue-800 hover:underline flex-1"
//                 >
//                   {resource.title}
//                 </a>
//                 <span className="ml-3 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
//                   {resource.type}
//                 </span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ) : (
//              <Alert>
//               <p className="text-gray-600">No resources available for this lesson.</p>
//             </Alert>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default LessonPage;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Alert } from "@mui/material";
import BackgroundVideoPlayer from "./BackgroundVideoPlayer";

interface Resource {
  type: string;
  id: number;
  url: string;
  title: string;
  thumbnailUrl?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  resources: Resource[];
}

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${id}/lessons`);
        setLessons(response.data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };
    fetchLessons();
  }, [id]);

  const renderResource = (resource: Resource) => {
    switch (resource.type) {
      case 'video':
        return (
          <div
            key={resource.id}
            className="relative h-64 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => setActiveVideo(resource)}
          >
            <BackgroundVideoPlayer
              url={resource.url}
              className="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-medium text-white">{resource.title}</h4>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <li key={resource.id} className="flex items-center p-3 bg-white rounded-md shadow-sm">
            <span className="mr-3">
              {resource.type === 'pdf' && '📄'}
              {resource.type === 'link' && '🔗'}
            </span>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline flex-1"
            >
              {resource.title}
            </a>
            <span className="ml-3 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {resource.type}
            </span>
          </li>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Lessons for Course {id}</h1>
      
      {/* Active Video Section */}
      {activeVideo && (
        <div className="mb-8 aspect-video rounded-lg overflow-hidden shadow-xl">
          <BackgroundVideoPlayer
            url={activeVideo.url}
            title={activeVideo.title}
          />
        </div>
      )}

      {lessons.length === 0 ? (
        <p className="text-gray-600">No lessons available for this course.</p>
      ) : (
        lessons.map((lesson) => (
          <div key={lesson.id} className="mb-6">
            <h2 className="text-2xl font-semibold">{lesson.title}</h2>
            <p className="text-gray-700 mb-2">{lesson.description}</p>
            {lesson.resources && lesson.resources.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-semibold mb-4">Resources:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lesson.resources.map(renderResource)}
                </div>
              </div>
            ) : (
              <Alert>
                <p className="text-gray-600">No resources available for this lesson.</p>
              </Alert>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default LessonPage;

