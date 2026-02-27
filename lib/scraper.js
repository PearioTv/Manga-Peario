const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BASE_URL = 'https://lekmanga.net';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
  'Accept-Language': 'ar,en;q=0.9',
  'Referer': BASE_URL,
};

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// 📚 Latest chapters / homepage
async function getLatestChapters(page = 1) {
  const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = [];

  // Try common selectors for manga listing sites
  $('div.page-item-detail, .listupd .bs, .uta, article').each((i, el) => {
    const $el = $(el);
    const title = $el.find('h3 a, h2 a, .tt').first().text().trim();
    const link = $el.find('h3 a, h2 a, .tt a, a').first().attr('href') || '';
    const cover = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
    const latestChap = $el.find('.chapter a, li a').first().text().trim();
    const chapLink = $el.find('.chapter a, li a').first().attr('href') || '';

    if (title && link) {
      items.push({ title, link, cover, latestChap, chapLink });
    }
  });

  return items;
}

// 🔎 Search
async function searchManga(query) {
  const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = [];

  $('div.page-item-detail, .listupd .bs, .uta, article, .bsx').each((i, el) => {
    const $el = $(el);
    const title = $el.find('h3 a, h2 a, .tt').first().text().trim();
    const link = $el.find('a').first().attr('href') || '';
    const cover = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
    const type = $el.find('.type, .typeflag').text().trim();
    if (title && link) items.push({ title, link, cover, type });
  });

  return items;
}

// 📖 Manga details
async function getMangaDetails(mangaUrl) {
  const url = mangaUrl.startsWith('http') ? mangaUrl : `${BASE_URL}${mangaUrl}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const title = $('h1.entry-title, .entry-title, h1').first().text().trim();
  const cover = $('.thumb img, .summary_image img').first().attr('src') || $('.thumb img').first().attr('data-src') || '';
  const description = $('.entry-content p, .summary__content p, #synopsis').first().text().trim();

  const info = {};
  $('.imptdt, .infotable tr, .tsinfo .imptdt').each((i, el) => {
    const label = $(el).find('b, i, th').text().trim().toLowerCase();
    const value = $(el).find('a, td').last().text().trim() || $(el).text().replace(label, '').trim();
    if (label) info[label] = value;
  });

  const author = info['المؤلف'] || info['author'] || $('a[href*="author"]').first().text().trim() || '';
  const artist = info['الرسام'] || info['artist'] || $('a[href*="artist"]').first().text().trim() || '';
  const status = info['الحالة'] || info['status'] || '';
  const genres = [];
  $('.mgen a, .genres-content a, .genre-info a').each((i, el) => genres.push($(el).text().trim()));

  const chapters = [];
  $('#chapterlist li, .cl li, ul.clstyle li').each((i, el) => {
    const $el = $(el);
    const chapTitle = $el.find('a .chapternum, a span').first().text().trim() || $el.find('a').text().trim();
    const chapLink = $el.find('a').first().attr('href') || '';
    const chapDate = $el.find('.chapterdate, .added').text().trim();
    if (chapLink) chapters.push({ title: chapTitle, link: chapLink, date: chapDate });
  });

  return { title, cover, description, author, artist, status, genres, chapters, chapterCount: chapters.length };
}

// 🖼️ Chapter pages
async function getChapterPages(chapterUrl) {
  const url = chapterUrl.startsWith('http') ? chapterUrl : `${BASE_URL}${chapterUrl}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const pages = [];

  // Common readers
  $('#readerarea img, .reading-content img, .page-break img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || '';
    if (src && !src.includes('data:image')) pages.push(src.trim());
  });

  // Fallback: ts_reader JS variable
  if (pages.length === 0) {
    const match = html.match(/ts_reader\.run\((\{.*?\})\)/s);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const source = data.sources?.[0];
        if (source?.images) pages.push(...source.images);
      } catch (e) {}
    }
  }

  // Nav links
  const prevChap = $('a.prev_page, .navleft a, #prev-chapter').first().attr('href') || '';
  const nextChap = $('a.next_page, .navright a, #next-chapter').first().attr('href') || '';
  const mangaLink = $('ol.breadcrumb li:nth-child(2) a, .allc a').first().attr('href') || '';
  const chapterTitle = $('h1, .entry-title').first().text().trim();

  return { pages, prevChap, nextChap, mangaLink, chapterTitle };
}

module.exports = { getLatestChapters, searchManga, getMangaDetails, getChapterPages };
