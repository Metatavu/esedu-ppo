import React from "react";
import { Buffer } from "buffer";
import { NavigationStackProp } from "react-navigation-stack";
import WebView, { WebViewNavigation } from "react-native-webview";
import config from "../../app/config";
import { useAppDispatch } from "../../app/hooks";
import { moodleTokenUpdate } from "../../features/common-slice";

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
  navigation: NavigationStackProp;
}

/**
 * Component state
 */
interface State {
  loginDetails: LoginDetails,
  loading: boolean,
  error: boolean,
  isLoggedin: boolean,
  key: number
};

/**
 * Login screen component
 */
const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isLoggedin, setIsLoggedin] = React.useState(false);
  const [key, setKey] = React.useState(0);
  const [loginDetails, setLoginDetails] = React.useState<LoginDetails>({});
  const dispatch = useAppDispatch();

  const resetWebViewToInitialUrl = () => {
    setKey(key + 1);
  };

  /**
   * Updates login details when values change
   */
  const updateData = (key: "username" | "password" | "realm", value: string) => {
    setLoginDetails({ ...loginDetails, [key]: value });
  }

  /**
   * Tries to login
   */
  const sendLogin = (event?: any) => {
    const loginData = loginDetails;
    setLoading(true);
  }

  /**
   * Monitors the webview navigation, grabs the token and navigates to main page
   */
  const onNavigation = (event: WebViewNavigation) => {
    if (event.url && (event.url.indexOf("user/profile.php") > -1 || event.url.indexOf("/intelliboard/student/index.php") > -1)) {
      resetWebViewToInitialUrl();
    }

    if (!event.url || event.url.indexOf("token=") === -1) {
      return;
    }
    const token = getTokenFromUrl(event.url);
    dispatch(moodleTokenUpdate(token));
    navigation.replace("Main");
  }

  /**
   * Extracts token from url
   */
  const getTokenFromUrl = (url: string): string => {
    const b64 = Buffer.from(url.split("token=")[1], "base64").toString("ascii");
    const token = b64.split(":::")[1];

    return token;
  }
  
  return (
    <WebView
      key={key}
      source={{ uri: `${config.hostUrl}/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=5000`}}
      style={{ marginTop: 20 }}
      onNavigationStateChange={onNavigation}
    />
  );
};

export default LoginScreen;