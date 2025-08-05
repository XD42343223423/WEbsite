import formidable from "formidable";
import fs from "fs";
import path from "path";
import { readFile, writeFile } from "fs/promises";

export const config = {
  api: { bodyParser: false }
};

const tmpDir = "/tmp/uploads";
fs.mkdirSync(tmpDir, { recursive: true });

export default async function handler(req, res) {
  // Serve image if GET
  if (req.method === "GET") {
    const id = req.query.id;
    const filepath = globalThis.uploadedFiles?.[id];

    if (!filepath || !fs.existsSync(filepath)) {
      return res.status(404).send("Not found");
    }

    const ext = path.extname(filepath).toLowerCase();
    const mime = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp"
    }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", mime);
    return fs.createReadStream(filepath).pipe(res);
  }

  // Handle file upload
  if (req.method === "POST") {
    const form = formidable({ multiples: false, uploadDir: tmpDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err || !files.file) {
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = files.file;
      const ext = path.extname(file.originalFilename || ".png");
      const name = Date.now() + "_" + Math.floor(Math.random() * 999999) + ext;
      const fullPath = path.join(tmpDir, name);

      await writeFile(fullPath, await readFile(file.filepath));

      globalThis.uploadedFiles = globalThis.uploadedFiles || {};
      globalThis.uploadedFiles[name] = fullPath;

      const base = req.headers.host.startsWith("localhost") ? "http" : "https";
      const url = `${base}://${req.headers.host}/api/api.js?id=${encodeURIComponent(name)}`;

      res.status(200).json({ url });
    });
  }
}
