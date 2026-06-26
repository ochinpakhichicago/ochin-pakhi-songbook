import { useState, useCallback, useMemo } from "react";

const SONGS = [
  {
    id: 3,
    title: "Tomay Hrid Majhare Rakhibo",
    titleBn: "তোমায় হৃদ মাঝারে রাখিব",
    lyricist: "Dwij Bhushon",
    lyricistBn: "দ্বিজ ভূষণ",
    genre: "Baul",
    sections: [
      {
        label: "Refrain",
        lines: [
          {
            trans: "Ore chhere dile sonar gour",
            bn: "ওরে ছেড়ে দিলে সোনার গৌর",
            en: "Oh, if you let go of golden Gour (Chaitanya)",
          },
          {
            trans: "Khepa chhere dile sonar gour",
            bn: "খেপা ছেড়ে দিলে সোনার গৌর",
            en: "O mad one, if you let go of golden Gour",
          },
          {
            trans: "Amra aar pabo na, aar pabo na",
            bn: "আমরা আর পাব না, আর পাব না",
            en: "We won't find him again, never again",
          },
          {
            trans: "Tomay hrid majhare rakhibo chhere debo na",
            bn: "তোমায় হৃদ মাঝারে রাখিব ছেড়ে দেব না",
            en: "I will keep you in my heart, I won't let you go",
          },
          {
            trans: "Tomay bokhho mahje rakhibo chhere debo na",
            bn: "তোমায় বক্ষ মাঝে রাখিব ছেড়ে দেব না",
            en: "I will keep you in my chest, I won't let you go",
          },
        ],
      },
      {
        label: "Verse 1",
        lines: [
          {
            trans: "Bhubono mohono gora",
            bn: "ভুবন মোহন গোরা",
            en: "The one who enchants the world, the fair one",
          },
          {
            trans: "Kon moni jonar mono hora",
            bn: "কোন মণি জনার মন হরা",
            en: "Who steals the mind like a jewel among people",
          },
          {
            trans: "Ore radhar preme matowara",
            bn: "ওরে রাধার প্রেমে মাতোয়ারা",
            en: "Oh, intoxicated by Radha's love",
          },
          {
            trans: "Chand gour amar",
            bn: "চাঁদ গৌর আমার",
            en: "My moon-like Gour",
          },
          {
            trans: "Radhar preme matowara",
            bn: "রাধার প্রেমে মাতোয়ারা",
            en: "Intoxicated by Radha's love",
          },
          {
            trans: "Dhulay jay bhai gora-gori",
            bn: "ধূলায় যায় ভাই গোরা-গোরী",
            en: "Into the dust goes, brother, the fair couple",
          },
          {
            trans: "Jete chaile jete debo na",
            bn: "যেতে চাইলে যেতে দেব না",
            en: "Even if they wish to go, I won't let them",
          },
        ],
      },
      {
        label: "Verse 2",
        lines: [
          {
            trans: "Jabo brojer kule kule",
            bn: "যাব ব্রজের কূলে কূলে",
            en: "I will go along the banks of Braj (Krishna's homeland)",
          },
          {
            trans: "Makhbo paaye ranga dhuli",
            bn: "মাখব পায়ে রাঙা ধুলি",
            en: "I will smear the red dust on my feet",
          },
          {
            trans: "Ore pagol mon..",
            bn: "ওরে পাগল মন..",
            en: "Oh my mad heart..",
          },
          {
            trans: "Ore noyonete noyon diye rakhbo tare",
            bn: "ওরে নয়নেতে নয়ন দিয়ে রাখব তারে",
            en: "With my eyes locked in his eyes, I will hold him",
          },
          {
            trans: "Chole gele, chole gele jete debo na",
            bn: "চলে গেলে, চলে গেলে যেতে দেব না",
            en: "If he tries to leave, I won't let him go",
          },
        ],
      },
      {
        label: "Verse 3",
        lines: [
          {
            trans: "Je dake chand gour bole",
            bn: "যে ডাকে চাঁদ গৌর বলে",
            en: "Whoever calls out 'Moon-like Gour'",
          },
          {
            trans: "Ogo bhoy ki go taar brojer kule",
            bn: "ওগো ভয় কি গো তার ব্রজের কূলে",
            en: "Oh, what fear could there be on the banks of Braj?",
          },
          {
            trans: "Ore Dwijo Bhushon chand bole",
            bn: "ওরে দ্বিজ ভূষণ চাঁদ বলে",
            en: "Dwij Bhushon says, calling him 'Moon'",
          },
          {
            trans: "Choron chhere debo na",
            bn: "চরণ ছেড়ে দেব না",
            en: "I will not let go of his feet",
          },
        ],
      },
    ],
    glossary: [
      { word: "hrid", bn: "হৃদ", meaning: "heart" },
      { word: "majhare", bn: "মাঝারে", meaning: "in the middle of, within" },
      { word: "rakhibo", bn: "রাখিব", meaning: "I will keep" },
      { word: "chhere", bn: "ছেড়ে", meaning: "letting go, releasing" },
      { word: "sonar", bn: "সোনার", meaning: "golden" },
      { word: "gour", bn: "গৌর", meaning: "the fair one — refers to Chaitanya Mahaprabhu" },
      { word: "khepa", bn: "খেপা", meaning: "mad one, ecstatic one" },
      { word: "bokhho", bn: "বক্ষ", meaning: "chest, bosom" },
      { word: "bhubono mohono", bn: "ভুবন মোহন", meaning: "enchanter of the universe" },
      { word: "mono hora", bn: "মন হরা", meaning: "one who steals the mind" },
      { word: "matowara", bn: "মাতোয়ারা", meaning: "intoxicated, ecstatic" },
      { word: "radha", bn: "রাধা", meaning: "Radha — beloved of Krishna/Gour" },
      { word: "dhulay", bn: "ধূলায়", meaning: "in the dust" },
      { word: "brojer", bn: "ব্রজের", meaning: "of Braj — Krishna's homeland in Vrindavan" },
      { word: "ranga dhuli", bn: "রাঙা ধুলি", meaning: "red/colored dust" },
      { word: "noyon", bn: "নয়ন", meaning: "eyes" },
      { word: "pagol", bn: "পাগল", meaning: "mad, crazy (with love)" },
      { word: "choron", bn: "চরণ", meaning: "feet (of the divine)" },
      { word: "chand", bn: "চাঁদ", meaning: "moon" },
    ],
    notes: "",
    reference: [
      // { title: "Description of the version", url: "https://youtube.com/watch?v=..." },
    ],
    ourRecording: [
      // { title: "Rehearsal / Live / Studio", url: "https://youtube.com/watch?v=..." },
    ],
  },
  {
    id: 10,
    title: "Jodi Tor Daak Shune",
    titleBn: "যদি তোর ডাক শুনে",
    lyricist: "Rabindranath Tagore",
    lyricistBn: "রবীন্দ্রনাথ ঠাকুর",
    genre: "Rabindrasangeet",
    sections: [
      {
        label: "Refrain",
        lines: [
          {
            trans: "Jodi tor daak shune keu na aashe tobe ekla cholo re",
            bn: "যদি তোর ডাক শুনে কেউ না আসে তবে একলা চলো রে",
            en: "If no one answers your call, then walk alone",
          },
          {
            trans: "Ekla cholo ekla cholo ekla cholo ekla cholo re",
            bn: "একলা চলো একলা চলো একলা চলো একলা চলো রে",
            en: "Walk alone, walk alone, walk alone, walk alone",
          },
        ],
      },
      {
        label: "Verse 1",
        lines: [
          {
            trans: "Jodi keu kotha na koy ore ore o obhaga",
            bn: "যদি কেউ কথা না কয় ওরে ওরে ও অভাগা",
            en: "If no one speaks to you, oh you unfortunate one",
          },
          {
            trans: "Jodi sobai thaake mukh phiraye shobai kore bhoy",
            bn: "যদি সবাই থাকে মুখ ফিরায়ে সবাই করে ভয়",
            en: "If everyone turns their face away, if all are afraid",
          },
          {
            trans: "Tobe poran khuley",
            bn: "তবে পরান খুলে",
            en: "Then with an open heart",
          },
          {
            trans: "O tui mukh phutey tor moner kotha ekla bolo re",
            bn: "ও তুই মুখ ফুটে তোর মনের কথা একলা বলো রে",
            en: "You speak your mind's words alone",
          },
        ],
      },
      {
        label: "Verse 2",
        lines: [
          {
            trans: "Jodi sobai phirey jay ore ore o obhaga",
            bn: "যদি সবাই ফিরে যায় ওরে ওরে ও অভাগা",
            en: "If everyone turns back, oh you unfortunate one",
          },
          {
            trans: "Jodi gohon pothe jabar kaale keu phirey na chaai",
            bn: "যদি গহন পথে যাবার কালে কেউ ফিরে না চায়",
            en: "If on a deep dark path no one looks back for you",
          },
          {
            trans: "Tobe pother kaaNta",
            bn: "তবে পথের কাঁটা",
            en: "Then the thorns of the path",
          },
          {
            trans: "O tui roktomakha chorontole ekla dolo re",
            bn: "ও তুই রক্তমাখা চরণতলে একলা দলো রে",
            en: "You trample alone with bloodied feet",
          },
        ],
      },
      {
        label: "Verse 3",
        lines: [
          {
            trans: "Jodi aalo na dhore orey orey o obhaga",
            bn: "যদি আলো না ধরে ওরে ওরে ও অভাগা",
            en: "If no one holds up a light, oh you unfortunate one",
          },
          {
            trans: "Jodi jhor badole aaNdhar raate duyar dey ghore",
            bn: "যদি ঝড় বাদলে আঁধার রাতে দুয়ার দেয় ঘরে",
            en: "If in storm and rain on a dark night they shut their doors",
          },
          {
            trans: "Tobe bojranole",
            bn: "তবে বজ্রনলে",
            en: "Then with the fire of thunder",
          },
          {
            trans: "Apon buker paajor jwaliye niye ekla jwolo re",
            bn: "আপন বুকের পাঁজর জ্বালিয়ে নিয়ে একলা জ্বলো রে",
            en: "Set your own ribs ablaze and burn alone",
          },
        ],
      },
    ],
    glossary: [
      { word: "daak", bn: "ডাক", meaning: "call, summons" },
      { word: "ekla", bn: "একলা", meaning: "alone" },
      { word: "cholo", bn: "চলো", meaning: "walk, go, move forward" },
      { word: "obhaga", bn: "অভাগা", meaning: "unfortunate one, ill-fated" },
      { word: "mukh phiraye", bn: "মুখ ফিরায়ে", meaning: "turning the face away" },
      { word: "bhoy", bn: "ভয়", meaning: "fear" },
      { word: "poran", bn: "পরান", meaning: "heart, soul, life-breath" },
      { word: "moner kotha", bn: "মনের কথা", meaning: "the words of the heart/mind" },
      { word: "gohon pothe", bn: "গহন পথে", meaning: "on a deep/dense path" },
      { word: "kaaNta", bn: "কাঁটা", meaning: "thorns" },
      { word: "roktomakha", bn: "রক্তমাখা", meaning: "smeared with blood, bloodied" },
      { word: "chorontole", bn: "চরণতলে", meaning: "under the feet, at the soles" },
      { word: "dolo", bn: "দলো", meaning: "trample, crush underfoot" },
      { word: "aalo", bn: "আলো", meaning: "light" },
      { word: "jhor", bn: "ঝড়", meaning: "storm" },
      { word: "badol", bn: "বাদল", meaning: "rain, monsoon" },
      { word: "aaNdhar", bn: "আঁধার", meaning: "darkness" },
      { word: "duyar", bn: "দুয়ার", meaning: "door, doorway" },
      { word: "bojranole", bn: "বজ্রনলে", meaning: "with thunderfire, lightning's flame" },
      { word: "paajor", bn: "পাঁজর", meaning: "ribs" },
      { word: "jwaliye", bn: "জ্বালিয়ে", meaning: "setting aflame, igniting" },
      { word: "jwolo", bn: "জ্বলো", meaning: "burn, blaze" },
    ],
    notes:
      "Flute and dotara start. Groove: accordion and dotara on first half, cello on 2nd half \"sniff a d d\".",
    reference: [
      // { title: "Description of the version", url: "https://youtube.com/watch?v=..." },
    ],
    ourRecording: [
      // { title: "Rehearsal / Live / Studio", url: "https://youtube.com/watch?v=..." },
    ],
  },
  {
    id: 78,
    title: "Se Ki Amar Kobar Kotha",
    titleBn: "সে কি আমার কবার কথা",
    lyricist: "Lalon Fakir",
    lyricistBn: "লালন ফকির",
    genre: "Baul / Lalongiti",
    sections: [
      {
        label: "Refrain",
        lines: [
          {
            trans: "Se ki amar kobar kotha",
            bn: "সে কি আমার কবার কথা",
            en: "Is this something I can even speak of?",
          },
          {
            trans: "Apon bege aponi mori",
            bn: "আপন বেগে আপনি মরি",
            en: "I die by my own momentum",
          },
          {
            trans: "(O mon) Gaur eshe hride bose",
            bn: "(ও মন) গৌর এসে হৃদে বসে",
            en: "(O my heart) Gaur came and sat in my heart",
          },
          {
            trans: "Korlo amar monchuri",
            bn: "করল আমার মনচুরি",
            en: "And stole my mind away",
          },
        ],
      },
      {
        label: "Verse 1",
        lines: [
          {
            trans: "Kiba gaur rup lampote",
            bn: "কিবা গৌর রূপ লম্পটে",
            en: "What a beauty-obsessed form Gaur has!",
          },
          {
            trans: "Dhairyer duri dey go kete",
            bn: "ধৈর্যের দুরি দেয় গো কেটে",
            en: "He cuts through the rope of my patience",
          },
          {
            trans: "Lojja bhoy sob jay go chute",
            bn: "লজ্জা ভয় সব যায় গো ছুটে",
            en: "All shame and fear go running away",
          },
          {
            trans: "Jokhon ai rup mone kori",
            bn: "যখন ঐ রূপ মনে করি",
            en: "Whenever I think of that form",
          },
        ],
      },
      {
        label: "Verse 2",
        lines: [
          {
            trans: "Ghumer ghore dekhlam jare",
            bn: "ঘুমের ঘরে দেখলাম যারে",
            en: "The one I saw in the room of sleep (in dreams)",
          },
          {
            trans: "Chetan hoye paine tare",
            bn: "চেতন হয়ে পাই নে তারে",
            en: "When awake, I cannot find him",
          },
          {
            trans: "Lukaile kon shohore",
            bn: "লুকাইলে কোন শহরে",
            en: "In which city has he hidden himself?",
          },
          {
            trans: "Nob roser rasbihari",
            bn: "নব রসের রসবিহারী",
            en: "The one who revels in the nine rasas (essences of love)",
          },
        ],
      },
      {
        label: "Verse 3",
        lines: [
          {
            trans: "Meghe jemon chataker e",
            bn: "মেঘে যেমন চাতকের এ",
            en: "Like the chatak bird with the rain cloud",
          },
          {
            trans: "Dekha diye fanke fere",
            bn: "দেখা দিয়ে ফাঁকে ফেরে",
            en: "He shows himself then slips away",
          },
          {
            trans: "Lalon bole tai amare",
            bn: "লালন বলে তাই আমারে",
            en: "Lalon says, that is why with me",
          },
          {
            trans: "Korlo gaur barabari",
            bn: "করল গৌর বারবারী",
            en: "Gaur has done this again and again",
          },
        ],
      },
    ],
    glossary: [
      { word: "kobar", bn: "কবার", meaning: "to speak of, to express" },
      { word: "bege", bn: "বেগে", meaning: "with speed, with momentum" },
      { word: "mori", bn: "মরি", meaning: "I die" },
      { word: "gaur", bn: "গৌর", meaning: "the fair one — the divine beloved" },
      { word: "hride", bn: "হৃদে", meaning: "in the heart" },
      { word: "monchuri", bn: "মনচুরি", meaning: "mind-theft, stealing the mind" },
      { word: "rup", bn: "রূপ", meaning: "form, beauty, appearance" },
      { word: "lampote", bn: "লম্পটে", meaning: "one addicted to beauty, beauty-obsessed" },
      { word: "dhairyer", bn: "ধৈর্যের", meaning: "of patience" },
      { word: "duri", bn: "দুরি", meaning: "rope, cord" },
      { word: "lojja", bn: "লজ্জা", meaning: "shame, modesty" },
      { word: "bhoy", bn: "ভয়", meaning: "fear" },
      { word: "ghumer ghore", bn: "ঘুমের ঘরে", meaning: "in the room of sleep — in dreams" },
      { word: "chetan", bn: "চেতন", meaning: "awake, conscious" },
      { word: "lukaile", bn: "লুকাইলে", meaning: "has hidden (himself)" },
      { word: "nob ros", bn: "নব রস", meaning: "nine rasas — the essences/flavors of love in devotional poetry" },
      { word: "rasbihari", bn: "রসবিহারী", meaning: "one who revels in rasa, the playful divine" },
      { word: "chatak", bn: "চাতক", meaning: "a mythical bird that only drinks falling rainwater — symbol of intense longing" },
      { word: "meghe", bn: "মেঘে", meaning: "in the cloud" },
      { word: "fanke", bn: "ফাঁকে", meaning: "in the gap, slipping away" },
      { word: "barabari", bn: "বারবারী", meaning: "again and again, repeatedly" },
    ],
    notes:
      "Subho solo with light dotara plucking, then he slips into rhythm.\nNate Khol in on \"Gaur eshe\"\nMolly along on ektara 1st time\nChorus \"se ki\" is repeated by everyone but Subho 2nd time\nDotara 2nd time\nSam or Tzip? 1st interlude, Mehtab enters\nDotara 2nd interlude\nSam 3rd interlude\nBuilding through \"Gaur eshe\" then fade out for the end 3× \"se ki\"\nListen for the swell and drop — hold back volume, let it simmer.",
    reference: [
      // { title: "Description of the version", url: "https://youtube.com/watch?v=..." },
    ],
    ourRecording: [
      // { title: "Rehearsal / Live / Studio", url: "https://youtube.com/watch?v=..." },
    ],
  },
];

