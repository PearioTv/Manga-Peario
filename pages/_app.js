import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') setDark(false);
  }, []);

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <div className={dark ? '' : 'light'}>
      <Component {...pageProps} toggleTheme={toggleTheme} dark={dark} />
    </div>
  );
}
