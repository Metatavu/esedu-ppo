import React from "react";
import { Box, HStack, Spinner, VStack } from "native-base";
import { StyleSheet, View, ImageBackground } from "react-native";

/**
 * Component props
 */
interface Props {
  backgroundColor: string,
  backgroundImage?: any
  footerContent?: JSX.Element
  loading?: boolean
  children?: JSX.Element | JSX.Element[];
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
        backgroundColor: this.props.backgroundColor
      }
    });

    const content = this.props.backgroundImage ? (
      <Box style={styles.container}>
        <ImageBackground source={this.props.backgroundImage} style={{width: "100%", height: "100%"}}>
          <VStack flex={1}>
            {this.props.children}
          </VStack>
          <HStack>
            {this.props.footerContent ? this.props.footerContent : null}
        </HStack>
        </ImageBackground>
      </Box>
    ) : (
      <Box style={styles.container}>
        <VStack flex={1}>
            {this.props.children}
        </VStack>
        <HStack>
            {this.props.footerContent ? this.props.footerContent : null}
        </HStack>
      </Box>
    );

    return (
      <View style={{width: "100%", height: "100%"}}>
        {content}
      </View>
    );
  }
}
