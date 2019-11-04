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
import { Image, Icon } from "react-native-elements";
import TextCleanup from "../../utils/TextCleanup";
import { Conversation, Participant, Message } from "../../types/index";

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
  conversations: Conversation[]
};

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
  },
  listIcon: {
      color: "#88B620",
      fontSize: 32
  }
});

/**
 * Component for application MessageScreen
 */
class ConversationsScreen extends React.Component<Props, State> {

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
      conversations: []
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
    this.setState({loading: true});
    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);
    const pageInfo: any = await service.coreWebserviceGetSiteInfo({});

    const conversations: any = await service.coreMessageGetConversations({userid: pageInfo.userid});

    const conversationList: Conversation[] = [];

    for (const conversation of conversations.conversations) {
      const participants: Participant[] = [];
      for (const user of conversation.members) {
        const newUser: Participant = {
          _id: user.id,
          name: user.fullname,
          avatar: user.profileimageurl
        }
        participants.push(newUser);
      }
      const messages: Message[] = [];
      for (const message of conversation.messages) {
        const newMessage: Message = {
          sentTime: message.timecreated,
          sentbyId: message.useridfrom,
          text: TextCleanup.cleanUpText(message.text)
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
    this.setState({conversations: conversationList});
    this.setState({loading: false});
  }

  /**
   * Component render
   */
  public render() {
    const listFooter =
    <TouchableOpacity onPress= {() => this.onNewConversationPress()}>
      <View style={[defaultStyles.topicItemBase]}>
        <Icon type="MaterialIcons" size={46} name="add" color="#fff"/>
        <View style={styles.messageContainer}>
        </View>
      </View>
    </TouchableOpacity>

    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
      <FlatList
        ListFooterComponent={listFooter}
        style={styles.listContainer}
        data={this.state.conversations}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => this.onConversationPress(item)}>
          <View style={[defaultStyles.topicItemBase]}>
            <Image style={defaultStyles.taskIcon} source={{ uri: item.participants[0].avatar }}/>
            <View style={styles.messageContainer}>
              <Text style={[defaultStyles.topicItemText, styles.messageText]}>{item.messages[0].text}</Text>
              <Text style={[defaultStyles.topicItemText, styles.messageUser]}>{item.participants[0].name}</Text>
            </View>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
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

  /**
   * Navigates to selected conversation
   */
  private onConversationPress(conversation: Conversation) {
    this.props.navigation.navigate("Messenger", {conversationId: conversation.id});
  }

  /**
   * Navigates to a new conversation
   */
  private onNewConversationPress() {
    console.warn("AAAAAA");
    this.props.navigation.navigate("NewConversation");
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

export default connect(mapStateToProps, mapDispatchToProps)(ConversationsScreen);
