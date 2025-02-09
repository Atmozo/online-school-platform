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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon, Video } from "lucide-react";
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

const ResourceTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    case 'link':
      return <LinkIcon className="w-5 h-5" />;
    default:
      return null;
  }
};

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://online-school-platform.onrender.com/api/courses/${id}/lessons`);
        setLessons(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setError("Failed to load lessons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [id]);

  const renderResource = (resource: Resource) => {
    switch (resource.type) {
      case 'video':
        return (
          <Card
            key={resource.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
            onClick={() => setActiveVideo(resource)}
          >
            <CardContent className="p-0">
              <div className="relative h-48">
                <BackgroundVideoPlayer
                  url={resource.url}
                  className="rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
{/*                     <h4 className="font-medium text-white group-hover:text-blue-100">{resource.title}</h4> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card key={resource.id} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="flex items-center p-4">
              <ResourceTypeIcon type={resource.type} />
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-blue-600 hover:text-blue-800 hover:underline flex-1"
              >
                {resource.title}
              </a>
              <Badge variant="secondary" className="ml-3">
                {resource.type}
              </Badge>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
{/*       <h1 className="text-3xl font-bold mb-8">Course {id} Lessons</h1> */}
      
      {activeVideo && (
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="aspect-video rounded-lg overflow-hidden">
              <BackgroundVideoPlayer
                url={activeVideo.url}
                title={activeVideo.title}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {lessons.length === 0 ? (
        <Alert>
          <AlertTitle>No Content Available</AlertTitle>
          <p>No lessons are currently available for this course.</p>
        </Alert>
      ) : (
        lessons.map((lesson) => (
          <Card key={lesson.id} className="mb-6">
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <p className="text-gray-700">{lesson.description}</p>
            </CardHeader>
            {lesson.resources && lesson.resources.length > 0 ? (
              <CardContent>
                <h3 className="font-semibold mb-4">Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lesson.resources.map(renderResource)}
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <Alert>
                  <p className="text-gray-600">No resources available for this lesson.</p>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default LessonPage;
