import React, { Dispatch } from "react";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, WebView, Text, TouchableOpacity } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client"
import { HOST_URL } from "react-native-dotenv";
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import { Image } from "react-native-elements";
import TextCleanup from "../../utils/TextCleanup";
import { Conversation, Participant, Message } from "../../types";
import { GiftedChat } from "react-native-gifted-chat";
import { TimerMixin } from "react-timer-mixin";

/**
 * Component props
 */
interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string,
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  moodleToken?: string,
  conversationId?: number,
  messages: GiftedChatMessage[],
  currentUserId?: number,
  loop?: any,
  userToMessageId?: number
};

interface GiftedChatMessage {
  _id: number,
  text: string,
  createdAt: Date,
  user: Participant
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 25,
    marginHorizontal: 10
  },
  messageUser: {
    padding: 0,
    height: 25,
    fontSize: 20,
    //backgroundColor: "#53B02B",
    alignItems: "flex-start",
    flexDirection: "row",
    textAlignVertical: "center",
    textAlign: "left"
  },
  messageText: {
    textAlignVertical: "top",
    fontSize: 18,
    width: 275,
    height: 30,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "white"
  },
  iconBackgroundAdjust: {
    marginTop: 25
  },
  activityText: {
    color: "black",
    paddingLeft: 10
  },
  messageContainer: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 5
  }
});

/**
 * Component for application MessageScreen
 */
class MessengerScreen extends React.Component<Props, State> {

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
      moodleToken: "",
      messages: []
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
   * Component will unmount
   */
  public componentWillUnmount() {
    if (this.state.loop) {
      clearInterval(this.state.loop);
    }
  }

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    if (!this.props.moodleToken) {
        return this.props.navigation.navigate("Login");
    }
    const conversationId = this.props.navigation.getParam("conversationId");

    const userToMessageId = this.props.navigation.getParam("userToMessageId");

    if (!conversationId && !userToMessageId) {
      return this.props.navigation.navigate("Conversations");
    }

    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const pageInfo: any = await service.coreWebserviceGetSiteInfo({});

    this.setState({currentUserId: pageInfo.userid});

    this.setState({conversationId});

    this.setState({userToMessageId});

    if (!this.state.currentUserId) {
      return;
    }
    const messages = await this.updateMessages(this.state.currentUserId, this.state.conversationId, this.state.userToMessageId);

    this.setState({messages});

    this.updateLoop();
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.currentUserId
        }}
      />
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

  private async updateMessages(userid?: number, conversationid?: number, userToMessageId?: number) {
    if (!this.props.moodleToken || !userid) {
      return this.props.navigation.naviage("Login");
    }

    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const messages: GiftedChatMessage[] = [];

    if (!conversationid) {
      return messages;
    }

    const conversation: any = await service.coreMessageGetConversation({
      userid, conversationid, includecontactrequests: false, includeprivacyinfo: false
    });
    for (const message of conversation.messages) {
      let sentBy;
      for (const user of conversation.members) {
        if (user.id === message.useridfrom) {
          sentBy = user;
        }
      }
      const newMessage: GiftedChatMessage = {
        createdAt: message.timecreated,
        _id: message.id,
        text: TextCleanup.cleanUpText(message.text),
        user: {
          _id: message.useridfrom,
          avatar: sentBy !== undefined ? sentBy.profileimageurlsmall : "",
          name: sentBy !== undefined ? sentBy.fullname : ""
        }
      }
      messages.push(newMessage)
    }

    return messages;
  }

  private async updateLoop() {
    const loop = setInterval(async () => {
      const messages = await this.updateMessages(this.state.currentUserId, this.state.conversationId);
      this.setState({messages});
    }, 2000);
    this.setState({loop});
  }

  /**
   * Message send function
   */
  private async onSend(message: any) {
    if (!this.props.moodleToken) {
      return;
    }
    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    if (!this.state.conversationId && this.state.userToMessageId) {
      const messageDetails = { messages: [{ touserid: this.state.userToMessageId, text: message[0].text, textformat: 0, clientmsgid: ""}]};

      const sentMessageResponse: any = await service.coreMessageSendInstantMessages(messageDetails);

      console.warn(sentMessageResponse[0].conversationid);
      this.setState({conversationId: sentMessageResponse[0].conversationid});
    } else if (this.state.conversationId) {

      const messageDetails = {conversationid: this.state.conversationId, messages: [{text: message[0].text, textformat: 0}]}

      const sentMessageResponse = await service.coreMessageSendMessagesToConversation(messageDetails);
    }

    const messages = await this.updateMessages(this.state.currentUserId, this.state.conversationId);

    this.setState({messages});
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
    moodleToken: state.moodleToken
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

export default connect(mapStateToProps, mapDispatchToProps)(MessengerScreen);
