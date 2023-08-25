import React from "react";
import { Box, HStack, Spinner, VStack } from "native-base";
import { StyleSheet, View, ImageBackground } from "react-native";
import FooterBar from "./FooterBar";
import { NavigationStackProp } from "react-navigation-stack";

/**
 * Component props
 */
interface Props {
  backgroundColor: string,
  backgroundImage?: any
  footerContent?: JSX.Element
  loading?: boolean
  children?: JSX.Element | JSX.Element[] | null;
  navigation: NavigationStackProp;
}

/**
 * Component state
 */
interface State {

}

/**
 * Basic layout component
 */
export default class BasicLayout extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props 
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render() {
    if (this.props.loading) {
      return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <Spinner color="green" />
        </View>
      );
    }

    const styles = StyleSheet.create({
      container: {
        backgroundColor: this.props.backgroundColor,
        flex: 1
      },
      bottom: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 0,
        position: "relative"
      },
      content: {
        marginTop: 0,
        marginBottom: 70
      }
    });

    const content = this.props.backgroundImage ? (
      <Box style={styles.container}>
        <ImageBackground source={this.props.backgroundImage} style={{width: "100%", height: "100%", flex: 1}}>
          <VStack flex={1}>
            {this.props.children}
          </VStack>
          <HStack>
            <FooterBar navigation={this.props.navigation} />
          </HStack>
        </ImageBackground>
      </Box>
    ) : (
      <Box style={styles.container}>
        <View style={[StyleSheet.absoluteFill, styles.content]}>
          {this.props.children}
        </View>
        <View style={styles.bottom}>
          <FooterBar navigation={this.props.navigation}/>
        </View>
      </Box>
    );

    return (
      <View style={{flex: 1, width: "100%", height: "100%"}}>
        {content}
      </View>
    );
  }
}
