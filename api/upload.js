import formidable from "formidable";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = formidable({ multiples: false, keepExtensions: true, uploadDir: "/tmp" });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.file[0];
    const fileExt = path.extname(file.originalFilename || ".png");
    const randomName = randomBytes(6).toString("hex") + fileExt;
    const newPath = path.join("/tmp", randomName);

    fs.renameSync(file.filepath, newPath);

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    const imageUrl = `${protocol}://${host}/api/image/${randomName}`;
    res.status(200).json({ url: imageUrl });
  });
}
