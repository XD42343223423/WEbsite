import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const id = req.query.id;
  const fileMap = globalThis.uploadedFiles || {};
  const filepath = fileMap[id];

  if (!filepath || !fs.existsSync(filepath)) {
    res.status(404).send("File not found");
    return;
  }

  const ext = path.extname(filepath).toLowerCase();
  const mime = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  }[ext] || "application/octet-stream";

  res.setHeader("Content-Type", mime);
  fs.createReadStream(filepath).pipe(res);
}
