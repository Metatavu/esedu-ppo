import React, { Dispatch } from "react";
import { connect } from "react-redux";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, Form, Item, Input, Label, Button, View } from 'native-base';
import { AccessToken, StoreState } from "../../types";
import * as actions from "../../actions";
import strings from "../../localization/strings";

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
  navigation: any,
  accessToken?: AccessToken,
  onAccessTokenUpdate: (accessToken: AccessToken) => void,
  locale?:string
};

/**
 * Component state
 */
interface State {
  loginDetails: LoginDetails,
  loading: boolean
  error:boolean
};

/**
 * Login screen component
 */
class LoginScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loginDetails: {},
      loading: false,
      error: false
    };
  }

  /**
   * Navigation options
   */
  static navigationOptions = {
    headerTitle: <TopBar showMenu={true} />
  };

  /**
   * Component did mount life-cycle event
   */
  async componentDidMount() {
    const accessToken = this.props.accessToken;
    if (accessToken) {
      this.props.navigation.navigate("Main");
    }
  }
    /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) { 
      this.props.navigation.navigate('Login');
    }
  }

  /**
   * Updates login details when values change
   */
  updateData = (key: "username" | "password" | "realm", value: string) => {
    const loginDetails: LoginDetails = this.state.loginDetails;
    loginDetails[key] = value;
    this.setState({
      loginDetails: loginDetails
    });
  }

  /**
   * Tries to login
   */
  sendLogin = (event?: any) => {
    const loginData = this.state.loginDetails;
    this.setState({loading: true});
  }
  
  /**
   * Component render method
   */
  render() {
    return (
      <BasicLayout loading={this.state.loading} backgroundColor="#fff">
        <Form>
          <Item>
            <Label>{strings.loginScreenUsernameLabel}</Label>
            <Input onChangeText={(text: string) => this.updateData("username", text)} />
          </Item>
          <Item>
            <Label>{strings.loginScreenPasswordLabel}</Label>
            <Input secureTextEntry onChangeText={(text: string) => this.updateData("password", text)} />
          </Item>
        </Form>
        {this.state.error ?
          <View>
              <Text>{strings.loginScreenErrorDialogTitle + ": " +strings.loginScreenWrongInfo}</Text>
          </View> 
        :
          null
        }
        <Button onPress={() => this.sendLogin()} block><Text>{strings.loginScreenLoginButton}</Text></Button>
      </BasicLayout>
    );
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
    accessToken: state.accessToken
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onAccessTokenUpdate: (accessToken: AccessToken) => dispatch(actions.accessTokenUpdate(accessToken))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
