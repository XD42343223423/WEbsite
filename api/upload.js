import { writeFile } from "fs/promises";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm({
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Failed to parse file" });

    const file = files.file;
    const ext = path.extname(file.originalFilename || ".png");
    const name = Date.now() + ext;
    const dest = path.join("/tmp", name);

    await writeFile(dest, await fs.promises.readFile(file.filepath));

    const baseUrl = req.headers.host.startsWith("localhost")
      ? "http://" + req.headers.host
      : "https://" + req.headers.host;

    const url = `${baseUrl}/api/image?id=${name}`;
    globalThis[`img_${name}`] = dest;

    res.status(200).json({ url });
  });
}
