// src/components/CourseThumbnail.tsx
import React from "react";
import { Link } from "react-router-dom";

interface CourseThumbnailProps {
  id: number;
  title: string;
  thumbnailUrl: string;
}

const CourseThumbnail: React.FC<CourseThumbnailProps> = ({ id, title, thumbnailUrl }) => {
  return (
    <div className="p-4 bg-white rounded shadow hover:shadow-lg transition duration-300">
      <Link to={`/courses/${id}`}>
        <img src={thumbnailUrl} alt={`${title} Thumbnail`} className="w-full h-auto rounded" />
        <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      </Link>
    </div>
  );
};

export default CourseThumbnail;
