import { apiRequest } from './client';
import { downloadFile } from './download';
import type { Address } from '../types/address';

export interface AddressPage {
  content: Address[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface ListParams {
  page?: number;
  size?: number;
  search?: string;
  signal?: AbortSignal;
}

/** Paginated addresses of a user. `search` matches any visible column. */
export function listAddressesByUser(
  userId: string,
  { page = 0, size = 10, search = '', signal }: ListParams = {},
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const term = search.trim();
  if (term) params.set('search', term);

  return apiRequest<AddressPage>(`/users/${userId}/addresses?${params.toString()}`, {
    signal,
  });
}

export function createAddress(userId: string, address: Record<string, unknown>) {
  return apiRequest<Address>(`/users/${userId}/addresses`, {
    method: 'POST',
    body: address,
  });
}

export function updateAddress(id: string, address: Record<string, unknown>) {
  return apiRequest<Address>(`/addresses/${id}`, { method: 'PUT', body: address });
}

export function deleteAddress(id: string) {
  return apiRequest<void>(`/addresses/${id}`, { method: 'DELETE' });
}

/** Downloads a user's addresses as an .xlsx, honoring the current search term. */
export function exportAddressesByUser(userId: string, search = '') {
  const term = search.trim();
  const query = term ? `?search=${encodeURIComponent(term)}` : '';
  return downloadFile(`/users/${userId}/addresses/export${query}`, 'direcciones.xlsx');
}
