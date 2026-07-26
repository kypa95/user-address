import AssignmentInd from '@mui/icons-material/AssignmentInd';
import type { SvgIconProps } from '@mui/material';

interface BrandIconProps {
  color?: SvgIconProps['color'];
  className?: string;
  titleAccess?: string;
}

/**
 * Brand mark: a clipboard with a person, from @mui/icons-material/AssignmentInd.
 * The header and `public/favicon.svg` share this mark; keep them in sync.
 */
export default function BrandIcon({
  color = 'inherit',
  className,
  titleAccess,
}: BrandIconProps) {
  return (
    <AssignmentInd color={color} className={className} titleAccess={titleAccess} />
  );
}
