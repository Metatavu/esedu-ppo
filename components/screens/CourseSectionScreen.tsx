import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { CourseTopic, TopicContent } from "../../types";
import { FlatList, ScrollView } from "react-navigation";
import Api from "moodle-ws-client";
import { StyleSheet, TouchableOpacity, Alert, Image, Linking } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import * as icons from "../../static/icons/index";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId, selectedActivityIdUpdate, selectedSectionIdUpdate } from "../../features/common-slice";
import config from "../../app/config";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
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
    textAlignVertical: "center"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  }
});

const emptyCourse = {
  courseName: "",
  courseSummary: {
    courseSummaryImageUrl: "",
    courseSummaryText: ""
  },
  courseTopics: []
};

const CourseSectionScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [courseContent, setCourseContent] = React.useState<CourseContent>(emptyCourse);

  const dispatch = useAppDispatch(); 
  const moodleToken = useAppSelector(selectMoodleToken);
  const courseId = useAppSelector(selectSelectedActivityId);

  useEffect(() => {
    if (!courseId) {
      setCourseContent(emptyCourse);
      return;
    }

    setLoading(true);

    getTopicsFromMoodle(courseId)
      .catch((e) => {
        setError(true);
        setLoading(false);
        navigation.navigate("Register");
      })
      .then((courseContent) => {
        setCourseContent(courseContent || emptyCourse);
        setLoading(false);
      });
  }, [courseId]);

  const listContent = (topic: CourseTopic, itemIndex: number) => {
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
        <TouchableOpacity onPress= {() => onActivityPress(item.type, item)}>
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
  const onActivityPress = (type: string, activity: TopicContent) => {
    if (type === "quiz") {
      dispatch(selectedActivityIdUpdate(activity.activityId));
      return navigation.push("Quiz");
    }
    else if (type === "page") {
      dispatch(selectedActivityIdUpdate(activity.activityId));
      return navigation.push("TextContent");
    }
    else if (type === "hvp") {
      dispatch(selectedActivityIdUpdate(activity.activityId));
      return navigation.push("Hvp");
    }
    else if (type === "assign") {
      dispatch(selectedActivityIdUpdate(activity.activityId));
      return navigation.push("Assignment");
    }
    else if (type === "forum") {
      dispatch(selectedActivityIdUpdate(activity.activityId));
      return navigation.push("Forum");
    } else if(type === "url" && activity.url) {
      Linking.openURL(activity.url)
    } else if (type === "label") {
      const courseId = activity.courseId ? parseInt(activity.courseId) : NaN;
      if (!isNaN(courseId)) {
        dispatch(selectedSectionIdUpdate(courseId));
        navigation.push("Section")
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
  const getTopicsFromMoodle = async (courseId: number): Promise<CourseContent | null> => {
    if (!moodleToken) {
      navigation.navigate("Login");
      return null;
    }

    const moodleService = Api.getMoodleService(config.hostUrl, moodleToken);

    const topics: any = await moodleService.coreCourseGetContents({courseid: courseId}).catch((e) => {
      throw e;
    });

    const courseInfo: any = await moodleService.coreCourseGetCoursesByField({field: "id", value: courseId.toString() }).catch((e) => {
      throw e;
    });

    const quizService = Api.getModQuizService(config.hostUrl, moodleToken)

    const quizList: any = await quizService.getQuizzesByCourses({courseids: [courseId]}).catch((e) => {
      throw e;
    });

    const forumService = Api.getModForumService(config.hostUrl, moodleToken);

    const courseForums: any = await forumService.getForumsByCourses({courseids: [courseId || 0]}).catch((e) => {
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

    const courseSummary = parseCourseSummary(topics[0].summary);

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
  const parseCourseSummary = (summaryHtml: string) => {
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
    } catch {
      return summary
    }

    return summary;
  };

  const renderContents = (): JSX.Element | null => {
    if (error) {
      return null;
    }

    return (
      <ScrollView style={{ flex: 1 }}>
        <View>
          <View style={defaultStyles.topicHeadline}>
            <Image source={icons.PalvelutilanteetIcon} style={defaultStyles.taskIcon} />
            <Text style={[defaultStyles.topicHeadlineText]}>{courseContent.courseName}</Text>
          </View>
          <View style={{ margin: 30 }}>
            <Text style={[defaultStyles.newsHeadline, { margin: 0 }]}>
              {courseContent.courseTopics.length > 0 ? courseContent.courseTopics[0].topicName : ""}
            </Text>
            {courseContent.courseSummary.courseSummaryImageUrl === "" ? <View /> :
              <Image style={{ height: 300 }} resizeMode={"contain"} source={{ uri: courseContent.courseSummary.courseSummaryImageUrl }} />
            }
            <Text>{courseContent.courseSummary.courseSummaryText}</Text>
          </View>
        </View>
        <FlatList
          style={{ margin: 0, borderRadius: 0, padding: 0 }}
          data={courseContent.courseTopics}
          renderItem={({ item }) =>
            item.topicContent.length > 0 ? listContent(item, courseContent.courseTopics.indexOf(item)) : <View></View>}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    );
  }

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      { renderContents() }  
    </BasicLayout>
  );
};

export default CourseSectionScreen;