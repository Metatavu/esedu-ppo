import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { AccessToken, CourseSection } from "../../types";
import { FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { TouchableOpacity, Alert, Image } from "react-native";
import defaultStyles from "../../styles/default-styles";
import * as icons from "../../static/icons/index";
import strings from "../../localization/strings";
import { NavigationStackProp } from "react-navigation-stack";
import StyledIcon from "../generic/StyledIcon";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectedSectionIdUpdate } from "../../features/common-slice";
import config from "../../app/config";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

/**
 * Component for application main screen
 */
const MainScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [courseSections, setCourseSections] = React.useState<CourseSection[]>([]);
  const [accessToken, setAccessToken] = React.useState<AccessToken>();
  const dispatch = useAppDispatch();

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  useEffect(() => {
    setLoading(true);
    getCoursesFromMoodle(config.courseIds)
      .catch((e) => {
        setLoading(false);
        setError(true);
        Alert.alert("Error", strings.mainScreenErrorText);
      })
      .then((courseSections) => {
        setCourseSections(courseSections || []);
        setLoading(false);
      });
  }, []);

  /**
   * Returns the courses topics from moodle Api
   * 
   * @param courseId course id to get topics by
   */
  const getCoursesFromMoodle = async (courseIds: number[]) => {
    const moodleService = Api.getMoodleService(config.hostUrl, moodleToken);

    const courses: any = await moodleService.coreCourseGetCoursesByField({field: "ids", value: courseIds.toString()});

    const courseSections: CourseSection[] = [];

    const info: any = await moodleService.coreWebserviceGetSiteInfo({});

    for (const section of courses.courses) {
      let icon: any;
      switch (parseInt(section.id, 10)) {
        case courseIds[1]:
          icon = icons.AsiakaskokemusIcon
          break;
        case courseIds[2]:
          icon = icons.AsiakastyytyvaisyysIcon
          break;
        case courseIds[3]:
          icon = icons.PalvelutilanteetIcon
          break;
        case courseIds[4]:
          icon = icons.HaasteellisetIcon
          break;
        case courseIds[5]:
          icon = icons.MinaAsiakasIcon
          break;
        default:
          icon = icons.SosiaalinenIcon
          break;
      }

      const newCourseSection: CourseSection = {
        id: section.id,
        sectionName: section.fullname,
        icon
      }

      courseSections.push(newCourseSection)
    }

    return courseSections;
  }

  /**
   * Saves the topic pressed by the user and navigates to the topic page
   * 
   * @param topic topic pressed by the user
   */
  const onTopicPress = (section: CourseSection) => {
    dispatch(selectedSectionIdUpdate(section.id));
    navigation.navigate("Section");
  }

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <FlatList
        style={defaultStyles.listContainer}
        data={courseSections}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => onTopicPress(item)}>
          <View style={defaultStyles.listItemBase}>
            <Image style={defaultStyles.taskIcon} source={item.icon} resizeMode={"contain"}/>
            <View style={defaultStyles.listTextContainer}>
              <Text style={[defaultStyles.listItemText, defaultStyles.active]}>{item.sectionName}</Text>
            </View>
            <StyledIcon style={defaultStyles.progressIcon} color="#fff" size={30} name="arrow-right"/>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={ <View style={{ margin: 25 }} /> }
      />
    </BasicLayout>
  );
};

export default MainScreen;