'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UploadDialog from './UploadDialog';

export default function Header() {
  const router = useRouter();
  return (
    <header>
      <Link className="logo" href="/"><b>K</b>itkul</Link>
      <form
        className="s"
        onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
          router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
        }}
      >
        <input name="q" placeholder="ค้นหาวิดีโอ…" aria-label="ค้นหาวิดีโอ" />
        <button className="btn">ค้นหา</button>
      </form>
      <UploadDialog />
    </header>
  );
}
