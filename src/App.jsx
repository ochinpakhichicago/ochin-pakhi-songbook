import { useState, useCallback, useMemo, useEffect } from "react";
import { parseSong } from "./parseSong";
import { QRCodeSVG } from "qrcode.react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import STATIC_SETLISTS from "./setlists.json";

const rawFiles = import.meta.glob("./songs/*.md", { query: "?raw", import: "default", eager: true });
const SONGS = Object.values(rawFiles)
  .map(parseSong)
  .sort((a, b) => a.id - b.id);

const MEMBER_PASSWORD = import.meta.env.VITE_MEMBER_PASSWORD;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME || "admin").toLowerCase();

const GENRES = [
  "All", "Baul", "Rabindrasangeet", "Nazrulgiti",
  "Bhatiyali", "Jhumur", "Qawwali", "Jit-sangeet",
];

// ─── Styles ───
const colors = {
  bg: "#FAF6EF",
  surface: "#FFFFFF",
  surfaceHover: "#F5F0E6",
  border: "#E2DAC8",
  text: "#2C1810",
  textMuted: "#7A6E5E",
  accent: "#B35A38",
  accentLight: "#FCEEE8",
  accentDark: "#8C3F24",
  gold: "#B8956A",
  goldLight: "#F5EDE0",
  tag: "#E8DFD0",
  green: "#5B7A52",
  greenLight: "#EDF3EB",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  bengali: "'Noto Sans Bengali', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── Password Gate ───
function PasswordGate({ onUnlock }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) { triggerShake("Please enter your name."); return; }
    const isAdmin = trimmedName.toLowerCase() === ADMIN_USERNAME && pw === ADMIN_PASSWORD;
    const isMember = pw === MEMBER_PASSWORD;
    if (!isAdmin && !isMember) { triggerShake("Incorrect password. Try again."); return; }
    onUnlock({ name: trimmedName, role: isAdmin ? "admin" : "member" });
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px",
    fontSize: 16,
    border: `1.5px solid ${hasError ? colors.accent : colors.border}`,
    borderRadius: 10,
    outline: "none",
    fontFamily: font.body,
    background: colors.surface,
    color: colors.text,
    marginBottom: 10,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(160deg, ${colors.bg} 0%, #EDE5D5 100%)`,
        fontFamily: font.body,
        padding: 24,
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          maxWidth: 360,
          animation: shake ? "shake 0.4s ease" : "none",
        }}
      >
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-8px)}
            40%{transform:translateX(8px)}
            60%{transform:translateX(-5px)}
            80%{transform:translateX(5px)}
          }
        `}</style>
        <div
          style={{
            fontFamily: font.bengali,
            fontSize: 42,
            color: colors.accent,
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          অচিন পাখি
        </div>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 20,
            color: colors.text,
            marginBottom: 32,
            fontWeight: 600,
          }}
        >
          Songbook
        </div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
          style={inputStyle(false)}
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ ...inputStyle(!!error), paddingRight: 46, marginBottom: 0 }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: 18, padding: 4, lineHeight: 1 }}
            tabIndex={-1}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
        <div style={{ marginBottom: 10 }} />
        {error && (
          <div style={{ color: colors.accent, fontSize: 13, marginBottom: 10 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "13px 0",
            background: colors.accent,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: font.body,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}

// ─── Song List ───
function SongList({ songs, onSelect, searchState }) {
  const [search, setSearch] = searchState;
  const [genreFilter, setGenreFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return songs.filter((s) => {
      const matchesGenre =
        genreFilter === "All" ||
        s.genre.toLowerCase().includes(genreFilter.toLowerCase());
      if (!matchesGenre) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.lyricist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.titleBn.includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [songs, search, genreFilter]);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body }}>
      {/* Header */}
      <div
        style={{
          padding: "28px 20px 16px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: font.bengali,
              fontSize: 24,
              color: colors.accent,
              fontWeight: 700,
            }}
          >
            অচিন পাখি
          </span>
          <span
            style={{
              fontFamily: font.display,
              fontSize: 18,
              color: colors.text,
              fontWeight: 600,
            }}
          >
            Songbook
          </span>
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
          {songs.length} songs
        </div>
        <input
          type="text"
          placeholder="Search by title, lyricist, genre, or theme…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "11px 14px",
            fontSize: 16,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            outline: "none",
            fontFamily: font.body,
            background: colors.bg,
            color: colors.text,
            minHeight: 44,
          }}
        />

        {/* Genre chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 2,
          }}
        >
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontFamily: font.body,
                cursor: "pointer",
                fontWeight: genreFilter === g ? 600 : 400,
                background: genreFilter === g ? colors.accent : colors.tag,
                color: genreFilter === g ? "#fff" : colors.text,
                minHeight: 32,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Song cards */}
      <div style={{ padding: "14px 16px 100px" }}>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: colors.textMuted,
              padding: 40,
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            No songs match your search.
          </div>
        )}
        {filtered.map((song) => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 10,
              cursor: "pointer",
              fontFamily: font.body,
              minHeight: 44,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 8px rgba(44,24,16,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: font.display,
                    fontSize: 17,
                    fontWeight: 600,
                    color: colors.text,
                    lineHeight: 1.3,
                  }}
                >
                  {song.title}
                </div>
                <div
                  style={{
                    fontFamily: font.bengali,
                    fontSize: 15,
                    color: colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  {song.titleBn}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: colors.green,
                    background: colors.greenLight,
                    padding: "3px 9px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  #{song.id}
                </span>
                {song._local && (
                  <span
                    style={{
                      fontSize: 10,
                      color: colors.textMuted,
                      background: colors.tag,
                      padding: "1px 7px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    local
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {song.lyricist}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: colors.accent,
                  background: colors.accentLight,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {song.genre}
              </span>
              {song.duration && (
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {song.duration}
                </span>
              )}
            </div>
            {song.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                  marginTop: 7,
                }}
              >
                {song.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch(tag);
                    }}
                    style={{
                      fontSize: 11,
                      color: colors.textMuted,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      padding: "1px 7px",
                      borderRadius: 20,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Song Detail ───
function SongDetail({ song, onBack, onPlay, backLabel = "All Songs" }) {
  const [tab, setTab] = useState("lyrics");
  const [activeWord, setActiveWord] = useState(null);

  const tabs = [
    { key: "lyrics", label: "Lyrics" },
    { key: "glossary", label: "Glossary" },
    { key: "notes", label: "Arrangement" },
    { key: "reference", label: "Listen & Learn" },
    { key: "ours", label: "Our Recording" },
    { key: "discussion", label: "Discussion" },
  ];

  const wordLookup = useMemo(() => {
    const map = {};
    song.glossary.forEach((g) => {
      g.word
        .toLowerCase()
        .split(" ")
        .forEach((w) => (map[w] = g));
      map[g.word.toLowerCase()] = g;
    });
    return map;
  }, [song]);

  const renderTransLine = useCallback(
    (line) => {
      const words = line.split(/(\s+)/);
      return words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const match = wordLookup[clean];
        if (match) {
          const isActive = activeWord && activeWord.word === match.word;
          return (
            <span
              key={i}
              onClick={() => setActiveWord(isActive ? null : match)}
              style={{
                borderBottom: `2px dotted ${colors.gold}`,
                cursor: "pointer",
                background: isActive ? colors.goldLight : "transparent",
                borderRadius: isActive ? 3 : 0,
                padding: "0 1px",
                transition: "background 0.15s",
              }}
            >
              {w}
            </span>
          );
        }
        return <span key={i}>{w}</span>;
      });
    },
    [wordLookup, activeWord]
  );

  const d = song.discussion;
  const hasDiscussion =
    d.summary || d.lyricistNote || d.talkingPoints.length || d.keyAspects.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: font.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 14px",
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: colors.accent,
            fontFamily: font.body,
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 0",
            fontWeight: 500,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← {backLabel}
        </button>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 22,
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1.25,
              }}
            >
              {song.title}
            </div>
            <div
              style={{
                fontFamily: font.bengali,
                fontSize: 18,
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              {song.titleBn}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.green,
              background: colors.greenLight,
              padding: "3px 9px",
              borderRadius: 20,
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginTop: 4,
            }}
          >
            #{song.id}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            {song.lyricist}{song.lyricistBn ? ` (${song.lyricistBn})` : ""}
          </span>
          <span
            style={{
              fontSize: 11,
              color: colors.accent,
              background: colors.accentLight,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {song.genre}
          </span>
          {song.key && (
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {song.key}
            </span>
          )}
          {song.duration && (
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {song.duration}
            </span>
          )}
        </div>
        {song.instruments && (
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            {song.instruments}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          padding: "0 18px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setActiveWord(null);
            }}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                tab === t.key
                  ? `2.5px solid ${colors.accent}`
                  : "2.5px solid transparent",
              padding: "12px 14px 10px",
              fontSize: 14,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? colors.accent : colors.textMuted,
              cursor: "pointer",
              fontFamily: font.body,
              transition: "color 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
              minHeight: 44,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px 18px 100px" }}>
        {/* ── Lyrics ── */}
        {tab === "lyrics" && (
          <div>
            <div
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              Tap{" "}
              <span
                style={{
                  borderBottom: `2px dotted ${colors.gold}`,
                  padding: "0 2px",
                }}
              >
                highlighted words
              </span>{" "}
              to see meanings
            </div>
            {song.sections.map((sec, si) => (
              <div key={si} style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  {sec.label}
                </div>
                {sec.lines.map((line, li) => (
                  <div key={li} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 16,
                        color: colors.text,
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {renderTransLine(line.trans)}
                    </div>
                    {line.bn && (
                      <div
                        style={{
                          fontFamily: font.bengali,
                          fontSize: 15,
                          color: colors.textMuted,
                          lineHeight: 1.6,
                          marginTop: 1,
                        }}
                      >
                        {line.bn}
                      </div>
                    )}
                    {line.en && (
                      <div
                        style={{
                          fontSize: 13,
                          color: colors.accent,
                          fontStyle: "italic",
                          lineHeight: 1.45,
                          marginTop: 2,
                        }}
                      >
                        {line.en}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Glossary ── */}
        {tab === "glossary" && (
          <div>
            {song.glossary.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: colors.textMuted,
                  padding: 40,
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                No glossary entries yet.
              </div>
            ) : (
              song.glossary.map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom:
                      i < song.glossary.length - 1
                        ? `1px solid ${colors.border}`
                        : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 110, flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>
                      {g.word}
                    </div>
                    <div
                      style={{
                        fontFamily: font.bengali,
                        fontSize: 14,
                        color: colors.textMuted,
                      }}
                    >
                      {g.bn}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: colors.text,
                      lineHeight: 1.45,
                      paddingTop: 1,
                    }}
                  >
                    {g.meaning}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Arrangement Notes ── */}
        {tab === "notes" && (
          <div>
            {song.notes ? (
              <div
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  Arrangement & Performance Notes
                </div>
                {song.notes.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 15,
                      color: colors.text,
                      lineHeight: 1.6,
                      marginBottom: 4,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: colors.textMuted,
                  padding: 40,
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                No arrangement notes yet for this song.
              </div>
            )}
          </div>
        )}

        {/* ── Listen & Learn ── */}
        {tab === "reference" && (
          <div>
            <div
              style={{
                fontSize: 13,
                color: colors.textMuted,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Authentic and classic renditions to study the original feel.
            </div>
            {song.reference && song.reference.length > 0 ? (
              song.reference.map((link, i) => (
                <VideoCard key={i} link={link} accentBorder={false} onPlay={onPlay} />
              ))
            ) : (
              <EmptyState icon="🎵" text="No reference links yet." sub="Add YouTube URLs to the song file to embed them here." />
            )}
          </div>
        )}

        {/* ── Our Recording ── */}
        {tab === "ours" && (
          <div>
            <div
              style={{
                fontSize: 13,
                color: colors.textMuted,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Ochin Pakhi rehearsals, live performances, and studio recordings.
            </div>
            {song.ourRecording && song.ourRecording.length > 0 ? (
              song.ourRecording.map((link, i) => (
                <VideoCard key={i} link={link} accentBorder={true} onPlay={onPlay} />
              ))
            ) : (
              <div
                style={{
                  background: colors.accentLight,
                  border: `1px dashed ${colors.accent}66`,
                  borderRadius: 10,
                  padding: "36px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: font.bengali,
                    fontSize: 22,
                    color: colors.accent,
                    marginBottom: 6,
                  }}
                >
                  অচিন পাখি
                </div>
                <div style={{ fontSize: 14, color: colors.textMuted, fontStyle: "italic" }}>
                  No recordings linked yet.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Discussion ── */}
        {tab === "discussion" && (
          <div>
            {!hasDiscussion ? (
              <EmptyState
                icon="💬"
                text="No discussion notes yet."
                sub="Add a summary, lyricist context, and talking points to the song file."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {d.summary && (
                  <DiscussionSection label="About this song">
                    <p
                      style={{
                        fontFamily: font.display,
                        fontSize: 16,
                        fontStyle: "italic",
                        color: colors.text,
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {d.summary}
                    </p>
                  </DiscussionSection>
                )}
                {d.lyricistNote && (
                  <DiscussionSection label="About the lyricist">
                    <p
                      style={{
                        fontSize: 15,
                        color: colors.text,
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {d.lyricistNote}
                    </p>
                  </DiscussionSection>
                )}
                {d.talkingPoints.length > 0 && (
                  <DiscussionSection label="Talk to the audience">
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {d.talkingPoints.map((pt, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            gap: 10,
                            fontSize: 15,
                            color: colors.text,
                            lineHeight: 1.55,
                            marginBottom: i < d.talkingPoints.length - 1 ? 10 : 0,
                          }}
                        >
                          <span style={{ color: colors.gold, flexShrink: 0, fontWeight: 700 }}>•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </DiscussionSection>
                )}
                {d.keyAspects.length > 0 && (
                  <DiscussionSection label="Key aspects">
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {d.keyAspects.map((pt, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            gap: 10,
                            fontSize: 15,
                            color: colors.textMuted,
                            lineHeight: 1.55,
                            marginBottom: i < d.keyAspects.length - 1 ? 10 : 0,
                          }}
                        >
                          <span style={{ color: colors.border, flexShrink: 0, fontWeight: 700 }}>—</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </DiscussionSection>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glossary definition panel — fixed above bottom nav so it's visible anywhere in the lyrics */}
      {activeWord && tab === "lyrics" && (
        <div
          style={{
            position: "fixed",
            bottom: 60,
            left: 0,
            right: 0,
            background: colors.surface,
            borderTop: `2px solid ${colors.gold}`,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.13)",
            padding: "14px 18px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            zIndex: 200,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: colors.accent, fontSize: 15 }}>
                {activeWord.word}
              </span>
              {activeWord.bn && (
                <>
                  <span style={{ fontFamily: font.bengali, color: colors.textMuted, fontSize: 14 }}>
                    {activeWord.bn}
                  </span>
                  {typeof window !== "undefined" && window.speechSynthesis && (
                    <button
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        const u = new SpeechSynthesisUtterance(activeWord.bn);
                        u.lang = "bn-IN";
                        u.rate = 0.85;
                        window.speechSynthesis.speak(u);
                      }}
                      title="Hear pronunciation"
                      style={{ background: colors.accentLight, border: `1px solid ${colors.accent}44`, borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 14, color: colors.accent, lineHeight: 1.4, flexShrink: 0 }}
                    >
                      🔊
                    </button>
                  )}
                </>
              )}
            </div>
            <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.5 }}>
              {activeWord.meaning}
            </div>
          </div>
          <button
            onClick={() => setActiveWord(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: colors.textMuted,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
              minHeight: 44,
              minWidth: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function DiscussionSection({ label, children }) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: colors.accent,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function VideoCard({ link, accentBorder, onPlay }) {
  const youtubeId = link.url.includes("youtu.be")
    ? link.url.split("youtu.be/")[1]?.split("?")[0]
    : link.url.split("v=")[1]?.split("&")[0];

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${accentBorder ? colors.accent + "44" : colors.border}`,
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => youtubeId && onPlay && onPlay(youtubeId, link.title)}
          style={{
            background: colors.accentLight,
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            fontSize: 14,
            color: colors.accent,
          }}
        >
          ▶
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: accentBorder ? colors.accent : colors.text }}>
            {link.title}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {accentBorder ? "Ochin Pakhi" : "YouTube"} · tap ▶ to play in app
          </div>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 18, color: colors.textMuted, textDecoration: "none", flexShrink: 0, padding: "4px 4px" }}
          title="Open on YouTube"
        >
          ↗
        </a>
      </div>
    </div>
  );
}

