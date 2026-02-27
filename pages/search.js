import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import MangaCard from '../components/MangaCard';

export default function Search({ toggleTheme, dark }) {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError('');
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setResults(d.data);
        else setError(d.error || 'حدث خطأ');
      })
      .catch(() => setError('فشل البحث'))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <Head>
        <title>{q ? `بحث: ${q}` : 'بحث'} - Manga Peario</title>
      </Head>
      <Navbar toggleTheme={toggleTheme} dark={dark} />
      <div className="container">
        <div className="section-title">🔎 نتائج البحث عن: {q}</div>

        {loading && <div className="loading">⏳ جاري البحث...</div>}
        {error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && results.length === 0 && q && (
          <div className="empty">😕 لا توجد نتائج لـ "{q}"</div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.9rem' }}>
              تم العثور على {results.length} نتيجة
            </p>
            <div className="manga-grid">
              {results.map((m, i) => (
                <MangaCard key={i} {...m} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
