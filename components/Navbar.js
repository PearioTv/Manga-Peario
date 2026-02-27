import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar({ toggleTheme, dark }) {
  const [q, setQ] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <nav className="navbar">
      <Link href="/" className="logo">⛩ Manga Peario</Link>
      <form className="nav-search" onSubmit={handleSearch}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ابحث عن مانجا..."
          type="text"
        />
        <button className="btn" type="submit">🔎</button>
      </form>
      <button className="theme-toggle" onClick={toggleTheme} title="تبديل الوضع">
        {dark ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}
