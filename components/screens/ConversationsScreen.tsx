import React, { useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import { FlatList } from "react-navigation";
import Api from "moodle-ws-client"
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import TextCleanup from "../../utils/TextCleanup";
import { Conversation, Participant, Message } from "../../types/index";
import strings from "../../localization/strings";
import { NavigationStackProp } from "react-navigation-stack";
import config from "../../app/config";
import StyledIcon from "../generic/StyledIcon";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken } from "../../features/common-slice";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 25,
    marginHorizontal: 10
  },
  messageUser: {
    padding: 0,
    height: 25,
    fontSize: 20,
    alignItems: "flex-start",
    flexDirection: "row",
    textAlignVertical: "top",
    textAlign: "left"
  },
  messageText: {
    textAlignVertical: "bottom",
    fontSize: 18,
    width: 275,
    height: 30,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "white"
  }
});

const ConversationsScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const moodleToken = useAppSelector(selectMoodleToken);

  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  /**
   * Returns the current users conversations
   */
  const getConversations = async () => {
    const conversationList: Conversation[] = [];

    const service = Api.getMoodleService(config.hostUrl, moodleToken || "");
    const pageInfo: any = await service.coreWebserviceGetSiteInfo({});
    const conversations: any = await service.coreMessageGetConversations({userid: pageInfo.userid}).catch((e) => {
      return conversationList;
    });

    for (const conversation of conversations.conversations) {
      const participants: Participant[] = [];
      for (const user of conversation.members) {
        const newUser: Participant = {
          _id: user.id,
          name: user.fullname,
          avatar: user.profileimageurl
        }
        participants.push(newUser);
      }

      const messages: Message[] = [];

      for (const message of conversation.messages) {
        const newMessage: Message = {
          sentTime: message.timecreated,
          sentbyId: message.useridfrom,
          text: TextCleanup.cleanUpText(message.text)
        }
        messages.push(newMessage);
      }

      const newCourseItem: Conversation = {
        id: conversation.id,
        participants,
        messages
      }
      conversationList.push(newCourseItem);
    }
    return conversationList;
  }

  /**
   * Navigates to selected conversation
   */
  const onConversationPress = (conversation: Conversation) => {
    navigation.navigate("Messenger", {conversationId: conversation.id});
  };

  /**
   * Navigates to a new conversation
   */
  const onNewConversationPress = () => {
    navigation.navigate("NewConversation");
  };

  useEffect(() => {
    setLoading(true);
    getConversations()
      .catch((e) => {
        setLoading(false);
        return Alert.alert(strings.conversationScreenGetError);
      })
      .then((conversationList) => {
        setConversations(conversationList || []);
        setLoading(false);
      });
  }, []);
  
  const listFooter =
    <TouchableOpacity onPress= {() => onNewConversationPress()}>
      <View style={defaultStyles.listItemBase}>
        <StyledIcon style={defaultStyles.taskIcon} name="add" size={46} color="#fff"/>
      </View>
    </TouchableOpacity>

    return (
      <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
        <FlatList
          ListFooterComponent={listFooter}
          style={styles.listContainer}
          data={conversations}
          renderItem={({item}) =>
          <TouchableOpacity onPress= {() => onConversationPress(item)}>
            <View style={defaultStyles.listItemBase}>
              <Image style={defaultStyles.taskIcon} source={{ uri: item.participants[0].avatar }} resizeMode={"contain"}/>
              <View style={defaultStyles.listTextContainer}>
                <Text style={[defaultStyles.listItemText, styles.messageText]}>{item.messages[0].text}</Text>
                <Text style={[defaultStyles.listItemText, styles.messageUser]}>{item.participants[0].name}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          keyExtractor={(item, index) => index.toString()}
        />
      </BasicLayout>
    );
};

export default ConversationsScreen;