import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { StoreState, AccessToken, CourseTopic, NewsItem } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { HOST_URL, COURSE_IDS } from "react-native-dotenv";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string
};

/**
 * Component state
 */
interface State {
  moodleToken?: string,
  loading: boolean,
  error: boolean,
  news: NewsItem[]
};

/**
 * Component for application main screen
 */
class NewsScreen extends React.Component<Props, State> {

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
      news: []
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
    const news = await this.getNewsFromMoodle(COURSE_IDS.split(",")).catch((e) => {
      this.setState({loading: false, error: true});
      Alert.alert("Error", strings.mainScreenErrorText);
    });
    this.setState({news});
    this.setState({loading: false});
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("News");
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <FlatList
        style={defaultStyles.listContainer}
        data={this.state.news}
        renderItem={({item}) =>
          <View style={{margin: 10}}>
            <Text style={defaultStyles.newsHeadline}>{item.title}</Text>
            <Text style={{margin: 10}}>{TextCleanup.cleanUpText(item.text)}</Text>
            <Text style={defaultStyles.newsFooterText}>{TextCleanup.cleanUpText(item.author)} {item.dateModified.toLocaleDateString()}</Text>
          </View>
          }
        keyExtractor={(item, index) => index.toString()}
        />
      </BasicLayout>
    );
  }

  /**
   * Returns the courses topics from moodle Api
   * @param courseId Course to retrieve the news section for
   */
  private async getNewsFromMoodle(courseIds: number[]) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }

    const forumService = Api.getModForumService(HOST_URL, this.props.moodleToken);

    const forums: any = await forumService.getForumsByCourses({courseids : courseIds});

    const news: NewsItem[] = [];

    for (const forum of forums) {
      if (forum.type === "news") {
        const forumPosts: any = await forumService.getForumDiscussionsPaginated({forumid: forum.id});
        for (const post of forumPosts.discussions) {
          const date = new Date(post.timemodified * 1000)
          const newsPost: NewsItem = {
            title: post.subject,
            text: post.message,
            author: post.userfullname,
            dateModified: date
          }
          news.push(newsPost);
        }
      }
    }

    return news;
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
    courseid: state.selectedSectionId
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

export default connect(mapStateToProps, mapDispatchToProps)(NewsScreen);
