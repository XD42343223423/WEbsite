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
  const form = formidable({ multiples: false, uploadDir: tmpDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(500).json({ error: "Upload failed" });

    const file = files.file;
    const ext = path.extname(file.originalFilename || ".png");
    const name = Date.now() + "_" + Math.floor(Math.random() * 999999) + ext;
    const fullPath = path.join(tmpDir, name);

    await writeFile(fullPath, await readFile(file.filepath));

    globalThis.uploadedFiles = globalThis.uploadedFiles || {};
    globalThis.uploadedFiles[name] = fullPath;

    const protocol = req.headers.host.startsWith("localhost") ? "http" : "https";
    const url = `${protocol}://${req.headers.host}/api/image?id=${encodeURIComponent(name)}`;

    res.status(200).json({ url });
  });
}
