import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const id = req.query.id;
  const filepath = globalThis.uploadedFiles?.[id];

  if (!filepath || !fs.existsSync(filepath)) {
    console.error("[IMAGE API] File not found:", id);
    res.status(404).send("File not found");
    return;
  }

  const ext = path.extname(filepath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
  };

  const mime = mimeTypes[ext] || "application/octet-stream";
  res.setHeader("Content-Type", mime);
  fs.createReadStream(filepath).pipe(res);
}
