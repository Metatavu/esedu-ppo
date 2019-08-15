import React, {Component} from "react";
import { MultichoiceQuestion, MultichoiceAnswer } from "../../types";
import { Text, BackHandler, ListView } from "react-native";
import defaultStyles from "../../styles/default-styles";
import MultiSelect from "react-native-multiple-select";
import { ListItem, Grid, Row, Col, View, Radio } from "native-base";

/**
 * Component props
 */
export interface Props {
  question: MultichoiceQuestion
};

class MultiChoiceAnswers extends Component<Props> {
    constructor(props: Props) {

        super(props);
        this.state = {
        };

      }
    public render() {
        return (
            <Grid>
              <Row>
                <Col>{ this.renderAnswers() }</Col>
              </Row>
            </Grid>
        );
    }

    private renderAnswers() {
      const items = this.props.question.answers.map((answer: MultichoiceAnswer) => {
          return {
            value: answer.value,
            name: answer.name,
          }
        });

      return(
          <View style={defaultStyles.listItem}>

          </View>
      );
  }
}

export default MultiChoiceAnswers;
