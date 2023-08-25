import React from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { CourseTopic } from "../../types";
import { FlatList } from "react-navigation";
import { StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import * as icons from "../../static/icons/index";
import { NavigationStackProp } from "react-navigation-stack";
import { selectSelectedTopic, selectedActivityIdUpdate } from "../../features/common-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import StyledIcon from "../generic/StyledIcon";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 25,
    marginHorizontal: 10
  },
  iconBackgroundAdjust: {
    marginTop: 25
  },
  activityText: {
    color: "white",
    paddingLeft: 10
  }
});

const TopicScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [courseContent, setCourseContent] = React.useState<CourseTopic[]>([]);
  const selectedTopic = useAppSelector(selectSelectedTopic);
  const dispatch = useAppDispatch(); 

  /**
   * Navigates to the pressed activity
   * @param type type of activity
   * @param activityId id of activity
   */
  const onActivityPress = async (type: string, activityId: number) => {
    if (type === "quiz") {
      dispatch(selectedActivityIdUpdate(activityId));
      return navigation.push("Quiz");
    }
    else if (type === "page") {
      dispatch(selectedActivityIdUpdate(activityId));
      return navigation.push("TextContent");
    }
    else if (type === "hvp") {
      dispatch(selectedActivityIdUpdate(activityId));
      return navigation.push("Hvp");
    }
    else if (type === "assign") {
      dispatch(selectedActivityIdUpdate(activityId));
      return navigation.push("Assignment");
    }
    else if (type === "forum") {
      dispatch(selectedActivityIdUpdate(activityId));
      return navigation.push("Forum");
    }
    else {
      Alert.alert("Error", strings.unsupportedActivityTypeText);
    }
  }

  if (selectedTopic) {
    return (
      <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
        <View style={defaultStyles.topicHeadline}>
          <Image source={icons.PalvelutilanteetIcon} style={defaultStyles.taskIcon} />
          <Text style={[defaultStyles.topicHeadlineText]}>{selectedTopic.topicName}</Text>
        </View>
        <FlatList
        style={styles.listContainer}
        data={selectedTopic.topicContent}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => onActivityPress(item.type, item.activityId)}>
          <View style={item.active ? defaultStyles.listItemBase : [defaultStyles.listItemBase, defaultStyles.listItemInactive]}>
            <View style={defaultStyles.listTextContainer}>
              <Text style={item.active ? [defaultStyles.listItemText, styles.activityText] :
                [defaultStyles.listItemText]}>{item.name}</Text>
            </View>
            {item.active ? <StyledIcon style={defaultStyles.progressIcon} color="white" size={50} name="pencil"/> : <View></View>}
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
        />
      </BasicLayout>
    );
  }

  return null;
};

export default TopicScreen;
