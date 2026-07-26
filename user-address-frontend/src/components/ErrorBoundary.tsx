import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import '../css/ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so a crash shows a readable message instead of a
 * blank screen. Reloading the page recovers.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Box className="error-boundary">
        <Typography variant="h5" color="error" gutterBottom>
          Ocurrió un error en la vista
        </Typography>
        <Typography variant="body2" component="pre" className="error-boundary-message">
          {error.message}
        </Typography>
      </Box>
    );
  }
}