function MiniPlayer({ nowPlaying, onClose }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => { setExpanded(true); }, [nowPlaying?.videoId]);

  if (!nowPlaying) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 200,
        background: colors.surface,
        borderTop: `2px solid ${colors.accent}44`,
        boxShadow: "0 -2px 16px rgba(44,24,16,0.15)",
      }}
    >
      {/* Always-visible header bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10 }}>
        <span style={{ fontSize: 16, color: colors.accent, flexShrink: 0 }}>♫</span>
        <div style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {nowPlaying.title}
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: colors.textMuted, padding: "4px 8px" }}
          title={expanded ? "Audio only" : "Show video"}
        >
          {expanded ? "▼ hide" : "▲ video"}
        </button>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: colors.textMuted, padding: "4px 8px", lineHeight: 1 }}
          title="Stop"
        >
          ✕
        </button>
      </div>

      {/* iframe — always mounted so audio continues; visually hidden when collapsed */}
      <div style={expanded ? {
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
      } : {
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        top: -9999,
        left: -9999,
      }}>
        <iframe
          key={nowPlaying.videoId}
          src={`https://www.youtube.com/embed/${nowPlaying.videoId}?autoplay=1`}
          title={nowPlaying.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px dashed ${colors.border}`,
        borderRadius: 10,
        padding: "36px 20px",
        textAlign: "center",
      }}
    >
      {icon && <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>}
      <div style={{ fontSize: 14, color: colors.textMuted, fontStyle: "italic" }}>
        {text}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Audience View (no password required) ───
function firstELine(song) {
  for (const sec of song.sections) {
    for (const line of sec.lines) {
      if (line.en) return line.en;
    }
  }
  return null;
}

function AudienceView({ eventName, songs }) {
  const [selected, setSelected] = useState(null);
  if (selected) return <AudienceSongDetail song={selected} eventName={eventName} onBack={() => setSelected(null)} />;
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body }}>
      <div style={{ padding: "24px 18px 16px", background: colors.surface, borderBottom: `1px solid ${colors.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Ochin Pakhi</div>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text }}>{eventName}</div>
      </div>
      <div style={{ padding: "16px 18px 40px" }}>
        {songs.map((song, idx) => {
          const preview = firstELine(song);
          return (
            <div
              key={song.id}
              onClick={() => setSelected(song)}
              style={{ background: colors.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: `1px solid ${colors.border}`, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}
            >
              <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: colors.accent, minWidth: 28, paddingTop: 2 }}>{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: 16 }}>{song.title}</div>
                {song.titleBn && <div style={{ fontFamily: font.bengali, color: colors.textMuted, fontSize: 14, marginTop: 2 }}>{song.titleBn}</div>}
                {preview && (
                  <div style={{ fontSize: 13, color: colors.textMuted, fontStyle: "italic", marginTop: 5, lineHeight: 1.5, borderLeft: `2px solid ${colors.gold}`, paddingLeft: 8 }}>
                    {preview}
                  </div>
                )}
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>{[song.lyricist, song.genre].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AudienceSongDetail({ song, eventName, onBack }) {
  const d = song.discussion;
  const allELines = song.sections.flatMap((sec) => sec.lines.filter((l) => l.en).map((l) => l.en));
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body }}>
      <div style={{ padding: "16px 18px 14px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: colors.accent, fontFamily: font.body, fontSize: 14, cursor: "pointer", padding: "4px 0", fontWeight: 500, marginBottom: 10 }}>
          ← {eventName}
        </button>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text }}>{song.title}</div>
        {song.titleBn && <div style={{ fontFamily: font.bengali, color: colors.textMuted, fontSize: 16, marginTop: 4 }}>{song.titleBn}</div>}
        {song.lyricist && <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>{[song.lyricist, song.genre].filter(Boolean).join(" · ")}</div>}
      </div>
      <div style={{ padding: "16px 18px 40px" }}>
        {d.summary && (
          <div style={{ background: colors.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 20, border: `1px solid ${colors.border}` }}>
            <div style={{ fontStyle: "italic", color: colors.textMuted, lineHeight: 1.65, fontSize: 14 }}>{d.summary}</div>
          </div>
        )}
        {d.talkingPoints.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Points of interest</div>
            {d.talkingPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: colors.textMuted, lineHeight: 1.55, marginBottom: 8 }}>
                <span style={{ color: colors.gold, flexShrink: 0 }}>•</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        )}
        {allELines.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Translation</div>
            {allELines.map((line, i) => (
              <div key={i} style={{ fontSize: 15, color: colors.text, lineHeight: 1.8, marginBottom: 4 }}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Setlists ───
function loadPersonalSetlists(userName) {
  try { return JSON.parse(localStorage.getItem(`ochin-pakhi-setlists-${userName.toLowerCase()}`) || "[]"); }
  catch { return []; }
}
function savePersonalSetlists(userName, lists) {
  localStorage.setItem(`ochin-pakhi-setlists-${userName.toLowerCase()}`, JSON.stringify(lists));
}

function QRModal({ setlist, onClose }) {
  const audienceUrl = `${window.location.origin}${window.location.pathname}#/audience/${encodeURIComponent(setlist.name)}/${setlist.songIds.join(",")}`;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: colors.surface, borderRadius: 16, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 4 }}>{setlist.name}</div>
        {(setlist.date || setlist.venue) && (
          <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>{[setlist.date, setlist.venue].filter(Boolean).join(" · ")}</div>
        )}
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
          <QRCodeSVG value={audienceUrl} size={200} fgColor={colors.text} bgColor={colors.surface} />
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, wordBreak: "break-all", lineHeight: 1.5, marginBottom: 20 }}>{audienceUrl}</div>
        <button onClick={onClose} style={{ background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 32px", fontFamily: font.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
      </div>
    </div>
  );
}

function SetlistCard({ sl, onClick }) {
  const count = sl.songIds.length;
  return (
    <div onClick={onClick} style={{ background: colors.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: `1px solid ${colors.border}`, cursor: "pointer" }}>
      <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{sl.name}</div>
      {(sl.date || sl.venue) && (
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>{[sl.date, sl.venue].filter(Boolean).join(" · ")}</div>
      )}
      <div style={{ fontSize: 13, color: colors.textMuted }}>{count === 0 ? "No songs" : `${count} song${count !== 1 ? "s" : ""}`}</div>
    </div>
  );
}

function SetlistsTab({ allSongs, user, onSelectSong }) {
  const [mySetlists, setMySetlists] = useState(() => loadPersonalSetlists(user.name));
  const [activeId, setActiveId] = useState(null);
  const [activeIsPersonal, setActiveIsPersonal] = useState(false);

  const saveMy = (updated) => { setMySetlists(updated); savePersonalSetlists(user.name, updated); };
  const createSetlist = () => {
    const sl = { id: Date.now().toString(), name: "My Setlist", date: "", venue: "", songIds: [] };
    const updated = [...mySetlists, sl];
    saveMy(updated);
    setActiveId(sl.id);
    setActiveIsPersonal(true);
  };

  const openBand = (id) => { setActiveId(id); setActiveIsPersonal(false); };
  const openMy = (id) => { setActiveId(id); setActiveIsPersonal(true); };

  if (activeId) {
    if (activeIsPersonal) {
      const sl = mySetlists.find((s) => s.id === activeId);
      if (!sl) { setActiveId(null); return null; }
      return (
        <PersonalSetlistDetail
          setlist={sl}
          allSongs={allSongs}
          onUpdate={(patch) => saveMy(mySetlists.map((s) => s.id === activeId ? { ...s, ...patch } : s))}
          onDelete={() => { saveMy(mySetlists.filter((s) => s.id !== activeId)); setActiveId(null); }}
          onBack={() => setActiveId(null)}
          onSelectSong={onSelectSong}
        />
      );
    } else {
      const sl = STATIC_SETLISTS.find((s) => s.id === activeId);
      if (!sl) { setActiveId(null); return null; }
      return <SetlistDetail setlist={sl} allSongs={allSongs} onBack={() => setActiveId(null)} onSelectSong={onSelectSong} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body, paddingBottom: 60 }}>
      <div style={{ padding: "16px 18px 14px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: colors.text }}>Setlists</span>
      </div>
      <div style={{ padding: "16px 18px 0" }}>
        {STATIC_SETLISTS.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Band</div>
            {STATIC_SETLISTS.map((sl) => <SetlistCard key={sl.id} sl={sl} onClick={() => openBand(sl.id)} />)}
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: STATIC_SETLISTS.length > 0 ? 20 : 0, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>My Setlists</div>
          <button onClick={createSetlist} style={{ background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontFamily: font.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New</button>
        </div>
        {mySetlists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0 8px", color: colors.textMuted, fontSize: 14 }}>No personal setlists yet — tap "+ New" to create one.</div>
        ) : mySetlists.map((sl) => <SetlistCard key={sl.id} sl={sl} onClick={() => openMy(sl.id)} />)}
      </div>
    </div>
  );
}

function SetlistDetail({ setlist, allSongs, onBack, onSelectSong }) {
  const [showQR, setShowQR] = useState(false);
  const songs = setlist.songIds.map((id) => allSongs.find((s) => s.id === id)).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body, paddingBottom: 80 }}>
      <div style={{ padding: "16px 18px 14px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: colors.accent, fontFamily: font.body, fontSize: 14, cursor: "pointer", padding: "4px 0", fontWeight: 500, marginBottom: 10 }}>← Setlists</button>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text }}>{setlist.name}</div>
        {(setlist.date || setlist.venue) && (
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{[setlist.date, setlist.venue].filter(Boolean).join(" · ")}</div>
        )}
      </div>
      {songs.length > 0 && (
        <div style={{ padding: "14px 18px 0" }}>
          <button onClick={() => setShowQR(true)} style={{ width: "100%", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "13px", fontFamily: font.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Share with Audience (QR)</button>
        </div>
      )}
      <div style={{ padding: "12px 18px" }}>
        {songs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontSize: 14 }}>No songs in this setlist yet.</div>
        ) : songs.map((song, idx) => (
          <div key={song.id} onClick={() => onSelectSong && onSelectSong(song)} style={{ background: colors.surface, borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ color: colors.textMuted, fontSize: 13, fontWeight: 700, minWidth: 22, textAlign: "center", flexShrink: 0 }}>{idx + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: colors.text, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
              {song.titleBn && <div style={{ fontFamily: font.bengali, fontSize: 13, color: colors.textMuted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.titleBn}</div>}
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{[song.lyricist, song.genre].filter(Boolean).join(" · ")}</div>
            </div>
            <span style={{ color: colors.textMuted, fontSize: 16, flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>
      {showQR && <QRModal setlist={setlist} onClose={() => setShowQR(false)} />}
    </div>
  );
}

function SortableSetlistSong({ song, idx, onRemove, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, background: isDragging ? colors.accentLight : colors.surface, borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: `1px solid ${isDragging ? colors.accent : colors.border}`, display: "flex", alignItems: "center", gap: 10 }}>
      <div {...attributes} {...listeners} style={{ color: colors.border, fontSize: 20, cursor: "grab", padding: "4px 6px", flexShrink: 0, touchAction: "none", userSelect: "none", lineHeight: 1 }}>⠿</div>
      <div style={{ color: colors.textMuted, fontSize: 13, fontWeight: 700, minWidth: 22, textAlign: "center" }}>{idx + 1}</div>
      <div onClick={() => onSelect && onSelect(song)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
        <div style={{ fontWeight: 600, color: colors.text, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
        {song.titleBn && <div style={{ fontFamily: font.bengali, fontSize: 13, color: colors.textMuted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.titleBn}</div>}
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{[song.lyricist, song.genre].filter(Boolean).join(" · ")}</div>
      </div>
      <button onClick={() => onRemove(song.id)} style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 20, cursor: "pointer", padding: "0 4px", minHeight: 44, minWidth: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
    </div>
  );
}

function PersonalSetlistDetail({ setlist, allSongs, onUpdate, onDelete, onBack, onSelectSong }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(setlist.name);
  const [showPicker, setShowPicker] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSelected, setPickerSelected] = useState(new Set());

  const songs = setlist.songIds.map((id) => allSongs.find((s) => s.id === id)).filter(Boolean);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }));

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      const oldIdx = setlist.songIds.indexOf(active.id);
      const newIdx = setlist.songIds.indexOf(over.id);
      onUpdate({ songIds: arrayMove(setlist.songIds, oldIdx, newIdx) });
    }
  };

  const pickerSongs = allSongs.filter((s) => {
    if (setlist.songIds.includes(s.id)) return false;
    if (!pickerSearch) return true;
    const q = pickerSearch.toLowerCase();
    return s.title.toLowerCase().includes(q) || (s.titleBn || "").includes(q) || (s.lyricist || "").toLowerCase().includes(q);
  });

  const confirmPickerAdd = () => {
    const toAdd = [...pickerSelected].filter((id) => !setlist.songIds.includes(id));
    if (toAdd.length > 0) onUpdate({ songIds: [...setlist.songIds, ...toAdd] });
    setShowPicker(false); setPickerSearch(""); setPickerSelected(new Set());
  };
  const closePicker = () => { setShowPicker(false); setPickerSearch(""); setPickerSelected(new Set()); };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: font.body, paddingBottom: 100 }}>
      <div style={{ padding: "16px 18px 14px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: colors.accent, fontFamily: font.body, fontSize: 14, cursor: "pointer", padding: "4px 0", fontWeight: 500, marginBottom: 10 }}>← Setlists</button>
        {editingName ? (
          <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => { onUpdate({ name: nameInput.trim() || setlist.name }); setEditingName(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text, border: "none", borderBottom: `2px solid ${colors.accent}`, background: "transparent", outline: "none", width: "100%", padding: "2px 0" }} />
        ) : (
          <div onClick={() => { setNameInput(setlist.name); setEditingName(true); }} style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text, cursor: "text", display: "flex", alignItems: "center", gap: 8 }}>
            {setlist.name}<span style={{ fontSize: 14, color: colors.textMuted, fontFamily: font.body, fontWeight: 400 }}>✎</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input type="date" value={setlist.date} onChange={(e) => onUpdate({ date: e.target.value })}
            style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "7px 8px", fontFamily: font.body, fontSize: 13, background: colors.bg, color: colors.text, outline: "none" }} />
          <input type="text" placeholder="Venue" value={setlist.venue} onChange={(e) => onUpdate({ venue: e.target.value })}
            style={{ flex: 2, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "7px 10px", fontFamily: font.body, fontSize: 13, background: colors.bg, color: colors.text, outline: "none" }} />
        </div>
      </div>

      {setlist.songIds.length > 0 && (
        <div style={{ padding: "14px 18px 0" }}>
          <button onClick={() => setShowQR(true)} style={{ width: "100%", background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "13px", fontFamily: font.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Share with Audience (QR)</button>
        </div>
      )}

      <div style={{ padding: "12px 18px" }}>
        {songs.length === 0 && <div style={{ textAlign: "center", padding: "28px 0 16px", color: colors.textMuted, fontSize: 14 }}>No songs yet — tap below to add.</div>}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={setlist.songIds} strategy={verticalListSortingStrategy}>
            {songs.map((song, idx) => (
              <SortableSetlistSong key={song.id} song={song} idx={idx} onRemove={(id) => onUpdate({ songIds: setlist.songIds.filter((sid) => sid !== id) })} onSelect={onSelectSong} />
            ))}
          </SortableContext>
        </DndContext>
        <button onClick={() => setShowPicker(true)} style={{ width: "100%", background: "transparent", border: `1.5px dashed ${colors.border}`, borderRadius: 10, padding: "13px", color: colors.textMuted, fontFamily: font.body, fontSize: 14, cursor: "pointer", marginTop: 4 }}>+ Add songs</button>
        <button onClick={() => { if (window.confirm(`Delete "${setlist.name}"?`)) onDelete(); }} style={{ width: "100%", background: "none", border: "none", color: colors.textMuted, fontFamily: font.body, fontSize: 13, cursor: "pointer", padding: "20px 0 4px", textDecoration: "underline" }}>Delete this setlist</button>
      </div>

      {showPicker && (
        <div onClick={(e) => { if (e.target === e.currentTarget) closePicker(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ background: colors.bg, borderRadius: "16px 16px 0 0", maxHeight: "78vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <input autoFocus type="text" placeholder="Search songs…" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)}
                style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 12px", fontFamily: font.body, fontSize: 15, background: colors.surface, outline: "none" }} />
              <button onClick={closePicker} style={{ background: "none", border: "none", fontSize: 22, color: colors.textMuted, cursor: "pointer", minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {pickerSongs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: colors.textMuted, fontSize: 14 }}>{pickerSearch ? "No matches" : "All songs already added"}</div>
              ) : pickerSongs.map((song) => {
                const checked = pickerSelected.has(song.id);
                return (
                  <div key={song.id} onClick={() => setPickerSelected((prev) => { const n = new Set(prev); checked ? n.delete(song.id) : n.add(song.id); return n; })}
                    style={{ padding: "13px 18px", borderBottom: `1px solid ${colors.border}`, cursor: "pointer", background: checked ? colors.accentLight : colors.surface, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? colors.accent : colors.border}`, background: checked ? colors.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: colors.text, fontSize: 15 }}>{song.title}</div>
                      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{[song.lyricist, song.genre].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 18px", borderTop: `1px solid ${colors.border}`, flexShrink: 0 }}>
              <button onClick={confirmPickerAdd} disabled={pickerSelected.size === 0}
                style={{ width: "100%", background: pickerSelected.size > 0 ? colors.accent : colors.border, color: "#fff", border: "none", borderRadius: 8, padding: "13px", fontFamily: font.body, fontSize: 15, fontWeight: 600, cursor: pickerSelected.size > 0 ? "pointer" : "default" }}>
                {pickerSelected.size === 0 ? "Select songs to add" : `Add ${pickerSelected.size} song${pickerSelected.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {showQR && <QRModal setlist={setlist} onClose={() => setShowQR(false)} />}
    </div>
  );
}

// ─── About ───
function AboutTab({ user, onSignOut, localSongs, allSongs, onAddSong, onRemoveSong }) {
  const [preview, setPreview] = useState(null); // { raw, song } | { error }
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useState(null);
  const staticIds = new Set(SONGS.map((s) => s.id));

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target.result;
      try {
        const song = parseSong(raw);
        if (!song.id || !song.title) throw new Error("Missing id or title in front matter.");
        setPreview({ raw, song, error: null });
      } catch (err) {
        setPreview({ raw: null, song: null, error: `Could not parse file: ${err.message}` });
      }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!preview?.song) return;
    onAddSong(preview.raw);
    setPreview(null);
  };

  const handleCopy = (raw, id) => {
    navigator.clipboard.writeText(raw).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 14,
  };

  const sectionLabel = {
    fontSize: 11,
    fontWeight: 700,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 12,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: font.body,
        padding: "32px 20px 100px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: font.bengali, fontSize: 32, color: colors.accent, fontWeight: 700, marginBottom: 4 }}>
          অচিন পাখি
        </div>
        <div style={{ fontFamily: font.display, fontSize: 17, color: colors.text, fontWeight: 600 }}>
          Songbook
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          {allSongs.length} songs · {localSongs.length > 0 ? `${localSongs.length} local` : "all from repo"}
        </div>
      </div>

      {/* Welcome card */}
      <div style={{ ...card, background: colors.accentLight, border: `1px solid ${colors.accent}33`, textAlign: "center" }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>👋</div>
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
          Welcome, {user.name}
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted }}>
          {user.role === "admin" ? "Admin · full access" : "Member · enjoy the songs"}
        </div>
      </div>

      {/* Song file format + upload — admin only */}
      {user.role === "admin" && <div style={card}>
        <div style={sectionLabel}>Song File Format</div>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 12px", lineHeight: 1.6 }}>
          Each song is a <code style={{ fontFamily: font.mono, background: colors.bg, padding: "1px 5px", borderRadius: 4 }}>.md</code> file
          in <code style={{ fontFamily: font.mono, background: colors.bg, padding: "1px 5px", borderRadius: 4 }}>src/songs/</code>.
          Front matter sets metadata, then sections hold lyrics and notes.
        </p>
        <pre style={{
          fontFamily: font.mono,
          fontSize: 11,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: "12px 14px",
          overflowX: "auto",
          color: colors.text,
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre",
        }}>{`---
id: 42
title: Song Title
lyricist: Poet Name
genre: Baul
instruments: dotara, tabla
---

[Refrain]
T: Ami tomar kachhe thaki
B: আমি তোমার কাছে থাকি
E: I stay close to you

[Glossary]
kachhe | কাছে | nearby, close

[Arrangement]
Start slow, dotara solo intro.

[Tags]
Baul, Devotion, Longing`}</pre>
      </div>}

      {/* Upload song file — admin only */}
      {user.role === "admin" && <div style={card}>
        <div style={sectionLabel}>Add Song File</div>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 14px", lineHeight: 1.55 }}>
          Upload a <code style={{ fontFamily: font.mono, background: colors.bg, padding: "1px 5px", borderRadius: 4 }}>.md</code> song
          file to add it to the app on this device. Songs are stored locally until committed to GitHub.
        </p>

        <label style={{ display: "block" }}>
          <input
            type="file"
            accept=".md"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            ref={(el) => { fileInputRef[0] = el; }}
          />
          <span
            onClick={() => fileInputRef[0]?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: colors.accentLight,
              color: colors.accent,
              border: `1.5px solid ${colors.accent}55`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              minHeight: 44,
              fontFamily: font.body,
            }}
          >
            ↑ Choose .md file
          </span>
        </label>

        {/* Error */}
        {preview?.error && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "#FEF2F0",
              border: `1px solid ${colors.accent}55`,
              borderRadius: 8,
              fontSize: 13,
              color: colors.accent,
            }}
          >
            {preview.error}
          </div>
        )}

        {/* Preview */}
        {preview?.song && (
          <div
            style={{
              marginTop: 14,
              padding: "14px 16px",
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
            }}
          >
            <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: colors.text }}>
              #{preview.song.id} — {preview.song.title}
            </div>
            {preview.song.titleBn && (
              <div style={{ fontFamily: font.bengali, fontSize: 14, color: colors.textMuted, marginTop: 2 }}>
                {preview.song.titleBn}
              </div>
            )}
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
              {preview.song.lyricist} · {preview.song.genre}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              {preview.song.sections.length} sections · {preview.song.glossary.length} glossary entries
            </div>

            {staticIds.has(preview.song.id) && (
              <div style={{ marginTop: 10, fontSize: 12, color: colors.accent, background: colors.accentLight, padding: "6px 10px", borderRadius: 6 }}>
                Song #{preview.song.id} already exists in the repo — local version will be ignored in the song list.
              </div>
            )}
            {!staticIds.has(preview.song.id) && localSongs.some((s) => s.id === preview.song.id) && (
              <div style={{ marginTop: 10, fontSize: 12, color: colors.textMuted, background: colors.bg, padding: "6px 10px", borderRadius: 6, border: `1px solid ${colors.border}` }}>
                A local song with id #{preview.song.id} already exists — it will be replaced.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={handleAdd}
                style={{
                  padding: "9px 18px",
                  background: colors.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: font.body,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Add to App
              </button>
              <button
                onClick={() => setPreview(null)}
                style={{
                  padding: "9px 18px",
                  background: "none",
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: font.body,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>}

      {/* Local songs list — admin only */}
      {user.role === "admin" && localSongs.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Local Songs</div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Stored on this device only. Copy the file content and commit to{" "}
            <code style={{ fontFamily: font.mono, background: colors.bg, padding: "1px 4px", borderRadius: 3 }}>src/songs/</code>{" "}
            in GitHub to make permanent for all devices.
          </div>
          {localSongs.map((song) => (
            <div
              key={song.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                  #{song.id} — {song.title}
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>{song.lyricist}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleCopy(song._raw, song.id)}
                  style={{
                    padding: "6px 12px",
                    background: copiedId === song.id ? colors.greenLight : colors.bg,
                    color: copiedId === song.id ? colors.green : colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: font.body,
                    cursor: "pointer",
                    minHeight: 36,
                    minWidth: 60,
                  }}
                >
                  {copiedId === song.id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => onRemoveSong(song.id)}
                  style={{
                    padding: "6px 12px",
                    background: "none",
                    color: colors.accent,
                    border: `1px solid ${colors.accent}55`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: font.body,
                    cursor: "pointer",
                    minHeight: 36,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Band info */}
      <div style={card}>
        <div style={sectionLabel}>About</div>
        <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.65, margin: 0 }}>
          Ochin Pakhi is a Chicago-based Bengali folk music ensemble performing Baul,
          Rabindrasangeet, and other traditions of Bengal. This songbook is a private
          rehearsal tool for band members.
        </p>
        <a
          href="https://ochinpakhichicago.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, background: colors.accentLight, color: colors.accent, fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "10px 16px", borderRadius: 8, border: `1px solid ${colors.accent}44` }}
        >
          🌐 ochinpakhichicago.org
          <span style={{ fontSize: 12 }}>↗</span>
        </a>
      </div>

      <button
        onClick={onSignOut}
        style={{
          width: "100%",
          padding: "14px 0",
          background: "none",
          border: `1.5px solid ${colors.border}`,
          borderRadius: 10,
          fontSize: 15,
          color: colors.textMuted,
          fontFamily: font.body,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        Sign out
      </button>
    </div>
  );
}

// ─── Bottom Nav ───
function BottomNav({ tab, onChange }) {
  const items = [
    { key: "songs", label: "Songs", icon: "♪" },
    { key: "setlists", label: "Setlists", icon: "☰" },
    { key: "about", label: "About", icon: "ℹ" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        zIndex: 100,
      }}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            cursor: "pointer",
            fontFamily: font.body,
            color: tab === item.key ? colors.accent : colors.textMuted,
            borderTop: `2px solid ${tab === item.key ? colors.accent : "transparent"}`,
            minHeight: 60,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
          <span style={{ fontSize: 11, fontWeight: tab === item.key ? 600 : 400 }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Welcome Popup ───
function WelcomePopup({ user, onDismiss }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ background: colors.surface, borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 340, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ fontFamily: font.bengali, fontSize: 36, color: colors.accent, fontWeight: 700, marginBottom: 4 }}>অচিন পাখি</div>
        <div style={{ fontFamily: font.display, fontSize: 14, color: colors.textMuted, marginBottom: 20 }}>Songbook</div>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
          Welcome, {user.name}!
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6, marginBottom: 28 }}>
          {user.role === "admin"
            ? "You're signed in as admin. You can browse songs, manage setlists, and upload new song files."
            : "Browse the songbook, follow along with lyrics, and let the music guide you."}
        </div>
        <button
          onClick={onDismiss}
          style={{ width: "100%", background: colors.accent, color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontFamily: font.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Let's go — don't show again
        </button>
      </div>
    </div>
  );
}

// ─── App ───
export default function App() {
  const [user, setUser] = useState(null); // { name, role: "member"|"admin" } | null
  const [showWelcome, setShowWelcome] = useState(false);
  const [mainTab, setMainTab] = useState("songs");
  const [nowPlaying, setNowPlaying] = useState(null); // { videoId, title }
  const [songSource, setSongSource] = useState("songs"); // "songs" | "setlists"
  const [selectedSong, setSelectedSong] = useState(null);
  const [hash, setHash] = useState(window.location.hash);
  const searchState = useState("");

  const [localRaws, setLocalRaws] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ochin-pakhi-local-songs") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("ochin-pakhi-local-songs", JSON.stringify(localRaws));
  }, [localRaws]);

  const localSongs = useMemo(() =>
    localRaws.map(({ raw }) => ({ ...parseSong(raw), _local: true, _raw: raw })),
    [localRaws]
  );

  const allSongs = useMemo(() => {
    const staticIds = new Set(SONGS.map((s) => s.id));
    const extras = localSongs.filter((s) => !staticIds.has(s.id));
    return [...SONGS, ...extras].sort((a, b) => a.id - b.id);
  }, [localSongs]);

  const onAddSong = useCallback((raw) => {
    const song = parseSong(raw);
    setLocalRaws((prev) => {
      const filtered = prev.filter((item) => item.id !== song.id);
      return [...filtered, { raw, id: song.id }];
    });
  }, []);

  const onRemoveSong = useCallback((id) => {
    setLocalRaws((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      setHash(h);
      const songMatch = h.match(/^#\/song\/(\d+)$/);
      if (songMatch) {
        const song = allSongs.find((s) => s.id === Number(songMatch[1]));
        if (song) { setSelectedSong(song); return; }
      }
      setSelectedSong(null);
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, [allSongs]);

  // Audience view bypasses the password gate
  const audienceMatch = hash.match(/^#\/audience\/([^/]+)\/(.+)$/);
  if (audienceMatch) {
    const eventName = decodeURIComponent(audienceMatch[1]);
    const ids = audienceMatch[2].split(",").map(Number);
    const songs = ids.map((id) => SONGS.find((s) => s.id === id)).filter(Boolean);
    return <AudienceView eventName={eventName} songs={songs} />;
  }

  if (!user) return (
    <PasswordGate onUnlock={(u) => {
      setUser(u);
      const seen = localStorage.getItem(`ochin-pakhi-welcomed-${u.name.toLowerCase()}`);
      if (!seen) setShowWelcome(true);
    }} />
  );

  const handlePlay = (videoId, title) => setNowPlaying({ videoId, title });

  if (selectedSong) {
    return (
      <>
        <SongDetail
          song={selectedSong}
          onBack={() => {
            setSelectedSong(null);
            window.location.hash = "#/";
            if (songSource === "setlists") setMainTab("setlists");
          }}
          onPlay={handlePlay}
          backLabel={songSource === "setlists" ? "Setlist" : "All Songs"}
        />
        <MiniPlayer nowPlaying={nowPlaying} onClose={() => setNowPlaying(null)} />
      </>
    );
  }

  return (
    <div>
      {mainTab === "songs" && (
        <SongList
          songs={allSongs}
          onSelect={(s) => {
            setSongSource("songs");
            setSelectedSong(s);
            window.location.hash = `#/song/${s.id}`;
          }}
          searchState={searchState}
        />
      )}
      {mainTab === "setlists" && <SetlistsTab allSongs={allSongs} user={user} onSelectSong={(s) => { setSongSource("setlists"); setSelectedSong(s); window.location.hash = `#/song/${s.id}`; }} />}
      {mainTab === "about" && (
        <AboutTab
          user={user}
          onSignOut={() => { setUser(null); setSelectedSong(null); }}
          localSongs={localSongs}
          allSongs={allSongs}
          onAddSong={onAddSong}
          onRemoveSong={onRemoveSong}
        />
      )}
      <BottomNav tab={mainTab} onChange={setMainTab} />
      <MiniPlayer nowPlaying={nowPlaying} onClose={() => setNowPlaying(null)} />
      {showWelcome && user && (
        <WelcomePopup
          user={user}
          onDismiss={() => {
            setShowWelcome(false);
            localStorage.setItem(`ochin-pakhi-welcomed-${user.name.toLowerCase()}`, "1");
          }}
        />
      )}
    </div>
  );
}
