export const dur = (s: number) => {
  const t = Math.round(s || 0);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
export const date = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
export const num = (n: number) => n.toLocaleString('th-TH');
