/**
 * Parse an EnglishPod HTML lesson fragment into structured data.
 * Supplements missing vocab-phonetic, vocab-pos, and vocab-example.
 */
export function parseLesson(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // --- Title & Level ---
  const h1 = doc.querySelector("h1");
  let level = "General";
  let title = "Untitled";

  if (h1) {
    const raw = h1.textContent.replace(/\u00a0/g, " ").trim();
    const idx = raw.indexOf(" - ");
    if (idx !== -1) {
      level = raw.slice(0, idx).trim();
      title = raw
        .slice(idx + 3)
        .trim()
        .replace(/\s*\(C\d+\)\s*$/, ""); // strip codes like (C0201)
    } else {
      title = raw;
    }
  }

  // --- Transcript ---
  const transcript = [];
  doc.querySelectorAll(".dialogue-block .line").forEach((el, i) => {
    const speaker = el.querySelector(".speaker")?.textContent.trim();
    const text = el
      .querySelector(".text")
      ?.textContent.replace(/\s+/g, " ")
      .trim();
    if (speaker && text) {
      transcript.push({ id: i + 1, speaker, text });
    }
  });

  // --- Vocabulary helper ---
  const parseBlock = (block) => {
    const items = [];
    block.querySelectorAll(".vocab-item").forEach((item) => {
      const word = item.querySelector(".word")?.textContent.trim() || "";
      const type = item.querySelector(".type")?.textContent.trim() || "";
      const definition =
        item.querySelector(".definition")?.textContent.trim() || "";
      if (!word) return;

      // Supplement missing example: auto-extract from transcript
      let example = "";
      const wordLower = word.toLowerCase();
      for (const line of transcript) {
        if (line.text.toLowerCase().includes(wordLower)) {
          example = line.text;
          break;
        }
      }

      // Supplement missing partOfSpeech with smart default
      const partOfSpeech = type || guessPartOfSpeech(word);

      items.push({
        word,
        phonetic: "", // no phonetic data in HTML source
        partOfSpeech,
        definition,
        example,
      });
    });
    return items;
  };

  // Parse Key Vocabulary + Supplementary Vocabulary blocks
  const blocks = doc.querySelectorAll(".vocab-block");
  const keyVocab = blocks.length > 0 ? parseBlock(blocks[0]) : [];
  const suppVocab = blocks.length > 1 ? parseBlock(blocks[1]) : [];

  return { level, title, transcript, keyVocab, suppVocab };
}

/** Guess a generic POS label when the HTML leaves it empty. */
function guessPartOfSpeech(word) {
  if (word.includes(" ")) return "phrase";
  return "word";
}
