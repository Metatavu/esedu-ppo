import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { Icon } from "react-native-elements";
import { StoreState, AccessToken, CourseTopic, CourseSection } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { HOST_URL, COURSE_IDS } from "react-native-dotenv";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  onSelectedSectionUpdate: (sectionId: number) => void
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  accessToken?: AccessToken,
  moodleToken?: string,
  courseSections: CourseSection[]
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
      courseSections: []
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerTitle: <TopBar showBack={false} navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    this.setState({loading: true});
    console.warn(COURSE_IDS);
    const courseSections = await this.getCoursesFromMoodle(COURSE_IDS.split(",")).catch((e) => {
      this.setState({loading: false, error: true});
      Alert.alert("Error", "Error getting courses");
    });
    this.setState({courseSections});
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
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <FlatList
        style={defaultStyles.listContainer}
        data={this.state.courseSections}
        renderItem={({item}) =>
        <TouchableOpacity onPress= {() => this.onTopicPress(item)}>
          <View style={defaultStyles.topicItemBase}>
            <Icon containerStyle={defaultStyles.taskIcon} size={46} name="trophy" type="evilicon" color="white"/>
            <View style={defaultStyles.topicTaskIconBackground}/>
            <Text style={[defaultStyles.topicItemText, styles.itemActiveText]}>{item.sectionName}</Text>
            <Icon containerStyle={defaultStyles.progressIcon} color="#fff" size={50} name="arrow-right" type="evilicon"/>
          </View>
        </TouchableOpacity>}
        keyExtractor={(item, index) => index.toString()}
        />
      </BasicLayout>
    );
  }

  /**
   * Returns the courses topics from moodle Api
   * 
   * @param courseId course id to get topics by
   */
  private async getCoursesFromMoodle(courseIds: number[]) {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    const moodleService = Api.getMoodleService(HOST_URL, this.props.moodleToken);
    const courses: any = await moodleService.coreCourseGetCoursesByField({field: "ids", value: courseIds.toString()});

    const courseSections: CourseSection[] = [];

    for (const section of courses.courses) {
      const newCourseSection: CourseSection = {
        id: section.id,
        sectionName: section.fullname
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
  private onTopicPress(section: CourseSection) {
    console.warn("Selected section: ", section.id);
    this.props.onSelectedSectionUpdate(section.id);
    this.props.navigation.navigate("Section");
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
    onSelectedSectionUpdate: (sectionId: number) => dispatch(actions.selectedSectionUpdate(sectionId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
