# Podcast English App

A React + Vite web app for learning English with podcast lessons, transcripts, vocabulary cards, and a custom audio player.

## Demo

- Live site: https://phamminhchuong.github.io/english/

## Features

- Lesson sidebar with search and level filtering.
- Conversation transcript view for each lesson.
- Key Vocabulary and Supplementary Vocabulary sections.
- Audio player with:
	- Play/Pause, Previous/Next lesson
	- Rewind/Fast-forward 15 seconds
	- Seek bar with current time and total duration
	- Repeat modes: Off, Repeat All, Repeat One
	- Auto Next toggle
	- Playback speed selector
	- Volume popup and mute toggle
- Keyboard shortcuts:
	- Space: Play/Pause
	- Arrow Left: Rewind 15s
	- Arrow Right: Forward 15s
- Responsive layout for desktop and mobile.
- Current lesson index persisted in localStorage.

## Tech Stack

- React 18
- Vite 5
- ESLint 9
- Plain CSS (custom design system in App.css)

## Project Structure

```text
podcast-english-app/
	public/
	scripts/
		convert-to-json.cjs
	src/
		components/
			AudioPlayer.jsx
			ConversationView.jsx
			Sidebar.jsx
		data/
			lessons.js
			lessons.json
			conversation_and_vocab/
		hooks/
			useAudioPlayer.js
		utils/
			parseLesson.js
		App.jsx
		App.css
		main.jsx
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### Install and Run

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually http://localhost:5173).

## Available Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build production bundle to dist/.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint.
- `npm run deploy`: Publish dist/ to GitHub Pages (via gh-pages).

## Data Pipeline

The app reads lesson data from:

- `src/data/lessons.json`

To regenerate JSON data from raw HTML files, run:

```bash
node scripts/convert-to-json.cjs
```

Notes:

- The conversion script expects source files in `../../../CRAW_DATA` relative to this project.
- Audio URLs are generated from archive.org in the script.

## Deployment (GitHub Pages)

This project is configured for GitHub Pages:

- `homepage` is set in package.json.
- `base` is set to `/english/` in vite.config.js.

Deploy command:

```bash
npm run deploy
```

## Development Notes

- Main app orchestration: `src/App.jsx`
- Audio state and controls: `src/hooks/useAudioPlayer.js`
- UI sections: `src/components/*`
- Parser utility (HTML to lesson shape): `src/utils/parseLesson.js`

## Roadmap Ideas

- Transcript line highlight synced with playback time.
- Bookmark and history for lessons.
- Offline caching and PWA support.
- Multi-language UI (EN/VI).

## License

No license file is currently included in this repository.
