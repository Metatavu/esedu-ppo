import { configureStore } from "@reduxjs/toolkit";

import commonReducer from "../features/common-slice";

/**
 * Initialized Redux store
 */
export const store = configureStore({
  reducer: {
    common: commonReducer
  },
  middleware: []
});

/**
 * Type of root state of Redux store
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type of dispatch method for dispatching actions to Redux store
 */
export type AppDispatch = typeof store.dispatch;
