/**
 * Every route the app renders, in one place.
 *
 * These are browser routes only — the backend endpoints live in `src/api`, and
 * the fact that both happen to say "/users" is a coincidence, not a shared
 * constant.
 */
export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  users: '/users',
  /** Stepper screen for creating a user; must be matched before the :id route. */
  userCreate: '/users/create',
  /** Pattern the router matches; use `userEdit(id)` to build a real link. */
  userEditPattern: '/users/:id',
  notFound: '*',
} as const;

/** Link to a single user's edit screen. */
export function userEditPath(id: string): string {
  return `${ROUTES.users}/${id}`;
}
