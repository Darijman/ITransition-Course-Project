export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;

    const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}
