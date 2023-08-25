import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { NewsItem } from "../../types";
import { FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken } from "../../features/common-slice";
import config from "../../app/config";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

/**
 * Component for application main screen
 */
const NewsScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [news, setNews] = React.useState<NewsItem[]>([]);

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  useEffect(() => {
    setLoading(true);

    getNewsFromMoodle(config.courseIds)
      .catch((e) => {
        setLoading(false);
        setError(true);
        Alert.alert("Error", strings.mainScreenErrorText);
      })
      .then((news) => {
        setNews(news || []);
        setLoading(false);
      });
  }, []);

  /**
   * Returns the courses topics from moodle Api
   * @param courseId Course to retrieve the news section for
   */
  const getNewsFromMoodle = async (courseIds: number[]) => {
    const forumService = Api.getModForumService(config.hostUrl, moodleToken);

    const forums: any = await forumService.getForumsByCourses({courseids : courseIds});

    const news: NewsItem[] = [];

    for (const forum of forums) {
      if (forum.type === "news") {
        const forumPosts: any = await forumService.getForumDiscussionsPaginated({forumid: forum.id});
        for (const post of forumPosts.discussions) {
          const date = new Date(post.timemodified * 1000)
          const newsPost: NewsItem = {
            title: post.subject,
            text: post.message,
            author: post.userfullname,
            dateModified: date
          }
          news.push(newsPost);
        }
      }
    }

    return news;
  }

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <FlatList
      style={defaultStyles.listContainer}
      data={news}
      renderItem={({item}) =>
        <View style={{margin: 10}}>
          <Text style={defaultStyles.newsHeadline}>{item.title}</Text>
          <Text style={{margin: 10}}>{TextCleanup.cleanUpText(item.text)}</Text>
          <Text style={defaultStyles.newsFooterText}>{TextCleanup.cleanUpText(item.author)} {item.dateModified.toLocaleDateString()}</Text>
        </View>
        }
      keyExtractor={(item, index) => index.toString()}
      />
    </BasicLayout>
  );
};

export default NewsScreen;