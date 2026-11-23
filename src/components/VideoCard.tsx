import Link from 'next/link';
import { publicUrl, type Video } from '@/lib/supabase';
import { date, dur, num } from '@/lib/format';

export default function VideoCard({ v, compact = false }: { v: Video; compact?: boolean }) {
  const thumb = v.thumb_path ? publicUrl('thumbnails', v.thumb_path) : null;
  return (
    <Link className={compact ? 'rel' : 'card'} href={`/watch/${v.id}`}>
      <div className="th" style={thumb ? { backgroundImage: `url('${thumb}')` } : undefined}>
        {!thumb && '🎬'}
        {v.duration > 0 && <i>{dur(v.duration)}</i>}
      </div>
      <div>
        <div className="t">{v.title}</div>
        <div className="m">{v.uploader}<br />{num(v.views)} ครั้ง · {date(v.created_at)}</div>
      </div>
    </Link>
  );
}
