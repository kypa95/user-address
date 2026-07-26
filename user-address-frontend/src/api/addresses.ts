import { apiRequest } from './client';
import { downloadFile } from './download';
import { HTTP_METHOD } from './httpMethods';
import type { Address } from '../types/address';
import type { Page } from '../types/page';
import { appendFilters, type ColumnFilters, type ListParams } from './params';

interface ListAddressesParams extends ListParams {
  /** Per-column filters: street, city, state, … */
  filters?: ColumnFilters;
}

/** Paginated addresses of a user. `search` matches any visible column. */
export function listAddressesByUser(
  userId: string,
  { page = 0, size = 10, search = '', filters, signal }: ListAddressesParams = {},
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const term = search.trim();
  if (term) params.set('search', term);
  appendFilters(params, filters);

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

/** Downloads a user's addresses as an .xlsx, with the same term and filters the listing shows. */
export function exportAddressesByUser(userId: string, search = '', filters?: ColumnFilters) {
  const params = new URLSearchParams();
  const term = search.trim();
  if (term) params.set('search', term);
  appendFilters(params, filters);

  const query = params.toString();
  return downloadFile(
    `/users/${userId}/addresses/export${query ? `?${query}` : ''}`,
    'Addresses.xlsx',
  );
}
