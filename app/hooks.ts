import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "./store";

/**
 * Custom hook for accessing dispatch function for Redux state
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Custom hook for accessing selector function for redux state
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;