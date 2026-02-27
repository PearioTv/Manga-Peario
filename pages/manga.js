import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function MangaPage({ toggleTheme, dark }) {
  const router = useRouter();
  const { url } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) return;
    
    const fetchMangaDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/manga?url=${encodeURIComponent(url)}`);
        const d = await res.json();
        
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.error || 'فشل تحميل المانجا');
        }
      } catch (err) {
        setError('فشل الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchMangaDetails();
  }, [url]);

  const goChapter = (chapUrl) => {
    router.push(`/chapter?url=${encodeURIComponent(chapUrl)}`);
  };

  const statusClass = data?.status?.includes('مستمر') || data?.status?.includes('ongoing')
    ? 'status-ongoing' : 'status-completed';

  return (
    <>
      <Head>
        <title>{data?.title || 'مانجا'} - Manga Peario</title>
      </Head>
      <Navbar toggleTheme={toggleTheme} dark={dark} />
      <div className="container">
        {loading && <div className="loading">⏳ جاري التحميل...</div>}
        {error && <div className="error-box">⚠️ {error}</div>}

        {data && (
          <>
            <div className="manga-details">
              <div>
                <img
                  className="manga-cover-large"
                  src={data.cover || '/placeholder.png'}
                  alt={data.title}
                  onError={e => { e.target.src = '/placeholder.png'; }}
                />
              </div>
              <div className="manga-meta">
                <h1>{data.title}</h1>
                <div className="meta-row">
                  {data.status && (
                    <span className={`badge ${statusClass}`}>{data.status}</span>
                  )}
                  {data.chapterCount > 0 && (
                    <span className="badge">📄 {data.chapterCount} فصل</span>
                  )}
                </div>
                {data.author && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 8 }}>
                    ✍️ المؤلف: <strong style={{ color: 'var(--text)' }}>{data.author}</strong>
                  </div>
                )}
                {data.artist && data.artist !== data.author && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 8 }}>
                    🎨 الرسام: <strong style={{ color: 'var(--text)' }}>{data.artist}</strong>
                  </div>
                )}
                {data.genres?.length > 0 && (
                  <div className="meta-row" style={{ marginTop: 8 }}>
                    {data.genres.map((g, i) => (
                      <span key={i} className="badge">{g}</span>
                    ))}
                  </div>
                )}
                {data.description && (
                  <p className="description">{data.description}</p>
                )}
              </div>
            </div>

            {/* Chapter List */}
            <div className="chapter-list">
              <div className="section-title">📄 قائمة الفصول ({data.chapters?.length || 0})</div>
              {data.chapters?.length === 0 && (
                <div className="empty">لا توجد فصول</div>
              )}
              {data.chapters?.map((ch, i) => (
                <div
                  key={i}
                  className="chapter-item"
                  onClick={() => goChapter(ch.link)}
                >
                  <span className="chapter-name">{ch.title || `فصل ${i + 1}`}</span>
                  <span className="chapter-date">{ch.date}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
