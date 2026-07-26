import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store/hooks';
import { fetchUserById, saveUser } from '../store/users/usersThunks';
import {
  currentCleared,
  selectCurrentUser,
  selectCurrentUserLoading,
  selectCurrentUserError,
  selectUsersSaving,
} from '../store/users/usersSlice';
import {
  fetchAddressesByUser,
  saveNewAddress,
  saveAddress,
  removeAddress,
} from '../store/address/addressesThunks';
import {
  addressesCleared,
  addressPaginationChanged,
  addressSearchChanged,
  addressColumnFiltersChanged,
  selectAddresses,
  selectAddressesTotal,
  selectAddressesPagination,
  selectAddressesSearch,
  selectAddressesColumnFilters,
  selectAddressesError,
  selectAddressesSaving,
} from '../store/address/addressesSlice';
import { toColumnFilters } from '../store/columnFilters';
import { exportAddressesByUser } from '../api/addresses';
import { USER_FIELDS, EMPTY_USER } from '../constants/users/userFields';
import { ADDRESS_FIELDS, EMPTY_ADDRESS } from '../constants/address/addressFields';
import { pickFields, type FormValues } from '../constants/forms';
import { normalizePais } from '../data/mexicoLocations';
import {
  validateUserForm,
  validateAddressForm,
  POSTAL_CODE_MAX,
  toE164,
} from '../utils/validators';
import { ROUTES } from '../routes/paths';
import type { Address } from '../types/address';
import type { FormErrors } from '../types/forms';

/**
 * Everything the edit screen does: loading the user, its server-side addresses,
 * the two forms and the three modals.
 *
 * Lives apart from `UserEdit.tsx` so that file is only markup.
 */
