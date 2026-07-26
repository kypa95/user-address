import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../store/hooks';
import { saveNewUser } from '../store/users/usersThunks';
import { validateUserForm, validateAddressForm, POSTAL_CODE_MAX } from '../utils/validators';
import { USER_FIELDS, EMPTY_USER } from '../constants/users/userFields';
import { ADDRESS_FIELDS, EMPTY_ADDRESS } from '../constants/address/addressFields';
import type { FormValues } from '../constants/forms';
import type { FormErrors } from '../types/forms';
import { ROUTES } from '../routes/paths';

export const STEPS = ['Datos personales', 'Direcciones'];

/**
 * An address the user has filled in but that does not exist yet. `draftId` is a
 * browser-only key for the table and the edit/delete actions; the backend never
 * sees it.
 */
export interface DraftAddress extends FormValues {
  draftId: string;
}

/**
 * Two-step create wizard. Nothing is persisted until "Finalizar": the first
 * step only validates and the addresses are staged in memory, so abandoning the
 * wizard leaves no half-created user behind.
 *
 * Lives apart from `UserCreate.tsx` so that file is only markup.
 */
export function useUserCreateApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormValues>(EMPTY_USER);
  const [userErrors, setUserErrors] = useState<FormErrors>({});

  const [drafts, setDrafts] = useState<DraftAddress[]>([]);

  const [addressOpen, setAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<FormValues>(EMPTY_ADDRESS);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<FormErrors>({});
  const [deleteAddressOpen, setDeleteAddressOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<DraftAddress | null>(null);

  // ---------- Step 1: personal data ----------

  const setUserField = (key: string) => (event: any) => setUserValue(key)(event.target.value);

  const setUserValue = (key: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setUserErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  /** Only validates: the user is created at the end of the wizard. */
  const handleNext = () => {
    const errors = validateUserForm(form, USER_FIELDS);
    setUserErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setActiveStep(1);
  };

  const handleBack = () => setActiveStep(0);

  // ---------- Step 2: draft addresses ----------

  const setAddressField = (key: string) => (event: any) =>
    setAddressValue(key, event.target.value);

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

  const handleCreateAddress = () => {
    setAddressForm(EMPTY_ADDRESS);
    setEditingDraftId(null);
    setAddressErrors({});
    setAddressOpen(true);
  };

  const handleEditAddress = (draft: DraftAddress) => {
    setAddressForm({ ...EMPTY_ADDRESS, ...draft });
    setEditingDraftId(draft.draftId);
    setAddressErrors({});
    setAddressOpen(true);
  };

  const closeAddress = () => setAddressOpen(false);

  const handleDeleteAddress = (draft: DraftAddress) => {
    setDraftToDelete(draft);
    setDeleteAddressOpen(true);
  };

  const closeDeleteAddress = () => setDeleteAddressOpen(false);

  const confirmDeleteAddress = () => {
    if (!draftToDelete) return;
    setDrafts((prev) => prev.filter((item) => item.draftId !== draftToDelete.draftId));
    setDeleteAddressOpen(false);
    toast.success('Dirección eliminada');
  };

  /** Adds or replaces an address in the staged list; no request is made. */
  const handleSaveAddress = () => {
    const errors = validateAddressForm(addressForm, ADDRESS_FIELDS);
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (editingDraftId) {
      setDrafts((prev) =>
        prev.map((item) =>
          item.draftId === editingDraftId ? { ...addressForm, draftId: editingDraftId } : item,
        ),
      );
    } else {
      setDrafts((prev) => [...prev, { ...addressForm, draftId: crypto.randomUUID() }]);
    }

    setAddressOpen(false);
    toast.success(editingDraftId ? 'Dirección actualizada' : 'Dirección agregada');
  };

  // ---------- Finish: the only place that writes ----------

  /**
   * Creates the user and its addresses in a single request. The backend saves
   * everything in one transaction, so either the user and all its addresses are
   * created, or nothing is. Addresses are optional: an empty list is valid.
   */
  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // Drop the browser-only draftId before sending.
      const addresses = drafts.map(({ draftId: _draftId, ...address }) => address);
      await dispatch(saveNewUser({ ...form, addresses })).unwrap();

      toast.success('Usuario creado');
      navigate(ROUTES.users);
    } catch (message) {
      // Duplicated CURP, RFC or email — or a rejected address — come back as a
      // business message; the wizard stays open so the data can be corrected.
      toast.error(message as string);
      setActiveStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  const goToUsers = () => navigate(ROUTES.users);

  return {
    activeStep,
    submitting,

    form,
    userErrors,
    setUserField,
    setUserValue,
    handleNext,
    handleBack,

    drafts,

    addressOpen,
    addressForm,
    editingDraftId,
    addressErrors,
    deleteAddressOpen,

    setAddressField,
    setAddressValue,
    handlePostalCodeChange,
    handleEstadoChange,
    handleCreateAddress,
    handleEditAddress,
    closeAddress,
    handleDeleteAddress,
    closeDeleteAddress,
    confirmDeleteAddress,
    handleSaveAddress,

    handleFinish,
    goToUsers,
  };
}
