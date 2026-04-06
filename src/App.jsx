import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ConversationView from "./components/ConversationView";
import AudioPlayer from "./components/AudioPlayer";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { lessons } from "./data/lessons";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Auto open/close sidebar based on screen size
  useEffect(() => {
    const handler = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const {
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
  } = useAudioPlayer(lessons);

  // Keyboard shortcuts: Space = play/pause, ArrowLeft = rewind 15s, ArrowRight = fast forward 15s
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rewind(15);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        fastForward(15);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, rewind, fastForward]);

  return (
    <div className={`app-layout${sidebarOpen ? "" : " sidebar-closed"}`}>
      <audio
        ref={audioRef}
        src={currentLesson?.audioSrc ?? ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        preload="metadata"
      />
      <Sidebar
        lessons={lessons}
        currentLessonIndex={currentLessonIndex}
        onSelect={(idx) => { selectLesson(idx); if (window.innerWidth < 768) setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />



      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="main-content">
        <ConversationView
          lesson={currentLesson}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
        />
      </main>
      <AudioPlayer
        lesson={currentLesson}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        playbackRate={playbackRate}
        repeatMode={repeatMode}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlay}
        onNext={goToNext}
        onPrev={goToPrev}
        onFastForward={fastForward}
        onRewind={rewind}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onCycleRepeat={cycleRepeat}
        onSeek={handleSeek}
        onSpeedChange={setPlaybackRate}
        autoNext={autoNext}
        onToggleAutoNext={toggleAutoNext}
      />
    </div>
  );
}


