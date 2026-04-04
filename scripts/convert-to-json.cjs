/**
 * Convert all CRAW_DATA/tab_*.html → src/data/lessons.json
 * Run: node scripts/convert-to-json.js
 */
const fs = require("fs");
const path = require("path");

const HTML_DIR = path.resolve(__dirname, "../../../CRAW_DATA");
const OUT_FILE = path.resolve(__dirname, "../src/data/lessons.json");
const MP3_BASE = "https://archive.org/download/englishpod_all";

// ── Regex helpers ────────────────────────────────────────────────────────────
function extractFirst(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : "";
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, ""));
}

// ── Parse h1: "Level - Title" ────────────────────────────────────────────────
function parseHeader(html) {
  const raw = stripTags(extractFirst(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const idx = raw.indexOf(" - ");
  if (idx !== -1) {
    const level = raw.slice(0, idx).trim();
    const title = raw.slice(idx + 3).trim().replace(/\s*\(C\d+\)\s*$/, "");
    return { level, title };
  }
  return { level: "General", title: raw || "Untitled" };
}

// ── Parse dialogue ───────────────────────────────────────────────────────────
function parseTranscript(html) {
  // Extract all speakers and texts independently then pair them
  const speakers = [];
  const texts = [];
  const speakerRe = /<div[^>]*class="speaker"[^>]*>(.*?)<\/div>/gi;
  const textRe = /<div[^>]*class="text"[^>]*>(.*?)<\/div>/gi;
  let m;
  while ((m = speakerRe.exec(html)) !== null) speakers.push(stripTags(m[1]));
  while ((m = textRe.exec(html)) !== null) texts.push(stripTags(m[1]));

  const transcript = [];
  const len = Math.min(speakers.length, texts.length);
  for (let i = 0; i < len; i++) {
    if (speakers[i] && texts[i]) {
      transcript.push({ id: i + 1, speaker: speakers[i], text: texts[i] });
    }
  }
  return transcript;
}

// ── Parse vocab blocks ───────────────────────────────────────────────────────
function parseVocabBlock(blockHtml, transcript) {
  // Extract each field array independently (avoids nested-div regex issues)
  const words = [];
  const types = [];
  const defs = [];
  const wordRe = /<div[^>]*class="word"[^>]*>(.*?)<\/div>/gi;
  const typeRe = /<div[^>]*class="type"[^>]*>(.*?)<\/div>/gi;
  const defRe  = /<div[^>]*class="definition"[^>]*>(.*?)<\/div>/gi;
  let m;
  while ((m = wordRe.exec(blockHtml)) !== null) words.push(stripTags(m[1]));
  while ((m = typeRe.exec(blockHtml)) !== null) types.push(stripTags(m[1]));
  while ((m = defRe.exec(blockHtml))  !== null) defs.push(stripTags(m[1]));

  const items = [];
  const len = words.length;
  for (let i = 0; i < len; i++) {
    const word = words[i];
    if (!word) continue;
    const type = types[i] || "";
    const definition = defs[i] || "";

    // Auto-extract example from transcript
    let example = "";
    const wordLower = word.toLowerCase();
    for (const line of transcript) {
      if (line.text.toLowerCase().includes(wordLower)) {
        example = line.text;
        break;
      }
    }

    const partOfSpeech = type || (word.includes(" ") ? "phrase" : "word");
    items.push({ word, phonetic: "", partOfSpeech, definition, example });
  }
  return items;
}

function parseVocab(html, transcript) {
  // Split into sections by <h2>
  const sections = html.split(/<h2[^>]*>[\s\S]*?<\/h2>/i);
  // sections[0] = before first h2 (dialogue area)
  // sections[1] = Key Vocabulary block
  // sections[2] = Supplementary Vocabulary block

  const keyVocab = sections[1] ? parseVocabBlock(sections[1], transcript) : [];
  const suppVocab = sections[2] ? parseVocabBlock(sections[2], transcript) : [];

  return { keyVocab, suppVocab };
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const files = fs
    .readdirSync(HTML_DIR)
    .filter((f) => /^tab_\d+\.html$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });

  console.log(`Found ${files.length} HTML files`);

  const lessons = [];

  for (const file of files) {
    const idx = parseInt(file.match(/\d+/)[0], 10);
    const html = fs.readFileSync(path.join(HTML_DIR, file), "utf8");

    const { level, title } = parseHeader(html);
    const transcript = parseTranscript(html);
    const { keyVocab, suppVocab } = parseVocab(html, transcript);

    const num = String(idx + 1).padStart(4, "0");
    const audioSrc = `${MP3_BASE}/englishpod_${num}pb.mp3`;

    lessons.push({
      id: idx + 1,
      title,
      level,
      audioSrc,
      transcript,
      keyVocab,
      suppVocab,
    });

    if ((idx + 1) % 50 === 0) process.stdout.write(`  Processed ${idx + 1}/${files.length}\r`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(lessons, null, 2), "utf8");

  const size = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`\nDone! Written ${lessons.length} lessons to lessons.json (${size} KB)`);
}

main();
