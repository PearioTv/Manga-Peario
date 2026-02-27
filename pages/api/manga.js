import { getMangaDetails } from '../../lib/scraper';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'Missing url param' });
    const data = await getMangaDetails(decodeURIComponent(url));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
