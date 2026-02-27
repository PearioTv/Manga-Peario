// أضف هذه الدالة للتعامل مع الأخطاء بشكل أفضل
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
