import React, { useEffect } from "react";
import { Alert } from "react-native";
import Api from "moodle-ws-client"
import BasicLayout from "../layout/BasicLayout";
import TextCleanup from "../../utils/TextCleanup";
import { Participant } from "../../types";
import { GiftedChat } from "react-native-gifted-chat";
import strings from "../../localization/strings";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppSelector, useInterval } from "../../app/hooks";
import { selectMoodleToken } from "../../features/common-slice";
import config from "../../app/config";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

interface GiftedChatMessage {
  _id: number,
  text: string,
  createdAt: Date,
  user: Participant
}

/**
 * Component for application MessageScreen
 */
const MessengerScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [messages, setMessages] = React.useState<GiftedChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<number>();
  const [conversationId, setConversationId] = React.useState<number>(navigation.getParam("conversationId"));

  const userToMessageId: number | undefined = navigation.getParam("userToMessageId");

  if (!conversationId) {
    navigation.navigate("Conversations");
    return null;
  }

  if (!userToMessageId) {
    navigation.navigate("Conversations");
    return null;
  }

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  useEffect(() => {
    setLoading(true);
    
    const service = Api.getMoodleService(config.hostUrl, moodleToken);

    service.coreWebserviceGetSiteInfo({})
      .catch((e) => {
        Alert.alert(strings.messageScreenError)
        setError(true);
        setLoading(false);
      })
      .then((pageInfo) => {
        const currentUserId = (pageInfo as any)?.userid;
        if (currentUserId) {
          setCurrentUserId(currentUserId);
        }

        updateMessages(currentUserId)
          .catch((e) => {
            Alert.alert(strings.messageScreenError);
            setError(true);
            setLoading(false);
          })
          .then((messages) => {
            setMessages(messages || []);
            setLoading(false);
          });
          
      });
  }, []);

  /**
   * Updates messages from moodle API
   * 
   * @param userid current user
   * @param conversationid conversation id
   */
  const updateMessages = async (userid: number) => {
    const service = Api.getMoodleService(config.hostUrl, moodleToken);

    const messages: GiftedChatMessage[] = [];

    if (!conversationId) {
      return messages;
    }

    const conversation: any = await service.coreMessageGetConversation({
      userid: userid, 
      conversationid: conversationId, 
      includecontactrequests: false, 
      includeprivacyinfo: false
    }).catch((e) => {
      Alert.alert(strings.messageScreenError);
    });

    for (const message of conversation.messages) {
      let sentBy;
      for (const user of conversation.members) {
        if (user.id === message.useridfrom) {
          sentBy = user;
        }
      }

      const newMessage: GiftedChatMessage = {
        createdAt: message.timecreated,
        _id: message.id,
        text: TextCleanup.cleanUpText(message.text),
        user: {
          _id: message.useridfrom,
          avatar: sentBy !== undefined ? sentBy.profileimageurlsmall : "",
          name: sentBy !== undefined ? sentBy.fullname : ""
        }
      }
      messages.push(newMessage)
    }

    return messages;
  }

  useInterval(() => {
    if (!currentUserId) {
      return;
    }

    updateMessages(currentUserId)
      .catch((e) => {
        Alert.alert(strings.messageScreenError);
        setError(true);
      })
      .catch((messages) => {
        setMessages(messages || []);
      });
  }, 2000);

  /**
   * Message send function
   */
  const onSend = async (message: any) => {
    if (!currentUserId) {
      return;
    }

    const service = Api.getMoodleService(config.hostUrl, moodleToken);

    if (!conversationId && userToMessageId) {
      const messageDetails = { messages: [{ touserid: userToMessageId, text: message[0].text, textformat: 0, clientmsgid: ""}]};

      const sentMessageResponse: any = await service.coreMessageSendInstantMessages(messageDetails);
      setConversationId(sentMessageResponse[0].conversationid);
    } else if (conversationId) {

      const messageDetails = {conversationid: conversationId, messages: [{text: message[0].text, textformat: 0}]}

      await service.coreMessageSendMessagesToConversation(messageDetails);
    }

    const messages = await updateMessages(currentUserId);
    setMessages(messages);
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUserId
      }}
    />
    </BasicLayout>
  );
};

export default MessengerScreen;