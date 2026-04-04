import { useState, useRef, useEffect, useCallback } from "react";

export function useAudioPlayer(lessons) {
  const audioRef = useRef(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'one' | 'all'
  const [autoNext, setAutoNext] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLineId, setActiveLineId] = useState(null);

  const currentLesson = lessons[currentLessonIndex];

  // Sync audio element properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex]);

  // Sync active transcript line with playback time
  useEffect(() => {
    if (!currentLesson || duration === 0) return;
    const lines = currentLesson.transcript;
    const segDuration = duration / lines.length;
    const idx = Math.floor(currentTime / segDuration);
    const clamped = Math.max(0, Math.min(idx, lines.length - 1));
    setActiveLineId(lines[clamped]?.id ?? null);
  }, [currentTime, duration, currentLesson]);

  const handleTimeUpdate = useCallback((e) => {
    setCurrentTime(e.target.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback((e) => {
    setDuration(e.target.duration);
  }, []);

  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (repeatMode === "all") {
      const nextIdx = (currentLessonIndex + 1) % lessons.length;
      setCurrentLessonIndex(nextIdx);
      setIsPlaying(true);
    } else {
      // repeatMode === "off"
      if (autoNext) {
        const nextIdx = currentLessonIndex + 1;
        if (nextIdx < lessons.length) {
          setCurrentLessonIndex(nextIdx);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    }
  }, [repeatMode, autoNext, currentLessonIndex, lessons.length]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const goToNext = useCallback(() => {
    const nextIdx = (currentLessonIndex + 1) % lessons.length;
    setCurrentLessonIndex(nextIdx);
    setIsPlaying(true);
  }, [currentLessonIndex, lessons.length]);

  const goToPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = (currentLessonIndex - 1 + lessons.length) % lessons.length;
    setCurrentLessonIndex(prevIdx);
    setIsPlaying(true);
  }, [currentLessonIndex, lessons.length]);

  const fastForward = useCallback((secs = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + secs, audio.duration || 0);
  }, []);

  const rewind = useCallback((secs = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - secs, 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback((val) => {
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  }, [isMuted]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) =>
      prev === "off" ? "all" : prev === "all" ? "one" : "off"
    );
  }, []);

  const toggleAutoNext = useCallback(() => {
    setAutoNext((prev) => !prev);
  }, []);

  const handleSeek = useCallback((val) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = val;
    setCurrentTime(val);
  }, []);

  const selectLesson = useCallback((idx) => {
    setCurrentLessonIndex(idx);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return {
    audioRef,
    currentLesson,
    currentLessonIndex,
    isPlaying,
    isMuted,
    volume,
    playbackRate,
    repeatMode,
    currentTime,
    duration,
    activeLineId,
    togglePlay,
    goToNext,
    goToPrev,
    fastForward,
    rewind,
    toggleMute,
    handleVolumeChange,
    cycleRepeat,
    autoNext,
    toggleAutoNext,
    handleSeek,
    selectLesson,
    setPlaybackRate,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handlePlay,
    handlePause,
  };
}
