import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, Item } from "native-base";
import { View, StyleSheet, Alert, Button, WebView } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import defaultStyles from "../../styles/default-styles";
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";
import strings from "../../localization/strings";
import { HOST_URL, COURSE_ID } from "react-native-dotenv";
import { FlatList } from "react-native-gesture-handler";

/**
 * Component props
 */
interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string,
  pageid?: number
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
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    this.setState({loading: false});
    if (!this.props.moodleToken || !this.props.pageid) {
      return this.props.navigation.navigate("Login");
    }

    const page = await this.getContentPageFromMoodle(this.props.pageid).catch((e) => {
      Alert.alert("Error", strings.quizScreenErrorText);
    });
    console.warn(page);
    this.setState({pageContent: `<h1>${page.name}</h1>` + page.content, loading: false});
    console.warn(this.state.pageContent);
  }

  /**
   * Component render
   */
  public render() {
    return (
        <View style={{flex: 1, justifyContent: "space-between", height: "100%"}}>
          <WebView style={{width: "100%", height: "100%"}} originWhitelist={["*"]} source={{ html: this.state.pageContent }}/>
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
     // this.props.navigation.navigate('Main');
    }
  }


  /**
   * Method gets questions from moodle API
   */
  private async getContentPageFromMoodle(pageid: number) {
    console.warn("Trying to get content page:", pageid);
    if (this.props.moodleToken != null) {
      const pageService = await Api.getModPageService(HOST_URL, this.props.moodleToken);
      const pageList: any = await pageService.getPagesByCourses({courseids: [COURSE_ID]});

      for (const page of pageList.pages) {
        console.warn(page.id, "vs", pageid);
        if (page.id === pageid) {
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
    pageid: state.selectedActivityId
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
