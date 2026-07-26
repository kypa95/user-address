import { useState } from 'react';
import { Box, Button, Divider, IconButton, Menu, Tooltip } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { MRT_ShowHideColumnsMenuItems } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

interface CustomShowHideColumnsButtonProps {
  table: any;
}

/**
 * Replaces MRT's own show/hide columns button.
 *
 * The stock menu adds an "Desanclar todo" action whenever column pinning is on,
 * and pinning has to stay on for the frozen first columns. Rebuilding the menu
 * from the pieces MRT exports drops that action while keeping the per-column
 * switches — and their drag-to-reorder behaviour — untouched.
 */
export default function CustomShowHideColumnsButton({
  table,
}: CustomShowHideColumnsButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<any>(null);

  const allColumns = table.getAllColumns();

  const toggleAll = (visible: boolean) => {
    table
      .getAllLeafColumns()
      .filter((column: any) => column.columnDef.enableHiding !== false)
      .forEach((column: any) => column.toggleVisibility(visible));
  };

  return (
    <>
      <Tooltip title={MRT_Localization_ES.showHideColumns}>
        <IconButton
          aria-label={MRT_Localization_ES.showHideColumns}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '0.5rem', pt: 0 }}>
          <Button
            disabled={!table.getIsSomeColumnsVisible()}
            onClick={() => toggleAll(false)}
          >
            {MRT_Localization_ES.hideAll}
          </Button>
          <Button
            disabled={table.getIsAllColumnsVisible()}
            onClick={() => toggleAll(true)}
          >
            {MRT_Localization_ES.showAll}
          </Button>
        </Box>

        <Divider />

        {allColumns.map((column: any, index: number) => (
          <MRT_ShowHideColumnsMenuItems
            key={`${index}-${column.id}`}
            allColumns={allColumns}
            column={column}
            hoveredColumn={hoveredColumn}
            isNestedColumns={false}
            setHoveredColumn={setHoveredColumn}
            table={table}
          />
        ))}
      </Menu>
    </>
  );
}
