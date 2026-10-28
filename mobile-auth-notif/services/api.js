import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  const token = await SecureStore.getItemAsync('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.pesan || data?.message || `Request gagal (${res.status})`);
  }

  return data;
}