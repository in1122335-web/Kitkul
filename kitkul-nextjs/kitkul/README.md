# Kitkul

เว็บแชร์วิดีโอ: Next.js 14 (App Router) + Supabase (ฐานข้อมูล, ที่เก็บไฟล์, เรียลไทม์)

## เริ่มใช้งาน
1. สร้างโปรเจกต์ที่ https://supabase.com
2. เปิด **SQL Editor** วางเนื้อหาจาก `supabase/schema.sql` แล้วกด Run (สร้างตาราง สิทธิ์ และที่เก็บไฟล์ให้ครบ)
3. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจาก Project Settings > API
   (`Project URL` และ `anon public key`)
4. ติดตั้งและรัน
   ```bash
   npm install
   npm run dev
   ```
   เปิด http://localhost:3000
5. ขึ้นออนไลน์: push ขึ้น GitHub แล้วนำเข้าที่ Vercel โดยต้องเพิ่ม Environment Variables สองตัวข้างต้น
   (Settings > Environment Variables) **ก่อนกด Deploy** หรือเพิ่มภายหลังแล้วกด Redeploy เพราะค่า `NEXT_PUBLIC_` ถูกฝังตอน build

## โครงสร้าง
- `src/app/page.tsx` หน้าแรก (ตารางวิดีโอ + ค้นหา)
- `src/app/watch/[id]/page.tsx` หน้าดูวิดีโอ + คอมเมนต์ + วิดีโอแนะนำ
- `src/components/UploadDialog.tsx` อัปโหลดวิดีโอ (สร้างภาพปกจากเฟรมแรกในเบราว์เซอร์)
- `src/components/Comments.tsx` คอมเมนต์แบบเรียลไทม์ ไม่ต้องล็อกอิน
- `supabase/schema.sql` ตาราง, RLS, ฟังก์ชันนับยอดชม, storage buckets

## ข้อควรระวังก่อนเปิดใช้งานจริง
ตามที่ตั้งใจไว้ ใครก็อัปโหลดและคอมเมนต์ได้โดยไม่ต้องล็อกอิน จึงเสี่ยงต่อสแปมและไฟล์ไม่เหมาะสม
(ระบบจำกัดไฟล์ 50 MB, ชนิด mp4/webm/mov เท่านั้น) ก่อนเปิดสาธารณะควรเพิ่มอย่างน้อยหนึ่งข้อ:
Supabase Auth (แล้วเปลี่ยนนโยบายใน schema.sql เป็น `to authenticated`), CAPTCHA (เช่น Cloudflare Turnstile)
หรือหน้าตรวจสอบเนื้อหาสำหรับผู้ดูแล รวมถึงคอยดูโควตา Storage ของแพ็กเกจที่ใช้อยู่
