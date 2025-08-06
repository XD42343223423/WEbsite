import formidable from "formidable";
import { readFileSync, unlinkSync } from "fs";
import { randomBytes } from "crypto";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!globalThis.imageMap) globalThis.imageMap = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = formidable({ multiples: false, keepExtensions: true, uploadDir: "/tmp" });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.file[0];
    const fileExt = path.extname(file.originalFilename || ".jpg");
    const fileName = randomBytes(6).toString("hex") + fileExt;
    const fileData = readFileSync(file.filepath);
    unlinkSync(file.filepath); // cleanup

    globalThis.imageMap.set(fileName, {
      content: fileData,
      type: file.mimetype || "image/jpeg"
    });

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const imageUrl = `${protocol}://${host}/api/image/${fileName}`;

    res.status(200).json({ url: imageUrl });
  });
}
