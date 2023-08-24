import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text } from "native-base";
import { View, StyleSheet, Alert } from "react-native";
import { NavigationStackProp } from "react-navigation-stack";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import defaultStyles from "../../styles/default-styles";
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";
import strings from "../../localization/strings";
import { MultichoiceQuestion } from "../../types";
import { selectMoodleToken } from "../../features/common-slice";
import { useAppSelector } from "../../app/hooks";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp
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
  TODO: Implement this 

  public static navigationOptions = (props: NavigationStackProp) => {
    return ({
      headerTitle: (
        <TopBar 
          navigation={ props } 
          showMenu={true} 
          showHeader={false}
          showLogout={true} 
          showUser={true} 
        />
      )
    });
  };
**/

/**
 * Quiz screen component
 */
const QuizScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [quizData, setQuizData] = React.useState<MultichoiceQuestion[]>([]);

  const moodleToken = useAppSelector(selectMoodleToken);

  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  /**
   * Method gets questions from moodle API
   */
  const getQuestionsFromMoodle = async (attemptid: number, page: number) => {
    const quizService = Api.getModQuizService("https://ppo-test.metatavu.io", moodleToken);
    const attemptData: any = await quizService.getAttemptData({attemptid, page});

    const quizHandler: QuizHandler = new QuizHandler();

    if (attemptData[0].questions) {
      const questions: any[] = quizHandler.getQuizObject(attemptData[0].questions);
      return questions;
    }

    return null;
  }
  
  useEffect(() => {
    setLoading(true);

    getQuestionsFromMoodle(6, 0)
      .catch((e) => {
        Alert.alert("Error", strings.quizScreenErrorText);
      })
      .then((questions) => {
        if (questions) {
          setQuizData(questions[0]);
        }

        setLoading(false);
      });
  }, []);

  if (!loading && quizData.length !== 0) {
    return (
      <BasicLayout backgroundColor="#fff">
        <Text style={defaultStyles.screenHeader}>{quizData[0].title}</Text>
        <MultiChoiceAnswers question={quizData[0]}/>
      </BasicLayout>
    );
  }

  return (<View></View>)
};

export default QuizScreen;