const PASSWORD = "ochinpakhi2026";

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
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (pw.trim().toLowerCase() === PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

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
          maxWidth: 380,
          width: "100%",
          animation: shake ? "shake 0.4s ease" : undefined,
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 8,
            fontFamily: font.bengali,
            color: colors.accent,
            fontWeight: 700,
          }}
        >
          অচিন পাখি
        </div>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 22,
            color: colors.text,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Songbook
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 32,
            letterSpacing: "0.04em",
          }}
        >
          Band members only
        </div>
        <input
          type="password"
          placeholder="Enter password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 18px",
            fontSize: 16,
            border: `1.5px solid ${error ? colors.accent : colors.border}`,
            borderRadius: 10,
            outline: "none",
            background: colors.surface,
            fontFamily: font.body,
            marginBottom: 12,
            color: colors.text,
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            background: colors.accent,
            color: "#FFF",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: font.body,
            letterSpacing: "0.02em",
          }}
        >
          Enter
        </button>
        {error && (
          <div
            style={{
              color: colors.accent,
              fontSize: 13,
              marginTop: 10,
            }}
          >
            Wrong password — ask Subho!
          </div>
        )}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Song List ───
function SongList({ onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SONGS;
    return SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.lyricist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.titleBn.includes(q)
    );
  }, [search]);

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
          padding: "28px 24px 20px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
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
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
          {SONGS.length} songs
        </div>
        <input
          type="text"
          placeholder="Search by title, lyricist, or genre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 14,
            padding: "11px 14px",
            fontSize: 14,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            outline: "none",
            fontFamily: font.body,
            background: colors.bg,
            color: colors.text,
          }}
        />
      </div>

      {/* Song cards */}
      <div style={{ padding: "16px 16px 40px" }}>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: colors.textMuted,
              padding: 40,
              fontSize: 14,
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
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(44,24,16,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
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
                  marginTop: 2,
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
              <span
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
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
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Song Detail ───
function SongDetail({ song, onBack }) {
  const [tab, setTab] = useState("lyrics");
  const [activeWord, setActiveWord] = useState(null);

  const tabs = [
    { key: "lyrics", label: "Lyrics" },
    { key: "glossary", label: "Glossary" },
    { key: "notes", label: "Arrangement" },
    { key: "reference", label: "Reference" },
    { key: "ours", label: "Our Version" },
  ];

  // Build a lookup from transliterated word → glossary entry
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

  // Render transliteration with tappable glossary words
  const renderTransLine = useCallback(
    (line) => {
      const words = line.split(/(\s+)/);
      return words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const match = wordLookup[clean];
        if (match) {
          const isActive =
            activeWord && activeWord.word === match.word;
          return (
            <span
              key={i}
              onClick={() =>
                setActiveWord(isActive ? null : match)
              }
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
            padding: 0,
            marginBottom: 10,
            fontWeight: 500,
          }}
        >
          ← All Songs
        </button>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between" }}>
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
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            {song.lyricist} ({song.lyricistBn})
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
        </div>
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
              padding: "12px 16px 10px",
              fontSize: 14,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? colors.accent : colors.textMuted,
              cursor: "pointer",
              fontFamily: font.body,
              transition: "color 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active word tooltip */}
      {activeWord && tab === "lyrics" && (
        <div
          style={{
            margin: "12px 18px 0",
            background: colors.goldLight,
            border: `1px solid ${colors.gold}`,
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 700,
                color: colors.text,
                fontSize: 15,
              }}
            >
              {activeWord.word}
            </span>
            <span
              style={{
                fontFamily: font.bengali,
                color: colors.textMuted,
                marginLeft: 8,
                fontSize: 15,
              }}
            >
              {activeWord.bn}
            </span>
            <div
              style={{
                fontSize: 14,
                color: colors.text,
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {activeWord.meaning}
            </div>
          </div>
          <button
            onClick={() => setActiveWord(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: colors.textMuted,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tab content */}
      <div style={{ padding: "16px 18px 60px" }}>
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
              Tap <span style={{ borderBottom: `2px dotted ${colors.gold}`, padding: "0 2px" }}>highlighted words</span> to see meanings
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
                  <div
                    key={li}
                    style={{
                      marginBottom: 16,
                      paddingLeft: 0,
                    }}
                  >
                    {/* Transliteration */}
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
                    {/* Bengali */}
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
                    {/* English */}
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
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Glossary ── */}
        {tab === "glossary" && (
          <div>
            {song.glossary.map((g, i) => (
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
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: colors.text,
                    }}
                  >
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
            ))}
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
                      paddingLeft: line.startsWith(" ") ? 16 : 0,
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

        {/* ── Reference (authentic/old versions) ── */}
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
              Authentic and classic renditions to study the original feel of this song.
            </div>
            {song.reference && song.reference.length > 0 ? (
              song.reference.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 10,
                    textDecoration: "none",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(44,24,16,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>▶</span>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: colors.text,
                        }}
                      >
                        {link.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        YouTube
                      </div>
                    </div>
                  </div>
                  {link.url.includes("youtube.com/watch") || link.url.includes("youtu.be") ? (
                    <div
                      style={{
                        marginTop: 12,
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          link.url.includes("youtu.be")
                            ? link.url.split("youtu.be/")[1]?.split("?")[0]
                            : link.url.split("v=")[1]?.split("&")[0]
                        }`}
                        title={link.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ) : null}
                </a>
              ))
            ) : (
              <div
                style={{
                  background: colors.surface,
                  border: `1px dashed ${colors.border}`,
                  borderRadius: 10,
                  padding: "36px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎵</div>
                <div
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  No reference links yet.
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  Add YouTube URLs to the song data to embed them here.
                </div>
              </div>
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
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: colors.surface,
                    border: `1px solid ${colors.accent}44`,
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 10,
                    textDecoration: "none",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(179,90,56,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontSize: 18,
                        background: colors.accentLight,
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: colors.accent,
                      }}
                    >
                      ▶
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: colors.accent,
                        }}
                      >
                        {link.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        Ochin Pakhi
                      </div>
                    </div>
                  </div>
                  {link.url.includes("youtube.com/watch") || link.url.includes("youtu.be") ? (
                    <div
                      style={{
                        marginTop: 12,
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          link.url.includes("youtu.be")
                            ? link.url.split("youtu.be/")[1]?.split("?")[0]
                            : link.url.split("v=")[1]?.split("&")[0]
                        }`}
                        title={link.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ) : null}
                </a>
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
                <div
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  No recordings linked yet.
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  Add YouTube URLs from the band's channel to embed them here.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ───
export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  if (selectedSong) {
    return (
      <SongDetail
        song={selectedSong}
        onBack={() => setSelectedSong(null)}
      />
    );
  }

  return <SongList onSelect={setSelectedSong} />;
}
