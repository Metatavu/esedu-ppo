import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { Icon } from "react-native-elements";
import { StoreState, CourseTopic } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import { StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import * as icons from "../../static/icons/index";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  selectedTopic?: CourseTopic,
  moodleToken?: string,
  onSelectedActivityUpdate: (activityId: number) => void
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  courseContent: CourseTopic[],
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

/**
 * Component for application main screen
 */
class TopicScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      courseContent: []
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerLeft: null,
      headerTitle: <TopBar showBack={false} navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    this.setState({loading: false})
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Topic");
    }
  }

  /**
   * Component render
   */
  public render() {
    if (this.props.selectedTopic) {
      return (
        <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
          <View style={defaultStyles.topicHeadline}>
            <Image source={icons.PalvelutilanteetIcon} style={defaultStyles.taskIcon} />
            <Text style={[defaultStyles.topicHeadlineText]}>{this.props.selectedTopic.topicName}</Text>
          </View>
          <FlatList
          style={styles.listContainer}
          data={this.props.selectedTopic.topicContent}
          renderItem={({item}) =>
          <TouchableOpacity onPress= {() => this.onActivityPress(item.type, item.activityId)}>
            <View style={item.active ? defaultStyles.listItemBase : [defaultStyles.listItemBase, defaultStyles.listItemInactive]}>
              <View style={defaultStyles.listTextContainer}>
                <Text style={item.active ? [defaultStyles.listItemText, styles.activityText] :
                  [defaultStyles.listItemText]}>{item.name}</Text>
              </View>
              {item.active ? <Icon containerStyle={defaultStyles.progressIcon}
                iconStyle={{color: "white"}} size={50} name="pencil" type="evilicon"/> : <View></View>}
            </View>
          </TouchableOpacity>}
          keyExtractor={(item, index) => index.toString()}
          />
        </BasicLayout>
      );
    }
  }

  /**
   * Navigates to the pressed activity
   * @param type type of activity
   * @param activityId id of activity
   */
  private async onActivityPress(type: string, activityId: number) {
    if (type === "quiz") {
      this.props.onSelectedActivityUpdate(activityId);
      return this.props.navigation.push("Quiz");
    }
    else if (type === "page") {
      this.props.onSelectedActivityUpdate(activityId);
      return this.props.navigation.push("TextContent");
    }
    else if (type === "hvp") {
      this.props.onSelectedActivityUpdate(activityId);
      return this.props.navigation.push("Hvp");
    }
    else if (type === "assign") {
      this.props.onSelectedActivityUpdate(activityId);
      return this.props.navigation.push("Assignment");
    }
    else if (type === "forum") {
      this.props.onSelectedActivityUpdate(activityId);
      return this.props.navigation.push("Forum");
    }
    else {
      Alert.alert("Error", strings.unsupportedActivityTypeText);
    }
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
    selectedTopic: state.selectedTopic
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSelectedActivityUpdate: (activityId: number) => dispatch(actions.selectedActivityUpdate(activityId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TopicScreen);
