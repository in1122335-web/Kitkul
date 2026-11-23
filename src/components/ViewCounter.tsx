'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// นับยอดชมครั้งเดียวต่อเบราว์เซอร์ต่อคลิป (ต่อการเปิดแท็บ)
export default function ViewCounter({ id }: { id: string }) {
  useEffect(() => {
    const k = `kk_v_${id}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    } catch {}
    // ต้องมี .then() เพราะ query ของ Supabase จะไม่ถูกส่งจนกว่าจะมีคนรอผลลัพธ์
    supabase.rpc('increment_views', { vid: id }).then(({ error }) => {
      if (error) {
        console.error('increment_views failed:', error.message);
        try { sessionStorage.removeItem(k); } catch {}
      }
    });
  }, [id]);
  return null;
}
