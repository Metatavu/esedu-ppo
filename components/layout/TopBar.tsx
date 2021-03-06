import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Text, View, TouchableHighlight } from "react-native";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import strings from "../../localization/strings";
import { NavigationActions, StackActions } from "react-navigation";

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
  navigation?: any
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
        <View style={{height: 50}}>
          <View style={{flex: 1, flexDirection: "row", paddingLeft: 10, paddingRight: 10, alignItems: "center", justifyContent: "space-between"}}>

            {this.props.showMenu &&
              <TouchableHighlight onPress={this.toggleLocale} style={{paddingLeft: 10}}>
                <Text style={{color: this.props.textColor || "#000"}}>{this.props.locale === "fi" ? "In english" : "Suomeksi"}</Text>
              </TouchableHighlight>
            }

            {this.props.showHeader &&
              <Text style={this.props.header &&
                 this.props.header.length > 20 ?
                 { fontSize: 18, color: this.props.textColor || "#000"} : { fontSize: 25, color: this.props.textColor || "#fff"}}>{this.props.header}</Text>
            }

            {this.props.showUser &&
              <TouchableHighlight style={{paddingRight: 10}}>
                <Text style={{color: this.props.textColor || "#000"}}>
                  {this.props.accessToken ? this.props.accessToken.firstName + " " + this.props.accessToken.lastName : ""}
                </Text>
              </TouchableHighlight>
            }

            {this.props.showCancel &&
              <Text onPress={() => this.props.navigation
              .reset([NavigationActions.navigate({routeName: "Main"})], 0)} style={{color: this.props.textColor || "#fff"}}>
                {strings.cancelButtonText}
              </Text>
            }

            {this.props.showLogout &&
              <Text onPress={() => this.logout()} style={{color: this.props.textColor || "#fff"}}>
                {strings.logoutText}
              </Text>
            }
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
