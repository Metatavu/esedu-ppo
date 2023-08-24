/**
 * Compoent props
 */
interface Props {
  children?: JSX.Element;
};

/**
 * Component for refreshing authentication
 */
const AuthRefresh = ({ children }: Props) => {
  /*
    TODO: Implement authentication
       
    if (!Auth.isTokenValid(this.props.accessToken)) {
    const accessToken = await Auth.refreshToken(this.props.accessToken);
    if (accessToken) {
      this.props.onAccessTokenUpdate(accessToken);
    }
  }*/

  return children || null;
}

export default AuthRefresh;