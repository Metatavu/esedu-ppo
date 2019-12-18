import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { View, StyleSheet, Alert, Button } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";
import strings from "../../localization/strings";
import { HOST_URL } from "react-native-dotenv";
import { FlatList } from "react-native-gesture-handler";

/**
 * Component props
 */
interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string,
  quizId?: number
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
  sequenceCheck?: number
};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin"
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
      optionsArray: [],
      moodleToken: ""
    };
    this.saveAnswer = this.saveAnswer.bind(this);
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
    if (!this.props.moodleToken) {
      this.props.navigation.navigate("Quiz");
    }

    await this.getQuestionsFromMoodle(6, 0).catch((e) => {
      Alert.alert("Error", strings.quizScreenErrorText);
    }).then((questions) => {
      this.setState({moodleToken: this.props.moodleToken});
      this.setState({quizData: questions});
      this.setState({loading: false});
    });
  }

  /**
   * Component render
   */
  public render() {
    if (this.state.quizData.length === 0) {
      return (
      <BasicLayout loading={this.state.loading} backgroundColor="#fff"></BasicLayout>
      )
    }
    else {
      return (
        <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
          <FlatList
            data={this.state.quizData}
            extraData={this.props.children}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) =>
            <MultiChoiceAnswers attemptId={this.state.attemptId != null ? this.state.attemptId : 0}
              moodleToken={this.props.moodleToken ? this.props.moodleToken : ""} exportCode={item.exportCode}
              triggerAnswerSave={(value: number, exportCode: string, token: string, attemptId: number, sequencecheck: number) =>
                this.saveAnswer(value, exportCode, token, attemptId, sequencecheck)} question={item}/>}
          />
          <View>
            <Button color={"#88B620"} title="Tallenna Vastaukset" onPress={() =>
              this.processAnswers(this.props.moodleToken != null ?
              this.props.moodleToken : "", this.state.attemptId != null ? this.state.attemptId : -1)}></Button>
          </View>
        </BasicLayout>
      );
    }
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Quiz");
    }
  }

  /**
   * Processes the answers and returns the user to the main page.
   */
  private async processAnswers(token: string, attemptid: number) {
    this.setState({loading: true});
    const quizService = Api.getModQuizService(HOST_URL, token);

    quizService.processAttempt({attemptid, finishattempt: true});

    this.setState({loading: false});
    this.props.navigation.navigate("Main");
  }

  /**
   * Saves the answer
   * @param value answer value
   * @param exportCode answer export code "q3:1_answer"
   * @param token moodleToken
   * @param attemptId Id of the current attempt
   * @param sequencecheck sequencecheck number of the question
   */
  private async saveAnswer(value: number, exportCode: string, token: string, attemptId: number, sequencecheck: number) {
    const quizService = Api.getModQuizService(HOST_URL, token);

    const data = [{
        name: exportCode,
        value: value.toString()
      },
      {
        name: exportCode.split("_")[0] + "_:sequencecheck",
        value: sequencecheck.toString()
      }
    ];
    const res = quizService.processAttempt({
      attemptid: attemptId,
      data
    });
  }

  /**
   * Method gets questions from moodle API
   */
  private async getQuestionsFromMoodle(attemptid: number, page: number) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    else if (!this.props.quizId) {
      return this.props.navigation.navigate("Login");
    }

    const quizService = Api.getModQuizService(HOST_URL, this.props.moodleToken);

    let attempt: any = await quizService.getUserAttempts({quizid: this.props.quizId, status: "unfinished", includepreviews: true});

    if (attempt.attempts.length === 0) {
      await quizService.startAttempt({quizid: this.props.quizId});
      attempt = await quizService.getUserAttempts({quizid: this.props.quizId, status: "unfinished", includepreviews: true});
    }

    const attemptData: any = await quizService.getAttemptData({attemptid: attempt.attempts[0].id, page: attempt.attempts[0].currentpage});

    this.setState({sequenceCheck: attemptData.sequencecheck});
    this.setState({attemptId: attempt.attempts[0].id});

    const quizHandler: QuizHandler = new QuizHandler();

    if (attemptData.questions) {
      const questions = quizHandler.getQuizObject(attemptData.questions);

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
    moodleToken: state.moodleToken,
    quizId: state.selectedActivityId
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
