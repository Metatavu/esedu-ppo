import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { AccessToken, StoreState } from "../../types";
import * as actions from "../../actions";
import { WebView, NavState, Alert, View, StyleSheet, Text, TextInput, Button } from "react-native";
import Api, { MoodleService, EnrolSelfServiceEnrolUserReponse } from "moodle-ws-client";
import { HOST_URL, INFOPAGE_ID, COURSE_IDS } from "react-native-dotenv";
import strings from "../../localization/strings";
import { HeaderProps, ScrollView } from "react-navigation";
import TopBar from "../layout/TopBar";
import defaultStyles from "../../styles/default-styles";
import BasicLayout from "../layout/BasicLayout";

/**
 * Component props
 */

 interface Props {
  navigation: any,
  activityId?: number,
  accessToken?: AccessToken,
  moodleToken?: string,
  locale?: string,
  };

/**
 * Component state
 */

interface State {
  loading: boolean,
  error: boolean,
  isLoggedin: boolean,
  hvpUrl?: string,
  regLogin: string,
  regPassword: string
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

/**
 * Hvp screen component
 */
class RegisterScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      isLoggedin: false,
      regLogin: "",
      regPassword: ""
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerLeft: null,
      headerTitle: <TopBar showCancel={false} showBack={true} navigation={props.navigation} showMenu={true}
        showHeader={false} showLogout={true} showUser={true} />
    });
  };

// 

  /** 
   * Component render method
   */
  public render() {
    return (
      <BasicLayout navigation={this.props.navigation} backgroundColor="#fff" loading={false}>
        <Text style={defaultStyles.screenHeader}>Anna kurssin avain ja salasana</Text>
        <View style={defaultStyles.listContainer}>
          <TextInput secureTextEntry={true} style={styles.listItemBase} placeholder="Salasana"  onChangeText={(text) =>
            this.setState({regPassword: text})}/>
          <View style={[defaultStyles.listTextContainer, {alignItems: "center"}]}>
            <Button color={"#88B620"} title={"Rekisteröidy"} onPress={() => this.register()}></Button>
          </View>
        </View>
      </BasicLayout>
    );
  }

  /**
   * Component did mount lifecycle event
   */
  public async componentDidMount() {
    this.setState({loading: true});
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Register");
    }
  }

  private async register() {
    const pass = this.state.regPassword;

    const courseIds = COURSE_IDS.split(",").map((x: string) => {
      return parseInt(x, 10);
    });
    const res = await this.tryToRegister(courseIds, pass);
    if (res) {
      Alert.alert("Rekisteröinti onnistui", "Käyttäjä on rekisteröity PPO kurssille.");
      this.props.navigation.navigate("Main");
    } else {
      Alert.alert("Rekisteröinti epäonnistui", "Tarkista että kurssiavain on kirjoitettu oikein.");
    }
  }

  private async tryToRegister(courseIds: number[], password: string): Promise<boolean> {
    const enrolService = Api.getEnrolSelfService(HOST_URL, this.props.moodleToken || "");
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
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    locale: state.locale,
    moodleToken: state.moodleToken,
    activityId: state.selectedActivityId
  };
}

/**
 * Redux mapper for mapping component dispatches
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);
