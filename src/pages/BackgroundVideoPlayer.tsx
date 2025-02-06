import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

const BackgroundVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  title,
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    playerRef.current = videojs(videoRef.current, {
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      fluid: true,
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    });

    // Ensure video covers the container
    playerRef.current.fill(true);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-fill vjs-big-play-button-centered"
          playsInline
        />
      </div>
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
      )}

      {/* Custom styles for video.js */}
      <style jsx>{`
        :global(.video-js) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        :global(.vjs-fill) {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        :global(.vjs-poster) {
          background-size: cover;
        }
      `}</style>
    </div>
  );
};

export default BackgroundVideoPlayer;