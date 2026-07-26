import { Grid } from '@mui/material';
import CustomTextField from './CustomTextField';
import CustomPhoneInput from './CustomPhoneInput';
import { USER_FIELDS, USER_MAX_LENGTH } from '../constants/users/userFields';
import type { FormValues } from '../constants/forms';
import type { FormErrors } from '../types/forms';

interface UserFormFieldsProps {
  idPrefix: string;
  values: FormValues;
  errors: FormErrors;
  onFieldChange: (key: string) => (event: any) => void;
  onValueChange: (key: string) => (value: string) => void;
}

/**
 * The personal-data fields, shared by the create wizard and the edit screen.
 *
 * Only the id prefix differs between the two, so it is a prop: the pages own
 * the state and the buttons, this owns the layout of the inputs.
 */
export default function UserFormFields({
  idPrefix,
  values,
  errors,
  onFieldChange,
  onValueChange,
}: UserFormFieldsProps) {
  return (
    <Grid container spacing={2}>
      {USER_FIELDS.map(([label, key]) => (
        <Grid size={{ xs: 12, md: 6 }} key={key}>
          {key === 'phoneNumber' ? (
            <CustomPhoneInput
              id={`${idPrefix}_${key}`}
              label={label}
              value={values[key]}
              onChange={onValueChange(key)}
              error={errors[key]}
              maxDigits={USER_MAX_LENGTH[key]}
            />
          ) : (
            <CustomTextField
              id={`${idPrefix}_${key}`}
              label={label}
              type={key === 'email' ? 'email' : 'text'}
              value={values[key]}
              onChange={onFieldChange(key)}
              error={errors[key]}
              maxLength={USER_MAX_LENGTH[key]}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}
