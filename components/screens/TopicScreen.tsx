import React from "react";
import BasicLayout from "../layout/BasicLayout";
import { Box, Icon, Text, View } from "native-base";
import { FlatList } from "react-navigation";
import { StyleSheet, TouchableOpacity } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { NavigationStackProp } from "react-navigation-stack";
import { CourseTopic } from "../../types";
import { useAppSelector } from "../../app/hooks";
import { selectSelectedTopic } from "../../features/common-slice";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

/**
 * Styles for the component
 */
const styles = StyleSheet.create({
  listContainer: {
    marginTop: 25,
    marginHorizontal: 10
  },
  topicHeadline: {
    padding: 10,
    height: 100,
    backgroundColor: "#53B02B",
    alignItems: "flex-start",
    flexDirection: "row",
    textAlignVertical: "center",
    textAlign: "center"
  },
  topicHeadlineText: {
    textAlignVertical: "center",
    margin: 10,
    fontSize: 18,
    width: 275,
    height: 60,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "white"
  },
  iconBackgroundAdjust: {
    marginTop: 25
  },
  activityText: {
    color: "white",
    paddingLeft: 10
  }
});

/**
TODO implement this
public static navigationOptions = (props: NavigationStackProp) => {
    return ({
      headerTitle: (
        <TopBar 
          navigation={ props } 
          showMenu={true} 
          showHeader={false}
          showLogout={true} 
          showUser={true} 
        />
      )
    });
  };
 */

/**
 * Topic screen component 
 */
const TopicScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [courseContent, setCourseContent] = React.useState<CourseTopic[]>([]);
  
  const selectedTopic = useAppSelector(selectSelectedTopic);

  /**
   * Navigates to the pressed activity
   * @param type 
   * @param activityId 
   */
  const onActivityPress = (type: string, activityId: number) => {
    if (type === "quiz") {
      // TODO navigate to quiz page and pass the quiz id
      // this.props.navigation.navigate("Quiz");
    }
  };

  if (selectedTopic) {
    return (
      <BasicLayout loading={loading} backgroundColor="#fff">
          <View style={styles.topicHeadline}>
            <Box style={defaultStyles.taskIcon}>
              <Icon 
                  size="46" 
                  name="eye" 
                  color="white"
              />
           </Box>
            <View style={[defaultStyles.topicTaskIconBackground, styles.iconBackgroundAdjust]}/>
            <Text style={[styles.topicHeadlineText]}>{selectedTopic.topicName}</Text>
          </View>
        <FlatList
        style={styles.listContainer}
        data={selectedTopic.topicContent}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => onActivityPress(item.type, item.activityId)}>
          <View style={defaultStyles.topicItemBase}>
            <Text style={[defaultStyles.topicItemText, styles.activityText]}>{item.name}</Text>
            <Box style={defaultStyles.progressIcon}>
              <Icon 
                  size="50" 
                  name="arrow-forward" 
              />
            </Box>
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
