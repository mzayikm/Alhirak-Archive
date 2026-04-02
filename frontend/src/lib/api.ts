const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let message = 'Request failed';

    try {
      const error = await res.json();
      message = Array.isArray(error.message)
        ? error.message.join(', ')
        : error.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function signup(
  username: string,
  email: string,
  password: string,
) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(username: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchMe() {
  return apiFetch('/auth/me');
}

export async function logout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function forgotPassword(email: string) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function fetchCategories() {
  return apiFetch('/categories');
}

export async function fetchArticles(params?: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  published?: 'true' | 'false' | 'all';
}) {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.featured !== undefined) {
    searchParams.set('featured', String(params.featured));
  }
  if (params?.search) searchParams.set('search', params.search);
  if (params?.author) searchParams.set('author', params.author);
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.published) searchParams.set('published', params.published);

  const query = searchParams.toString();
  return apiFetch(query ? `/articles?${query}` : '/articles');
}

export async function fetchArticleById(id: string) {
  return apiFetch(`/articles/${id}`);
}

export async function searchArticles(q: string) {
  return apiFetch(`/search?q=${encodeURIComponent(q)}`);
}