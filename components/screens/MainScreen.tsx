import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text } from "native-base";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";
import Api from "moodle-ws-client";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  quizData: any,
  optionsArray: string[],
  accessToken?: AccessToken
  moodleToken?: string
};

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
      quizData: [],
      optionsArray: []
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
    this.getTopicsFromMoodle().catch((e) => {
      this.setState({loading: false, error: true});
    });
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
        <BasicLayout backgroundColor="#fff">
          <Text>Course Overview</Text>
        </BasicLayout>
      );
    }

  /**
   * Returns topics from moodle Api
   */
  private async getTopicsFromMoodle() {
    if (!this.state.moodleToken) {
      return this.props.navigation.navigate("Login");
    }

    // TODO Get course topics from moodle and display them
    const moodleService = Api.getMoodleService("https://ppo-test.metatavu.io", this.state.moodleToken);
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    locale: state.locale
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
