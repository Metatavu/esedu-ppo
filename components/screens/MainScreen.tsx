import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { Icon } from "react-native-elements";
import { StoreState, AccessToken, CourseTopic } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { StyleSheet, TouchableOpacity } from "react-native";
import defaultStyles from "../../styles/default-styles";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  onSelectedTopicUpdate: (topicContent: CourseTopic) => void,
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  accessToken?: AccessToken,
  moodleToken?: string,
  courseId: number,
  courseContent: CourseTopic[]
};

const styles = StyleSheet.create({
  topicContainer: {
   flex: 1,
   paddingTop: 22
  },
  topicItemInactive: {
    color: "#8f8f8f",
    borderColor: "#8f8f8f"
  },
  itemDone: {
    backgroundColor: "#ffffff"
  },
  itemActiveText: {
    color: "white"
  }
})

/**
 * Component for application main screen
 */
class MainScreen extends React.Component<Props, State> {

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
      courseId: 2,
      courseContent: []
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    this.setState({loading: true});
    const courseContent = await this.getTopicsFromMoodle(this.state.courseId).catch((e) => {
      this.setState({loading: false, error: true});
    });
    this.setState({courseContent});
    this.setState({loading: false});
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Main");
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout loading={this.state.loading} backgroundColor="#fff">
        <FlatList
        style={defaultStyles.listContainer}
        data={this.state.courseContent}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => this.onTopicPress(item)}>
          <View style={[defaultStyles.topicItemBase,
            item.topicDone ? styles.itemDone : (item.topicAvailable ? defaultStyles.topicItemBase : styles.topicItemInactive)]}>
            <Icon containerStyle={defaultStyles.taskIcon} size={46} name={item.topicDone ? "trophy" : "eye"} type="evilicon" color="white"/>
            <View style={defaultStyles.topicTaskIconBackground}/>
            <Text style={[defaultStyles.topicItemText, item.topicDone ? defaultStyles.topicItemText : styles.itemActiveText]}>{item.topicName}</Text>
            <Icon containerStyle={defaultStyles.progressIcon} size={50} name={item.topicDone ? "check" : "arrow-right"} type="evilicon"/>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
        />
      </BasicLayout>
    );
  }

  /**
   * Returns the courses topics from moodle Api
   */
  private async getTopicsFromMoodle(courseId: number) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }

    const moodleService = await Api.getMoodleService("https://ppo-test.metatavu.io", this.props.moodleToken);

    const topics: any = await moodleService.coreCourseGetContents({courseid: courseId});

    const quizService = await Api.getModQuizService("https://ppo-test.metatavu.io", this.props.moodleToken);

    const quizList: any = await quizService.getQuizzesByCourses({courseids: [courseId]});

    const courseContent: CourseTopic[] = [];

    for (const topic of topics) {
      const newCourseItem: CourseTopic = {
        id: topic.id,
        topicName: topic.name,
        topicDone: true,
        topicAvailable: true,
        topicContent: []
      }
      if (topic.modules.length === 0) {
        newCourseItem.topicDone = false
      }

      for (const activity of topic.modules) {
        if (activity.completion === 1 && activity.completiondata.state === 0) {
          newCourseItem.topicDone = false;
        }
        if (activity.modname === "resource") {
          newCourseItem.topicDone = true;
        } else if (activity.modname === "quiz") {
          for (const quiz of quizList.quizzes) {
            if (quiz.coursemodule === activity.id) {
              newCourseItem.topicContent.push({name: activity.name, type: "quiz", activityId: quiz.id});
            }
          }
        }
      }

      if (newCourseItem.id !== 1) {
        courseContent.push(newCourseItem);
      }
    }
    return courseContent;
  }

  /**
   * Saves the topic pressed by the user and navigates to the topic page
   * @param topic selected topic
   */
  private onTopicPress(topic: CourseTopic) {
    this.props.onSelectedTopicUpdate(topic);
    this.props.navigation.navigate("Topic");
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
    moodleToken: state.moodleToken
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSelectedTopicUpdate: (courseTopic: CourseTopic) => dispatch(actions.selectedTopicUpdate(courseTopic))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
