import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function ChapterPage({ toggleTheme, dark }) {
  const router = useRouter();
  const { url } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('vertical'); // vertical | horizontal

  useEffect(() => {
    if (!url) return;
    
    const fetchChapter = async () => {
      setLoading(true);
      setData(null);
      setError('');
      try {
        const res = await fetch(`/api/chapter?url=${encodeURIComponent(url)}`);
        const d = await res.json();
        
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.error || 'فشل تحميل الفصل');
        }
      } catch (err) {
        setError('فشل الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [url]);

  const goChapter = (chapUrl) => {
    if (!chapUrl) return;
    router.push(`/chapter?url=${encodeURIComponent(chapUrl)}`);
  };

  return (
    <>
      <Head>
        <title>{data?.chapterTitle || 'قارئ الفصل'} - Manga Peario</title>
      </Head>
      <Navbar toggleTheme={toggleTheme} dark={dark} />

      {/* Reader Controls */}
      <div className="reader-header">
        <button
          className="btn btn-ghost"
          onClick={() => data?.mangaLink && router.push(`/manga?url=${encodeURIComponent(data.mangaLink)}`)}
        >
          ← المانجا
        </button>

        <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
          {data?.chapterTitle || ''}
        </span>

        <button
          className="btn btn-ghost"
          onClick={() => setMode(m => m === 'vertical' ? 'horizontal' : 'vertical')}
          title="تبديل طريقة العرض"
        >
          {mode === 'vertical' ? '↔ أفقي' : '↕ عمودي'}
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => goChapter(data?.prevChap)}
          disabled={!data?.prevChap}
        >
          ← السابق
        </button>
        <button
          className="btn"
          onClick={() => goChapter(data?.nextChap)}
          disabled={!data?.nextChap}
        >
          التالي →
        </button>
      </div>

      {loading && <div className="loading">⏳ جاري تحميل الصفحات...</div>}
      {error && <div className="error-box" style={{ margin: '32px auto', maxWidth: 600 }}>⚠️ {error}</div>}

      {data && (
        <>
          <div className={`reader-images ${mode}`}>
            {data.pages.length === 0 && (
              <div className="empty">لا توجد صور لهذا الفصل</div>
            )}
            {data.pages.map((src, i) => (
              <img
                key={i}
                className="page-img"
                src={src}
                alt={`صفحة ${i + 1}`}
                loading="lazy"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>

          {/* Bottom nav */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '24px 0 40px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => goChapter(data.prevChap)}
              disabled={!data.prevChap}
            >
              ← الفصل السابق
            </button>
            <button
              className="btn"
              onClick={() => goChapter(data.nextChap)}
              disabled={!data.nextChap}
            >
              الفصل التالي →
            </button>
          </div>
        </>
      )}
    </>
  );
}
