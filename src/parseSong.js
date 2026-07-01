const LYRICS_SECTIONS = new Set([
  "Refrain", "Verse 1", "Verse 2", "Verse 3", "Verse 4", "Verse 5",
  "Verse 6", "Verse 7", "Verse 8", "Bridge", "Chorus", "Intro", "Outro", "Coda",
]);

function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, rest: text };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (key) meta[key] = val;
  }
  return { meta, rest: text.slice(match[0].length).trim() };
}

function parseLyricsBlock(lines) {
  const sections = [];
  let current = null;
  let pendingLine = null;

  const flushPending = () => {
    if (pendingLine && current) {
      current.lines.push(pendingLine);
      pendingLine = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      flushPending();
      current = { label: sectionMatch[1], lines: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;

    if (line.startsWith("T: ")) {
      flushPending();
      pendingLine = { trans: line.slice(3), bn: "", en: "" };
    } else if (line.startsWith("B: ") && pendingLine) {
      pendingLine.bn = line.slice(3);
    } else if (line.startsWith("E: ") && pendingLine) {
      pendingLine.en = line.slice(3);
    } else if (line === "" && pendingLine) {
      flushPending();
    }
  }
  flushPending();
  return sections;
}

export function parseSong(text) {
  const { meta, rest } = parseFrontMatter(text);

  const blocks = {};
  let currentBlock = null;
  const lyricLines = [];
  const allLines = rest.split("\n");

  for (const raw of allLines) {
    const line = raw.trimEnd();
    const blockMatch = line.match(/^\[(.+)\]$/);
    if (blockMatch) {
      const name = blockMatch[1];
      if (LYRICS_SECTIONS.has(name)) {
        currentBlock = "__lyrics__";
        lyricLines.push(line);
      } else {
        currentBlock = name;
        if (!blocks[name]) blocks[name] = [];
      }
      continue;
    }
    if (currentBlock === "__lyrics__") {
      lyricLines.push(raw);
    } else if (currentBlock) {
      blocks[currentBlock].push(raw);
    }
  }

  const sections = parseLyricsBlock(lyricLines);

  const parseGlossary = (lines = []) =>
    lines
      .filter((l) => l.trim() && l.includes("|"))
      .map((l) => {
        const [word, bn, ...rest] = l.split("|").map((s) => s.trim());
        return { word, bn, meaning: rest.join("|").trim() };
      });

  const parseBullets = (lines = []) =>
    lines
      .filter((l) => l.trim().startsWith("- "))
      .map((l) => l.trim().slice(2));

  const parseLinks = (lines = []) =>
    lines
      .filter((l) => l.trim() && l.includes("|"))
      .map((l) => {
        const idx = l.lastIndexOf("|");
        return { title: l.slice(0, idx).trim(), url: l.slice(idx + 1).trim() };
      });

  const joinText = (lines = []) => lines.join("\n").trim();

  const parseTags = (lines = []) =>
    lines
      .join(",")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  return {
    id: Number(meta.id),
    title: meta.title || "",
    titleBn: meta.titleBn || "",
    lyricist: meta.lyricist || "",
    lyricistBn: meta.lyricistBn || "",
    genre: meta.genre || "",
    key: meta.key || "",
    instruments: meta.instruments || "",
    duration: meta.duration || "",
    sections,
    glossary: parseGlossary(blocks["Glossary"]),
    notes: joinText(blocks["Arrangement"]),
    discussion: {
      summary: joinText(blocks["Discussion.Summary"]),
      lyricistNote: joinText(blocks["Discussion.Lyricist"]),
      talkingPoints: parseBullets(blocks["Discussion.Points"]),
      keyAspects: parseBullets(blocks["Discussion.KeyAspects"]),
    },
    tags: parseTags(blocks["Tags"]),
    reference: parseLinks(blocks["Reference"]),
    ourRecording: parseLinks(blocks["OurRecording"]),
  };
}
