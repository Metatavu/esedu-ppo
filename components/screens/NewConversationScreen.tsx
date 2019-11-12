import React, { Dispatch } from "react";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, WebView, Text, TouchableOpacity, Image } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client"
import { HOST_URL } from "react-native-dotenv";
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import { Icon } from "react-native-elements";
import TextCleanup from "../../utils/TextCleanup";
import { Conversation, Participant, Message } from "../../types";
import { GiftedChat } from "react-native-gifted-chat";
import { TimerMixin } from "react-timer-mixin";
import { TextInput } from "react-native-gesture-handler";

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
  currentUserId: number,
  searchResults: Participant[]
  loop?: any
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "#000",
    margin: 15,
    marginBottom: 0,
    padding: 10,
    alignItems: "center"
  },
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
class NewConversationScreen extends React.Component<Props, State> {

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
      currentUserId: -1,
      searchResults: []
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

    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const pageInfo: any = await service.coreWebserviceGetSiteInfo({});

    this.setState({currentUserId: pageInfo.userid});
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <View style={styles.searchContainer}>
          <TextInput
            style={{flex: 1}}
            onChangeText={(text) => this.onChangeText(text)}
          />
          <Icon name="search" color="gray" size={25}/>
        </View>
        <FlatList
        style={defaultStyles.listContainer}
        data={this.state.searchResults}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => this.onNewConversationSelect(item)}>
          <View style={defaultStyles.listItemBase}>
            <Image style={defaultStyles.taskIcon} source={{uri: item.avatar}} resizeMode={"contain"}/>
            <View style={defaultStyles.listTextContainer}>
              <Text style={defaultStyles.listItemText}>{item.name}</Text>
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
      this.props.navigation.navigate("NewConversation");
    }
  }

  /**
   * 
   * @param item User to start a new conversation with 
   */
  public async onNewConversationSelect(item: Participant) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const conversation: any = await service.coreMessageGetConversationBetweenUsers({
      userid: this.state.currentUserId, otheruserid: item._id, includecontactrequests: true, includeprivacyinfo: true
    });

    if (conversation) {
      return this.props.navigation.navigate("Messenger", {conversationId: conversation.id});
    }

    return this.props.navigation.navigate("Messenger", {userToMessageId: item._id});
  }

  private async onChangeText(txt: string) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    const service = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const searchResult: any = await service.coreMessageMessageSearchUsers({userid: this.state.currentUserId, search: txt});

    const allResults = searchResult.contacts.concat(searchResult.noncontacts);

    const foundUsers = [];

    for (const user of allResults) {
      const newUser: Participant = {
        _id: user.id,
        name: user.fullname,
        avatar: user.profileimageurl
      }
      foundUsers.push(newUser);
    }
    this.setState({searchResults: foundUsers});
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

export default connect(mapStateToProps, mapDispatchToProps)(NewConversationScreen);
