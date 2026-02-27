// في قسم عرض النتائج
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
      {results.length === 24 && (
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          قد توجد نتائج إضافية
        </span>
      )}
    </div>
    <div className="manga-grid">
      {results.map((m, i) => (
        <MangaCard key={i} {...m} />
      ))}
    </div>
  </>
)}
