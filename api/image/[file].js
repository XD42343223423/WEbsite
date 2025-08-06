import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { file } = req.query;
  const filePath = path.join("/tmp", file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  }[ext] || "application/octet-stream";

  const stream = fs.createReadStream(filePath);
  res.setHeader("Content-Type", contentType);
  stream.pipe(res);
}
