import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

export interface TabItem {
  label: string;
  content: ReactNode;
}

interface CustomTabProps {
  id?: string;
  tabs: TabItem[];
  defaultTab?: number;
}

/**
 * Reusable tabs component. Renders the active tab's content below the tab bar.
 */
export default function CustomTab({ id, tabs, defaultTab = 0 }: CustomTabProps) {
  const [active, setActive] = useState(defaultTab);

  return (
    <Box id={id}>
      <Tabs
        value={active}
        onChange={(_event: SyntheticEvent, value: number) => setActive(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      {tabs.map((tab, index) =>
        index === active ? (
          <Box key={tab.label} sx={{ pt: 3 }}>
            {tab.content}
          </Box>
        ) : null,
      )}
    </Box>
  );
}
