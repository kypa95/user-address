import { apiRequest } from './client';
import { downloadFile } from './download';
import { HTTP_METHOD } from './httpMethods';
import type { Address } from '../types/address';
import type { Page } from '../types/page';
import type { ListParams } from './params';

/** Paginated addresses of a user. `search` matches any visible column. */
export function listAddressesByUser(
  userId: string,
  { page = 0, size = 10, search = '', signal }: ListParams = {},
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const term = search.trim();
  if (term) params.set('search', term);

  return apiRequest<Page<Address>>(`/users/${userId}/addresses?${params.toString()}`, {
    signal,
  });
}

export function createAddress(userId: string, address: Record<string, unknown>) {
  return apiRequest<Address>(`/users/${userId}/addresses`, {
    method: HTTP_METHOD.POST,
    body: address,
  });
}

export function updateAddress(id: string, address: Record<string, unknown>) {
  return apiRequest<Address>(`/addresses/${id}`, { method: HTTP_METHOD.PUT, body: address });
}

export function deleteAddress(id: string) {
  return apiRequest<void>(`/addresses/${id}`, { method: HTTP_METHOD.DELETE });
}

/** Downloads a user's addresses as an .xlsx, honoring the current search term. */
export function exportAddressesByUser(userId: string, search = '') {
  const term = search.trim();
  const query = term ? `?search=${encodeURIComponent(term)}` : '';
  return downloadFile(`/users/${userId}/addresses/export${query}`, 'direcciones.xlsx');
}
