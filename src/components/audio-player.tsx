
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

// --- Playlist ---
// Add your music file paths here.
// They must be in the `public/calm-music` folder.
const playlist = [
  '/calm-music/1.mp3',
  '/calm-music/2.mp3',
  '/calm-music/3.mp3',
  '/calm-music/4.mp3',
  '/calm-music/5.mp3',
  '/calm-music/6.mp3',
];

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  }, []);

  useEffect(() => {
    // This effect runs only once to initialize the audio element.
    const audio = new Audio();
    audio.volume = 0.3;
    audio.addEventListener('ended', playNextTrack);
    audioRef.current = audio;

    // Set initial track
    audio.src = playlist[currentTrackIndex];

    // Cleanup on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', playNextTrack);
        audioRef.current = null;
      }
    };
  }, [playNextTrack]); // The dependency array is correct.

  useEffect(() => {
    // This effect handles playing/pausing and track changes.
    if (!audioRef.current) return;

    audioRef.current.src = playlist[currentTrackIndex];

    if (isPlaying) {
      // We must handle the promise returned by play()
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented.
          if (error.name === 'NotAllowedError') {
            setIsPlaying(false);
          } else {
            console.error('Audio play error:', error);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label="Toggle music"
      >
        {isPlaying ? (
          <Volume2 className="h-8 w-8" />
        ) : (
          <VolumeX className="h-8 w-8" />
        )}
      </Button>
    </div>
  );
}
