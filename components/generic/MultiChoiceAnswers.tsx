import React from "react";
import { MultichoiceQuestion, MultichoiceAnswer } from "../../types";
import defaultStyles from "../../styles/default-styles";
import { Box, View } from "native-base";

/**
 * Component props
 */
interface Props {
  question: MultichoiceQuestion
};

/**
 * Component for displaying multichoice answers
 */
const MultiChoiceAnswers = ({ question }: Props) => {

  const renderAnswers = () => {
    const items = question.answers.map((answer: MultichoiceAnswer) => {
      return {
        value: answer.value,
        name: answer.name
      };
    });

    return <View style={defaultStyles.listItem}> </View>;
  };

  return (
    <Box flexDirection="row">
      <Box flex={1}>
        {renderAnswers()}
      </Box>
    </Box>
  );
};

export default MultiChoiceAnswers;
