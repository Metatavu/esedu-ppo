import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View } from "native-base";
import { Icon } from "react-native-elements";
import { StoreState, AccessToken, CourseTopic } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import { StyleSheet, TouchableOpacity } from "react-native";
import defaultStyles from "../../styles/default-styles";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  selectedTopic?: CourseTopic
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  courseContent: CourseTopic[]
};

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
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
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
      this.props.navigation.navigate("Main");
    }
  }

  /**
   * Component render
   */
  public render() {
    if (this.props.selectedTopic) {
      return (
        <BasicLayout loading={this.state.loading} backgroundColor="#fff">
            <View style={styles.topicHeadline}>
              <Icon containerStyle={defaultStyles.taskIcon} size={46} name="eye" type="evilicon" color="white"/>
              <View style={[defaultStyles.topicTaskIconBackground, styles.iconBackgroundAdjust]}/>
              <Text style={[styles.topicHeadlineText]}>{this.props.selectedTopic.topicName}</Text>
            </View>
          <FlatList
          style={styles.listContainer}
          data={this.props.selectedTopic.topicContent}
          renderItem={({item}) =>
          <TouchableOpacity onPress= {() => this.onActivityPress(item.type, item.activityId)}>
            <View style={defaultStyles.topicItemBase}>
              <Text style={[defaultStyles.topicItemText, styles.activityText]}>{item.name}</Text>
              <Icon containerStyle={defaultStyles.progressIcon} size={50} name="arrow-right" type="evilicon"/>
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
   * @param type 
   * @param activityId 
   */
  private onActivityPress(type: string, activityId: number) {
    if (type === "quiz") {
      // TODO navigate to quiz page and pass the quiz id
      // this.props.navigation.navigate("Quiz");
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
