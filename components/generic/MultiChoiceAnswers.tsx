import React, { Component } from "react";
import { MultichoiceQuestion, MultichoiceAnswer } from "../../types";
import defaultStyles from "../../styles/default-styles";
import { Grid, Row, Col, View } from "native-base";

/**
 * Component props
 */
interface Props {
  question: MultichoiceQuestion
};

/**
 * Component state
 */
interface State {};

/**
 * Component for displaying multichoice answers
 */
class MultiChoiceAnswers extends Component<Props> {
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
          <Grid>
            <Row>
              <Col>{ this.renderAnswers() }</Col>
            </Row>
          </Grid>
      );
  }

  /**
   * Method for rendering answers
   */
  private renderAnswers() {
    const items = this.props.question.answers.map((answer: MultichoiceAnswer) => {
        return {
          value: answer.value,
          name: answer.name
        }
      });

    return (
        <View style={defaultStyles.listItem}>

        </View>
    );
  }
}

export default MultiChoiceAnswers;
