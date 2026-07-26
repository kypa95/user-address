import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useTheme, useMediaQuery } from '@mui/material';
import type { ReactNode } from 'react';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface RowActionArgs {
  row: { original: any };
  closeMenu: () => void;
}

interface CustomTableProps {
  id?: string;
  columns: any[];
  data: any[];
  isLoading?: boolean;
  renderRowActionMenuItems?: (args: RowActionArgs) => ReactNode[];
  manualServerSide?: boolean;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (updater: any) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (updater: any) => void;
  /** Per-column filters, as MRT's `[{ id, value }]`. */
  columnFilters?: { id: string; value: unknown }[];
  onColumnFiltersChange?: (updater: any) => void;
  errorMessage?: string | null;
}

/**
 * Reusable data table built on Material React Table.
 * Ships with pagination, global search and per-column filters. Pass
 * `manualServerSide` with the controlled state props to page/search server side.
 */
export default function CustomTable({
  id,
  columns,
  data,
  isLoading = false,
  renderRowActionMenuItems,
  manualServerSide = false,
  rowCount,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  errorMessage,
}: CustomTableProps) {
  const hasRowActions = Boolean(renderRowActionMenuItems);

  // Freeze the first two columns from md up; on smaller screens pinning a wide
  // column would eat the whole viewport, so it is disabled there.
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const pinnedLeft = isMdUp
    ? columns.slice(0, 2).map((column) => column.accessorKey ?? column.id)
    : [];

  const tableState: Record<string, unknown> = {
    isLoading,
    showAlertBanner: Boolean(errorMessage),
    columnPinning: { left: pinnedLeft },
  };
  if (pagination !== undefined) tableState.pagination = pagination;
  if (globalFilter !== undefined) tableState.globalFilter = globalFilter;
  if (columnFilters !== undefined) tableState.columnFilters = columnFilters;

  // MRT's config generics are sidestepped with a cast: the shape is validated by
  // the prop interface above, and the runtime object is what MRT expects.
  const table = useMaterialReactTable({
    columns,
    data,
    state: tableState,
    enablePagination: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableColumnPinning: true,
    enableRowActions: hasRowActions,
    renderRowActionMenuItems: hasRowActions ? renderRowActionMenuItems : undefined,
    positionActionsColumn: 'last',
    manualPagination: manualServerSide,
    manualFiltering: manualServerSide,
    rowCount,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    // Sorting a single server page would order only those rows, which reads as
    // if the whole table were sorted.
    enableSorting: !manualServerSide,
    muiToolbarAlertBannerProps: errorMessage
      ? { color: 'error', children: errorMessage }
      : undefined,
    localization: {
      actions: 'Acciones',
      search: 'Buscar',
      rowsPerPage: 'Filas por página',
      noRecordsToDisplay: 'Sin registros',
    },
    muiSearchTextFieldProps: { placeholder: 'Buscar' },
    muiTablePaperProps: { id },
  } as any);

  return <MaterialReactTable table={table} />;
}
