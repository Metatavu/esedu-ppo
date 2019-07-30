import { AppAction } from '../actions';
import { StoreState } from '../types';
import { ACCESS_TOKEN_UPDATE, LOCALE_UPDATE } from '../constants';

/**
 * Reducer function
 * 
 * @param storeState store state 
 * @param action action
 */
export function reducer(storeState: StoreState, action: AppAction): StoreState {
  switch (action.type) {
    case ACCESS_TOKEN_UPDATE:
      //const accessToken = action.accessToken;
      return storeState;
    case LOCALE_UPDATE:
      return {...storeState, locale: action.locale};
  }

  return storeState;
}