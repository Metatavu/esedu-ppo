import React, { useState } from "react";
import { Buffer } from "buffer";
import { NavigationStackProp } from "react-navigation-stack";
import { WebView, WebViewNavigation } from 'react-native-webview';
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
 * Login screen component
 */
const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [loginDetails, setLoginDetails] = useState<LoginDetails>();

  const dispatch = useAppDispatch();

  /**
   * Monitors the webview navigation, grabs the token and navigates to main page
   */
  const onNavigation = (event: WebViewNavigation) => {
    if (!event.url || event.url.indexOf("token=") === -1) {
      return;
    }

    const token = getTokenFromUrl(event.url);
    dispatch(moodleTokenUpdate(token));
    navigation.navigate("Main");
  }

  /**
   * Updates login details when values change
   */
  const updateData = (key: keyof LoginDetails, value: string) => {
    if (!loginDetails) {
      return;
    }

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
   * Extracts token from url
   */
  const getTokenFromUrl = (url: string): string => {
    const b64 = Buffer.from(url.split("token=")[1], "base64").toString("ascii");
    const token = b64.split(":::")[1];

    return token;
  }

  return (
    <WebView
      source={{ uri: "https://ppo-test.metatavu.io/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=5000&urlscheme="}}
      style={{ marginTop: 20 }}
      onNavigationStateChange={onNavigation}
    />
  );

};

export default LoginScreen;