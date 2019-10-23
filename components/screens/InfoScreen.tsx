import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { StoreState, AccessToken, CourseTopic, NewsItem } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import Api from "moodle-ws-client"
import { HeaderProps, FlatList } from "react-navigation";
import { HOST_URL, COURSE_IDS, INFOPAGE_ID } from "react-native-dotenv";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import { Alert, WebView } from "react-native";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  courseid?: number
};

/**
 * Component state
 */
interface State {
  moodleToken?: string,
  loading: boolean,
  error: boolean,
  pageContent: string,
  pageHeader: string
};

/**
 * Component for application info screen
 */
class InfoScreen extends React.Component<Props, State> {

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
    this.setState({loading: true});
    if (!this.props.moodleToken || !INFOPAGE_ID) {
      return this.props.navigation.navigate("Login");
    }
    console.warn(INFOPAGE_ID);
    const pageContent: any = await this.getContentPageFromMoodle(INFOPAGE_ID).catch((e) => {
      Alert.alert("Error", strings.pageContentErrorText);
    });
    this.setState({pageContent: `<h1>${pageContent.name}</h1> ${pageContent.content}`, loading: false});
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Main");
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
        <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
          <View style={{flex: 1, padding: 10, justifyContent: "center", height: 400}}>
            <WebView style={{flex: 1}} originWhitelist={["*"]} source={{ html: this.state.pageContent }}/>
          </View>
        </BasicLayout>
    );
  }

  /**
   * Method gets info page from moodle API
   */
  public async getContentPageFromMoodle(pageid: number) {
    if (this.props.moodleToken != null) {
      const pageService = Api.getModPageService(HOST_URL, this.props.moodleToken);
      const pageList: any = await pageService.getPagesByCourses({courseids: [COURSE_IDS]});

      for (const page of pageList.pages) {
        if (page.coursemodule == pageid) {
          return page;
        }
      }
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

export default connect(mapStateToProps, mapDispatchToProps)(InfoScreen);
