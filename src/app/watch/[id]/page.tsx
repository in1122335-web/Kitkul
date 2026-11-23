import { notFound } from 'next/navigation';
import { supabase, publicUrl, type Video, type Comment } from '@/lib/supabase';
import { date, num } from '@/lib/format';
import VideoCard from '@/components/VideoCard';
import Comments from '@/components/Comments';
import ViewCounter from '@/components/ViewCounter';
import Actions from '@/components/Actions';

export const revalidate = 0;

export default async function Watch({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const [vr, cr, rr] = await Promise.all([
    supabase.from('videos').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('comments').select('*').eq('video_id', params.id).order('created_at', { ascending: false }),
    supabase.from('videos').select('*').neq('id', params.id).order('created_at', { ascending: false }).limit(8),
  ]);
  const v = vr.data as Video | null;
  if (!v) notFound();
  const thumb = v.thumb_path ? publicUrl('thumbnails', v.thumb_path) : undefined;

  return (
    <div className="watch">
      <ViewCounter id={v.id} />
      <div>
        <video controls preload="metadata" playsInline poster={thumb} src={publicUrl('videos', v.video_path)} />
        <h1>{v.title}</h1>
        <div className="mute">โดย {v.uploader} · {num(v.views)} ครั้ง · {date(v.created_at)}</div>
        <Actions id={v.id} title={v.title} likes={v.likes} dislikes={v.dislikes} shares={v.shares} />
        <div className="desc">{v.description || '(ไม่มีคำอธิบาย)'}</div>
        <Comments videoId={v.id} initial={(cr.data ?? []) as Comment[]} />
      </div>
      <aside>
        <h2>วิดีโอแนะนำ</h2>
        {((rr.data ?? []) as Video[]).map((x) => <VideoCard key={x.id} v={x} compact />)}
        {!rr.data?.length && <p className="mute">ยังไม่มีวิดีโออื่น</p>}
      </aside>
    </div>
  );
}
