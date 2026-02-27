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
    setLoading(true);
    setError('');
    fetch(`/api/latest?page=${page}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setManga(d.data);
        else setError(d.error || 'حدث خطأ');
      })
      .catch(() => setError('فشل تحميل البيانات'))
      .finally(() => setLoading(false));
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
          <div className="manga-grid">
            {manga.map((m, i) => (
              <MangaCard key={i} {...m} />
            ))}
          </div>
        )}

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
          >
            التالية →
          </button>
        </div>
      </div>
    </>
  );
}
