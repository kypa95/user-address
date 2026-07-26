import { Box, Typography, IconButton } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ArrowBack from '@mui/icons-material/ArrowBack';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import CustomHeaderMenu from '../components/CustomHeaderMenu';
import CustomStep from '../components/CustomStep';
import CustomTable from '../components/CustomTable';
import CustomModal from '../components/CustomModal';
import CustomMenuItem from '../components/CustomMenuItem';
import CustomButton from '../components/CustomButton';
import CustomChip from '../components/CustomChip';
import UserFormFields from '../components/UserFormFields';
import AddressFormFields from '../components/AddressFormFields';
import { ADDRESS_COLUMNS } from '../constants/address/addressColumns';
import { useUserCreateApp, STEPS } from './UserCreateApp';
import '../css/UserEdit.css';

export default function UserCreate() {
  const {
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
  } = useUserCreateApp();

  const renderAddressActions = ({ row, closeMenu }: any) => [
    <CustomMenuItem
      key="edit"
      icon={<Edit fontSize="small" />}
      label="Editar"
      onClick={() => {
        handleEditAddress(row.original);
        closeMenu();
      }}
    />,
    <CustomMenuItem
      key="delete"
      icon={<Delete fontSize="small" color="error" />}
      label="Eliminar"
      onClick={() => {
        handleDeleteAddress(row.original);
        closeMenu();
      }}
    />,
  ];

  const personalStep = (
    <Box component="form" className="tab-form" noValidate>
      <UserFormFields
        idPrefix="txt_ucr"
        values={form}
        errors={userErrors}
        onFieldChange={setUserField}
        onValueChange={setUserValue}
      />

      <Box className="tab-actions" sx={{ mt: 3 }}>
        <CustomButton
          id="btn_ucr_cancel"
          variant="outlined"
          fullWidth={false}
          onClick={goToUsers}
        >
          Cancelar
        </CustomButton>
        <CustomButton id="btn_ucr_next" fullWidth={false} onClick={handleNext}>
          Siguiente
        </CustomButton>
      </Box>
    </Box>
  );

  const addressesStep = (
    <Box>
      <Box className="addresses-toolbar">
        <CustomButton
          id="btn_ucr_create_address"
          fullWidth={false}
          onClick={handleCreateAddress}
        >
          Agregar dirección
        </CustomButton>
      </Box>

      <CustomTable
        id="tbl_ucr_addresses"
        columns={ADDRESS_COLUMNS}
        data={drafts}
        renderRowActionMenuItems={renderAddressActions}
        // These addresses are being composed, not explored: the row actions and
        // the pagination are all this list needs.
        enableTopToolbar={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableColumnActions={false}
        enableHiding={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableColumnPinning={false}
        enableSorting={false}
      />

      <CustomChip
        id="chp_ucr_addresses_hint"
        className="step-hint"
        icon={<InfoOutlined />}
        color="info"
        variant="outlined"
        label="Las direcciones son opcionales. Se guardarán junto con el usuario al finalizar."
      />

      <Box className="tab-actions" sx={{ mt: 3 }}>
        <CustomButton
          id="btn_ucr_back_step"
          variant="outlined"
          fullWidth={false}
          onClick={handleBack}
          disabled={submitting}
        >
          Atrás
        </CustomButton>
        <CustomButton
          id="btn_ucr_finish"
          fullWidth={false}
          onClick={handleFinish}
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : 'Finalizar'}
        </CustomButton>
      </Box>
    </Box>
  );

  return (
    <>
      <CustomHeaderMenu />

      <Box className="user-edit-page">
        <Box className="user-edit-header">
          <IconButton id="btn_ucr_back" aria-label="Volver" onClick={goToUsers}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Crear usuario</Typography>
        </Box>

        <CustomStep steps={STEPS} activeStep={activeStep}>
          {activeStep === 0 ? personalStep : addressesStep}
        </CustomStep>
      </Box>

      <CustomModal
        id="mdl_ucr_address"
        open={addressOpen}
        onClose={closeAddress}
        title={editingDraftId ? 'Actualizar dirección' : 'Nueva dirección'}
        actions={
          <>
            <CustomButton
              id="btn_ucr_cancel_address"
              variant="outlined"
              fullWidth={false}
              onClick={closeAddress}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              id="btn_ucr_save_address"
              fullWidth={false}
              onClick={handleSaveAddress}
            >
              Guardar
            </CustomButton>
          </>
        }
      >
        <AddressFormFields
          idPrefix="ucr"
          values={addressForm}
          errors={addressErrors}
          onFieldChange={setAddressField}
          onValueChange={setAddressValue}
          onStateChange={handleEstadoChange}
          onPostalCodeChange={handlePostalCodeChange}
        />
      </CustomModal>

      <CustomModal
        id="mdl_ucr_delete"
        open={deleteAddressOpen}
        onClose={closeDeleteAddress}
        title="Eliminar dirección"
        maxWidth="sm"
        actions={
          <>
            <CustomButton
              id="btn_ucr_cancel_delete"
              variant="outlined"
              fullWidth={false}
              onClick={closeDeleteAddress}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              id="btn_ucr_confirm_delete"
              color="error"
              fullWidth={false}
              onClick={confirmDeleteAddress}
            >
              Eliminar
            </CustomButton>
          </>
        }
      >
        <Typography>¿Eliminar esta dirección?</Typography>
      </CustomModal>
    </>
  );
}
