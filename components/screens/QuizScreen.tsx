import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text } from "native-base";
import { View, StyleSheet, Alert } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import defaultStyles from "../../styles/default-styles";
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  moodleToken?: string,
  quizData: MultichoiceQuestion[],
  optionsArray: string[]
};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin"
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

/**
 * Component for application main screen
 */
class QuizScreen extends React.Component<Props, State> {

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
      optionsArray: []
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    if (!this.props.moodleToken) {
      this.props.navigation.navigate("Login");
    }
    this.setState({loading: true});
    const questions = await this.getQuestionsFromMoodle(6, 0).catch((e) => {
      Alert.alert("Error", strings.quizScreenErrorText);
    });
    this.setState({quizData: questions[0]});
  }

  /**
   * Component render
   */
  public render() {
    if (!this.state.loading && this.state.quizData.length !== 0) {
      return (
        <BasicLayout backgroundColor="#fff">
          <Text style={defaultStyles.screenHeader}>{this.state.quizData[0].title}</Text>
          <MultiChoiceAnswers question={this.state.quizData[0]}/>
        </BasicLayout>
      );
    }
    else {
      return(<View></View>)
    }
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
  private async getQuestionsFromMoodle(attemptid: number, page: number) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    this.setState({loading: true});
    const quizService = Api.getModQuizService("https://ppo-test.metatavu.io", this.props.moodleToken);

    const attemptData: any = await quizService.getAttemptData({attemptid, page});

    const quizHandler: QuizHandler = new QuizHandler();

    if (attemptData[0].questions) {
      const questions: any[] = quizHandler.getQuizObject(attemptData[0].questions);

      return questions;
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

export default connect(mapStateToProps, mapDispatchToProps)(QuizScreen);
