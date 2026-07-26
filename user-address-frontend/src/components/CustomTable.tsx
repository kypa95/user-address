import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFiltersButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import CustomShowHideColumnsButton from './CustomShowHideColumnsButton';
import {
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
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

  // Each feature is its own switch, all on by default. A list the user is
  // composing rather than exploring can turn off the ones it does not need.

  /** The whole top bar. Turning it off hides the search and every button in it. */
  enableTopToolbar?: boolean;
  /** The search box. */
  enableGlobalFilter?: boolean;
  /** The per-column filter inputs and the button that reveals them. */
  enableColumnFilters?: boolean;
  /**
   * The ⋮ menu on each column header. Defaults to `enableColumnFilters`: the
   * menu only keeps the two filter entries, so without filters it would open
   * empty.
   */
  enableColumnActions?: boolean;
  /** The show/hide columns button. */
  enableHiding?: boolean;
  /** The density toggle. */
  enableDensityToggle?: boolean;
  /** The fullscreen toggle. */
  enableFullScreenToggle?: boolean;
  /** Freezing the first columns while scrolling sideways. */
  enableColumnPinning?: boolean;
  /**
   * Click-to-sort on the headers. Off by default under `manualServerSide`,
   * where sorting would only reorder the page already on screen.
   */
  enableSorting?: boolean;
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
  enableTopToolbar = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  enableColumnActions = enableColumnFilters,
  enableHiding = true,
  enableDensityToggle = true,
  enableFullScreenToggle = true,
  enableColumnPinning = true,
  enableSorting = !manualServerSide,
}: CustomTableProps) {
  const hasRowActions = Boolean(renderRowActionMenuItems);

  // Freeze the first two columns from md up; on smaller screens pinning a wide
  // column would eat the whole viewport, so it is disabled there.
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const pinnedLeft =
    isMdUp && enableColumnPinning
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
    // The search box stays open instead of hiding behind the magnifier.
    initialState: { showGlobalFilter: true },
    enablePagination: true,
    enableTopToolbar,
    enableGlobalFilter,
    enableColumnFilters,
    enableColumnActions,
    enableHiding,
    enableDensityToggle,
    enableFullScreenToggle,
    enableColumnPinning,
    enableSorting,
    enableRowActions: hasRowActions,
    renderRowActionMenuItems: hasRowActions ? renderRowActionMenuItems : undefined,
    positionActionsColumn: 'last',
    manualPagination: manualServerSide,
    manualFiltering: manualServerSide,
    rowCount,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    // Same toolbar as MRT's default, with our own show/hide button so the
    // "Desanclar todo" action never appears. Overriding this means each button
    // has to honour its own flag, which MRT would otherwise do for us.
    renderToolbarInternalActions: ({ table: instance }: any) => (
      <>
        {/* No toggle for the search: it is always on screen, so the button
            would only serve to hide it. */}
        {enableColumnFilters && <MRT_ToggleFiltersButton table={instance} />}
        {enableHiding && <CustomShowHideColumnsButton table={instance} />}
        {enableDensityToggle && <MRT_ToggleDensePaddingButton table={instance} />}
        {enableFullScreenToggle && <MRT_ToggleFullScreenButton table={instance} />}
      </>
    ),
    // The column menu ships with sort, hide, group and pin entries. Only the two
    // filter ones are kept, matched by label instead of by position: MRT keys
    // those items by index, and an index moves whenever the library adds one.
    renderColumnActionsMenuItems: ({ internalColumnMenuItems, column }: any) => {
      const header = String(column.columnDef.header ?? '');
      const keep = [
        MRT_Localization_ES.clearFilter,
        MRT_Localization_ES.filterByColumn?.replace('{column}', header),
      ];

      return internalColumnMenuItems.filter((item: any) =>
        keep.includes(item?.props?.label),
      );
    },
    muiToolbarAlertBannerProps: errorMessage
      ? { color: 'error', children: errorMessage }
      : undefined,
    localization: {
      ...MRT_Localization_ES,
      // Shorter than the pack's defaults, which wrap in narrow toolbars.
      noRecordsToDisplay: 'Sin registros',
      rowsPerPage: 'Filas por página',
    },
    // MRT builds both adornments through the deprecated `InputProps`, which MUI
    // v9 replaced with `slotProps.input`. Declaring them here keeps the
    // magnifier and the clear button on screen regardless.
    muiSearchTextFieldProps: ({ table: instance }: any) => ({
      placeholder: 'Buscar',
      slotProps: {
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={MRT_Localization_ES.clearSearch ?? ''}>
                <span>
                  <IconButton
                    aria-label={MRT_Localization_ES.clearSearch}
                    size="small"
                    disabled={!instance.getState().globalFilter}
                    onClick={() => instance.setGlobalFilter(undefined)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          ),
        },
      },
    }),
    muiTablePaperProps: { id },
  } as any);

  return <MaterialReactTable table={table} />;
}
