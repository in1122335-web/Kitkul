-- ไลก์ / ดิสไลก์ / แชร์ — วางใน Supabase > SQL Editor แล้ว Run (รันซ้ำได้)
alter table public.videos
  add column if not exists likes bigint not null default 0,
  add column if not exists dislikes bigint not null default 0,
  add column if not exists shares bigint not null default 0;

-- ไม่ให้ผู้ใช้ตั้งตัวเลขเองตอนสร้างคลิป
drop policy if exists "videos insert" on public.videos;
create policy "videos insert" on public.videos for insert
  with check (views = 0 and likes = 0 and dislikes = 0 and shares = 0);

-- 1 เบราว์เซอร์ = 1 โหวตต่อคลิป (ไม่มีสิทธิ์เข้าตารางตรงๆ ใช้ผ่านฟังก์ชันเท่านั้น)
create table if not exists public.votes (
  video_id uuid not null references public.videos(id) on delete cascade,
  voter text not null check (char_length(voter) between 8 and 64),
  value smallint not null check (value in (1, -1)),
  primary key (video_id, voter)
);
alter table public.votes enable row level security;

create or replace function public.vote_video(vid uuid, voter_id text, val int)
returns table (out_likes bigint, out_dislikes bigint, out_mine int)
language plpgsql security definer set search_path = public as $$
declare cur smallint;
begin
  select value into cur from votes where video_id = vid and voter = voter_id;
  if cur is not null then            -- ถอนโหวตเดิมก่อน
    delete from votes where video_id = vid and voter = voter_id;
    if cur = 1 then update videos set likes = greatest(likes - 1, 0) where id = vid;
    else update videos set dislikes = greatest(dislikes - 1, 0) where id = vid; end if;
  end if;
  if val in (1, -1) and cur is distinct from val::smallint then   -- ใส่โหวตใหม่ (กดซ้ำ = ยกเลิก)
    insert into votes (video_id, voter, value) values (vid, voter_id, val::smallint);
    if val = 1 then update videos set likes = likes + 1 where id = vid;
    else update videos set dislikes = dislikes + 1 where id = vid; end if;
  end if;
  return query select v.likes, v.dislikes,
    coalesce((select x.value from votes x where x.video_id = vid and x.voter = voter_id), 0)::int
    from videos v where v.id = vid;
end $$;

create or replace function public.get_my_vote(vid uuid, voter_id text) returns int
language sql security definer set search_path = public as
$$ select coalesce((select value from votes where video_id = vid and voter = voter_id), 0)::int $$;

create or replace function public.increment_shares(vid uuid) returns void
language sql security definer set search_path = public as
$$ update videos set shares = shares + 1 where id = vid; $$;

grant execute on function public.vote_video(uuid, text, int) to anon, authenticated;
grant execute on function public.get_my_vote(uuid, text) to anon, authenticated;
grant execute on function public.increment_shares(uuid) to anon, authenticated;
notify pgrst, 'reload schema';
