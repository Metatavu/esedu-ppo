import { AppAction } from "../actions";
import { StoreState } from "../types";
import { ACCESS_TOKEN_UPDATE, LOCALE_UPDATE, MOODLE_TOKEN_UPDATE, SELECTED_TOPIC_UPDATE, SELECTED_ACTIVITY_UPDATE } from "../constants";

/**
 * Reducer function
 * 
 * @param storeState store state 
 * @param action action
 */
export function reducer(storeState: StoreState, action: AppAction): StoreState {
  switch (action.type) {
    case ACCESS_TOKEN_UPDATE:
      // const accessToken = action.accessToken;
      return storeState;
    case LOCALE_UPDATE:
      return {...storeState, locale: action.locale};
    case MOODLE_TOKEN_UPDATE:
      return {...storeState, moodleToken: action.moodleToken};
    case SELECTED_TOPIC_UPDATE:
      return {...storeState, selectedTopic: action.courseTopic};
    case SELECTED_ACTIVITY_UPDATE:
      return {...storeState, selectedActivityId: action.activityId}
  }

  return storeState;
}
