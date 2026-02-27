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
    
    const searchManga = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const d = await res.json();
        
        if (d.success) {
          setResults(d.data);
        } else {
          setError(d.error || 'حدث خطأ في البحث');
        }
      } catch (err) {
        setError('فشل الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    searchManga();
  }, [q]);

  return (
    <>
      <Head>
        <title>{q ? `بحث: ${q}` : 'بحث'} - Manga Peario</title>
      </Head>
      <Navbar toggleTheme={toggleTheme} dark={dark} />
      <div className="container">
        <div className="section-title">
          🔎 نتائج البحث عن: {q}
        </div>

        {loading && <div className="loading">⏳ جاري البحث...</div>}
        {error && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && results.length === 0 && q && (
          <div className="empty">
            😕 لا توجد نتائج لـ "{q}"
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div style={{ 
              background: 'var(--surface)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius)',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>🔍 تم العثور على <strong>{results.length}</strong> نتيجة</span>
            </div>
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