export function useUserEditApp() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const loading = useSelector(selectCurrentUserLoading);
  const loadError = useSelector(selectCurrentUserError);
  const savingUser = useSelector(selectUsersSaving);

  const addresses = useSelector(selectAddresses);
  const addressesTotal = useSelector(selectAddressesTotal);
  const addressesPagination = useSelector(selectAddressesPagination);
  const addressesSearch = useSelector(selectAddressesSearch);
  const addressesColumnFilters = useSelector(selectAddressesColumnFilters);
  const addressesError = useSelector(selectAddressesError);
  const savingAddress = useSelector(selectAddressesSaving);

  const [form, setForm] = useState<FormValues>(EMPTY_USER);
  const [formUserId, setFormUserId] = useState<string | null>(null);
  const [userErrors, setUserErrors] = useState<FormErrors>({});

  if (currentUser && currentUser.id !== formUserId) {
    setFormUserId(currentUser.id);
    const loaded = pickFields(USER_FIELDS, currentUser);
    setForm({ ...loaded, phoneNumber: toE164(loaded.phoneNumber) });
  }

  const [addressOpen, setAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<FormValues>(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<FormErrors>({});

  const [deleteAddressOpen, setDeleteAddressOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const [exportingAddresses, setExportingAddresses] = useState(false);

  useEffect(() => {
    const userPromise = dispatch(fetchUserById(id));
    return () => {
      userPromise.abort();
      dispatch(currentCleared());
      dispatch(addressesCleared());
    };
  }, [dispatch, id]);

  const addressFilters = toColumnFilters(addressesColumnFilters);
  const addressFiltersKey = JSON.stringify(addressFilters);

  const addressesQuery = {
    userId: id,
    page: addressesPagination.pageIndex,
    size: addressesPagination.pageSize,
    search: addressesSearch,
    filters: addressFilters,
  };

  useEffect(() => {
    const promise = dispatch(fetchAddressesByUser(addressesQuery));

    return () => promise.abort();
  }, [dispatch, id, addressesPagination.pageIndex, addressesPagination.pageSize, addressesSearch, addressFiltersKey]);

  const reloadAddresses = useCallback(
    () => dispatch(fetchAddressesByUser(addressesQuery)),
    [dispatch, id, addressesPagination.pageIndex, addressesPagination.pageSize, addressesSearch, addressFiltersKey],
  );

  const handleAddressColumnFiltersChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(addressesColumnFilters) : updater;
    dispatch(addressColumnFiltersChanged(next ?? []));
  };

  const handleAddressPaginationChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(addressesPagination) : updater;
    dispatch(addressPaginationChanged(next));
  };

  const handleAddressSearchChange = (updater: any) => {
    const next = typeof updater === 'function' ? updater(addressesSearch) : updater;
    dispatch(addressSearchChanged(next ?? ''));
  };

  // ---------- Personal data ----------

  const setUserField = (key: string) => (event: any) => setUserValue(key)(event.target.value);

  const setUserValue = (key: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setUserErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  const handleUpdateUser = async () => {
    const errors = validateUserForm(form, USER_FIELDS);
    setUserErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await dispatch(saveUser({ id, user: form })).unwrap();
      toast.success('Datos personales actualizados');
    } catch (message) {
      toast.error(message as string);
    }
  };

  // ---------- Addresses ----------

  const setAddressField = (key: string) => (event: any) => {
    setAddressValue(key, event.target.value);
  };

  const setAddressValue = (key: string, value: string) => {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
    setAddressErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  const handlePostalCodeChange = (event: any) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, POSTAL_CODE_MAX);
    setAddressValue('postalCode', digits);
  };

  const handleEstadoChange = (estado: string) => {
    setAddressForm((prev) => ({ ...prev, state: estado, city: '' }));
    setAddressErrors((prev) => ({ ...prev, state: '', city: '' }));
  };

  const handleExportAddresses = async () => {
    setExportingAddresses(true);
    try {
      await exportAddressesByUser(id, addressesSearch, addressFilters);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setExportingAddresses(false);
    }
  };

  const handleCreateAddress = () => {
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setAddressErrors({});
    setAddressOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    const loaded = pickFields(ADDRESS_FIELDS, address);
    setAddressForm({ ...loaded, country: normalizePais(loaded.country) });
    setEditingAddressId(address.id);
    setAddressErrors({});
    setAddressOpen(true);
  };

  const closeAddress = () => setAddressOpen(false);

  const handleDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setDeleteAddressOpen(true);
  };

  const closeDeleteAddress = () => setDeleteAddressOpen(false);

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await dispatch(removeAddress(addressToDelete.id)).unwrap();
      toast.success('Dirección eliminada');
      setDeleteAddressOpen(false);
      reloadAddresses();
    } catch (message) {
      toast.error(message as string);
    }
  };

  const handleSaveAddress = async () => {
    const errors = validateAddressForm(addressForm, ADDRESS_FIELDS);
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editingAddressId) {
        await dispatch(saveAddress({ id: editingAddressId, address: addressForm })).unwrap();
      } else {
        await dispatch(saveNewAddress({ userId: id, address: addressForm })).unwrap();
      }
      setAddressOpen(false);
      toast.success(editingAddressId ? 'Dirección actualizada' : 'Dirección creada');
      reloadAddresses();
    } catch (message) {
      toast.error(message as string);
    }
  };

  const goToUsers = () => navigate(ROUTES.users);

  return {
    loading,
    loadError,
    currentUser,

    form,
    userErrors,
    setUserField,
    setUserValue,
    handleUpdateUser,
    savingUser,

    addresses,
    addressesTotal,
    addressesPagination,
    addressesSearch,
    addressesColumnFilters,
    addressesError,
    savingAddress,
    handleAddressPaginationChange,
    handleAddressSearchChange,
    handleAddressColumnFiltersChange,
    exportingAddresses,
    handleExportAddresses,

    addressOpen,
    addressForm,
    editingAddressId,
    addressErrors,
    setAddressField,
    setAddressValue,
    handlePostalCodeChange,
    handleEstadoChange,
    handleCreateAddress,
    handleEditAddress,
    closeAddress,
    handleSaveAddress,

    deleteAddressOpen,
    handleDeleteAddress,
    closeDeleteAddress,
    confirmDeleteAddress,

    goToUsers,
  };
}
