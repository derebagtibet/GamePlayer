import { API_URL } from './Config';

/**
 * Güvenli fetch wrapper - response.ok kontrolü ve JSON parse hatalarını yakalar.
 * Sunucu HTML döndürse veya bağlantı kopsa bile crash olmaz.
 */
export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const url = path.startsWith('http') ? path : `${API_URL}${path}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      // HTTP 4xx/5xx hataları
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // JSON parse edilemiyorsa (HTML error page vb.) status kodu yeterli
      }
      return { ok: false, data: null, error: errorMessage };
    }

    // Başarılı response - JSON parse et
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return { ok: true, data: null };
    }

    try {
      const data = JSON.parse(text) as T;
      // Backend bazen {status: "error"} döner ama HTTP 200 verir
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as any;
        if (obj.status === 'error') {
          return { ok: false, data, error: obj.message || 'Bilinmeyen hata' };
        }
      }
      return { ok: true, data };
    } catch {
      return { ok: false, data: null, error: 'Sunucudan geçersiz yanıt alındı' };
    }
  } catch (error: any) {
    // Network hatası, timeout vb.
    if (error.name === 'AbortError') {
      return { ok: false, data: null, error: 'İstek iptal edildi' };
    }
    return { ok: false, data: null, error: 'Sunucuya bağlanılamadı' };
  }
}

/**
 * GET isteği kısayolu
 */
export function apiGet<T = any>(path: string, signal?: AbortSignal) {
  return apiFetch<T>(path, { signal });
}

/**
 * POST isteği kısayolu (JSON body)
 */
export function apiPost<T = any>(path: string, body: any, signal?: AbortSignal) {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

/**
 * PUT isteği kısayolu (JSON body)
 */
export function apiPut<T = any>(path: string, body: any) {
  return apiFetch<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
