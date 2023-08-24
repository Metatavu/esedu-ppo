import { createStackNavigator, createAppContainer } from "react-navigation";
import React from "react";
import LoginScreen from "./components/screens/LoginScreen";
import MainScreen from "./components/screens/MainScreen";
import { createStore } from "redux";
import { StoreState } from "./types";
import { AppAction } from "./actions";
import { reducer } from "./reducers";
import { Provider } from "react-redux";
import AuthRefresh from "./components/generic/AuthRefresh";
import strings from "./localization/strings";
import QuizScreen from "./components/screens/QuizScreen";
import TopicScreen from "./components/screens/TopicScreen";
import TextContentScreen from "./components/screens/TextContentScreen";
import NewsScreen from "./components/screens/NewsScreen";
import HvpScreen from "./components/screens/HvpScreen";
import CourseSectionScreen from "./components/screens/CourseSectionScreen";
import { MenuProvider } from "react-native-popup-menu";
import MessengerScreen from "./components/screens/MessengerScreen";
import ConversationsScreen from "./components/screens/ConversationsScreen";
import NewConversationScreen from "./components/screens/NewConversationScreen";
import AssignmentScreen from "./components/screens/AssignmentScreen";
import ForumScreen from "./components/screens/ForumScreen";
import RegisterScreen from "./components/screens/RegisterScreen"
import SplashScreen from "react-native-splash-screen";
import { useEffect } from "react"

interface State {
  authenticated: boolean
}
const initalStoreState: StoreState = {
  locale: strings.getLanguage() || "fi"
};

const store = createStore<StoreState, AppAction, any, any>(reducer as any, initalStoreState);

const RootStack = createStackNavigator({
  Main: {
    screen: MainScreen
  },
  Login: { screen: LoginScreen },
  Quiz: { screen: QuizScreen},
  Topic: { screen: TopicScreen},
  TextContent: { screen: TextContentScreen},
  News: { screen: NewsScreen},
  Hvp: { screen: HvpScreen},
  Section: { screen: CourseSectionScreen},
  Conversations: { screen: ConversationsScreen},
  Messenger: { screen: MessengerScreen},
  NewConversation: { screen: NewConversationScreen},
  Assignment: { screen: AssignmentScreen},
  Forum: { screen: ForumScreen},
  Register: { screen: RegisterScreen }
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

export default class App extends React.Component<any, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      authenticated: false
    };
  }

  public render() {
    return (
      <Provider store={store}>
        <MenuProvider>
        <AppContainer />
        <AuthRefresh />
        </MenuProvider>
      </Provider>
    );
  }
}
