# Ochin Pakhi Songbook 🎵

A private web app for Ochin Pakhi band members to browse songs with Bengali lyrics, transliteration, English translations, tappable word glossary, arrangement notes, and embedded audio/video.

**Password:** `ochinpakhi2026` (change in `src/App.jsx` — search for `PASSWORD`)

---

## How to Deploy (Free) — Step by Step

You need: a GitHub account and a Vercel account (both free).

### Step 1: Push to GitHub

1. Go to https://github.com/new
2. Name the repo `ochin-pakhi-songbook` (keep it **Private** so lyrics stay private)
3. Click "Create repository"
4. On the next screen, GitHub shows you upload instructions. The easiest way:
   - Click **"uploading an existing file"** link
   - Drag-and-drop ALL the files from this project folder
   - Click "Commit changes"

Or if you're comfortable with the terminal:
```bash
cd ochin-pakhi-songbook
git init
git add .
git commit -m "Initial songbook"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ochin-pakhi-songbook.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `ochin-pakhi-songbook` repo
4. Vercel auto-detects it's a Vite project — leave all settings as-is
5. Click **Deploy**
6. In about 60 seconds you'll get a live URL like: `ochin-pakhi-songbook.vercel.app`

### Step 3: Share with the Band

Send the URL and password to your bandmates. Works on phone and laptop.

### Optional: Custom Domain

In Vercel dashboard → your project → Settings → Domains, you can add a custom domain like `songs.ochinpakhichicago.org` for free.

---

## How to Update Songs

### Adding a new song

Open `src/App.jsx` and add a new entry to the `SONGS` array following the existing pattern. Each song has:
- `id` — the song number from your Google Doc
- `title` / `titleBn` — title in transliteration and Bengali script
- `lyricist` / `lyricistBn` — lyricist name in both scripts
- `genre` — e.g. "Baul", "Rabindrasangeet", "Bhatiyali"
- `sections` — array of song sections (Refrain, Verse 1, etc.), each with lines containing `trans` (transliteration), `bn` (Bengali), and `en` (English translation)
- `glossary` — array of vocabulary words with `word`, `bn`, and `meaning`
- `notes` — arrangement and performance notes (use `\n` for line breaks)
- `reference` — array of `{ title, url }` for classic/authentic YouTube versions
- `ourRecording` — array of `{ title, url }` for Ochin Pakhi recordings

### Adding YouTube links

In any song's `reference` or `ourRecording` array:
```js
reference: [
  { title: "Purna Das Baul — classic version", url: "https://www.youtube.com/watch?v=XXXXX" },
],
ourRecording: [
  { title: "Live at Old Town School Nov 2021", url: "https://www.youtube.com/watch?v=XXXXX" },
],
```

### Changing the password

Search for `const PASSWORD =` in `src/App.jsx` and change the string.

### Deploying updates

If you used GitHub + Vercel: just push your changes to GitHub and Vercel auto-deploys within a minute. No manual steps needed.

---

## Running Locally (for testing before deploying)

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

---

## Project Structure

```
ochin-pakhi-songbook/
├── index.html          ← HTML shell (loads fonts)
├── package.json        ← dependencies
├── vite.config.js      ← build config
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← The entire songbook app + song data
```

Built with React + Vite. All song data lives in `App.jsx` for simplicity — no database needed.
