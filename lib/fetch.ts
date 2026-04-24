export function getCSRFToken(): string | null {
  const match = document.cookie.match(new RegExp('(^| )roktokorobi-csrf=([^;]+)'));
  return match ? match[2] : null;
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const csrfToken = getCSRFToken();
  
  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
