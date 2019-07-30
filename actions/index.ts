import * as constants from '../constants';
import { AccessToken } from '../types';

/**
 * Access token update data
 */
export interface AccessTokenUpdate {
  type: constants.ACCESS_TOKEN_UPDATE,
  accessToken?: AccessToken
}

/**
 * Locale update data
 */
export interface LocaleUpdate {
  type: constants.LOCALE_UPDATE,
  locale: string
}

/**
 * Actions
 */
export type AppAction =  AccessTokenUpdate | LocaleUpdate;

/**
 * Store update method for access token
 * 
 * @param accessToken access token
 */
export function accessTokenUpdate(accessToken?: AccessToken): AccessTokenUpdate {
  return {
    type: constants.ACCESS_TOKEN_UPDATE,
    accessToken: accessToken
  }
}

/**
 * Store update method for locale
 * 
 * @param locale locale
 */
export function localeUpdate(locale: string): LocaleUpdate {
  return {
    type: constants.LOCALE_UPDATE,
    locale: locale
  }
}