import React, { useEffect } from "react";
import { Alert, View, StyleSheet } from "react-native";
import Api from "moodle-ws-client";
import strings from "../../localization/strings";
import BasicLayout from "../layout/BasicLayout";
import { NavigationStackProp } from "react-navigation-stack";
import WebView from "react-native-webview";
import config from "../../app/config";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId } from "../../features/common-slice";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
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

const HvpScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isLoggedin, setIsLoggedin] = React.useState(false);
  const [hvpUrl, setHvpUrl] = React.useState<string>();

  const moodleToken = useAppSelector(selectMoodleToken);

  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  const activityId = useAppSelector(selectSelectedActivityId);
  if (!activityId) {
    navigation.navigate("Main");
    return null;
  }

  useEffect(() => {
    getHvpUrl()
      .catch((e) => {
        setLoading(false);
        Alert.alert("Error", strings.pageContentErrorText);
      })
      .then((url) => {
        setHvpUrl(url!!);
        setLoading(false);
      });  
  }, [activityId]);

  /**
   * Gets url for the H5p task
   */
  const getHvpUrl = async (): Promise<string> => {
    const moodleService = Api.getMoodleService(config.hostUrl, moodleToken);
    const siteInfo: any = await moodleService.coreWebserviceGetSiteInfo({});
    if (!siteInfo.userid) {
      throw new Error("User not found");
    }

    return `/mod/hvp/embed.php?id=${activityId}&user_id=${siteInfo.userid}`;
  }

  const script = `var css = 'body { overflow: auto !important; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));`;

    return (
      <BasicLayout navigation={navigation} backgroundColor="#fff" loading={loading}>
          <View style={StyleSheet.absoluteFill}>
            <WebView
              source={{ uri: `${config.hostUrl}${hvpUrl}`}}
              javaScriptEnabled={true}
              injectedJavaScript={script}
            />
          </View>
      </BasicLayout>
    );
};

export default HvpScreen;