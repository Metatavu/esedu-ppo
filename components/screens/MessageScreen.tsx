import React, { Dispatch } from "react";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, WebView, Text } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import Api from "moodle-ws-client"
import strings from "../../localization/strings";
import { HOST_URL } from "react-native-dotenv";
import BasicLayout from "../layout/BasicLayout";
import { isDate } from "util";

/**
 * Component props
 */
interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string,
  pageid?: number
  courseid?: number
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  moodleToken?: string,
  quizData: MultichoiceQuestion[],
  optionsArray: string[],
  attemptId?: number,
  sequenceCheck?: number,
  pageContent: string,
  pageHeader: string,
  mountedId?: number
};

interface Conversation {
  id: number,
  participants: User[],
  messages: Message[]
}

interface User {
  id: number,
  fullname: string
}

interface Message {
  sentbyId: number,
  sentTime: Date,
  text: string
}

const styles = StyleSheet.create({
  paragraph: {
    fontFamily: "Cochin",
    marginBottom: 20
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  questionContainer: {
    marginBottom: 15
  }
});

/**
 * Component for application main screen
 */
class TextContentScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      quizData: [],
      optionsArray: [],
      moodleToken: "",
      pageContent: "",
      pageHeader: ""
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerLeft: null,
      headerTitle: <TopBar showBack={true} navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    if (!this.props.moodleToken) {
        return this.props.navigation.navigate("Login");
    }
    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);
    const pageInfo: any = await service.coreWebserviceGetSiteInfo({});

    const conversations: any = await service.coreMessageGetConversations({userid: pageInfo.userid});

    const conversationList: Conversation[] = [];

    for (const conversation of conversations.conversations) {
      const participants: User[] = [];

      for (const user of conversation.members) {
        const newUser: User = {
          id: user.id,
          fullname: user.fullname
        }
        participants.push(newUser);
      }
      const messages: Message[] = [];
      for (const message of conversation.messages) {
        const newMessage: Message = {
          sentTime: message.timecreated,
          sentbyId: message.useridfrom,
          text: message.text
        }
        messages.push(newMessage);
      }

      const newCourseItem: Conversation = {
        id: conversation.id,
        participants,
        messages
      }
      conversationList.push(newCourseItem);
    }
    console.warn(conversationList);
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} backgroundColor="#fff" loading={false}>
        <View>
            <Text>This is a messages screen</Text>
        </View>
      </BasicLayout>
    );
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Message");
    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    locale: state.locale,
    moodleToken: state.moodleToken,
    pageid: state.selectedActivityId,
    courseid: state.selectedSectionId
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TextContentScreen);
