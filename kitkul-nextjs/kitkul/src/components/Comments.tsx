'use client';
import { useEffect, useState } from 'react';
import { supabase, type Comment } from '@/lib/supabase';

export default function Comments({ videoId, initial }: { videoId: string; initial: Comment[] }) {
  const [list, setList] = useState<Comment[]>(initial);
  const [busy, setBusy] = useState(false);
  const add = (c: Comment) => setList((l) => (l.some((x) => x.id === c.id) ? l : [c, ...l]));

  useEffect(() => {
    const ch = supabase
      .channel(`comments-${videoId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` },
        (p) => add(p.new as Comment))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [videoId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const author = String(fd.get('author')).trim(), body = String(fd.get('body')).trim();
    if (!author || !body) return;
    try { localStorage.setItem('kk_name', author); } catch {}
    setBusy(true);
    const { data, error } = await supabase.from('comments')
      .insert({ video_id: videoId, author, body }).select().single();
    setBusy(false);
    if (error) return alert(`ส่งไม่สำเร็จ: ${error.message}`);
    add(data as Comment);
    (form.elements.namedItem('body') as HTMLTextAreaElement).value = '';
  }

  return (
    <>
      <h2>ความคิดเห็น ({list.length})</h2>
      <form className="cf" onSubmit={submit}>
        <input name="author" maxLength={30} placeholder="ชื่อของคุณ" required
          defaultValue={typeof window !== 'undefined' ? localStorage.getItem('kk_name') ?? '' : ''} />
        <textarea name="body" rows={3} maxLength={500} placeholder="เขียนความคิดเห็น…" required />
        <div><button className="btn" disabled={busy}>ส่งความคิดเห็น</button></div>
      </form>
      {list.length === 0 && <p className="mute">ยังไม่มีความคิดเห็น เป็นคนแรกเลย!</p>}
      {list.map((c) => (
        <div className="cm" key={c.id}>
          <b>{c.author}</b><span>{new Date(c.created_at).toLocaleString('th-TH')}</span><br />{c.body}
        </div>
      ))}
    </>
  );
}
