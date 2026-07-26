import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Typed dispatch that understands thunks. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
/** Typed selector bound to the store's RootState. */
export const useAppSelector = useSelector.withTypes<RootState>();
