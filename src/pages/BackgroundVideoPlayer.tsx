import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';

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
  const [platform, setPlatform] = useState<'youtube' | 'alison' | 'google' | 'googleDrive' | 'direct' | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(autoplay);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectPlatformAndId = (url: string) => {
      // YouTube patterns
      const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /youtube\.com\/watch\?.*v=([^&]+)/
      ];
      
      // Alison patterns - support both course and topic URLs
      const alisonPatterns = [
        /alison\.com\/topic\/learn\/(\d+)/,
        /alison\.com\/course\/([^\/\?]+)/,
        /alison\.com\/topic\/embed\/(\d+)/
      ];

      // Google Video patterns
      const googlePatterns = [
        /video\.google\.com\/videoplay\?docid=([^&]+)/,
        /video\.google\.com\/view\?docid=([^&]+)/
      ];

      // Google Drive patterns
      const googleDrivePatterns = [
        /drive\.google\.com\/file\/d\/([^\/]+)\/view/,
        /drive\.google\.com\/open\?id=([^&]+)/
      ];

      // Check YouTube
      for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
          setPlatform('youtube');
          setVideoId(match[1]);
          return;
        }
      }

      // Check Alison
      for (const pattern of alisonPatterns) {
        const match = url.match(pattern);
        if (match) {
          setPlatform('alison');
          setVideoId(match[1]);
          return;
        }
      }

      // Check Google Video
      for (const pattern of googlePatterns) {
        const match = url.match(pattern);
        if (match) {
          setPlatform('google');
          setVideoId(match[1]);
          return;
        }
      }

      // Check Google Drive
      for (const pattern of googleDrivePatterns) {
        const match = url.match(pattern);
        if (match) {
          setPlatform('googleDrive');
          setVideoId(match[1]);
          return;
        }
      }

      // Handle direct video URLs or other formats
      const videoExtensions = /\.(mp4|webm|ogg)$/i;
      if (videoExtensions.test(url)) {
        setPlatform('direct');
        setVideoId(null);
      } else {
        // For any other URL, try to load it as a direct video first
        setPlatform('direct');
        setVideoId(null);
      }
    };
    
    detectPlatformAndId(url);
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Function to get the correct Alison embed URL
  const getAlisonEmbedUrl = (courseId: string) => {
    // If it's already an embed URL, return as is
    if (url.includes('/topic/embed/')) {
      return url;
    }
    // If it's a course URL, convert to embed format
    return `https://alison.com/topic/embed/${courseId}`;
  };

  // Function to get the correct Google Video embed URL
  const getGoogleVideoEmbedUrl = (videoId: string) => {
    return `https://video.google.com/embed/videoplay?docid=${videoId}`;
  };

  // Function to get the correct Google Drive embed URL
  const getGoogleDriveEmbedUrl = (fileId: string) => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  if (platform === 'youtube' && videoId) {
    const youtubeParams = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: isMuted ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0'
    });

    return (
      <div className={`relative w-full ${className}`} ref={containerRef}>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}?${youtubeParams.toString()}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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

  if (platform === 'alison' && videoId) {
    return (
      <div className={`relative w-full ${className}`} ref={containerRef}>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={getAlisonEmbedUrl(videoId)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title || "Alison course"}
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

  if (platform === 'google' && videoId) {
    return (
      <div className={`relative w-full ${className}`} ref={containerRef}>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={getGoogleVideoEmbedUrl(videoId)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title || "Google video"}
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

  if (platform === 'googleDrive' && videoId) {
    return (
      <div className={`relative w-full ${className}`} ref={containerRef}>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={getGoogleDriveEmbedUrl(videoId)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title || "Google Drive video"}
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

  // Direct video file (unchanged)
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} ref={containerRef}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        playsInline
        autoPlay={autoplay}
        muted={isMuted}
        poster={thumbnailUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/50 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {title && (
            <div className="flex-grow">
              <h3 className="text-white text-lg font-medium truncate">{title}</h3>
            </div>
          )}

          <div className="relative">
            <button
              onClick={toggleSettings}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <Settings size={24} />
            </button>
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 p-4 bg-black/90 rounded-lg">
                <div className="text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Playback Speed:</span>
                    <select
                      onChange={(e) => {
                        if (videoRef.current) {
                          videoRef.current.playbackRate = parseFloat(e.target.value);
                        }
                      }}
                      className="bg-transparent border border-white/20 rounded"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1.0" selected>1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2.0">2x</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundVideoPlayer;
