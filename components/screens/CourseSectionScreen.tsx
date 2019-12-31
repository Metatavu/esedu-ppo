import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { Icon } from "react-native-elements";
import { StoreState, AccessToken, CourseTopic, TopicContent } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList, ScrollView } from "react-navigation";
import Api from "moodle-ws-client";
import { StyleSheet, TouchableOpacity, Alert, Image, WebView, Linking } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { HOST_URL} from "react-native-dotenv";
import strings from "../../localization/strings";
import * as icons from "../../static/icons/index";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  courseid?: number,
  onSelectedActivityUpdate: (activityId: number) => void
  onSelectedSectionUpdate: (sectionId: number) => void
};

interface CourseContent {
  courseName: string
  courseSummary: CourseSummary,
  courseTopics: CourseTopic[]
}

interface CourseSummary {
  courseSummaryText: string,
  courseSummaryImageUrl: string
}

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  accessToken?: AccessToken,
  moodleToken?: string,
  courseContent: CourseContent
};

const styles = StyleSheet.create({
  topicItemInactive: {
    color: "#8f8f8f",
    borderColor: "#8f8f8f"
  },
  itemDone: {
    backgroundColor: "#ffffff"
  },
  itemActiveText: {
    color: "white"
  },
  listContainer: {
    marginHorizontal: 10,
    marginVertical: 20
  },
  iconBackgroundAdjust: {
    marginTop: 25
  },
  activityText: {
    color: "white",
    paddingLeft: 10
  },
  listItemBase: {
    flex: 1,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#19411C",
    flexDirection: "row",
    alignContent: "flex-start"
  },
  listText: {
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "#19411C"
  },
  listItemHeader: {
    height: 0
  },
  listHeadline: {
    paddingHorizontal: 15,
    fontSize: 20,
    flex: 1,
    fontFamily: "sans-serif-condensed",
    fontWeight: "700",
    color: "#fff",
    textAlignVertical: "center"}
});

/**
 * Component for application main screen
 */
class CourseSectionScreen extends React.Component<Props, State> {

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
      courseContent: {
        courseName: "",
        courseSummary: {
          courseSummaryImageUrl: "",
          courseSummaryText: ""
        },
        courseTopics: []
      }
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerLeft: null,
      headerTitle: <TopBar showBack={true} navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    if (!this.props.courseid) {
      return this.props.navigation.navigate("Main");
    }
    this.setState({loading: true});
    const courseContent = await this.getTopicsFromMoodle(this.props.courseid).catch((e) => {
      this.setState({loading: false, error: true});
      Alert.alert(strings.mainScreenErrorText);
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
      this.props.navigation.navigate("Section");
    }
  }

