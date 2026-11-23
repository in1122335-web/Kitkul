'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { grabFrame } from '@/lib/frame';

const MAX = 50 * 1024 * 1024;

export default function UploadDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get('file') as File;
    if (!file || !file.size) return;
    if (file.size > MAX) return setMsg('ไฟล์ใหญ่เกิน 50 MB');
    const uploader = String(fd.get('uploader')).trim();
    try { localStorage.setItem('kk_name', uploader); } catch {}
    setBusy(true); setMsg('กำลังอัปโหลด… กรุณารอสักครู่');
    try {
      const id = crypto.randomUUID();
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
      const videoPath = `${id}.${ext}`;
      const { blob, duration } = await grabFrame(file);
      const up = await supabase.storage.from('videos').upload(videoPath, file, { contentType: file.type });
      if (up.error) throw up.error;
      let thumbPath: string | null = null;
      if (blob) {
        thumbPath = `${id}.jpg`;
        const t = await supabase.storage.from('thumbnails').upload(thumbPath, blob, { contentType: 'image/jpeg' });
        if (t.error) thumbPath = null;
      }
      const { error } = await supabase.from('videos').insert({
        id, title: String(fd.get('title')).trim(), uploader,
        description: String(fd.get('description') ?? '').trim(),
        video_path: videoPath, thumb_path: thumbPath, duration,
      });
      if (error) throw error;
      form.reset(); ref.current?.close(); setMsg('');
      router.push(`/watch/${id}`); router.refresh();
    } catch (err: any) {
      setMsg(`อัปโหลดไม่สำเร็จ: ${err?.message ?? err}`);
    }
    setBusy(false);
  }

  return (
    <>
      <button className="btn" onClick={() => ref.current?.showModal()}>⬆ อัปโหลดวิดีโอ</button>
      <dialog ref={ref}>
        <form onSubmit={onSubmit}>
          <h2>อัปโหลดวิดีโอ</h2>
          <input type="file" name="file" accept="video/mp4,video/webm,video/quicktime" required />
          <input name="title" placeholder="ชื่อคลิป" maxLength={100} required />
          <input name="uploader" placeholder="ชื่อผู้อัปโหลด" maxLength={30} required
            defaultValue={typeof window !== 'undefined' ? localStorage.getItem('kk_name') ?? '' : ''} />
          <textarea name="description" rows={3} maxLength={1000} placeholder="คำอธิบายคลิป" />
          <div className="mute">{msg}</div>
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => ref.current?.close()}>ยกเลิก</button>
            <button className="btn" disabled={busy}>อัปโหลด</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
