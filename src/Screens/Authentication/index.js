import React from 'react'
import {
  Button,
  Text,
  Container,
  Body,
  Content,
  Header,
  Title,
  Left,
  Right
} from 'native-base'
import { View, ActivityIndicator } from 'react-native'
import styled from 'styled-components/native'
import { AuthSession } from 'expo'
import { inject, observer } from 'mobx-react/native'

const IntroText = styled.Text`
  text-align: center;
  font-weight: bold;
  margin: 30px 10px 30px;
  font-size: 16px;
`

const ButtonsView = styled.View`
  flex-direction: row;
  margin-top: 40px;
`

const StyledButton = styled(Button)`
  flex-grow: 1;
  align-content: center;
  justify-content: center;
  margin: 0 5px;
`

const ErrorText = styled.Text`
  text-align: center;
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
`

@observer
class AuthenticationScreen extends React.Component {
  handleAuthentication = async () => {
    const redirectUrl = AuthSession.getRedirectUrl()
    const result = await AuthSession.startAsync({
      authUrl:
        `https://yedidim-sandbox-2.firebaseapp.com/?` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&language=he`
    })

    const { error, verificationId, code } = result.params

    if (!error && verificationId && code) {
      this.props.signIn({ verificationId, code }) // No redirection is needed, auth state will change and home will be rendered
      // .catch(errorThrown => this.setState({ error: errorThrown }))
    }
  }

  render() {
    const { authError, isAuthenticating } = this.props

    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>Authentication</Title>
          </Body>
          <Right />
        </Header>
        {isAuthenticating ? (
          <Content padder>
            <IntroText>Please wait, authenticating...</IntroText>
            <ActivityIndicator size="large" />
          </Content>
        ) : (
          <Content padder>
            {authError ? (
              <View>
                <IntroText>
                  An error has occurred, unable to authenticate. Please try
                  again later.
                </IntroText>
                <ErrorText>Code: {authError.code}</ErrorText>
                <ErrorText>Message: {authError.message}</ErrorText>
              </View>
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
        )}
      </Container>
    )
  }
}

export default inject(({ Authentication }) => ({
  signIn: Authentication.signIn,
  authError: Authentication.authError,
  isAuthenticating: Authentication.isAuthenticating
}))(AuthenticationScreen)
