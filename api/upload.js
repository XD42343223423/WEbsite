import { writeFile } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.file;
    const ext = path.extname(file.originalFilename);
    const name = Date.now() + ext;

    const data = await fs.promises.readFile(file.filepath);
    const dest = path.join(process.cwd(), "public", "uploads", name);

    await writeFile(dest, data);

    const baseUrl = req.headers.host.startsWith("localhost")
      ? "http://" + req.headers.host
      : "https://" + req.headers.host;

    res.status(200).json({ url: `${baseUrl}/uploads/${name}` });
  });
}
