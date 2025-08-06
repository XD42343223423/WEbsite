export const config = {
  api: {
    bodyParser: false,
  },
};

if (!globalThis.imageMap) globalThis.imageMap = new Map();

export default async function handler(req, res) {
  const { file } = req.query;

  const entry = globalThis.imageMap.get(file);
  if (!entry) return res.status(404).send("Image not found.");

  res.setHeader("Content-Type", entry.type);
  res.setHeader("Cache-Control", "public, max-age=31536000");
  res.status(200).send(entry.content);
}
