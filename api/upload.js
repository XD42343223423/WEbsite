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
  if (req.method === "GET") {
    const id = req.query.id;
    const filepath = globalThis.uploadedFiles?.[id];

    if (!filepath || !fs.existsSync(filepath)) {
      console.error("[GET] File not found:", id);
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

    console.log("[GET] Serving file:", filepath);
    res.setHeader("Content-Type", mime);
    return fs.createReadStream(filepath).pipe(res);
  }

  if (req.method === "POST") {
    console.log("[POST] Upload request received");

    const form = formidable({ multiples: false, uploadDir: tmpDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err || !files.file) {
        console.error("[POST] Form parse failed:", err);
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = files.file;
      console.log("[POST] File received:", file.originalFilename);

      const ext = path.extname(file.originalFilename || ".png");
      const name = Date.now() + "_" + Math.floor(Math.random() * 999999) + ext;
      const fullPath = path.join(tmpDir, name);

      try {
        await writeFile(fullPath, await readFile(file.filepath));

        globalThis.uploadedFiles = globalThis.uploadedFiles || {};
        globalThis.uploadedFiles[name] = fullPath;

        const base = req.headers.host.startsWith("localhost") ? "http" : "https";
        const url = `${base}://${req.headers.host}/api/upload?id=${encodeURIComponent(name)}`;

        console.log("[POST] File saved:", fullPath);
        console.log("[POST] URL:", url);

        res.status(200).json({ url });
      } catch (err) {
        console.error("[POST] Write failed:", err);
        res.status(500).json({ error: "Failed to save file" });
      }
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
