import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = { title: 'Kitkul', description: 'แชร์วิดีโอของคุณ' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Header />
        <main>{children}</main>
        <footer>© Kitkul · เว็บแชร์วิดีโอ · ไฟล์สูงสุด 50 MB ต่อคลิป</footer>
      </body>
    </html>
  );
}
