import { useRouter } from 'next/router';

export default function MangaCard({ title, cover, latestChap, link }) {
  const router = useRouter();

  const go = () => {
    router.push(`/manga?url=${encodeURIComponent(link)}`);
  };

  return (
    <div className="manga-card" onClick={go}>
      <img
        className="manga-cover"
        src={cover || '/placeholder.png'}
        alt={title}
        onError={e => { e.target.src = '/placeholder.png'; }}
        loading="lazy"
      />
      <div className="manga-info">
        <div className="manga-title">{title}</div>
        {latestChap && <div className="manga-chapter">{latestChap}</div>}
      </div>
    </div>
  );
}
