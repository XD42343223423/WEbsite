import formidable from 'formidable';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  return res.status(200).json({ status: 'Formidable is working!' });
}
