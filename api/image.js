import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const id = req.query.id;
  const filePath = globalThis.uploadedFiles?.[id];

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
  }[ext] || "application/octet-stream";

  // ?raw=1 returns just image
  if (req.query.raw === "1") {
    res.setHeader("Content-Type", mime);
    return fs.createReadStream(filePath).pipe(res);
  }

  // Otherwise show minimal preview page
  res.setHeader("Content-Type", "text/html");
  res.end(`
    <html style="background:#111;color:white;display:flex;align-items:center;justify-content:center;height:100vh;">
      <img src="/api/image?id=${encodeURIComponent(id)}&raw=1" style="max-width:90vw;max-height:90vh;border:2px solid #444;">
    </html>
  `);
}
