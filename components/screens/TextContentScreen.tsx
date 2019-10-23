import React, { Dispatch } from "react";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, WebView } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import Api from "moodle-ws-client"
import strings from "../../localization/strings";
import { HOST_URL } from "react-native-dotenv";

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
  pageHeader: string
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
      const pageContent = await this.getContentPageFromMoodle(id).catch((e) => {
        Alert.alert("Error", strings.pageContentErrorText);
      });
      this.setState({pageContent: `<h1>${pageContent.name}</h1> ${pageContent.content}`, loading: false});
    } else if (this.props.pageid) {
      const pageContent = await this.getContentPageFromMoodle(this.props.pageid).catch((e) => {
        Alert.alert("Error", strings.pageContentErrorText);
      });
      this.setState({pageContent: `<h1>${pageContent.name}</h1> ${pageContent.content}`, loading: false});
    } else {
      Alert.alert("Error", strings.pageContentErrorText);
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
        <View style={{flex: 1, padding: 10, justifyContent: "center", height: "100%"}}>
          <WebView style={{flex: 1}} originWhitelist={["*"]} source={{ html: this.state.pageContent }}/>
        </View>
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
  public async getContentPageFromMoodle(pageid: number) {
    if (this.props.moodleToken && this.props.courseid) {
      const pageService = Api.getModPageService(HOST_URL, this.props.moodleToken);
      const pageList: any = await pageService.getPagesByCourses({courseids: [this.props.courseid]});

      for (const page of pageList.pages) {
        if (parseInt(page.coursemodule, 10) === pageid) {
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
