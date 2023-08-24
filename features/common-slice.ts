import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../app/store";
import { AccessToken, CourseTopic } from "../types";

/**
 * Interface describing common state in Redux
 */
export interface CommonState {
  accessToken?: AccessToken,
  moodleToken?: string,
  selectedTopic?: CourseTopic,
  locale: string
}

/**
 * Initial common state
 */
const initialState: CommonState = {
  accessToken: undefined,
  moodleToken: undefined,
  selectedTopic: undefined,
  locale: "fi"
};

/**
 * Common slice of Redux store
 */
export const commonSlice = createSlice({
  name: "common",
  initialState: initialState,
  reducers: {
    accessTokenUpdate: (state, { payload: accessToken }: PayloadAction<AccessToken | undefined>) => {
      state.accessToken = accessToken;
    },
    moodleTokenUpdate: (state, { payload: moodleToken }: PayloadAction<string | undefined>) => {
      state.moodleToken = moodleToken;
    },
    localeUpdate: (state, { payload: locale }: PayloadAction<string>) => {
      state.locale = locale;
    },
    selectedTopicUpdate: (state, { payload: selectedTopic }: PayloadAction<CourseTopic | undefined>) => {
      state.selectedTopic = selectedTopic;
    }
  }
});

/**
 * Common actions from created slice
 */
export const { accessTokenUpdate, moodleTokenUpdate, localeUpdate, selectedTopicUpdate } = commonSlice.actions;

export const selectAccessToken = (state: RootState) => state.common.accessToken;
export const selectMoodleToken = (state: RootState) => state.common.moodleToken;
export const selectSelectedTopic = (state: RootState) => state.common.selectedTopic;
export const selectLocale = (state: RootState) => state.common.locale;

/**
 * Reducer for common slice
 */
export default commonSlice.reducer;
