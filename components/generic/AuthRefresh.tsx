import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";

/**
 * Component props
 */
interface Props {
  accessToken?: AccessToken,
  onAccessTokenUpdate: (accessToken: AccessToken) => void
};

/**
 * Component state
 */
interface State {};

/**
 * Component for keeping authentication token fresh
 */
class AuthRefresh extends React.Component<Props, State> {

  private timer?: any;

  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      eventData: { },
    };
  }

  /**
   * Component did mount life-cycle event
   */
  public componentDidMount() {
    this.timer = setInterval(async () => {
      if (!this.props.accessToken) {
        return;
      }
      /*
        TODO: Implement authentication
        if (!Auth.isTokenValid(this.props.accessToken)) {
        const accessToken = await Auth.refreshToken(this.props.accessToken);
        if (accessToken) {
          this.props.onAccessTokenUpdate(accessToken);
        }
      }*/
    }, 30000);
  }

  /**
   * Component will unmount life-cycle event
   */
  public componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Component render method
   */
  public render() {
    return null;
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
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onAccessTokenUpdate: (accessToken: AccessToken) => dispatch(actions.accessTokenUpdate(accessToken)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthRefresh);
