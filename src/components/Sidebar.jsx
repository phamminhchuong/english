import { useState } from "react";
import { levels } from "../data/lessons";

const LEVEL_PALETTE = [
  "#4ADE80", "#60A5FA", "#FACC15", "#F97316", "#E879F9",
  "#34D399", "#FB7185", "#A78BFA", "#38BDF8", "#FCA5A5",
];

function getLevelColor(level) {
  if (level === "All") return "#94A3B8";
  const idx = levels.indexOf(level);
  return LEVEL_PALETTE[Math.max(0, idx - 1) % LEVEL_PALETTE.length];
}

export default function Sidebar({
  lessons,
  currentLessonIndex,
  onSelect,
  isOpen,
  onClose,
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = lessons.filter((l) => {
    const matchLevel = filter === "All" || l.level === filter;
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.level.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <aside className={`sidebar${isOpen ? " open" : " hidden"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-row">
          <div className="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="#F97316" strokeWidth="2" />
              <path d="M9 9l6 3-6 3V9z" fill="#F97316" />
            </svg>
            <span className="sidebar-logo-text">EnglishPod</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar" title="Close sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <input
          className="sidebar-search"
          type="text"
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search lessons"
        />

        <select
          className="sidebar-level-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by level"
        >
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl === "All" ? "All Levels" : lvl}
            </option>
          ))}
        </select>
      </div>

      <p className="sidebar-count">{filtered.length} lesson{filtered.length !== 1 ? "s" : ""}</p>

      <nav className="lesson-list" aria-label="Lesson list">
        {filtered.length === 0 ? (
          <p className="sidebar-empty">No lessons found.</p>
        ) : (
          filtered.map((lesson) => {
            const realIdx = lessons.indexOf(lesson);
            const isActive = realIdx === currentLessonIndex;
            return (
              <button
                key={lesson.id}
                className={`lesson-item${isActive ? " active" : ""}`}
                onClick={() => onSelect(realIdx)}
                aria-current={isActive ? "true" : undefined}
              >
                <div className="lesson-item-top">
                  <span className="lesson-number">{String(lesson.id).padStart(3, "0")}</span>
                  <span
                    className="lesson-level-badge"
                    style={{ color: getLevelColor(lesson.level) }}
                  >
                    {lesson.level}
                  </span>
                </div>
                <p className="lesson-title">{lesson.title}</p>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
