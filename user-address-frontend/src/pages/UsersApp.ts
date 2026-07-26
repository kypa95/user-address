import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store/hooks';
import { fetchUsers, removeUser } from '../store/users/usersThunks';
import {
  paginationChanged,
  searchChanged,
  columnFiltersChanged,
  usersQueryReset,
  selectUsersColumnFilters,
  selectUsers,
  selectUsersTotal,
  selectUsersPagination,
  selectUsersSearch,
  selectUsersLoading,
  selectUsersError,
  selectUsersSaving,
} from '../store/users/usersSlice';
import { fetchAddressesByUser } from '../store/address/addressesThunks';
import {
  addressPaginationChanged,
  addressSearchChanged,
  addressColumnFiltersChanged,
  selectAddresses,
  selectAddressesLoading,
  selectAddressesTotal,
  selectAddressesPagination,
  selectAddressesSearch,
} from '../store/address/addressesSlice';
import { exportUsers } from '../api/users';
import { exportAddressesByUser } from '../api/addresses';
import { ROUTES, userEditPath } from '../routes/paths';
import { toColumnFilters } from '../store/columnFilters';
import type { User } from '../types/user';

/**
 * Everything the users listing does: loading the page, the filters, the export
 * and the two modals.
 *
 * Lives apart from `Users.tsx` so that file is only markup.
 */
export function useUsersApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const users = useSelector(selectUsers);
  const total = useSelector(selectUsersTotal);
  const pagination = useSelector(selectUsersPagination);
  const search = useSelector(selectUsersSearch);
  const isLoading = useSelector(selectUsersLoading);
  const loadError = useSelector(selectUsersError);
  const saving = useSelector(selectUsersSaving);
  const columnFilters = useSelector(selectUsersColumnFilters);

  const detailAddresses = useSelector(selectAddresses);
  const detailLoading = useSelector(selectAddressesLoading);
  const detailTotal = useSelector(selectAddressesTotal);
  const detailPagination = useSelector(selectAddressesPagination);
  const detailSearch = useSelector(selectAddressesSearch);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportingAddresses, setExportingAddresses] = useState(false);
  const filters = toColumnFilters(columnFilters);
  const filtersKey = JSON.stringify(filters);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const query = {
    page: pagination.pageIndex,
    size: pagination.pageSize,
    search,
    filters,
  };

  useEffect(() => {
    const promise = dispatch(fetchUsers(query));

    return () => promise.abort();
  }, [dispatch, query.page, query.size, query.search, filtersKey, query]);

  // Clear the search, filters and page when leaving the listing, so coming back
  // from create/edit starts fresh instead of keeping the old filters applied.
  useEffect(() => () => void dispatch(usersQueryReset()), [dispatch]);

  const reload = useCallback(
    () => dispatch(fetchUsers(query)),
    [dispatch, query],
  );

  const handleColumnFiltersChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(columnFilters) : updater;
    dispatch(columnFiltersChanged(next ?? []));
  };

  const handlePaginationChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    dispatch(paginationChanged(next));
  };

  const handleSearchChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(search) : updater;
    dispatch(searchChanged(next ?? ''));
  };

  const handleDetail = (user: User) => {
    setSelected(user);
    setDetailOpen(true);
    dispatch(addressPaginationChanged({ pageIndex: 0, pageSize: 10 }));
    dispatch(addressSearchChanged(''));
    dispatch(addressColumnFiltersChanged([]));
  };

  useEffect(() => {
    if (!detailOpen || !selected) return;

    const promise = dispatch(
      fetchAddressesByUser({
        userId: selected.id,
        page: detailPagination.pageIndex,
        size: detailPagination.pageSize,
        search: detailSearch,
      }),
    );
    return () => promise.abort();
  }, [
    dispatch,
    detailOpen,
    selected,
    detailPagination.pageIndex,
    detailPagination.pageSize,
    detailSearch,
  ]);

  const handleDetailPaginationChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(detailPagination) : updater;
    dispatch(addressPaginationChanged(next));
  };

  const handleDetailSearchChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(detailSearch) : updater;
    dispatch(addressSearchChanged(next ?? ''));
  };

  const closeDetail = () => setDetailOpen(false);

  /**
   * Exports the addresses of the user on screen, honouring the search box of
   * the detail table so the file matches what the modal is showing. That table
   * has no column filters, so the term is all the criteria there is.
   */
  const handleExportAddresses = async () => {
    if (!selected) return;

    setExportingAddresses(true);
    try {
      await exportAddressesByUser(selected.id, detailSearch);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setExportingAddresses(false);
    }
  };

  const handleEdit = (user: User) => navigate(userEditPath(user.id));

  const goToCreate = () => navigate(ROUTES.userCreate);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const closeDelete = () => setDeleteOpen(false);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(removeUser(userToDelete.id)).unwrap();
      toast.success('Usuario eliminado');
      setDeleteOpen(false);
      reload();
    } catch (message) {
      toast.error(message as string);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUsers(search, filters);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return {
    users,
    total,
    pagination,
    search,
    columnFilters,
    isLoading,
    loadError,
    saving,

    detailOpen,
    selected,
    detailAddresses,
    detailLoading,
    detailTotal,
    detailPagination,
    detailSearch,
    handleDetailPaginationChange,
    handleDetailSearchChange,
    handleExportAddresses,
    exportingAddresses,

    deleteOpen,
    userToDelete,
    exporting,

    handlePaginationChange,
    handleSearchChange,
    handleColumnFiltersChange,
    handleDetail,
    closeDetail,
    handleEdit,
    goToCreate,
    handleDelete,
    closeDelete,
    confirmDelete,
    handleExport,
  };
}
