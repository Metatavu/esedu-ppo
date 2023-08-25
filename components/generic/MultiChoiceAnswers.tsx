import React from "react";
import { MultichoiceQuestion } from "../../types";
import defaultStyles from "../../styles/default-styles";
import { FlatList, Text, View } from "native-base";
import { StyleSheet, TouchableOpacity } from "react-native";

/**
 * Component props
 */
interface Props {
  question: MultichoiceQuestion;
  exportCode: string;
  moodleToken: string;
  attemptId: number;
  triggerAnswerSave: (value: number, exportCode: string, moodleToken: string, attemptId: number, sequencecheck: number) => void;
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  QuestionContainer: {
    marginBottom: 15
  },
  AnswerBase: {
    paddingLeft: 10,
    margin: 15,
    marginBottom: 0,
    marginTop: 10,
    height: 50,
    borderWidth: 1,
    borderColor: "#53B02B",
    borderRadius: 7,
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  Selected: {
    backgroundColor: "#53B02B"
  },
  SelectedText: {
    color: "white",
    borderColor: "#8f8f8f"
  },
  Unselected: {
    backgroundColor: "#ffffff"
  },
  UnselectedText: {
    color: "black"
  }
})

/**
 * Component for displaying multichoice answers
 */
const MultiChoiceAnswers = ({ question, exportCode, moodleToken, attemptId, triggerAnswerSave }: Props) => {

  const [selectedValue, setSelectedValue] = React.useState<number>();

  /**
   * Answer selection handler
   * 
   * @param value value
   */
  const onAnswerSelect = (value: number) => {
    triggerAnswerSave(value, exportCode, moodleToken, attemptId, question.sequencecheck);
    setSelectedValue(value);
  };

  return (
    <View style={styles.QuestionContainer}>
      <Text style={defaultStyles.screenHeader}>{question.title}</Text>
      <FlatList
        data={question.answers}
        renderItem={({ item }) =>
          <TouchableOpacity onPress={() =>
            onAnswerSelect(item.value)}>
            <View style={[styles.AnswerBase, selectedValue === item.value ? styles.Selected : styles.Unselected]}>
              <Text style={[defaultStyles.listItemText, selectedValue === item.value ? styles.SelectedText : styles.UnselectedText]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>}
        keyExtractor={(index) => index.toString()}
      />
    </View>
  );
};

export default MultiChoiceAnswers;
