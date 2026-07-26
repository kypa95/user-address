import { Box } from '@mui/material';
import CustomTextField from './CustomTextField';
import CustomSelect from './CustomSelect';
import CustomAutocompleteSearch from './CustomAutocompleteSearch';
import { ESTADOS, municipiosOf, PAISES } from '../data/mexicoLocations';
import { ADDRESS_FIELDS, ADDRESS_MAX_LENGTH } from '../constants/address/addressFields';
import type { FormValues } from '../constants/forms';
import type { FormErrors } from '../types/forms';

interface AddressFormFieldsProps {
  idPrefix: string;
  values: FormValues;
  errors: FormErrors;
  onFieldChange: (key: string) => (event: any) => void;
  onValueChange: (key: string, value: string) => void;
  onStateChange: (state: string) => void;
  onPostalCodeChange: (event: any) => void;
}

/**
 * The address fields, shared by the create wizard and the edit screen.
 *
 * Four of them are not plain text inputs: state and municipio are
 * autocompletes that depend on each other, the postal code is digits only, and
 * the country is a single-option select.
 */
export default function AddressFormFields({
  idPrefix,
  values,
  errors,
  onFieldChange,
  onValueChange,
  onStateChange,
  onPostalCodeChange,
}: AddressFormFieldsProps) {
  return (
    <Box component="form" noValidate>
      {ADDRESS_FIELDS.map(([label, key]) => {
        if (key === 'state') {
          return (
            <CustomAutocompleteSearch
              id={`txt_${idPrefix}_${key}`}
              key={key}
              label={label}
              value={values.state}
              onChange={onStateChange}
              options={ESTADOS}
              error={errors.state}
              maxLength={ADDRESS_MAX_LENGTH[key]}
            />
          );
        }
        if (key === 'city') {
          return (
            <CustomAutocompleteSearch
              id={`txt_${idPrefix}_${key}`}
              key={key}
              label="Municipio"
              value={values.city}
              onChange={(value) => onValueChange('city', value)}
              options={municipiosOf(values.state)}
              freeSolo
              error={errors.city}
              maxLength={ADDRESS_MAX_LENGTH[key]}
            />
          );
        }
        if (key === 'postalCode') {
          return (
            <CustomTextField
              id={`txt_${idPrefix}_${key}`}
              key={key}
              label={label}
              value={values.postalCode}
              onChange={onPostalCodeChange}
              error={errors.postalCode}
              maxLength={ADDRESS_MAX_LENGTH[key]}
            />
          );
        }
        if (key === 'country') {
          return (
            <CustomSelect
              id={`slc_${idPrefix}_${key}`}
              key={key}
              label={label}
              value={values.country}
              onChange={onFieldChange('country')}
              options={PAISES}
              error={errors.country}
            />
          );
        }
        return (
          <CustomTextField
            id={`txt_${idPrefix}_${key}`}
            key={key}
            label={label}
            value={values[key]}
            onChange={onFieldChange(key)}
            error={errors[key]}
            maxLength={ADDRESS_MAX_LENGTH[key]}
          />
        );
      })}
    </Box>
  );
}
