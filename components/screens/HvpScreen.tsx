import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { AccessToken, StoreState } from "../../types";
import * as actions from "../../actions";
import { WebView, NavState, Alert, View } from "react-native";
import Api from "moodle-ws-client";
import { HOST_URL, INFOPAGE_ID } from "react-native-dotenv";
import strings from "../../localization/strings";
import { HeaderProps } from "react-navigation";
import TopBar from "../layout/TopBar";
import BasicLayout from "../layout/BasicLayout";

/**
 * Component props
 */
interface Props {
  navigation: any,
  activityId?: number,
  accessToken?: AccessToken,
  moodleToken?: string,
  locale?: string,
};

/**
 * Component state
 */
interface State {
  loading: boolean,
  error: boolean,
  isLoggedin: boolean,
  hvpUrl?: string
};

/**
 * Hvp screen component
 */
class HvpScreen extends React.Component<Props, State> {

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
      isLoggedin: false
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
   * Component render method
   */
  public render() {
    if (!this.state.loading) {
      return (
        <WebView
          source={{ uri: `${HOST_URL}${this.state.hvpUrl}`}}
          style={{ marginTop: 20 }}
        />
      );
    }
    return (
      <BasicLayout backgroundColor="#fff" loading={true}>
      </BasicLayout>
    )
  }

  /**
   * Component did mount lifecycle event
   */
  public async componentDidMount() {
    this.setState({loading: true});
    if (!this.props.moodleToken || !this.props.activityId) {
      return this.props.navigation.navigate("Login");
    }

    const hvpUrl = await this.getHvpUrl(this.props.activityId, this.props.moodleToken).catch((e) => {
      Alert.alert("Error", strings.pageContentErrorText);
    });
    if (hvpUrl) {
      console.warn(hvpUrl);
      this.setState({hvpUrl})
      this.setState({loading: false});
    }
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Hvp");
    }
  }

  /**
   * Gets url for the H5p task
   * 
   * @param id hvp id @param token moodle token
   */
  private async getHvpUrl(id: number, token: string) {

    console.warn(id, token);
    const moodleService = Api.getMoodleService(HOST_URL, token);
    const siteInfo: any = await moodleService.coreWebserviceGetSiteInfo({});
    if (!siteInfo.userid) {
      throw new Error("User not found");
    }
    return `/mod/hvp/embed.php?id=${id}&user_id=${siteInfo.userid}`;
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
    activityId: state.selectedActivityId
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

export default connect(mapStateToProps, mapDispatchToProps)(HvpScreen);
