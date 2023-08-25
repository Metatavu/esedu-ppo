import React, { Component } from "react";
import defaultStyles from "../../styles/default-styles";
import { View, Text } from "native-base";
import { TextInput, Button } from "react-native";
import TextCleanup from "../../utils/TextCleanup";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props {
  styles: any,
  item: any,
  sendComment: (id: number, title: string, message: string) => void
};

/**
 * Component state
 */
interface State {
  commentText: string
};

/**
 * Component for displaying multichoice answers
 */
class ForumPost extends Component<Props, State> {
  /**
   * Constructor
   * 
   * @param props 
   */
  constructor(props: Props) {
      super(props);
      this.state = {
        commentText: ""
      };
  }

  /**
   * Component render method
   */
  public render() {
      return (
        <View style={{padding: 10, marginVertical: 25, backgroundColor: "#F5F9E8"}}>
          <Text style={defaultStyles.newsHeadline}>{this.props.item.title}</Text>
          <Text style={{margin: 10}}>{TextCleanup.cleanUpText(this.props.item.text)}</Text>
          <Text style={defaultStyles.newsFooterText}>
            {TextCleanup.cleanUpText(this.props.item.author)} {this.props.item.dateModified.toLocaleDateString()}
          </Text>
          <View style={this.props.styles.listItemBase}>
            <View style={[defaultStyles.listTextContainer]}>
              <TextInput placeholder={strings.comment} onChangeText={(text) => this.onChangeText(text)} style={this.props.styles.textField}/>
            </View>
          </View>
          <View style={[this.props.styles.listItemBase, {borderBottomWidth: 0}]}>
            <View style={[defaultStyles.listTextContainer, {alignItems: "flex-end"}]}>
              <Button color={"#88B620"} title={strings.send} onPress={() => this.submitToDialog()}></Button>
            </View>
          </View>
        </View>
      );
  }

  private onChangeText(text: string) {
    this.setState({commentText: text});
  }

  private submitToDialog() {
    if (this.state.commentText !== "") {
      this.props.sendComment(this.props.item.id, this.props.item.title, this.state.commentText);
    }
  }
}

export default ForumPost;
