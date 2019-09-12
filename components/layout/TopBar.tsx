import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Text, View, TouchableHighlight, Image, TouchableOpacity } from "react-native";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import strings from "../../localization/strings";
import { NavigationActions, StackActions } from "react-navigation";
import { EseduLogo } from "../../static/icons/index";
import { Icon } from "native-base";

/**
 * Component props
 */
interface Props {
  showLogout?: boolean,
  header?: string,
  showMenu?: boolean,
  showUser?: boolean,
  showHeader?: boolean,
  showCancel?: boolean
  textColor?: string
  accessToken?: AccessToken
  onLocaleUpdate: (locale: string) => void
  onAccessTokenUpdate: (accessToken?: AccessToken) => void
  locale: string,
  navigation?: any,
  showBack: boolean
}

/**
 * Component state
 */
interface State {
}

/**
 * Top bar component
 */
class TopBar extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <View style={{flex: 1}}>
        <View style={{height: 100}}>
          <View style={{flex: 1, flexDirection: "row-reverse", paddingLeft: 10, paddingRight: 10, alignItems: "center", justifyContent: "space-between"}}>
            {this.props.showHeader &&
              <Text style={this.props.header &&
                 this.props.header.length > 20 ?
                 { fontSize: 18, color: this.props.textColor || "#000"} : { fontSize: 25, color: this.props.textColor || "#fff"}}>{this.props.header}</Text>
            }
            {this.props.showCancel &&
              <Text onPress={() => this.props.navigation
              .reset([NavigationActions.navigate({routeName: "Main"})], 0)} style={{color: this.props.textColor || "#fff"}}>
                {strings.cancelButtonText}
              </Text>
            }
            {this.props.showLogout &&
              <Text onPress={() => this.logout()} style={{color: this.props.textColor || "black", padding: 20}}>
                {strings.logoutText}
              </Text>
            }
            {this.props.showBack &&
            <TouchableOpacity style={{padding: 20}} onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" type="MaterialIcons"/>
            </TouchableOpacity>
            }
          </View>
          <View style={{flex: 1, justifyContent: "center", height: 100, width: "100%", position: "absolute", alignItems: "center"}}>
              <Image source={EseduLogo} style={{width: 50, height: 50}}/>
          </View>
        </View>
      </View>
    );
  }

  /**
   * Toggles selected language
   */
  private toggleLocale = () => {
    const currentLocale = strings.getLanguage();
    if (currentLocale === "fi") {
      strings.setLanguage("en");
      this.props.onLocaleUpdate("en");
    } else {
      strings.setLanguage("fi");
      this.props.onLocaleUpdate("fi");
    }
  }

  /**
   * Logout function
   */
  private logout = () => {
    this.props.onAccessTokenUpdate(undefined)
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Login" })]
    });
    this.props.navigation.dispatch(resetAction);
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    accessToken: state.accessToken,
    locale: state.locale
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onLocaleUpdate: (locale: string) => dispatch(actions.localeUpdate(locale)),
    onAccessTokenUpdate: (accessToken?: AccessToken) => dispatch(actions.accessTokenUpdate(accessToken))
   };
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
