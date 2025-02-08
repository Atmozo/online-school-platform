// import React, { useEffect, useRef, useState } from 'react';
// import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

// interface VideoPlayerProps {
//   url: string;
//   title?: string;
//   className?: string;
//   thumbnailUrl?: string;
//   autoplay?: boolean;
// }

// const BackgroundVideoPlayer: React.FC<VideoPlayerProps> = ({
//   url,
//   title,
//   className = '',
//   thumbnailUrl,
//   autoplay = false
// }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [isPlaying, setIsPlaying] = useState(autoplay);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     video.muted = isMuted;
//     if (autoplay) {
//       video.play().catch(() => {
//         setIsPlaying(false);
//       });
//     }

//     return () => {
//       video.pause();
//     };
//   }, [autoplay]);

//   const togglePlay = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     const video = videoRef.current;
//     if (!video) return;

//     if (video.paused) {
//       video.play().then(() => {
//         setIsPlaying(true);
//       }).catch((error) => {
//         console.error("Error playing video:", error);
//         setIsPlaying(false);
//       });
//     } else {
//       video.pause();
//       setIsPlaying(false);
//     }
//   };

//   const toggleMute = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     const video = videoRef.current;
//     if (!video) return;

//     video.muted = !video.muted;
//     setIsMuted(video.muted);
//   };

//   return (
//     <div 
//       className={`relative w-full h-full overflow-hidden group ${className}`}
//       onMouseEnter={() => setIsHovering(true)}
//       onMouseLeave={() => setIsHovering(false)}
//     >
//       {thumbnailUrl && !isPlaying && (
//         <div className="absolute inset-0">
//           <img 
//             src={thumbnailUrl} 
//             alt={title || 'Video thumbnail'} 
//             className="w-full h-full object-cover"
//           />
//         </div>
//       )}
      
//       <video
//         ref={videoRef}
//         className="w-full h-full object-cover"
//         playsInline
//         loop
//         poster={thumbnailUrl}
//       >
//         <source src={url} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>

//       <div 
//         className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300
//           ${isHovering ? 'opacity-100' : 'opacity-0'}`}
//       >
//         <div className="flex gap-4">
//           <button
//             onClick={togglePlay}
//             className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
//             aria-label={isPlaying ? 'Pause' : 'Play'}
//           >
//             {isPlaying ? (
//               <Pause className="w-6 h-6 text-gray-800" />
//             ) : (
//               <Play className="w-6 h-6 text-gray-800" />
//             )}
//           </button>
//           <button
//             onClick={toggleMute}
//             className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-lg"
//             aria-label={isMuted ? 'Unmute' : 'Mute'}
//           >
//             {isMuted ? (
//               <VolumeX className="w-6 h-6 text-gray-800" />
//             ) : (
//               <Volume2 className="w-6 h-6 text-gray-800" />
//             )}
//           </button>
//         </div>
//       </div>

//       {title && (
//         <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
//           <h3 className="text-white text-lg font-medium">{title}</h3>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BackgroundVideoPlayer;

// VideoPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
}

const BackgroundVideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  className = '',
  thumbnailUrl,
  autoplay = false
}) => {
  const [isYouTube, setIsYouTube] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Function to extract YouTube video ID
    const extractYouTubeId = (url: string) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /youtube\.com\/watch\?.*v=([^&]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const id = extractYouTubeId(url);
    setVideoId(id);
    setIsYouTube(!!id);
  }, [url]);

  if (isYouTube && videoId) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "YouTube video"}
          />
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white text-lg font-medium">{title}</h3>
          </div>
        )}
      </div>
    );
  }

  // For direct video files (non-YouTube)
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        className="w-full h-full object-cover rounded-lg"
        controls
        playsInline
        autoPlay={autoplay}
        muted={autoplay}
        poster={thumbnailUrl}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default BackgroundVideoPlayer;