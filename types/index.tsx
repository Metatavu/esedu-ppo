/**
 * Interface describing authorization config
 */
export interface AuthConfig {
  url: string
  realmId: string
  clientId: string
  username: string
  password: string
}

/**
 * Interface describing access token
 */
export interface AccessToken {
  created: Date
  access_token: string
  expires_in: number
  refresh_token: number
  refresh_expires_in: number
  url: string
  client_id: string
  realmId: string,
  firstName: string,
  lastName: string
  userId: string
}

/**
  * Interface describing questions for multichoice quiz
  * @param title question title
  * @param answers list of possible answers to the question
  */
export interface MultichoiceQuestion {
    title: string
    answers: MultichoiceAnswer[]
}

/**
  * Interface describing answers for multichoice quiz
  * @param name name of the question
  * @param value value to be passed on back to moodle
  */
export interface MultichoiceAnswer {
  name: string,
  value: string
}

/**
 * Course Topic interface
 */
export interface CourseTopic {
  id: number,
  topicName: string,
  topicDone: boolean,
  topicAvailable: boolean,
  topicContent: TopicContent[]
}

/**
 * Topic Content interface
 */
export interface TopicContent {
  name: string,
  type: string,
  activityId: number
}
