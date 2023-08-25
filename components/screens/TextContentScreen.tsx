import React, { useEffect } from "react";
import { View, StyleSheet, Alert, Text, Image, Modal, TouchableHighlight } from "react-native";
import { MultichoiceQuestion } from "../../types";
import Api from "moodle-ws-client"
import strings from "../../localization/strings";
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import TextCleanup from "../../utils/TextCleanup";
import * as icons from "../../static/icons";
import { NavigationStackProp } from "react-navigation-stack";
import WebView from "react-native-webview";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId, selectSelectedSectionId } from "../../features/common-slice";
import config from "../../app/config";

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
  quizData: MultichoiceQuestion[],
  optionsArray: string[],
  attemptId?: number,
  sequenceCheck?: number,
  pageContent: string,
  pageHeader: string,
  mountedId?: number
};

const styles = StyleSheet.create({
  paragraph: {
    fontFamily: "Cochin",
    marginBottom: 20
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  questionContainer: {
    marginBottom: 15
  }
});

const TextContentScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [pageContent, setPageContent] = React.useState<string>("");
  const [pageHeader, setPageHeader] = React.useState<string>("");

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  const navigationPageId = navigation.getParam("pageId");
  const selectedActivityId = useAppSelector(selectSelectedActivityId);
  const selectedSectionId = useAppSelector(selectSelectedSectionId);

  const loadPage = async (pageId: number) => {
    const courseId = selectedSectionId || config.courseIds[0];

    const pageContent = await getContentPageFromMoodle(pageId, courseId);
    if (!pageContent) {
      throw new Error("Page content not found");
    };

    return pageContent;
  };

  useEffect(() => {
    setLoading(true);
    const pageId = parseInt(navigationPageId, 10) || selectedActivityId;
    if (pageId) {
      loadPage(pageId)
        .then((pageContent) => {
          setPageHeader(TextCleanup.cleanUpText(pageContent.name));
          setPageContent(pageContent.content);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          setError(true);
          Alert.alert("Error", strings.mainScreenErrorText);
        });
    } else {
      setLoading(false);
      setError(true);
      Alert.alert("Error", strings.pageContentErrorText);
    }
  }, []);

  /**
   * Method gets text page from moodle API
   * 
   * @param pageid content page id to fetch
   */
  const getContentPageFromMoodle = async (pageid: number, courseid: number) => {
    const pageService = Api.getModPageService(config.hostUrl, moodleToken);
    const pageList: any = await pageService.getPagesByCourses({courseids: [courseid]});

    for (const page of pageList.pages) {
      if (parseInt(page.coursemodule, 10) == pageid) {
        return page;
      }
    }
  }
  
  const renderContent = () => {
    if (error) {
      return null;
    }

    return (
      <View style={{flex: 1}}>
        <View style={[defaultStyles.topicHeadline, {alignItems: "center"}]}>
          <Image source={icons.ContentIcon} style={defaultStyles.taskIcon} />
          <Text style={defaultStyles.topicHeadlineText}>{pageHeader}</Text>
        </View>
        <View style={{flex: 1, padding: 10, justifyContent: "center"}}>
          <WebView style={{zIndex: -1}} 
          source={{ html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${pageContent}</body></html>` }}/>
        </View>
      </View>
    );
  };

  return (
    <BasicLayout navigation={navigation} backgroundColor="#fff" loading={loading}>
      { renderContent() }
    </BasicLayout>
  );
};

export default TextContentScreen;