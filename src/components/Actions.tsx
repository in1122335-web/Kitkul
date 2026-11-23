'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { num } from '@/lib/format';

function voterId() {
  try {
    let v = localStorage.getItem('kk_voter');
    if (!v) { v = crypto.randomUUID(); localStorage.setItem('kk_voter', v); }
    return v;
  } catch { return 'anon-' + Math.random().toString(36).slice(2, 12); }
}

export default function Actions(p: { id: string; title: string; likes: number; dislikes: number; shares: number }) {
  const [likes, setLikes] = useState(p.likes);
  const [dislikes, setDislikes] = useState(p.dislikes);
  const [shares, setShares] = useState(p.shares);
  const [mine, setMine] = useState(0);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    supabase.rpc('get_my_vote', { vid: p.id, voter_id: voterId() }).then(({ data }) => {
      if (typeof data === 'number') setMine(data);
    });
  }, [p.id]);

  function vote(val: 1 | -1) {
    const prev = { likes, dislikes, mine };
    // อัปเดตหน้าจอทันที แล้วใช้ค่าจริงจากเซิร์ฟเวอร์ทับ
    let l = likes, d = dislikes;
    if (mine === 1) l--; if (mine === -1) d--;
    const next = mine === val ? 0 : val;
    if (next === 1) l++; if (next === -1) d++;
    setLikes(Math.max(l, 0)); setDislikes(Math.max(d, 0)); setMine(next);
    supabase.rpc('vote_video', { vid: p.id, voter_id: voterId(), val }).then(({ data, error }) => {
      const r = Array.isArray(data) ? data[0] : null;
      if (error || !r) { setLikes(prev.likes); setDislikes(prev.dislikes); setMine(prev.mine); return; }
      setLikes(Number(r.out_likes)); setDislikes(Number(r.out_dislikes)); setMine(r.out_mine);
    });
  }

  function counted() {
    setShares((s) => s + 1);
    supabase.rpc('increment_shares', { vid: p.id }).then(() => {});
  }
  const url = () => window.location.href;
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(''), 2000); };

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: p.title, url: url() }); counted(); } catch {}
    } else setOpen((o) => !o);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url()); flash('คัดลอกลิงก์แล้ว'); counted(); }
    catch { flash('คัดลอกไม่สำเร็จ'); }
  }
  const enc = (s: string) => encodeURIComponent(s);

  return (
    <div className="actions">
      <button className={`pill${mine === 1 ? ' on' : ''}`} onClick={() => vote(1)} aria-pressed={mine === 1}>👍 {num(likes)}</button>
      <button className={`pill${mine === -1 ? ' on' : ''}`} onClick={() => vote(-1)} aria-pressed={mine === -1}>👎 {num(dislikes)}</button>
      <button className="pill" onClick={share}>↗ แชร์ {shares > 0 && `(${num(shares)})`}</button>
      <button className="pill" onClick={() => setOpen((o) => !o)} aria-label="ตัวเลือกแชร์เพิ่มเติม">⋯</button>
      {open && (
        <div className="sharebox">
          <button className="pill" onClick={copy}>🔗 คัดลอกลิงก์</button>
          <a className="pill" target="_blank" rel="noopener" onClick={counted}
            href={`https://social-plugins.line.me/lineit/share?url=${enc(typeof window !== 'undefined' ? url() : '')}`}>LINE</a>
          <a className="pill" target="_blank" rel="noopener" onClick={counted}
            href={`https://www.facebook.com/sharer/sharer.php?u=${enc(typeof window !== 'undefined' ? url() : '')}`}>Facebook</a>
          <a className="pill" target="_blank" rel="noopener" onClick={counted}
            href={`https://twitter.com/intent/tweet?url=${enc(typeof window !== 'undefined' ? url() : '')}&text=${enc(p.title)}`}>X</a>
        </div>
      )}
      {note && <span className="mute">{note}</span>}
    </div>
  );
}
