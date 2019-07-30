import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text } from "native-base";
import { View } from "react-native";
import { StoreState } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps } from "react-navigation";

/**
 * Component props
 */
export interface Props {
  navigation: any,
  locale: string
};

/**
 * Component state
 */
interface State {
};

/**
 * Component for application main screen
 */
class MainScreen extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Navigation options
   */
  static navigationOptions = (props: HeaderProps) => {
    return ({ 
      headerTitle: <TopBar navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) { 
      this.props.navigation.navigate('Main');
    }
  }

  /**
   * Component render
   */
  public render() {

    return (
      <BasicLayout backgroundColor="#fff">
        <View>
          <Text>Hello World!</Text>
        </View>
      </BasicLayout>
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
    locale: state.locale
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);