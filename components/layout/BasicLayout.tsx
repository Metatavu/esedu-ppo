import React from "react";
import { Container, Content, Footer, Spinner } from "native-base";
import { StyleSheet, View, ImageBackground } from "react-native";

export interface Props {
  backgroundColor: string,
  backgroundImage?: any
  footerContent?: JSX.Element
  loading?: boolean
}

interface State {

}

export default class BasicLayout extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {

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
      <Container style={styles.container}>
        <ImageBackground source={this.props.backgroundImage} style={{width: '100%', height: '100%'}}>
          <Content>
            {this.props.children}
          </Content>
          {this.props.footerContent && 
            <Footer>
              {this.props.footerContent}
            </Footer>
          }
        </ImageBackground>
      </Container>
    ) : (
      <Container style={styles.container}>
        <Content>
          {this.props.children}
        </Content>
        {this.props.footerContent && 
          <Footer>
            {this.props.footerContent}
          </Footer>
        }
      </Container>
    );

    return (
      <View style={{width: "100%", height: "100%"}}>
        {content}
      </View>
    );
  }
}
