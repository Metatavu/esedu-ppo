import { useEffect, useRef } from "react";
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

/**
 * Custom hook for running given callback function in intervals
 *
 * @param callback callback function
 * @param delay delay as milliseconds
 * @returns function that clears interval when called
 */
export const useInterval = (callback: () => any, delay: number) => {
  const savedCallback = useRef<typeof callback>();
  const stopInterval = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const timeout = setInterval(() => savedCallback.current?.(), delay);

    stopInterval.current = () => clearInterval(timeout);

    return () => {
      clearInterval(timeout);
      stopInterval.current = undefined;
    };
  }, [delay]);

  return stopInterval.current;
};