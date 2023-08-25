import { createAppContainer } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';

import React from "react";
import LoginScreen from "./components/screens/LoginScreen";
import MainScreen from "./components/screens/MainScreen";
import AuthRefresh from "./components/generic/AuthRefresh";
import strings from "./localization/strings";
import QuizScreen from "./components/screens/QuizScreen";
import TopicScreen from "./components/screens/TopicScreen";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./app/store";
import TextContentScreen from "./components/screens/TextContentScreen";
import NewsScreen from "./components/screens/NewsScreen";
import HvpScreen from "./components/screens/HvpScreen";
import CourseSectionScreen from "./components/screens/CourseSectionScreen";
import ConversationsScreen from "./components/screens/ConversationsScreen";
import MessengerScreen from "./components/screens/MessengerScreen";
import NewConversationScreen from "./components/screens/NewConversationScreen";
import AssignmentScreen from "./components/screens/AssignmentScreen";
import ForumScreen from "./components/screens/ForumScreen";
import RegisterScreen from "./components/screens/RegisterScreen";
import { MenuProvider } from "react-native-popup-menu";
import TopBar from "./components/layout/TopBar";

strings.setLanguage("fi");

const RootStack = createStackNavigator({
  Main: {
    screen: MainScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={false} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Login: { 
    screen: LoginScreen 
  },
  Quiz: { 
    screen: QuizScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Topic: { 
    screen: TopicScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={false} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  TextContent: { 
    screen: TextContentScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  News: { 
    screen: NewsScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Hvp: { 
    screen: HvpScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showCancel={false} showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Section: { 
    screen: CourseSectionScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Conversations: { 
    screen: ConversationsScreen,
    navigationOptions: {
      headerTitle: () => ( 
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true}/>
      )
    }
  },
  Messenger: { 
    screen: MessengerScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  NewConversation: { 
    screen: NewConversationScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Assignment: { 
    screen: AssignmentScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Forum: { 
    screen: ForumScreen,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  },
  Register: { 
    screen: RegisterScreen ,
    navigationOptions: {
      headerTitle: () => (
        <TopBar showCancel={false} showBack={true} navigation={ RootStack.navigationOptions } showHeader={false} showLogout={true} />
      )
    }
  }
}, {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: "#fff",
      borderBottomColor: "#10511E",
      borderBottomWidth: 1,
      height: 100,
      elevation: 0
    }
  },
  initialRouteName: "Login"
});

const AppContainer = createAppContainer(RootStack);

/**
 * App component
 */
const App = () => {
  return (
    <StoreProvider store={store}>
      <MenuProvider>
        <AppContainer />
        <AuthRefresh />
      </MenuProvider>
    </StoreProvider>
  );
};

export default App;