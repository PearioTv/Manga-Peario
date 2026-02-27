import { searchManga } from '../../lib/scraper';

export default async function handler(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Missing query param q' });
    const data = await searchManga(q);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
