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

strings.setLanguage("fi");

const RootStack = createStackNavigator({
  Main: MainScreen,
  Login: LoginScreen,
  Quiz: QuizScreen,
  Topic: TopicScreen
}, {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: "#fff",
      borderBottomColor: "black",
      borderBottomWidth: 2
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
      <AppContainer />
      <AuthRefresh />
    </StoreProvider>
  );
};

export default App;