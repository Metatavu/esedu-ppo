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
import InfoScreen from "./components/screens/InfoScreen";
import HvpScreen from "./components/screens/HvpScreen";
import CourseSectionScreen from "./components/screens/CourseSectionScreen";

interface State {
  authenticated: boolean
}
const initalStoreState: StoreState = {
  locale: strings.getLanguage()
};

const store = createStore<StoreState, AppAction, any, any>(reducer as any, initalStoreState);

const RootStack = createStackNavigator({
  Main: MainScreen,
  Login: LoginScreen,
  Quiz: QuizScreen,
  Topic: TopicScreen,
  TextContent: TextContentScreen,
  News: NewsScreen,
  //Info: InfoScreen,
  Hvp: HvpScreen,
  Section: CourseSectionScreen
}, {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: "#fff",
      borderBottomColor: "#53B02B",
      borderBottomWidth: 2,
      height: 100
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
        <AppContainer />
        <AuthRefresh />
      </Provider>
    );
  }
}
