import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";

export interface Strings extends LocalizedStringsMethods {
  loginScreenHeader: string,
  loginScreenUsernameLabel: string,
  loginScreenPasswordLabel: string,
  loginScreenLoginButton: string,
  loginScreenErrorDialogTitle: string,
  loginScreenUnknownError: string,
  loginScreenWrongInfo: string,
  logoutText: string,
  cancelButtonText: string,
  quizScreenErrorText: string,
  mainScreenErrorText: string,
  pageContentErrorText: string,
  unsupportedActivityTypeText: string,
  frontPageText: string,
  newsText: string,
  instructionsText: string,
  goalsText: string,
  chatText: string,
  uploadFailedError: string,
  fileTooLargeError: string,
  errorSavingSubmission: string,
  deadline: string,
  submissionSent: string,
  language: string,
  logout: string,
  addConversation: string,
  title: string,
  message: string,
  send: string,
  comment: string,
  conversationScreenGetError: string,
  selectFile: string,
  messageScreenError: string,
  newConversationScreenError: string,
  newConversationScreenConversationStartError: string,
  sentForReview: string,
  notSentForReview: string,
  notGraded: string,
  graded: string,
  error: string
}

const strings: Strings = new LocalizedStrings({
  en: require("./en.json"),
  fi: require("./fi.json")
});

export default strings;
