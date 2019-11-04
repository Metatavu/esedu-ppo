import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Text, View, TouchableHighlight, StyleSheet, Image } from "react-native";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import strings from "../../localization/strings";
import { Footer, FooterTab, Button, Icon } from "native-base";
import { INFOPAGE_ID, GOALSPAGE_ID } from "react-native-dotenv";
import * as Icons from "../../static/icons/index";

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
  navigation: any
}

/**
 * Component state
 */
interface State {
}

const styles = StyleSheet.create({
  footerIcon: {
    height: 22,
    marginBottom: 5
  },
  footerText: {
    color: "#10511E"
  }
})

/**
 * Footer bar component
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
    const footerButtons: Array<{text: string, image: any, screen: string, pageId?: string}> = [{
      text: strings.frontPageText,
      image: this.props.navigation.state.routeName === "Main" ? Icons.EtusivuActiveIcon : Icons.EtusivuIcon,
      screen: "Main"
    },
    {
      text: strings.newsText,
      image: this.props.navigation.state.routeName === "News" ? Icons.UutisetActiveIcon : Icons.UutisetIcon,
      screen: "News"
    },
    {
      text: strings.instructionsText,
      image: this.props.navigation.state.routeName === "TextContent" && this.props.navigation.getParam("pageId").toString() === INFOPAGE_ID ?
      Icons.OhjeetActiveIcon : Icons.OhjeetIcon,
      screen: "TextContent",
      pageId: INFOPAGE_ID
    },
    {
      text: strings.goalsText,
      image: this.props.navigation.state.routeName === "TextContent" && this.props.navigation.getParam("pageId").toString() === GOALSPAGE_ID ?
      Icons.TavoitteetActiveIcon : Icons.TavoitteetIcon,
      screen: "TextContent",
      pageId: GOALSPAGE_ID
    },
    {
      text: strings.chatText,
      image: this.props.navigation.state.routeName === "Conversations" ? Icons.KeskusteleActiveIcon : Icons.KeskusteleIcon,
      screen: "Conversations"
    }];

    const footerLayout = footerButtons.map((button, index) => {
      return(
      <Button onPress={() => this.props.navigation.push(button.screen, {pageId: button.pageId})} vertical active={true} style={{backgroundColor: "white"}}>
        <Image source={button.image} resizeMode={"contain"} style={styles.footerIcon}/>
        <Text style={styles.footerText}>{button.text}</Text>
      </Button>
      )
    });

    return (
      <View style={{height: 70}}>
        <Footer style={{height: 70, backgroundColor: "fff"}}>
          <FooterTab style={{height: 70, backgroundColor: "#fff", borderTopColor: "#10511E", borderTopWidth: 1}}>
            {footerLayout}
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
