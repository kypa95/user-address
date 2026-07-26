import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CustomHeaderMenu from '../components/CustomHeaderMenu';
import CustomTab from '../components/CustomTab';
import CustomTable from '../components/CustomTable';
import CustomModal from '../components/CustomModal';
import CustomMenuItem from '../components/CustomMenuItem';
import CustomButton from '../components/CustomButton';
import UserFormFields from '../components/UserFormFields';
import AddressFormFields from '../components/AddressFormFields';
import { ADDRESS_COLUMNS } from '../constants/address/addressColumns';
import { useUserEditApp } from './UserEditApp';
import '../css/UserEdit.css';

export default function UserEdit() {
  const {
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
  } = useUserEditApp();

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

  if (loading && !currentUser) {
    return (
      <>
        <CustomHeaderMenu />
        <Box className="user-edit-page user-edit-loading">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <CustomHeaderMenu />
        <Box className="user-edit-page">
          <Typography variant="h6" gutterBottom>
            {loadError}
          </Typography>
          <CustomButton id="btn_ued_back" fullWidth={false} onClick={goToUsers}>
            Volver
          </CustomButton>
        </Box>
      </>
    );
  }

  const personalTab = (
    <Box component="form" className="tab-form" noValidate>
      <Box className="tab-actions">
        <CustomButton
          id="btn_ued_update"
          fullWidth={false}
          onClick={handleUpdateUser}
          disabled={savingUser}
        >
          {savingUser ? 'Guardando…' : 'Actualizar'}
        </CustomButton>
      </Box>
      <UserFormFields
        idPrefix="txt_ued"
        values={form}
        errors={userErrors}
        onFieldChange={setUserField}
        onValueChange={setUserValue}
      />
    </Box>
  );

  const addressesTab = (
    <Box>
      <Box className="addresses-toolbar">
        <CustomButton
          id="btn_ued_export"
          variant="outlined"
          fullWidth={false}
          onClick={handleExportAddresses}
          disabled={exportingAddresses}
        >
          {exportingAddresses ? 'Exportando…' : 'Exportar'}
        </CustomButton>
        <CustomButton
          id="btn_ued_create_address"
          fullWidth={false}
          onClick={handleCreateAddress}
        >
          Crear dirección
        </CustomButton>
      </Box>
      <CustomTable
        id="tbl_ued_addresses"
        columns={ADDRESS_COLUMNS}
        data={addresses}
        errorMessage={addressesError}
        renderRowActionMenuItems={renderAddressActions}
        enableColumnPinning={false}
        manualServerSide
        rowCount={addressesTotal}
        pagination={addressesPagination}
        onPaginationChange={handleAddressPaginationChange}
        globalFilter={addressesSearch}
        onGlobalFilterChange={handleAddressSearchChange}
        columnFilters={addressesColumnFilters}
        onColumnFiltersChange={handleAddressColumnFiltersChange}
      />
    </Box>
  );

  return (
    <>
      <CustomHeaderMenu />

      <Box className="user-edit-page">
        <Box className="user-edit-header">
          <IconButton id="btn_ued_back" aria-label="Volver" onClick={goToUsers}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Editar usuario</Typography>
        </Box>

        <CustomTab
          id="tab_ued_edit"
          tabs={[
            { label: 'Datos personales', content: personalTab },
            { label: 'Direcciones', content: addressesTab },
          ]}
        />
      </Box>

      <CustomModal
        id="mdl_ued_address"
        open={addressOpen}
        onClose={closeAddress}
        title={editingAddressId ? 'Actualizar dirección' : 'Nueva dirección'}
        actions={
          <>
            <CustomButton
              id="btn_ued_cancel_address"
              variant="outlined"
              fullWidth={false}
              onClick={closeAddress}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              id="btn_ued_save_address"
              fullWidth={false}
              onClick={handleSaveAddress}
              disabled={savingAddress}
            >
              {savingAddress ? 'Guardando…' : 'Guardar'}
            </CustomButton>
          </>
        }
      >
        <AddressFormFields
          idPrefix="ued"
          values={addressForm}
          errors={addressErrors}
          onFieldChange={setAddressField}
          onValueChange={setAddressValue}
          onStateChange={handleEstadoChange}
          onPostalCodeChange={handlePostalCodeChange}
        />
      </CustomModal>

      <CustomModal
        id="mdl_ued_delete"
        open={deleteAddressOpen}
        onClose={closeDeleteAddress}
        title="Eliminar dirección"
        maxWidth="sm"
        actions={
          <>
            <CustomButton
              id="btn_ued_cancel_delete"
              variant="outlined"
              fullWidth={false}
              onClick={closeDeleteAddress}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              id="btn_ued_confirm_delete"
              color="error"
              fullWidth={false}
              onClick={confirmDeleteAddress}
              disabled={savingAddress}
            >
              {savingAddress ? 'Eliminando…' : 'Eliminar'}
            </CustomButton>
          </>
        }
      >
        <Typography>¿Eliminar esta dirección?</Typography>
      </CustomModal>
    </>
  );
}
