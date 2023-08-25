import React, { useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import { FlatList } from "react-navigation";
import Api from "moodle-ws-client"
import BasicLayout from "../layout/BasicLayout";
import defaultStyles from "../../styles/default-styles";
import { Participant } from "../../types";
import { TextInput } from "react-native-gesture-handler";
import strings from "../../localization/strings";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken } from "../../features/common-slice";
import config from "../../app/config";
import { Icon } from "native-base";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "#000",
    margin: 15,
    marginBottom: 0,
    padding: 10,
    alignItems: "center"
  },
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
    textAlignVertical: "center",
    textAlign: "left"
  },
  messageText: {
    textAlignVertical: "top",
    fontSize: 18,
    width: 275,
    height: 30,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "white"
  },
  iconBackgroundAdjust: {
    marginTop: 25
  },
  activityText: {
    color: "black",
    paddingLeft: 10
  },
  messageContainer: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 5
  }
});

/**
 * Component for application MessageScreen
 */
const NewConversationScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number>(-1);
  const [searchResults, setSearchResults] = React.useState<Participant[]>([]);

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
        Alert.alert(strings.newConversationScreenError);
      })
      .then((pageInfo) => {
        const currentUserId = (pageInfo as any)?.userid;
        if (currentUserId) {
          setCurrentUserId(currentUserId);
        }
      });
  }, []);

  /**
   * Starts a new conversation with the selected user and navigates to the messenger.
   * 
   * @param item User to start a new conversation with 
   */
  const onNewConversationSelect = async (item: Participant) => {
    const service = Api.getMoodleService(config.hostUrl, moodleToken);

    const conversation: any = await service.coreMessageGetConversationBetweenUsers({
      userid: currentUserId, otheruserid: item._id, includecontactrequests: true, includeprivacyinfo: true
    }).catch((e) => {
      Alert.alert(strings.newConversationScreenConversationStartError);
    });

    if (conversation) {
      return navigation.navigate("Messenger", {conversationId: conversation.id});
    }

    return navigation.navigate("Messenger", {userToMessageId: item._id});
  }

  const onChangeText = async (txt: string) => {
    const service = Api.getMoodleService(config.hostUrl, moodleToken);

    const searchResult: any = await service.coreMessageMessageSearchUsers({userid: currentUserId, search: txt}).catch((e) => {});
    if (searchResult === undefined) {
      return;
    }

    const allResults = searchResult.contacts.concat(searchResult.noncontacts);

    const foundUsers = [];

    for (const user of allResults) {
      const newUser: Participant = {
        _id: user.id,
        name: user.fullname,
        avatar: user.profileimageurl
      }
      foundUsers.push(newUser);
    }

    setSearchResults(foundUsers);
  }

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <View style={styles.searchContainer}>
        <TextInput
          style={{flex: 1}}
          onChangeText={(text) => onChangeText(text)}
        />
        <Icon name="search" color="gray" size={25}/>
      </View>
      <FlatList
      style={defaultStyles.listContainer}
      data={searchResults}
      renderItem={({item}) =>
      <TouchableOpacity onPress= {() => onNewConversationSelect(item)}>
        <View style={defaultStyles.listItemBase}>
          <Image style={defaultStyles.taskIcon} source={{uri: item.avatar}} resizeMode={"contain"}/>
          <View style={defaultStyles.listTextContainer}>
            <Text style={defaultStyles.listItemText}>{item.name}</Text>
          </View>
        </View>
      </TouchableOpacity>}
      keyExtractor={(item, index) => index.toString()}
    />
    </BasicLayout>
  );
};

export default NewConversationScreen;