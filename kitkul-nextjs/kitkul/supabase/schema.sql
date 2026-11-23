-- Kitkul: วางทั้งไฟล์นี้ใน Supabase > SQL Editor แล้วกด Run
create extension if not exists pgcrypto;

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  uploader text not null check (char_length(uploader) between 1 and 30),
  description text not null default '' check (char_length(description) <= 1000),
  video_path text not null,
  thumb_path text,
  duration real not null default 0,
  views bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  author text not null check (char_length(author) between 1 and 30),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index on public.comments (video_id, created_at desc);
create index on public.videos (created_at desc);

alter table public.videos enable row level security;
alter table public.comments enable row level security;

-- ทุกคนอ่านได้ / ทุกคนเพิ่มได้โดยไม่ต้องล็อกอิน (ไม่มีนโยบาย update/delete = แก้หรือลบจากหน้าเว็บไม่ได้)
create policy "videos read" on public.videos for select using (true);
create policy "videos insert" on public.videos for insert with check (views = 0);
create policy "comments read" on public.comments for select using (true);
create policy "comments insert" on public.comments for insert with check (true);

-- นับยอดเข้าชมผ่านฟังก์ชันเดียว ไม่เปิดสิทธิ์ update ตรงๆ
create function public.increment_views(vid uuid) returns void
language sql security definer set search_path = public as
$$ update public.videos set views = views + 1 where id = vid; $$;
grant execute on function public.increment_views(uuid) to anon, authenticated;

-- ที่เก็บไฟล์ (วิดีโอสูงสุด 50 MB, ภาพปก 2 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('videos', 'videos', true, 52428800, array['video/mp4','video/webm','video/quicktime']),
  ('thumbnails', 'thumbnails', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

create policy "files read" on storage.objects for select using (bucket_id in ('videos','thumbnails'));
create policy "files upload" on storage.objects for insert with check (bucket_id in ('videos','thumbnails'));

-- คอมเมนต์แบบเรียลไทม์
alter publication supabase_realtime add table public.comments;
