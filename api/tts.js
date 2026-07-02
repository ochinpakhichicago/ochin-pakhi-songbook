import https from "https";

export default function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).end();

  const path =
    `/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=bn&client=gtx&sl=bn&ttsspeed=0.8`;

  const options = {
    hostname: "translate.googleapis.com",
    path,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://translate.google.com/",
      Accept: "audio/mpeg,audio/*",
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode !== 200) return res.status(502).end();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => res.status(500).end());
  proxyReq.end();
}
