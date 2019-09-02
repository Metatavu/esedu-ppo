import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Text, View, TouchableHighlight, StyleSheet } from "react-native";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import strings from "../../localization/strings";
import { NavigationActions, StackActions } from "react-navigation";
import { Container, Header, Content, Footer, FooterTab, Button, Icon, Badge } from "native-base";
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

const styles = StyleSheet.create({
  footerIcon: {
    color: "#88B620",
    fontSize: 32
  }
})
/**
 * Top bar component
 */
class FooterBar extends React.Component<Props, State> {

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
      <View style={{height: 70}}>
        <Footer style={{height: 70}}>
          <FooterTab style={{height: 70, backgroundColor: "#fff", borderTopColor: "#53B02B", borderTopWidth: 1.5}}>
            <Button onPress={() => this.props.navigation.navigate("Main")} vertical active={true} style={{backgroundColor: "white"}}>
              <Icon type="AntDesign" style={styles.footerIcon}  name="home" />
              <Text>Etusivu</Text>
            </Button>
            <Button vertical>
              <Icon type="FontAwesome" style={styles.footerIcon} name="newspaper-o" />
              <Text>Uutiset</Text>
            </Button>
            <Button vertical>
              <Icon type="MaterialCommunityIcons" style={styles.footerIcon}  name="information-outline" />
              <Text>Ohjeet</Text>
            </Button>
            <Button vertical>
              <Icon type="MaterialCommunityIcons" style={styles.footerIcon}  name="check-circle-outline" />
              <Text>Tavoitteet</Text>
            </Button>
            <Button vertical>
              <Icon type="MaterialIcons" style={styles.footerIcon} name="chat-bubble-outline" />
              <Text>Keskustele</Text>
            </Button>
          </FooterTab>
        </Footer>
      </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(FooterBar);
