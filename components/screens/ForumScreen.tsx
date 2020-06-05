import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { StoreState, AccessToken, CourseTopic, NewsItem, ForumItem } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert, TextInput, StyleSheet, Button, IntentAndroid, Image } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { HOST_URL, COURSE_IDS } from "react-native-dotenv";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";
import { ScrollView } from "react-native-gesture-handler";
import ForumPost from "../generic/ForumPost";
import * as icons from "../../static/icons";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  activityId?: number,
  courseid?: number
};

/**
 * Component state
 */
interface State {
  moodleToken?: string,
  loading: boolean,
  error: boolean,
  forum: Forum,
  newForumTitle: string,
  newForumText: string
};

interface Forum {
  title: string,
  intro: string,
  userCanPost: boolean,
  posts: ForumItem[]
}

const styles = StyleSheet.create({
  textField : {
    alignContent: "center"
  },
  listItemBase: {
    flex: 1,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#53B02B",
    flexDirection: "row",
    alignContent: "flex-start"
  }
});

/**
 * Component for application main screen
 */
class ForumScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      moodleToken: "",
      loading: false,
      error: false,
      forum: {
         intro: "",
         title: "",
         userCanPost: false,
         posts: []
      },
      newForumTitle: "",
      newForumText: ""
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
    this.setState({loading: true});
    if (!this.props.activityId) {
      return this.props.navigation.goBack();
    }
    const forum = await this.getForumFromMoodle(this.props.activityId).catch((e) => {
      this.setState({loading: false, error: true});
      Alert.alert("Error", strings.mainScreenErrorText);
    });
    this.setState({forum});
    this.setState({loading: false});
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Forum");
    }
  }

  /**
   * Component render
   */
  public render() {
    const forumHeader =
      <View>
        <View style={defaultStyles.topicHeadline}>
            <Image source={icons.TaskIcon} style={defaultStyles.taskIcon} />
            <Text style={[defaultStyles.topicHeadlineText]}>{TextCleanup.cleanUpText(this.state.forum.title)}</Text>
        </View>
        <View style={{margin: 30}}>
          <Text>{TextCleanup.cleanUpText(this.state.forum.intro)}</Text>
        </View>
      </View>

    const listFooter =
      <View>
        <Text>{strings.addConversation}</Text>
        <View style={styles.listItemBase}>
          <View style={[defaultStyles.listTextContainer]}>
            <TextInput placeholder={strings.title} onChangeText={(text) => this.onChangeText(text, true)} style={styles.textField}/>
          </View>
        </View>
        <View style={styles.listItemBase}>
          <View style={[defaultStyles.listTextContainer]}>
            <TextInput placeholder={strings.message} onChangeText={(text) => this.onChangeText(text, false)} style={styles.textField}/>
          </View>
        </View>
        <View style={styles.listItemBase}>
          <View style={[defaultStyles.listTextContainer, {alignItems: "flex-end"}]}>
            <Button color={"#88B620"} title={strings.send} onPress={() => this.submitToForum()}></Button>
          </View>
        </View>
      </View>

    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <ScrollView>
          {forumHeader}
          <FlatList
          ListFooterComponent={this.state.forum.userCanPost ? listFooter : <View/>}
          style={[defaultStyles.listContainer]}
          data={this.state.forum.posts}
          renderItem={({item}) =>
          <ForumPost styles={styles} item={item} sendComment={(id, title, text) => this.submitDiscussion(id, title, text)}/>
          }
          keyExtractor={(item, index) => index.toString()}
          />
          </ScrollView>
      </BasicLayout>
    );
  }

  private onChangeText(text: string, title: boolean) {
    if (title) {
      return this.setState({newForumTitle: text});
    } else {
      return this.setState({newForumText: text});
    }
  }

  private async submitDiscussion(id: number, title: string, text: string) {
    const forum = Api.getModForumService(HOST_URL, this.props.moodleToken || "");

    forum.addDiscussionPost({postid: id, subject: title, message: text});
  }

  private async submitToForum() {
    const forumService = Api.getModForumService(this.props.moodleToken || "", HOST_URL);

    const newDiscussion = {
      forumid: this.props.activityId || 0,
      subject: this.state.newForumTitle,
      message: this.state.newForumText
    }

    await forumService.addDiscussion(newDiscussion);
  }

  /**
   * Returns the courses topics from moodle Api
   * @param courseId Course to retrieve the news section for
   */
  private async getForumFromMoodle(forumid: number) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }

    const forumService = Api.getModForumService(HOST_URL, this.props.moodleToken);

    const viewForum: any = await forumService.getForumsByCourses({courseids: [this.props.courseid || 0]})

    const forums: Forum = {
      title: "",
      intro: "",
      userCanPost: false,
      posts: []
    }

    for (const forum of viewForum) {

      if (forum.id === forumid) {
        forums.intro = forum.intro,
        forums.title = forum.name,
        forums.userCanPost = forum.type !== "news"
      }
    }

    const forumDiscussions: any = await forumService.getForumDiscussionsPaginated({forumid});

    for (const discussion of forumDiscussions.discussions) {
      const date = new Date(discussion.timemodified * 1000);
      const posts: ForumItem = {
        title: discussion.subject,
        text: discussion.message,
        author: discussion.userfullname,
        dateModified: date,
        comments: [],
        id: discussion.id
      }
      forums.posts.push(posts);
    }

    return forums;
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
    courseid: state.selectedSectionId,
    activityId: state.selectedActivityId
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSelectedTopicUpdate: (courseTopic: CourseTopic) => dispatch(actions.selectedTopicUpdate(courseTopic))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForumScreen);
