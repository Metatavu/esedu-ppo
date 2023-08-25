import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { View, StyleSheet, Alert, Button } from "react-native";
import { MultichoiceQuestion } from "../../types";
import { QuizHandler } from "../moodlequiz/QuizHandler";
import Api from "moodle-ws-client"
import MultiChoiceAnswers from "../generic/MultiChoiceAnswers";
import strings from "../../localization/strings";
import { FlatList } from "react-native-gesture-handler";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId } from "../../features/common-slice";
import config from "../../app/config";
  
/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
  children: JSX.Element | null;
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

const QuizScreen = ({ navigation, children }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [quizData, setQuizData] = React.useState<MultichoiceQuestion[]>([]);
  const [optionsArray, setOptionsArray] = React.useState<string[]>([]);
  const [attemptId, setAttemptId] = React.useState<number>(0);
  const [sequenceCheck, setSequenceCheck] = React.useState<number>(0);

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  const quizId = useAppSelector(selectSelectedActivityId);
  if (!quizId) {
    navigation.navigate("Login");
    return null;
  }

  useEffect(() => {
    setLoading(true);
    getQuestionsFromMoodle(6, 0).catch((e) => {
      Alert.alert("Error", strings.quizScreenErrorText);
    }).then((questions) => {
      setQuizData(questions || []);
      setLoading(false);
    });
  }, []);

  /**
   * Processes the answers and returns the user to the main page.
   */
  const processAnswers = async (token: string, attemptid: number) => {
    setLoading(true);
    const quizService = Api.getModQuizService(config.hostUrl, token);

    quizService.processAttempt({attemptid, finishattempt: true});

    setLoading(false);

    navigation.navigate("Main");
  }

  /**
   * Saves the answer
   * @param value answer value
   * @param exportCode answer export code "q3:1_answer"
   * @param token moodleToken
   * @param attemptId Id of the current attempt
   * @param sequencecheck sequencecheck number of the question
   */
  const saveAnswer = async (value: number, exportCode: string, token: string, attemptId: number, sequencecheck: number) => {
    const quizService = Api.getModQuizService(config.hostUrl, token);

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
  const getQuestionsFromMoodle = async (attemptid: number, page: number) => {
    const quizService = Api.getModQuizService(config.hostUrl, moodleToken);

    let attempt: any = await quizService.getUserAttempts({quizid: quizId, status: "unfinished", includepreviews: true});

    if (attempt.attempts.length === 0) {
      await quizService.startAttempt({quizid: quizId});
      attempt = await quizService.getUserAttempts({quizid: quizId, status: "unfinished", includepreviews: true});
    }

    const attemptData: any = await quizService.getAttemptData({attemptid: attempt.attempts[0].id, page: attempt.attempts[0].currentpage});

    setSequenceCheck(attemptData.sequencecheck);
    setAttemptId(attempt.attempts[0].id);

    const quizHandler: QuizHandler = new QuizHandler();

    if (attemptData.questions) {
      const questions = quizHandler.getQuizObject(attemptData.questions);

      return questions;
    } else {
      return [];
    }
  }

  if (quizData.length === 0) {
    return (
      <BasicLayout navigation={ navigation } loading={loading} backgroundColor="#fff"></BasicLayout>
    )
  }

  return (
      <BasicLayout navigation={ navigation } loading={loading} backgroundColor="#fff">
        <FlatList
          data={quizData}
          extraData={children}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) =>
          <MultiChoiceAnswers attemptId={attemptId != null ? attemptId : 0}
            moodleToken={moodleToken ? moodleToken : ""} exportCode={item.exportCode}
            triggerAnswerSave={(value: number, exportCode: string, token: string, attemptId: number, sequencecheck: number) =>
              saveAnswer(value, exportCode, token, attemptId, sequencecheck)} question={item}/>}
        />
        <View>
          <Button color={"#88B620"} title="Tallenna Vastaukset" onPress={() =>
            processAnswers(moodleToken != null ?
            moodleToken : "", attemptId != null ? attemptId : -1)}></Button>
        </View>
      </BasicLayout>
    );
};

export default QuizScreen;