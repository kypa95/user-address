/** Mirrors AddressResponse on the backend. */
export interface Address {
  id: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  state: string;
  city: string;
  postalCode: string;
  country: string;
}
