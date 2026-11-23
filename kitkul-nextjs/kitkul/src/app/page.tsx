import { supabase, type Video } from '@/lib/supabase';
import VideoCard from '@/components/VideoCard';

export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim().replace(/[%,()*]/g, '');
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(60);
  if (q) query = query.or(`title.ilike.%${q}%,uploader.ilike.%${q}%`);
  const { data, error } = await query;
  const videos = (data ?? []) as Video[];
  const noEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hint = noEnv
    ? 'ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ใน Vercel (ตั้งแล้วต้อง Redeploy)'
    : error?.code === 'PGRST205' || error?.code === '42P01'
      ? 'ยังไม่ได้รัน supabase/schema.sql ใน Supabase SQL Editor'
      : 'ตรวจสอบว่า Project URL และ Publishable key ถูกต้อง';

  return (
    <>
      <h2>{q ? `ผลการค้นหา “${q}”` : 'วิดีโอล่าสุด'}</h2>
      {error ? (
        <div className="empty">
          <div>เชื่อมต่อฐานข้อมูลไม่ได้</div>
          <p className="mute" style={{ fontWeight: 400 }}>{hint}</p>
          <code>{error.code ?? ''} {error.message}</code>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty">{q ? 'ไม่พบวิดีโอที่ค้นหา' : 'ยังไม่มีวิดีโอ — กด “อัปโหลดวิดีโอ” เพื่อแชร์คลิปแรกของคุณ!'}</div>
      ) : (
        <div className="grid">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
      )}
    </>
  );
}
