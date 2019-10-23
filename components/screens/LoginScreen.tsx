import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { AccessToken, StoreState } from "../../types";
import * as actions from "../../actions";
import { WebView, NavState } from "react-native";
import { Buffer } from "buffer";
import { HOST_URL } from "react-native-dotenv";

/**
 * Login details
 */
interface LoginDetails {
  username?: string,
  password?: string,
  realm?: string
}

/**
 * Component props
 */
interface Props {
  navigation: any,
  accessToken?: AccessToken,
  onAccessTokenUpdate: (accessToken: AccessToken) => void,
  onMoodleTokenUpdate: (moodleToken: string) => void,
  locale?: string
}

/**
 * Component state
 */
interface State {
  loginDetails: LoginDetails,
  loading: boolean,
  error: boolean,
  isLoggedin: boolean
};

/**
 * Login screen component
 */
class LoginScreen extends React.Component<Props, State> {

  /**
   * Navigation options
   */
  public static navigationOptions = {
    headerVisible: false,
    header: null
  };

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loginDetails: {},
      loading: false,
      error: false,
      isLoggedin: false
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <WebView
        source={{ uri: `${HOST_URL}/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=5000&urlscheme=`}}
        style={{ marginTop: 20 }}
        onNavigationStateChange={this.onNavigation}
      />
    );
  }

  /**
   * Component did mount lifecycle event
   */
  public async componentDidMount() {
    console.warn(HOST_URL);
  }
  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Login");
    }
  }

  /**
   * Updates login details when values change
   */
  private updateData = (key: "username" | "password" | "realm", value: string) => {
    const loginDetails: LoginDetails = this.state.loginDetails;
    loginDetails[key] = value;
    this.setState({
      loginDetails
    });
  }

  /**
   * Tries to login
   */
  private sendLogin = (event?: any) => {
    const loginData = this.state.loginDetails;
    this.setState({loading: true});
  }

  /**
   * Monitors the webview navigation, grabs the token and navigates to main page
   */
  private onNavigation = (event: NavState) => {
    /*
    const token = this.getTokenFromUrl("https://moodle.esedu.fi/admin/tool/mobile/://token=ZmE4MTkyMGYzNDkxYmNjNTAwODRiM2Q3MzYzMDdhNGM6OjoxNWIxZDZmMGY5NjZlMGQ5ZmZlYjNjNjkwNjkyYTI5OTo6OlhxVTFoM0ZNV0hLT09vU0xySzJtcHI1WFdHeG5GbjRxVVV3V29kMlNWcnJ5bGZzaE5veUVhbENlQXlDZHZUQ3o=");
    this.props.onMoodleTokenUpdate(token);
    this.props.navigation.replace("Main");
    */
    if (!event.url || event.url.indexOf("token=") === -1) {
      return;
    }

    const token = this.getTokenFromUrl(event.url);
    this.props.onMoodleTokenUpdate(token);
    this.props.navigation.replace("Main");
  }

  /**
   * Extracts token from url
   */
  private getTokenFromUrl = (url: string): string => {
    const b64 = Buffer.from(url.split("token=")[1], "base64").toString("ascii");
    const token = b64.split(":::")[1];

    return token;
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
    accessToken: state.accessToken,
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
    onAccessTokenUpdate: (accessToken: AccessToken) => dispatch(actions.accessTokenUpdate(accessToken)),
    onMoodleTokenUpdate: (moodleToken: string) => dispatch(actions.moodleTokenUpdate(moodleToken))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
