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
    title: string,
    exportCode: string,
    answers: MultichoiceAnswer[],
    sequencecheck: number
}

/**
  * Interface describing answers for multichoice quiz
  * @param name name of the question
  * @param value value to be passed on back to moodle
  */
export interface MultichoiceAnswer {
  name: string,
  value: number
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
 * Course Section interface
 */
export interface CourseSection {
  id: number,
  sectionName: string,
  icon: any
}

/**
 * Topic Content interface
 */
export interface TopicContent {
  name: string,
  type: string,
  activityId: number,
  active: boolean,
  isTask: boolean,
  courseId?: string,
  url?: string
}

/**
 * News Item Interface
 */
export interface NewsItem {
  title: string,
  text: string,
  author: string
  dateModified: Date
};

/**
 * Forum Item Interface
 */
export interface ForumItem {
  id: number,
  title: string,
  text: string,
  author: string,
  dateModified: Date,
  comments: Message[]
};

/**
 * Interface describing conversations
 */
export interface Conversation {
  id: number,
  participants: Participant[],
  messages: Message[]
}

/**
 * Interface describing conversations participants
 */
export interface Participant {
  _id: number,
  name: string,
  avatar: string
}

/**
 * Interface describing conversations messages
 */
export interface Message {
  sentbyId: number,
  sentTime: Date,
  text: string
}
