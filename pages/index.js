import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';

export default function Home({ toggleTheme, dark }) {
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/latest?page=${page}`);
        const d = await res.json();
        
        if (d.success) {
          setManga(d.data);
        } else {
          setError(d.error || 'حدث خطأ في تحميل البيانات');
        }
      } catch (err) {
        setError('فشل الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [page]);

  return (
    <>
      <Head>
        <title>Manga Peario - أحدث المانجا</title>
        <meta name="description" content="موقع قراءة المانجا - Manga Peario" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar toggleTheme={toggleTheme} dark={dark} />
      <div className="container">
        <div className="section-title">📚 أحدث التحديثات</div>

        {loading && <div className="loading">⏳ جاري التحميل...</div>}
        {error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && manga.length === 0 && (
          <div className="empty">لا توجد نتائج</div>
        )}

        {!loading && manga.length > 0 && (
          <>
            <div className="manga-grid">
              {manga.map((m, i) => (
                <MangaCard key={i} {...m} />
              ))}
            </div>

            <div className="pagination">
              <button
                className="btn btn-ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← السابقة
              </button>
              <span style={{ padding: '8px 16px', color: 'var(--muted)' }}>صفحة {page}</span>
              <button
                className="btn"
                onClick={() => setPage(p => p + 1)}
                disabled={manga.length < 20} // تعطيل إذا كانت النتائج أقل من 20
              >
                التالية →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
