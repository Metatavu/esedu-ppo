import React, { Component } from "react";
import { MultichoiceQuestion } from "../../types";
import defaultStyles from "../../styles/default-styles";
import { View, Text } from "native-base";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";

/**
 * Component props
 */
interface Props {
  question: MultichoiceQuestion,
  exportCode: string,
  moodleToken: string,
  attemptId: number,
  triggerAnswerSave: (value: number, exportCode: string, moodleToken: string, attemptId: number, sequencecheck: number) => void
};

/**
 * Component state
 */
interface State {
  selectedValue?: number
};

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
class MultiChoiceAnswers extends Component<Props, State> {
  /**
   * Constructor
   * 
   * @param props 
   */
  constructor(props: Props) {
      super(props);
      this.state = {
      };
  }

  /**
   * Component render method
   */
  public render() {
      return (
        <View style={styles.QuestionContainer}>
          <Text style={defaultStyles.screenHeader}>{this.props.question.title}</Text>
          <FlatList
            data={this.props.question.answers}
            extraData={this.state}
            renderItem={({item}) =>
            <TouchableOpacity onPress= {() =>
              this.onAnswerSelect(item.value, this.props.exportCode, this.props.moodleToken, this.props.attemptId, this.props.question.sequencecheck)}>
              <View style={[styles.AnswerBase, this.state.selectedValue === item.value ? styles.Selected : styles.Unselected]}>
                <Text style={[defaultStyles.topicItemText, this.state.selectedValue === item.value ? styles.SelectedText : styles.UnselectedText]}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>}
            keyExtractor={(index) => index.toString()}
            />
        </View>
      );
  }

  private onAnswerSelect(value: number, exportCode: string, moodleToken: string, attemptId: number, sequencecheck: number) {
    this.props.triggerAnswerSave(value, exportCode, this.props.moodleToken, attemptId, sequencecheck)
    this.setState({selectedValue: value});
  }
}

export default MultiChoiceAnswers;
