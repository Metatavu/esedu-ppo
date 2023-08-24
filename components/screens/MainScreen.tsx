import { useEffect, useState } from "react";
import BasicLayout from "../layout/BasicLayout";
import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { CourseTopic } from "../../types";
import { NavigationStackProp } from "react-navigation-stack";
import { selectMoodleToken, selectedTopicUpdate } from "../../features/common-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import defaultStyles from "../../styles/default-styles";
import { Text, View } from "native-base";
import StyledIcon from "../generic/StyledIcon";
import Api from "moodle-ws-client";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp
};

/**
 * Styles for the component
 */
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
});

/**
 * Main screen component
 */
const MainScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [courseContent, setCourseContent] = useState<CourseTopic[]>([]);
  const dispatch = useAppDispatch();
  const moodleToken = useAppSelector(selectMoodleToken);
  const [courseId, setCourseId] = useState(2); // TODO: where to get this from?

  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  /**
   * Returns the courses topics from moodle Api
   */
  const getTopicsFromMoodle = async (courseId: number) => {
    const moodleService = await Api.getMoodleService("https://ppo-test.metatavu.io", moodleToken);

    const topics: any = await moodleService.coreCourseGetContents({ courseid: courseId });

    const quizService = await Api.getModQuizService("https://ppo-test.metatavu.io", moodleToken);

    const quizList: any = await quizService.getQuizzesByCourses({ courseids: [courseId] });

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
              newCourseItem.topicContent.push({ name: activity.name, type: "quiz", activityId: quiz.id });
            }
          }
        }
      }

      if (newCourseItem.id !== 1) {
        courseContent.push(newCourseItem);
      }
    }
    return courseContent;
  };

  const loadCourseContent = async () => {
    return await getTopicsFromMoodle(courseId);
  };

  useEffect(() => {
    setLoading(true);

    loadCourseContent()
      .catch((e) => {
        console.error(e);
        setError(true);
        setLoading(false);
      })
      .then((courseContent) => {
        if (courseContent) {
          setCourseContent(courseContent);
        }
        setLoading(false);
      }
      );
  }, [courseId]);

  /**
   * Saves the topic pressed by the user and navigates to the topic page
   * @param topic selected topic
   */
  const onTopicPress = (topic: CourseTopic) => {
    dispatch(selectedTopicUpdate(topic));
    navigation.navigate("Topic");
  }

  return (
    <BasicLayout loading={loading} backgroundColor="#fff">
      <FlatList
        style={defaultStyles.listContainer}
        data={courseContent}
        renderItem={({ item }) =>
          <TouchableOpacity onPress={() => onTopicPress(item)}>
            <View style={[defaultStyles.topicItemBase, item.topicDone ? styles.itemDone : (item.topicAvailable ? defaultStyles.topicItemBase : styles.topicItemInactive)]}>
              <StyledIcon
                size={46}
                name={item.topicDone ? "trophy-outline" : "eye-outline"}
                style={defaultStyles.taskIcon}
              />

              <View style={defaultStyles.topicTaskIconBackground} />
              <Text style={[defaultStyles.topicItemText, item.topicDone ? defaultStyles.topicItemText : styles.itemActiveText]}>{item.topicName}</Text>


              <StyledIcon
                size={50}
                name={item.topicDone ? "checkmark-circle" : "arrow-forward"}
                style={defaultStyles.progressIcon}
              />

            </View>
          </TouchableOpacity>}
        keyExtractor={(_item, index) => index.toString()}
      />
    </BasicLayout>
  );
};

export default MainScreen;