  /**
   * Component render
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <ScrollView style={{flex: 1}}>
        <View>
          <View style={defaultStyles.topicHeadline}>
            <Image source={icons.PalvelutilanteetIcon} style={defaultStyles.taskIcon} />
            <Text style={[defaultStyles.topicHeadlineText]}>{this.state.courseContent.courseName}</Text>
          </View>
          <View style={{margin: 30}}>
            <Text style={[defaultStyles.newsHeadline, {margin: 0}]}>
              {this.state.courseContent.courseTopics.length > 0 ? this.state.courseContent.courseTopics[0].topicName : ""}
            </Text>
            {this.state.courseContent.courseSummary.courseSummaryImageUrl === "" ? <View/> :
              <Image style={{height: 300}} resizeMode={"contain"} source={{ uri: this.state.courseContent.courseSummary.courseSummaryImageUrl}}/>
            }
            <Text>{this.state.courseContent.courseSummary.courseSummaryText}</Text>
          </View>
        </View>
          <FlatList
            style={{margin: 0, borderRadius: 0, padding: 0}}
            data={this.state.courseContent.courseTopics}
            renderItem={({item}) =>
            item.topicContent.length > 0 ? this.listContent(item, this.state.courseContent.courseTopics.indexOf(item)) : <View></View>}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </BasicLayout>
    );
  }

  private listContent(topic: CourseTopic, itemIndex: number) {
    const content =
    <View style={{backgroundColor: "#F5F9E8"}}>
      <View style={[styles.listItemBase, {flex: 1, flexDirection: "row", height: 60, backgroundColor: "#53B02B", justifyContent: "flex-start"}]}>
        <View style={[defaultStyles.listTextContainer, {flex: 0, marginLeft: 10}]}>
        <Text style={styles.listHeadline}>
            {itemIndex}
        </Text>
        </View>
        <View style={defaultStyles.listTextContainer}>
          <Text style={styles.listHeadline}>
            {topic.topicName}
          </Text>
        </View>
      </View>
      <FlatList
        ListHeaderComponent={<View style={[styles.listItemBase, styles.listItemHeader]}></View>}
        style={[styles.listContainer, {padding: 20}]}
        data={topic.topicContent}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => this.onActivityPress(item.type, item)}>
          <View style={styles.listItemBase}>
            <Image style={[defaultStyles.progressIcon, {width: 40, margin: 5}]}
              resizeMode={"contain"} source={item.isTask ? icons.TaskIcon : icons.ContentIcon }/>
            <View style={[defaultStyles.listTextContainer]}>
              <Text style={[defaultStyles.listItemText, styles.listText]}>{item.name}</Text>
            </View>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>

    return content;
  }

  /**
   * Navigates to the pressed activity
   * @param type type of activity
   * @param activityId id of activity
   */
  private async onActivityPress(type: string, activity: TopicContent) {
    if (type === "quiz") {
      this.props.onSelectedActivityUpdate(activity.activityId);
      return this.props.navigation.replace("Quiz");
    }
    else if (type === "page") {
      this.props.onSelectedActivityUpdate(activity.activityId);
      return this.props.navigation.replace("TextContent");
    }
    else if (type === "hvp") {
      this.props.onSelectedActivityUpdate(activity.activityId);
      return this.props.navigation.replace("Hvp");
    }
    else if (type === "assign") {
      this.props.onSelectedActivityUpdate(activity.activityId);
      return this.props.navigation.replace("Assignment");
    }
    else if (type === "forum") {
      this.props.onSelectedActivityUpdate(activity.activityId);
      return this.props.navigation.replace("Forum");
    } else if(type === "url" && activity.url) {
      Linking.openURL(activity.url)
    } else if (type === "label") {
      const courseId = activity.courseId ? parseInt(activity.courseId) : NaN;
      if (!isNaN(courseId)) {
        this.props.onSelectedSectionUpdate(courseId);
        this.props.navigation.push("Section")
      }
    }
    else {
      Alert.alert("Error", strings.unsupportedActivityTypeText + " " + type);
    }
  }

  /**
   * Returns the courses topics from moodle Api
   * 
   * @param courseId course id to get topics by
   */
  private async getTopicsFromMoodle(courseId: number) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    const moodleService = Api.getMoodleService(HOST_URL, this.props.moodleToken);

    const topics: any = await moodleService.coreCourseGetContents({courseid: courseId}).catch((e) => {
      throw e;
    });

    const courseInfo: any = await moodleService.coreCourseGetCoursesByField({field: "id", value: courseId.toString() }).catch((e) => {
      throw e;
    });

    const quizService = Api.getModQuizService(HOST_URL, this.props.moodleToken)

    const quizList: any = await quizService.getQuizzesByCourses({courseids: [courseId]}).catch((e) => {
      throw e;
    });

    const forumService = Api.getModForumService(HOST_URL, this.props.moodleToken);

    const courseForums: any = await forumService.getForumsByCourses({courseids: [this.props.courseid || 0]}).catch((e) => {
      throw e;
    });

    const courseTopics: CourseTopic[] = [];

