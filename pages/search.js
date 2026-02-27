import { searchManga } from '../../lib/scraper';

export default async function handler(req, res) {
  // تفعيل CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing query param q' 
      });
    }

    const data = await searchManga(q);
    res.status(200).json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'فشل البحث' 
    });
  }
}
