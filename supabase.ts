import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  { auth: { persistSession: false } }
);

export const publicUrl = (bucket: 'videos' | 'thumbnails', path: string) =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

export type Video = {
  id: string; title: string; uploader: string; description: string;
  video_path: string; thumb_path: string | null; duration: number;
  views: number; created_at: string;
};
export type Comment = { id: string; video_id: string; author: string; body: string; created_at: string };
