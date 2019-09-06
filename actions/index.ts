import * as constants from "../constants";
import { AccessToken, CourseTopic, TopicContent } from "../types";

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
 * Moodle token update data
 */
export interface MoodleTokenUpdate {
  type: constants.MOODLE_TOKEN_UPDATE,
  moodleToken?: string
}

/**
 * Selected topic update data
 */
export interface SelectedTopicUpdate {
  type: constants.SELECTED_TOPIC_UPDATE,
  courseTopic?: CourseTopic
}

export interface SelectedActivityUpdate {
  type: constants.SELECTED_ACTIVITY_UPDATE,
  activityId: number
}
/**
 * Actions
 */
export type AppAction =  AccessTokenUpdate | LocaleUpdate | MoodleTokenUpdate | SelectedTopicUpdate | SelectedActivityUpdate;

/**
 * Store update method for access token
 * 
 * @param accessToken access token
 */
export function accessTokenUpdate(accessToken?: AccessToken): AccessTokenUpdate {
  return {
    type: constants.ACCESS_TOKEN_UPDATE,
    accessToken
  }
}

/**
 * Store update method for moodle token
 * 
 * @param moodleToken moodle token
 */
export function moodleTokenUpdate(moodleToken?: string): MoodleTokenUpdate {
  return{
    type: constants.MOODLE_TOKEN_UPDATE,
    moodleToken
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
    locale
  }
}

/**
 * Store update method for selected topic
 * 
 * @param locale locale
 */
export function selectedTopicUpdate(courseTopic: CourseTopic): SelectedTopicUpdate {
  return {
    type: constants.SELECTED_TOPIC_UPDATE,
    courseTopic
  }
}

/**
 * Store update method for selected topic
 * 
 * @param locale locale
 */
export function selectedActivityUpdate(activityId: number): SelectedActivityUpdate {
  return {
    type: constants.SELECTED_ACTIVITY_UPDATE,
    activityId
  }
}
