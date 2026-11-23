// ดึงเฟรมแรกของวิดีโอมาเป็นภาพปก (JPEG) และอ่านความยาวคลิป
export function grabFrame(file: File): Promise<{ blob: Blob | null; duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let done = false;
    const end = (blob: Blob | null) => {
      if (done) return;
      done = true;
      const d = isFinite(v.duration) ? v.duration : 0;
      URL.revokeObjectURL(url);
      resolve({ blob, duration: d });
    };
    v.muted = true; v.preload = 'metadata'; v.src = url;
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 2); };
    v.onseeked = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = Math.round((480 * v.videoHeight) / v.videoWidth) || 300;
        c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(end, 'image/jpeg', 0.75);
      } catch { end(null); }
    };
    v.onerror = () => end(null);
    setTimeout(() => end(null), 8000);
  });
}
