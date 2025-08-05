import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { id } = req.query;
  const filepath = globalThis[`img_${id}`];

  if (!filepath || !fs.existsSync(filepath)) {
    res.status(404).send("Not found");
    return;
  }

  const ext = path.extname(filepath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
               ext === ".png" ? "image/png" :
               "application/octet-stream";

  res.setHeader("Content-Type", mime);
  fs.createReadStream(filepath).pipe(res);
}
