import { apiRequest } from './client';
import { downloadFile } from './download';
import { HTTP_METHOD } from './httpMethods';
import type { User } from '../types/user';
import type { Page } from '../types/page';
import { appendFilters, type ColumnFilters, type ListParams } from './params';

interface ListUsersParams extends ListParams {
  filters?: ColumnFilters;
}

export function listUsers({
  page = 0,
  size = 10,
  search = '',
  filters,
  signal,
}: ListUsersParams = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const term = search.trim();
  if (term) params.set('search', term);
  appendFilters(params, filters);

  return apiRequest<Page<User>>(`/users?${params.toString()}`, { signal });
}

export function getUser(id: string, { signal }: { signal?: AbortSignal } = {}) {
  return apiRequest<User>(`/users/${id}`, { signal });
}

export function createUser(user: Record<string, unknown>) {
  return apiRequest<User>('/users', { method: HTTP_METHOD.POST, body: user });
}

export function updateUser(id: string, user: Record<string, unknown>) {
  return apiRequest<User>(`/users/${id}`, { method: HTTP_METHOD.PUT, body: user });
}

export function deleteUser(id: string) {
  return apiRequest<void>(`/users/${id}`, { method: HTTP_METHOD.DELETE });
}

export function exportUsers(search = '', filters?: ColumnFilters) {
  const params = new URLSearchParams();
  const term = search.trim();
  if (term) params.set('search', term);
  appendFilters(params, filters);

  const query = params.toString();
  return downloadFile(`/users/export${query ? `?${query}` : ''}`, 'Users.xlsx');
}
