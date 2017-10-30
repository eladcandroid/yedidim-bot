import React from "react";
import {
  Button,
  Text,
  Container,
  Card,
  CardItem,
  Body,
  Content,
  Header,
  Title,
  Left,
  Icon,
  Right,
  Form,
  Item,
  Input,
  Label
} from "native-base";
import { View, WebView } from "react-native";
import styled from "styled-components/native";
import { signIn, signOut } from "../../api";
import { AuthSession } from "expo";

const IntroText = styled.Text`
  text-align: center;
  font-weight: bold;
  margin: 30px 10px 30px;
  font-size: 16px;
`;

const ButtonsView = styled.View`
  flex-direction: row;
  margin-top: 40px;
`;

const StyledButton = styled(Button)`
  flex-grow: 1;
  align-content: center;
  justify-content: center;
  margin: 0 5px;
`;

export default class AuthenticationScreen extends React.Component {
  state = {
    user: null
  };

  handleAuthentication = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      authUrl:
        `https://yedidim-sandbox-2.firebaseapp.com/?` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&language=he`
    });

    const { error, verificationId, code } = result.params;

    if (!error && verificationId && code) {
      signIn(verificationId, code).then(user => this.setState({ user }));
    }
  };

  render() {
    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>Authentication</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          {this.state.user ? (
            <Text>{JSON.stringify(this.state.user)}</Text>
          ) : (
            <IntroText>
              You are not authenticated yet. Please authenticate to receive
              events.
            </IntroText>
          )}
          <ButtonsView>
            <StyledButton success onPress={this.handleAuthentication}>
              <Text>Authenticate me</Text>
            </StyledButton>
          </ButtonsView>
        </Content>
      </Container>
    );
  }
}
