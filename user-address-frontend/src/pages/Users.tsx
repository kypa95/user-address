import { Box, Typography, Stack, Divider, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CustomTable from '../components/CustomTable';
import CustomModal from '../components/CustomModal';
import CustomMenuItem from '../components/CustomMenuItem';
import CustomHeaderMenu from '../components/CustomHeaderMenu';
import CustomButton from '../components/CustomButton';
import { USER_COLUMNS } from '../constants/users/userColumns';
import { USER_DETAIL_FIELDS } from '../constants/users/userFields';
import { ADDRESS_COLUMNS } from '../constants/address/addressColumns';
import { useUsersApp } from './UsersApp';
import '../css/Users.css';

export default function Users() {
  const {
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
  } = useUsersApp();

  const renderRowActionMenuItems = ({ row, closeMenu }) => [
    <CustomMenuItem
      key="detail"
      icon={<Visibility fontSize="small" />}
      label="Detalles"
      onClick={() => {
        handleDetail(row.original);
        closeMenu();
      }}
    />,
    <CustomMenuItem
      key="edit"
      icon={<Edit fontSize="small" />}
      label="Editar"
      onClick={() => {
        handleEdit(row.original);
        closeMenu();
      }}
    />,
    <CustomMenuItem
      key="delete"
      icon={<Delete fontSize="small" color="error" />}
      label="Eliminar"
      onClick={() => {
        handleDelete(row.original);
        closeMenu();
      }}
    />,
  ];

  return (
    <>
      <CustomHeaderMenu />

      <Box className="users-page">
        <Box className="users-toolbar">
          <Typography variant="h4">
            Usuarios
          </Typography>
          <Box className="users-actions">
            <CustomButton
              id="btn_use_export"
              variant="outlined"
              fullWidth={false}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exportando…' : 'Exportar'}
            </CustomButton>
            <CustomButton id="btn_use_create" fullWidth={false} onClick={goToCreate}>
              Crear usuario
            </CustomButton>
          </Box>
        </Box>

        <CustomTable
          id="tbl_use_list"
          columns={USER_COLUMNS}
          data={users}
          isLoading={isLoading}
          errorMessage={loadError}
          renderRowActionMenuItems={renderRowActionMenuItems}
          // The backend does the filtering and the paging, always.
          manualServerSide
          rowCount={total}
          columnFilters={columnFilters}
          onColumnFiltersChange={handleColumnFiltersChange}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          globalFilter={search}
          onGlobalFilterChange={handleSearchChange}
        />
      </Box>

      <CustomModal
        id="mdl_use_detail"
        open={detailOpen}
        onClose={closeDetail}
        title="Detalles del usuario"
        maxWidth="md"
      >
        {selected ? (
          <Stack spacing={2}>
            <Stack spacing={1}>
              {USER_DETAIL_FIELDS.map(([label, key]) => (
                <Box key={key} className="detail-row">
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body1">{selected[key] || '—'}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider />

            <Typography variant="h6">
              Direcciones
            </Typography>
            {detailLoading ? (
              <Box className="detail-loading">
                <CircularProgress size={28} />
              </Box>
            ) : (
              <CustomTable
                id="tbl_use_detail_addresses"
                columns={ADDRESS_COLUMNS}
                data={detailAddresses}
                enableColumnPinning={false}
                manualServerSide
                rowCount={detailTotal}
                pagination={detailPagination}
                onPaginationChange={handleDetailPaginationChange}
                globalFilter={detailSearch}
                onGlobalFilterChange={handleDetailSearchChange}
                enableColumnFilters={false}
              />
            )}
          </Stack>
        ) : null}
      </CustomModal>

      <CustomModal
        id="mdl_use_delete"
        open={deleteOpen}
        onClose={closeDelete}
        title="Eliminar usuario"
        maxWidth="sm"
        actions={
          <>
            <CustomButton
              id="btn_use_cancel_delete"
              variant="outlined"
              fullWidth={false}
              onClick={closeDelete}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              id="btn_use_confirm_delete"
              color="error"
              fullWidth={false}
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? 'Eliminando…' : 'Eliminar'}
            </CustomButton>
          </>
        }
      >
        <Typography>
          ¿Eliminar a {userToDelete?.name} {userToDelete?.lastName}? Se borrarán también
          todas sus direcciones.
        </Typography>
      </CustomModal>
    </>
  );
}
