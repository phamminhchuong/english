import { useState, useRef, useEffect } from "react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  lesson,
  isPlaying,
  isMuted,
  volume,
  playbackRate,
  repeatMode,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrev,
  onFastForward,
  onRewind,
  onToggleMute,
  onVolumeChange,
  onCycleRepeat,
  onSeek,
  onSpeedChange,
  autoNext,
  onToggleAutoNext,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const [showVolume, setShowVolume] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const volumeRef = useRef(null);
  const speedRef = useRef(null);

  // Close popups on outside click
  useEffect(() => {
    function handleClick(e) {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolume(false);
      }
      if (speedRef.current && !speedRef.current.contains(e.target)) {
        setShowSpeed(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const repeatLabel = repeatMode === "off" ? "Repeat off" : repeatMode === "all" ? "Repeat all" : "Repeat one";
  const repeatOpacity = repeatMode === "off" ? 0.4 : 1;

  return (
    <footer className="audio-player" aria-label="Audio player controls">
      {/* Top: Progress Bar (full width) */}
      <div className="player-progress-row">
        <span className="player-time">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-bar"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          aria-label="Seek"
          style={{ "--progress": `${progress}%` }}
        />
        <span className="player-time">{formatTime(duration)}</span>
      </div>

      {/* Bottom: Controls Row */}
      <div className="player-bottom-row">
        {/* Left: Lesson info */}
        <div className="player-info">
          <div className="player-thumb">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="#F97316" strokeWidth="2" />
              <path d="M9 9l6 3-6 3V9z" fill="#F97316" />
            </svg>
          </div>
          <div className="player-info-text">
            <span className="player-lesson-title">
              {lesson ? lesson.title : "No lesson selected"}
            </span>
            <span className="player-lesson-level">
              {lesson ? `${lesson.level} · #${String(lesson.id).padStart(3, "0")}` : ""}
            </span>
          </div>
        </div>

        {/* Center: Main controls */}
        <div className="player-controls">
          {/* Repeat */}
          <button
            className="ctrl-btn ctrl-secondary"
            onClick={onCycleRepeat}
            title={repeatLabel}
            aria-label={repeatLabel}
            style={{ opacity: repeatOpacity }}
          >
            {repeatMode === "one" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                <text x="9" y="16" fontSize="6" fill="currentColor" stroke="none">1</text>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            )}
          </button>

          {/* Rewind 15s — << double triangle */}
          <button className="ctrl-btn ctrl-secondary" onClick={() => onRewind(15)} aria-label="Rewind 15 seconds" title="Rewind 15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6v12l-8.5-6zm-9 0v12l-8.5-6z" />
            </svg>
          </button>

          {/* Previous */}
          <button className="ctrl-btn ctrl-secondary" onClick={onPrev} aria-label="Previous lesson">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            className="ctrl-btn ctrl-play"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button className="ctrl-btn ctrl-secondary" onClick={onNext} aria-label="Next lesson">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zm-10 0v12l8.5-6z" />
            </svg>
          </button>

          {/* Fast Forward 15s — >> double triangle */}
          <button className="ctrl-btn ctrl-secondary" onClick={() => onFastForward(15)} aria-label="Fast forward 15 seconds" title="Forward 15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            </svg>
          </button>

          {/* Auto Next toggle */}
          <button
            className={`ctrl-btn ctrl-secondary auto-next-btn${autoNext ? " active" : ""}`}
            onClick={onToggleAutoNext}
            title={autoNext ? "Auto Next: ON" : "Auto Next: OFF"}
            aria-label={autoNext ? "Disable auto next" : "Enable auto next"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Right: Speed + Volume */}
        <div className="player-right">
          {/* Speed popup */}
          <div className="speed-popup-wrapper" ref={speedRef}>
            <button
              className={`ctrl-btn ctrl-secondary speed-toggle${showSpeed ? " active" : ""}`}
              onClick={() => setShowSpeed((v) => !v)}
              title="Playback speed"
              aria-label="Playback speed"
            >
              <span className="speed-current">{playbackRate}x</span>
            </button>
            {showSpeed && (
              <div className="speed-popup">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    className={`speed-popup-btn${playbackRate === s ? " active" : ""}`}
                    onClick={() => { onSpeedChange(s); setShowSpeed(false); }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume vertical popup */}
          <div className="volume-popup-wrapper" ref={volumeRef}>
            <button
              className={`ctrl-btn ctrl-secondary volume-toggle${showVolume ? " active" : ""}`}
              onClick={() => setShowVolume((v) => !v)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.05-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            {showVolume && (
              <div className="volume-popup">
                <span className="volume-popup-pct">{isMuted ? 0 : Math.round(volume * 100)}%</span>
                <input
                  type="range"
                  className="volume-vertical-bar"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  aria-label="Volume"
                  style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <button
                  className="volume-mute-btn"
                  onClick={onToggleMute}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
