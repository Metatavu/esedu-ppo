import React, { useEffect } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { ForumItem } from "../../types";
import { FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert, TextInput, StyleSheet, Button, Image } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";
import { ScrollView } from "react-native-gesture-handler";
import ForumPost from "../generic/ForumPost";
import * as icons from "../../static/icons";
import { NavigationStackProp } from "react-navigation-stack";
import config from "../../app/config";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId } from "../../features/common-slice";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

interface Forum {
  title: string,
  intro: string,
  userCanPost: boolean,
  posts: ForumItem[]
}

const styles = StyleSheet.create({
  textField : {
    alignContent: "center"
  },
  listItemBase: {
    flex: 1,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#53B02B",
    flexDirection: "row",
    alignContent: "flex-start"
  }
});

const emptyForum: Forum = {
  title: "",
  intro: "",
  userCanPost: false,
  posts: []
};

const ForumScreen = ({ navigation }: Props) => {
  const [ loading, setLoading ] = React.useState(false);
  const [ error, setError ] = React.useState(false);
  const [ forum, setForum ] = React.useState<Forum>(emptyForum);
  const [ newForumTitle, setNewForumTitle ] = React.useState("");
  const [ newForumText, setNewForumText ] = React.useState("");

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

  const courseId = useAppSelector(selectSelectedActivityId);

  useEffect(() => {
    setLoading(true);
    getForumFromMoodle(activityId)
      .catch((e) => {
        setError(true);
        Alert.alert("Error", strings.mainScreenErrorText);
      })
      .then((forum) => {
        setForum(forum || emptyForum);
        setLoading(false);
      });
  }, [ activityId ]);

  const onChangeText = (text: string, title: boolean) => {
    if (title) {
      setNewForumTitle(text);
    } else {
      setNewForumText(text);
    }
  };

  const submitDiscussion = async (id: number, title: string, text: string) => {
    const forum = Api.getModForumService(config.hostUrl, moodleToken || "");
    forum.addDiscussionPost({postid: id, subject: title, message: text});
  };

  const submitToForum = async () => {
    const forumService = Api.getModForumService(moodleToken || "", config.hostUrl);

    const newDiscussion = {
      forumid: activityId || 0,
      subject: newForumTitle,
      message: newForumText
    }

    await forumService.addDiscussion(newDiscussion);
  };

  /**
   * Returns the courses topics from moodle Api
   * @param courseId Course to retrieve the news section for
   */
  const getForumFromMoodle = async (forumid: number) => {
    const forumService = Api.getModForumService(config.hostUrl, moodleToken);

    const viewForum: any = await forumService.getForumsByCourses({courseids: [courseId || 0]})

    const forums: Forum = {
      title: "",
      intro: "",
      userCanPost: false,
      posts: []
    }

    for (const forum of viewForum) {

      if (forum.id === forumid) {
        forums.intro = forum.intro,
        forums.title = forum.name,
        forums.userCanPost = forum.type !== "news"
      }
    }

    const forumDiscussions: any = await forumService.getForumDiscussionsPaginated({forumid});

    for (const discussion of forumDiscussions.discussions) {
      const date = new Date(discussion.timemodified * 1000);
      const posts: ForumItem = {
        title: discussion.subject,
        text: discussion.message,
        author: discussion.userfullname,
        dateModified: date,
        comments: [],
        id: discussion.id
      }
      forums.posts.push(posts);
    }

    return forums;
  };

  const forumHeader =
    <View>
      <View style={defaultStyles.topicHeadline}>
          <Image source={icons.TaskIcon} style={defaultStyles.taskIcon} />
          <Text style={[defaultStyles.topicHeadlineText]}>{TextCleanup.cleanUpText(forum.title)}</Text>
      </View>
      <View style={{margin: 30}}>
        <Text>{TextCleanup.cleanUpText(forum.intro)}</Text>
      </View>
    </View>

  const listFooter =
    <View>
      <Text>{strings.addConversation}</Text>
      <View style={styles.listItemBase}>
        <View style={[defaultStyles.listTextContainer]}>
          <TextInput placeholder={strings.title} onChangeText={(text) => onChangeText(text, true)} style={styles.textField}/>
        </View>
      </View>
      <View style={styles.listItemBase}>
        <View style={[defaultStyles.listTextContainer]}>
          <TextInput placeholder={strings.message} onChangeText={(text) => onChangeText(text, false)} style={styles.textField}/>
        </View>
      </View>
      <View style={styles.listItemBase}>
        <View style={[defaultStyles.listTextContainer, {alignItems: "flex-end"}]}>
          <Button color={"#88B620"} title={strings.send} onPress={() => submitToForum()}></Button>
        </View>
      </View>
    </View>

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <ScrollView>
        {forumHeader}
        <FlatList
        ListFooterComponent={forum.userCanPost ? listFooter : <View/>}
        style={[defaultStyles.listContainer]}
        data={forum.posts}
        renderItem={({item}) =>
        <ForumPost styles={styles} item={item} sendComment={(id, title, text) => submitDiscussion(id, title, text)}/>
        }
        keyExtractor={(item, index) => index.toString()}
        />
        </ScrollView>
    </BasicLayout>
  );
};

export default ForumScreen;