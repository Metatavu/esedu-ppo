import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import strings from "../../localization/strings";
import { Box, Button, VStack } from "native-base";
import * as Icons from "../../static/icons/index";
import { NavigationStackProp } from "react-navigation-stack";

const { INFOPAGE_ID, GOALSPAGE_ID } = process.env;

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  footerIcon: {
    height: 22,
    marginBottom: 5
  },
  footerText: {
    color: "#10511E",
    fontSize: 12
  }
})

/**
 * Footer bar component
 */
const FooterBar = ({ navigation }: Props) => {
  const footerButtons: Array<{text: string, image: any, screen: string, pageId?: string}> = [{
    text: strings.frontPageText,
    image: navigation.state.routeName === "Main" ? Icons.EtusivuActiveIcon : Icons.EtusivuIcon,
    screen: "Main"
  },
  {
    text: strings.newsText,
    image: navigation.state.routeName === "News" ? Icons.UutisetActiveIcon : Icons.UutisetIcon,
    screen: "News"
  },
  {
    text: strings.instructionsText,
    image: navigation.state.routeName === "TextContent" && navigation.getParam("pageId") === INFOPAGE_ID ?
    Icons.OhjeetActiveIcon : Icons.OhjeetIcon,
    screen: "TextContent",
    pageId: INFOPAGE_ID
  },
  {
    text: strings.goalsText,
    image: navigation.state.routeName === "TextContent" && navigation.getParam("pageId") === GOALSPAGE_ID ?
    Icons.TavoitteetActiveIcon : Icons.TavoitteetIcon,
    screen: "TextContent",
    pageId: GOALSPAGE_ID
  }];

  const footerLayout = footerButtons.map((button, index) => {
    return (
      <Button 
        key={index} 
        onPress={() => navigation.replace(button.screen, {pageId: button.pageId})}
        variant="outline"
        colorScheme="white"
      >
        <VStack space={2} alignItems="center">
          <Image 
            source={button.image} 
            alt="Button Image" 
            resizeMode="contain"
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>{button.text}</Text>
        </VStack>
      </Button>
    )
  });

  return (
    <View style={{height: 70}}>
      <Box 
        bg="white" 
        height={70}
      >
        <Box 
          height={70} 
          bg="#fff" 
          borderTopWidth={1} 
          borderTopColor="#10511E"
        >
          {footerLayout}
        </Box>
      </Box>
    </View>
  );
};

export default FooterBar;
