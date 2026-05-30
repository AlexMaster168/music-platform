const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_BASE = `${API_ORIGIN}/api`;

/** Полный URL до файла на бэкенде (audio/image), отдаваемого статикой. */
export function fileUrl(path?: string | null): string | undefined {
   if (!path) return undefined;
   if (path.startsWith('http')) return path;
   return `${API_ORIGIN}/${path}`;
}

const ACCESS_KEY = 'mp_access';
const REFRESH_KEY = 'mp_refresh';

export const tokens = {
   get access(): string | null {
      return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null;
   },
   get refresh(): string | null {
      return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
   },
   set(access: string, refresh: string) {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
   },
   clear() {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
   },
};

export class ApiError extends Error {
   constructor(
      public status: number,
      message: string,
   ) {
      super(message);
      this.name = 'ApiError';
   }
}

function buildHeaders(options: RequestInit, withAuth: boolean): Headers {
   const headers = new Headers(options.headers);
   if (withAuth && tokens.access) {
      headers.set('Authorization', `Bearer ${tokens.access}`);
   }
   const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;
   if (options.body && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
   }
   return headers;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
   if (!tokens.refresh) return false;
   if (!refreshPromise) {
      refreshPromise = (async () => {
         try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ refreshToken: tokens.refresh }),
            });
            if (!res.ok) {
               tokens.clear();
               return false;
            }
            const data = await res.json();
            tokens.set(data.accessToken, data.refreshToken);
            return true;
         } catch {
            return false;
         }
      })();
   }
   const ok = await refreshPromise;
   refreshPromise = null;
   return ok;
}

export interface ApiOptions extends RequestInit {
   auth?: boolean;
}

export async function api<T = unknown>(
   path: string,
   options: ApiOptions = {},
): Promise<T> {
   const { auth = true, ...opts } = options;

   let res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: buildHeaders(opts, auth),
   });

   if (res.status === 401 && auth) {
      const refreshed = await tryRefresh();
      if (refreshed) {
         res = await fetch(`${API_BASE}${path}`, {
            ...opts,
            headers: buildHeaders(opts, true),
         });
      }
   }

   if (!res.ok) {
      let message = res.statusText;
      try {
         const body = await res.json();
         message = Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message || message;
      } catch {
         /* тело не JSON — оставляем statusText */
      }
      throw new ApiError(res.status, message);
   }

   if (res.status === 204) return undefined as T;
   const text = await res.text();
   return (text ? JSON.parse(text) : undefined) as T;
}
