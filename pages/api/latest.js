import { getLatestChapters } from '../../lib/scraper';

export default async function handler(req, res) {
  try {
    const { page = 1 } = req.query;
    const data = await getLatestChapters(parseInt(page));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
