const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BASE_URL = 'https://lekmanga.net';

// استخدام CORS Proxy لتجاوز حماية Cloudflare
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

async function fetchPage(url, useProxy = true) {
  try {
    // استخدام البروكسي إذا كان مطلوباً
    const fetchUrl = useProxy ? `${PROXY_URL}${encodeURIComponent(url)}` : url;
    
    const res = await fetch(fetchUrl, { 
      headers: HEADERS,
      timeout: 10000 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error('Fetch error:', error);
    // محاولة بدون بروكسي إذا فشل
    if (useProxy) {
      return fetchPage(url, false);
    }
    throw error;
  }
}

// 📚 Latest chapters / homepage
async function getLatestChapters(page = 1) {
  try {
    const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const items = [];

    // محددات موقع lekmanga
    $('.c-tabs-item__content, .page-item-detail, .row .col-sm-6').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('.post-title h4 a, .post-title a').text().trim();
      const link = $el.find('.post-title a').attr('href') || '';
      
      // البحث عن صورة الغلاف
      let cover = $el.find('img').attr('src') || 
                  $el.find('img').attr('data-src') || 
                  $el.find('img').attr('data-lazy-src') || '';
      
      // تنظيف رابط الصورة
      if (cover && !cover.startsWith('http')) {
        cover = cover.startsWith('//') ? 'https:' + cover : cover;
      }

      // آخر فصل
      const latestChap = $el.find('.list-chapter a').first().text().trim() || 
                        $el.find('.chapter-item a').first().text().trim();
      const chapLink = $el.find('.list-chapter a').first().attr('href') || '';

      if (title && link) {
        items.push({
          title,
          link,
          cover,
          latestChap,
          chapLink
        });
      }
    });

    return items;
  } catch (error) {
    console.error('Error in getLatestChapters:', error);
    return [];
  }
}

// 🔎 Search محسن
async function searchManga(query) {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=wp-manga`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const items = [];

    $('.c-tabs-item__content, .c-post, .row.c-row .col-6').each((i, el) => {
      const $el = $(el);
      
      const title = $el.find('.post-title h4 a, .post-title a').text().trim();
      const link = $el.find('.post-title a').attr('href') || '';
      
      let cover = $el.find('img').attr('src') || 
                  $el.find('img').attr('data-src') || 
                  $el.find('img').attr('data-lazy-src') || 
                  '/placeholder.png';

      if (cover && !cover.startsWith('http')) {
        cover = cover.startsWith('//') ? 'https:' + cover : cover;
      }

      const author = $el.find('.mg_author a').text().trim();
      const status = $el.find('.mg_status .summary-content').text().trim();

      if (title && link) {
        items.push({ 
          title, 
          link, 
          cover, 
          author,
          status
        });
      }
    });

    return items;
  } catch (error) {
    console.error('Error in searchManga:', error);
    return [];
  }
}

// 📖 Manga details
async function getMangaDetails(mangaUrl) {
  try {
    const url = mangaUrl.startsWith('http') ? mangaUrl : `${BASE_URL}${mangaUrl}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const title = $('.post-title h1').text().trim() || 
                  $('.entry-title').text().trim();
    
    let cover = $('.summary_image img').attr('src') || 
                $('.thumb img').attr('src') || 
                $('img[itemprop="image"]').attr('src') || 
                '/placeholder.png';

    if (cover && !cover.startsWith('http')) {
      cover = cover.startsWith('//') ? 'https:' + cover : cover;
    }

    // الوصف
    const description = $('.summary__content p').first().text().trim() || 
                       $('.description-summary p').text().trim() || 
                       'لا يوجد وصف';

    // المعلومات
    const info = {};
    $('.post-content .meta-item, .post-content .mg_author, .post-content .mg_status, .post-content .mg_artist').each((i, el) => {
      const $el = $(el);
      const label = $el.find('.meta-label, strong').text().trim().toLowerCase();
      const value = $el.find('.meta-value, a').text().trim();
      if (label && value) info[label] = value;
    });

    const author = info['المؤلف'] || info['author'] || $('.mg_author .summary-content').text().trim() || 'غير معروف';
    const artist = info['الرسام'] || info['artist'] || $('.mg_artist .summary-content').text().trim() || author;
    const status = info['الحالة'] || info['status'] || $('.mg_status .summary-content').text().trim() || 'غير معروف';

    // التصنيفات
    const genres = [];
    $('.genres-content a, .mg_genre a').each((i, el) => {
      const genre = $(el).text().trim();
      if (genre) genres.push(genre);
    });

    // الفصول
    const chapters = [];
    $('.wp-manga-chapter, .chapter-item, li.wp-manga-chapter').each((i, el) => {
      const $el = $(el);
      const chapLink = $el.find('a').attr('href') || '';
      const chapTitle = $el.find('a').text().trim();
      const chapDate = $el.find('.chapter-release-date, .date').text().trim() || '';

      if (chapLink) {
        chapters.push({ 
          title: chapTitle || `الفصل ${i + 1}`, 
          link: chapLink, 
          date: chapDate 
        });
      }
    });

    // ترتيب الفصول من الأحدث إلى الأقدم
    chapters.reverse();

    return { 
      title, 
      cover, 
      description, 
      author, 
      artist, 
      status, 
      genres, 
      chapters, 
      chapterCount: chapters.length 
    };
  } catch (error) {
    console.error('Error in getMangaDetails:', error);
    throw error;
  }
}

// 🖼️ Chapter pages
async function getChapterPages(chapterUrl) {
  try {
    const url = chapterUrl.startsWith('http') ? chapterUrl : `${BASE_URL}${chapterUrl}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const pages = [];

    // صور القراءة
    $('.reading-content img, .page-break img, .wp-manga-chapter-img').each((i, el) => {
      let src = $(el).attr('src') || 
                $(el).attr('data-src') || 
                $(el).attr('data-lazy-src') || 
                $(el).attr('data-cfsrc') || '';
      
      if (src && !src.includes('data:image') && !src.includes('blank.gif')) {
        if (src.startsWith('//')) src = 'https:' + src;
        pages.push(src.trim());
      }
    });

    // عنوان الفصل
    const chapterTitle = $('.breadcrumb li:last-child, h1.entry-title').text().trim() || '';

    // روابط التنقل
    const prevChap = $('.nav-links .prev_page, .prev a, a.prev').attr('href') || '';
    const nextChap = $('.nav-links .next_page, .next a, a.next').attr('href') || '';
    
    // رابط المانجا
    const mangaLink = $('.breadcrumb li:nth-child(2) a').attr('href') || 
                      $('.back-to-manga a').attr('href') || '';

    return { 
      pages, 
      prevChap, 
      nextChap, 
      mangaLink, 
      chapterTitle 
    };
  } catch (error) {
    console.error('Error in getChapterPages:', error);
    throw error;
  }
}

module.exports = { getLatestChapters, searchManga, getMangaDetails, getChapterPages };
