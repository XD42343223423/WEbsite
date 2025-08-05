import formidable from "formidable";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

const tmpDir = "/tmp/uploads";
fs.mkdirSync(tmpDir, { recursive: true });

export default async function handler(req, res) {
  const form = formidable({ multiples: false, uploadDir: tmpDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(500).json({ error: "Upload failed" });
      return;
    }

    const file = files.file;
    const ext = path.extname(file.originalFilename || ".png");
    const id = Date.now() + "_" + Math.floor(Math.random() * 99999);
    const filename = id + ext;
    const filepath = path.join(tmpDir, filename);
    const fileData = await readFile(file.filepath);
    await writeFile(filepath, fileData);

    globalThis.uploadedFiles = globalThis.uploadedFiles || {};
    globalThis.uploadedFiles[filename] = filepath;

    const base = req.headers.host.startsWith("localhost") ? "http://" : "https://";
    const url = base + req.headers.host + `/api/image?id=${filename}`;

    res.status(200).json({ url });
  });
}
