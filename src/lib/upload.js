import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload helper — the single path for admin image / resource uploads.
 *
 * - Real mode: uploads to Supabase Storage buckets (`bic-images`, `bic-resources`)
 *   and returns the public URL.
 * - Demo mode (no Supabase): reads the file as a data URL so the whole flow is
 *   testable locally; persisted with the record.
 *
 * Size limits (enforced BEFORE upload):
 *   images    5 MB
 *   resources 3.5 MB  (club requirement)
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_RESOURCE_BYTES = 3.5 * 1024 * 1024; // 3.5 MB

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
const RESOURCE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
  'application/zip',
];

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function sanitizeName(name) {
  const safe = String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  return safe || 'file';
}

/**
 * @param {File} file
 * @param {'image'|'resource'} kind
 * @param {string} folder e.g. 'events' | 'articles' | 'resources'
 * @returns {Promise<{ok: true, url: string, size_label: string}|{ok: false, error: string}>}
 */
export async function uploadFile(file, kind = 'resource', folder = 'resources') {
  if (!file || !file.size) return { ok: false, error: 'No file selected.' };

  const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_RESOURCE_BYTES;
  const allowed = kind === 'image' ? IMAGE_TYPES : RESOURCE_TYPES;

  if (file.size > maxBytes) {
    const limitMb = kind === 'image' ? '5 MB' : '3.5 MB';
    return { ok: false, error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is ${limitMb}.` };
  }
  if (allowed.length && !allowed.includes(file.type)) {
    return { ok: false, error: kind === 'image' ? 'Please choose an image (PNG, JPG, WEBP, GIF, SVG).' : 'File type not allowed. Use PDF, Excel, Word, CSV, TXT or ZIP.' };
  }

  const sizeLabel = `${file.type.includes('image') ? 'IMG' : file.type.split('/')[1]?.toUpperCase() || 'FILE'} · ${formatBytes(file.size)}`;

  if (isSupabaseConfigured) {
    const bucket = kind === 'image' ? 'bic-images' : 'bic-resources';
    const path = `${folder}/${Date.now()}_${sanitizeName(file.name)}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, size_label: sizeLabel };
  }

  // Demo mode — keep everything testable locally. localStorage holds ~5 MB,
  // so images are downscaled and resource files are capped lower than the
  // real-mode 3.5 MB limit to guarantee they actually persist.
  if (kind === 'resource' && file.size > 2 * 1024 * 1024) {
    return {
      ok: false,
      error: `Demo mode stores files in browser storage, so the limit is 2 MB here. The full 3.5 MB limit applies once Supabase storage is connected.`,
    };
  }
  try {
    const dataUrl =
      kind === 'image'
        ? await downscaleImage(file)
        : await readAsDataURL(file);
    return { ok: true, url: dataUrl, size_label: sizeLabel };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Downscale an image to a max dimension so the data URL stays small enough
 * for localStorage in demo mode. Uses canvas (no extra deps).
 */
async function downscaleImage(file) {
  const dataUrl = await readAsDataURL(file);
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not read this image.'));
    el.src = dataUrl;
  });
  const MAX = 1200;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
