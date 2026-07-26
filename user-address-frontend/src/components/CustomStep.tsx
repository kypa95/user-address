import { Box, Stepper, Step, StepLabel } from '@mui/material';
import type { ReactNode } from 'react';

interface CustomStepProps {
  steps: string[];
  activeStep: number;
  children: ReactNode;
}

/**
 * Reusable stepper: renders the step bar and the active step's content below.
 * The parent owns `activeStep` and passes the content to show.
 */
export default function CustomStep({ steps, activeStep, children }: CustomStepProps) {
  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ pt: 4 }}>{children}</Box>
    </Box>
  );
}
