import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text } from "native-base";
import { View, StyleSheet } from "react-native";
import { StoreState, MultichoiceQuestion } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import { RadioButtons } from "react-native-radio-buttons";
import defaultStyles from "../../styles/default-styles";
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";

/**
 * Component props
 */
export interface Props {
  navigation: any,
  moodleToken?: string,
  locale: string
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  moodleToken?: string,
  quizData: MultichoiceQuestion[],
  optionsArray: string[]
};

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
      loading : true,
      quizData : [],
      optionsArray : [],
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />,
    });
  };

  public async componentDidMount() {
    if (!this.props.moodleToken) {
      this.props.navigation.navigate("Login");
    }
    this.getQuestionsFromMoodle().catch((e) => {
      if (e) {
        throw e
      }
    });
  }

  /**
   * Component render
   */
  public render() {
    if (!this.state.loading) {
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

  private async getQuestionsFromMoodle() {
    if (!this.props.moodleToken) { return this.props.navigation.navigate("Login"); }
    this.setState({loading: true});
    const quizService = Api.getModQuizService("https://ppo-test.metatavu.io", this.props.moodleToken);

    const attemptData: any = await quizService.getAttemptData({attemptid : 6, page: 0});

    const quizHandler: QuizHandler = new QuizHandler();

    if (attemptData[0].questions) {
      const questions: any[] = quizHandler.getQuizObject(attemptData[0].questions);

      this.setState({quizData : questions});

      const optionsArray = [];
      for (const answ of this.state.quizData[0].answers) {
        optionsArray.push(answ.name)
      }
      this.setState({optionsArray});
    }

    this.setState({loading : false});
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

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(QuizScreen);
