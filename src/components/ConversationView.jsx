import { useState } from "react";

const SPEAKER_COLORS = [
  "#60A5FA", "#F97316", "#4ADE80", "#E879F9", "#FACC15", "#34D399",
];

function getSpeakerColor(speaker, speakerMap) {
  if (!speakerMap[speaker]) {
    const idx = Object.keys(speakerMap).length % SPEAKER_COLORS.length;
    speakerMap[speaker] = SPEAKER_COLORS[idx];
  }
  return speakerMap[speaker];
}

function VocabSection({ title, items, activeVocab, setActiveVocab, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="vocab-section" aria-label={title}>
      <h2 className="section-heading">
        {icon}
        {title} ({items.length})
      </h2>
      <div className="vocab-grid">
        {items.map((item, idx) => {
          const key = `${title}-${item.word}-${idx}`;
          const isOpen = activeVocab === key;
          return (
            <button
              key={key}
              className={`vocab-card${isOpen ? " open" : ""}`}
              onClick={() => setActiveVocab(isOpen ? null : key)}
              aria-expanded={isOpen}
            >
              <div className="vocab-card-top">
                <div>
                  <span className="vocab-word">{item.word}</span>
                  {item.phonetic && (
                    <span className="vocab-phonetic">{item.phonetic}</span>
                  )}
                </div>
                {item.partOfSpeech && (
                  <span className="vocab-pos">{item.partOfSpeech}</span>
                )}
              </div>
              {isOpen && (
                <div className="vocab-card-body">
                  <p className="vocab-definition">{item.definition}</p>
                  {item.example && (
                    <p className="vocab-example">
                      <span className="vocab-example-label">Example: </span>
                      &ldquo;{item.example}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ConversationView({ lesson, sidebarOpen, onToggleSidebar }) {
  const [activeVocab, setActiveVocab] = useState(null);
  const speakerMap = {};

  if (!lesson) {
    return (
      <div className="conversation-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="#312E81" strokeWidth="2" />
          <path d="M9 9l6 3-6 3V9z" fill="#312E81" />
        </svg>
        <p>Select a lesson to start learning</p>
      </div>
    );
  }

  const keyIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z"
        stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const suppIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 6v6l4 2M12 2a10 10 0 100 20 10 10 0 000-20z"
        stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="conversation-view">
      <header className="conversation-header">
        <button
          className="sidebar-toggle-inline"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="conversation-title-block">
          <h1 className="conversation-title">{lesson.title}</h1>
          <div className="conversation-meta">
            <span className="tag tag-level">{lesson.level}</span>
            <span className="tag tag-id">#{String(lesson.id).padStart(3, "0")}</span>
          </div>
        </div>
      </header>

      <div className="conversation-body">
        {/* Transcript Section */}
        <section className="transcript-section" aria-label="Conversation transcript">
          <h2 className="section-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 12h8M8 8h5M5 4h14a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z"
                stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Conversation
          </h2>
          <div className="transcript-lines">
            {lesson.transcript.map((line) => {
              const color = getSpeakerColor(line.speaker, speakerMap);
              return (
                <div
                  key={line.id}
                  className="transcript-line"
                >
                  <div className="speaker-avatar" style={{ backgroundColor: `${color}22`, borderColor: color }}>
                    <span style={{ color }}>{line.speaker[0]}</span>
                  </div>
                  <div className="line-body">
                    <strong className="speaker-name" style={{ color }}>{line.speaker}</strong>
                    <p className="line-text">{line.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Key Vocabulary */}
        <VocabSection
          title="Key Vocabulary"
          items={lesson.keyVocab}
          activeVocab={activeVocab}
          setActiveVocab={setActiveVocab}
          icon={keyIcon}
        />

        {/* Supplementary Vocabulary */}
        <VocabSection
          title="Supplementary Vocabulary"
          items={lesson.suppVocab}
          activeVocab={activeVocab}
          setActiveVocab={setActiveVocab}
          icon={suppIcon}
        />
      </div>
    </div>
  );
}
