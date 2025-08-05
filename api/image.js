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

  res.setHeader("Content-Type", mime);
  fs.createReadStream(filePath).pipe(res);
}
