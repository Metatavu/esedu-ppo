import React, { Dispatch } from "react";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, WebView, Text, Image, Modal, TouchableHighlight } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import Api from "moodle-ws-client"
import strings from "../../localization/strings";
import { HOST_URL, COURSE_IDS } from "react-native-dotenv";
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import TextCleanup from "../../utils/TextCleanup";
import * as icons from "../../static/icons";

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
    this.setState({loading: true});
    const pageID = this.props.navigation.getParam("pageId");
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }

    if (pageID != null) {
      const id = parseInt(pageID, 10);
      const pageContent = await this.getContentPageFromMoodle(id, COURSE_IDS.split(",")[0]).catch((e) => {
        this.setState({loading: false, error: true});
        Alert.alert("Error", strings.mainScreenErrorText);
        return
      });
      if (pageContent === undefined) {
        this.setState({error: true, loading: false});
        return Alert.alert("Error", strings.mainScreenErrorText);
      }
      this.setState({pageHeader: TextCleanup.cleanUpText(pageContent.name), pageContent: pageContent.content});
      this.setState({pageHeader: TextCleanup.cleanUpText(pageContent.name)});
      this.setState({loading: false});
    } else if (this.props.pageid) {
      const pageContent = await this.getContentPageFromMoodle(this.props.pageid, this.props.courseid || COURSE_IDS.split(",")[0]).catch((e) => {
        this.setState({loading: false, error: true});
        Alert.alert("Error", strings.mainScreenErrorText);
        return
      });
      if (pageContent === undefined) {
        this.setState({error: true, loading: false});
        Alert.alert("Error", strings.mainScreenErrorText);
        return
      }
      this.setState({pageHeader: TextCleanup.cleanUpText(pageContent.name), pageContent: pageContent.content});
      this.setState({pageHeader: TextCleanup.cleanUpText(pageContent.name)})
      this.setState({loading: false});
    } else {
      this.setState({loading: false, error: true});
      Alert.alert("Error", strings.pageContentErrorText);
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} backgroundColor="#fff" loading={this.state.loading}>
        {!this.state.error &&
        <View style={{flex: 1}}>
          <View style={[defaultStyles.topicHeadline, {alignItems: "center"}]}>
            <Image source={icons.ContentIcon} style={defaultStyles.taskIcon} />
            <Text style={defaultStyles.topicHeadlineText}>{this.state.pageHeader}</Text>
          </View>
          <View style={{flex: 1, padding: 10, justifyContent: "center"}}>
            <WebView style={{zIndex: -1}} 
            source={{ html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${this.state.pageContent}</body></html>` }}/>
          </View>
        </View>
        }
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
      this.props.navigation.navigate("TextContent");
    }
  }

  /**
   * Method gets text page from moodle API
   * 
   * @param pageid content page id to fetch
   */
  public async getContentPageFromMoodle(pageid: number, courseid: number) {
    if (this.props.moodleToken) {
      const pageService = Api.getModPageService(HOST_URL, this.props.moodleToken);
      const pageList: any = await pageService.getPagesByCourses({courseids: [courseid]});

      for (const page of pageList.pages) {
        if (parseInt(page.coursemodule, 10) == pageid) {
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