    const courseName = courseInfo.courses[0].fullname;

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
          newCourseItem.topicContent.push({name: activity.name, type: "inactive", activityId: 999, active: false, isTask: false});
        } else if (activity.modname === "quiz") {
          for (const quiz of quizList.quizzes) {
            if (quiz.coursemodule === activity.id) {
              newCourseItem.topicContent.push({name: activity.name, type: "quiz", activityId: quiz.id, active: true, isTask: true});
            }
          }
        } else if (activity.modname === "hvp") {
          newCourseItem.topicContent.push({name: activity.name, type: activity.modname, activityId: activity.id, active: true, isTask: true});
        } else if (activity.modname === "page") {
          newCourseItem.topicContent.push({name: activity.name, type: activity.modname, activityId: activity.id, active: true, isTask: false});
        }
        else if (activity.modname === "assign") {
          newCourseItem.topicContent.push({name: activity.name, type: "assign", activityId: activity.instance, active: true, isTask: true});
        } else if (activity.modname === "forum") {
          for (const forum of courseForums) {
            if (activity.id === forum.cmid) {
              newCourseItem.topicContent.push({name: activity.name, type: "forum", activityId: forum.id, active: true, isTask: true});
            }
          }
        } else if (activity.modname === "label") {
          const description = activity && activity.description ? activity.description as string : "";
          const regex = /\/course\/view\.php\?id=(\d*)/gm;
          const match = regex.exec(description);
          if (match && match[1]) {
            newCourseItem.topicContent.push({name: activity.name, type: "label", activityId: 0, active: false, isTask: false, courseId: match[1]});
          } else {
            newCourseItem.topicContent.push({name: activity.name, type: "inactive", activityId: 0, active: false, isTask: false});
          }
        } else if (activity.modname === "url") {
          const contents = activity.contents && activity.contents.length > 0 ? activity.contents : [];
          const contentItem = contents.find((contentItem: any) => contentItem.type === "url");
          if (contentItem) {
            newCourseItem.topicContent.push({name: activity.name, type: "url", activityId: 0, active: false, isTask: false, url: contentItem.fileurl as string});
          } else {
            newCourseItem.topicContent.push({name: activity.name, type: "inactive", activityId: 0, active: false, isTask: false});
          }
          
        } else {
          newCourseItem.topicContent.push({name: activity.name, type: "inactive", activityId: 0, active: false, isTask: false});
        }
      }

      if (newCourseItem.id !== 1) {
        courseTopics.push(newCourseItem);
      }
    }

    const courseSummary = this.parseCourseSummary(topics[0].summary);

    const courseContent: CourseContent = {
      courseName,
      courseSummary,
      courseTopics
    }

    return courseContent;
  }

  /**
   * Tries to parse summary html into a CourseSummary object. Returns empy object if it cant.
   * @param summaryHtml 
   */
  private parseCourseSummary(summaryHtml: string) {
    const summary: CourseSummary = {
      courseSummaryImageUrl: "",
      courseSummaryText: ""
    }
    try {
      const summaryImage = summaryHtml.split("src=\"")[1].split('"', 2)[0];
      const summaryTags = summaryHtml.split("<p>");
      let summaryText = "";
      summaryTags.forEach((innerHtml) => {
        if (innerHtml.indexOf("<br>") > -1) {
          summaryText = summaryText + " ";
        }
        else if (innerHtml.indexOf("<img") === -1) {
          summaryText = summaryText + innerHtml.replace(/<\/p>/g, "").replace(/&nbsp;/g, " ");
        }
      });
      summary.courseSummaryText = summaryText;
      summary.courseSummaryImageUrl = summaryImage
    } catch {}

    return summary;
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
    courseid: state.selectedSectionId
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSelectedActivityUpdate: (activityId: number) => dispatch(actions.selectedActivityUpdate(activityId)),
    onSelectedSectionUpdate: (sectionId: number) => dispatch(actions.selectedSectionUpdate(sectionId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseSectionScreen);
