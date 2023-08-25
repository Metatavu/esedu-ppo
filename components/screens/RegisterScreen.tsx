import React from "react";
import { Alert, View, StyleSheet, Text, TextInput, Button } from "react-native";
import Api from "moodle-ws-client";
import defaultStyles from "../../styles/default-styles";
import BasicLayout from "../layout/BasicLayout";
import { NavigationStackProp } from "react-navigation-stack";
import config from "../../app/config";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken } from "../../features/common-slice";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
};

const styles = StyleSheet.create({
  textField : {
    alignContent: "center"
  },
  container : {
    padding: 50
  },
  listItemBase: {
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#53B02B",
    flexDirection: "row",
    alignContent: "flex-start"
  }
});

const RegisterScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isLoggedin, setIsLoggedin] = React.useState(false);
  const [regLogin, setRegLogin] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [hvpUrl, setHvpUrl] = React.useState("");

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  const register = async () => {
    const pass = regPassword;

    const res = await tryToRegister(config.courseIds, pass);
    if (res) {
      Alert.alert("Rekisteröinti onnistui", "Käyttäjä on rekisteröity PPO kurssille.");
      navigation.navigate("Main");
    } else {
      Alert.alert("Rekisteröinti epäonnistui", "Tarkista että kurssiavain on kirjoitettu oikein.");
    }
  }

  const tryToRegister = async (courseIds: number[], password: string): Promise<boolean> => {
    const enrolService = Api.getEnrolSelfService(config.hostUrl, moodleToken || "");
    for (const courseId of courseIds) {
      const res: any = await enrolService.enrolUser({courseid: courseId, password}).catch((e) => {
        return false
      });
      if (!(res.status && res.status != null && res.status == true)) {
        return false
      }
    }
    return true
  }

  return (
    <BasicLayout navigation={navigation} backgroundColor="#fff" loading={false}>
      <Text style={defaultStyles.screenHeader}>Anna kurssin avain ja salasana</Text>
      <View style={defaultStyles.listContainer}>
        <TextInput secureTextEntry={true} style={styles.listItemBase} placeholder="Salasana"  onChangeText={(text) => setRegPassword(text)} />
        <View style={[defaultStyles.listTextContainer, {alignItems: "center"}]}>
          <Button color={"#88B620"} title={"Rekisteröidy"} onPress={() => register()}></Button>
        </View>
      </View>
    </BasicLayout>
  );
};

export default RegisterScreen;
