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
import { ActivityIndicator } from 'react-native'
import styled from 'styled-components/native'
import { AuthSession } from 'expo'
import { signIn } from 'API'

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

export default class AuthenticationScreen extends React.Component {
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
      signIn(verificationId, code)
        .then(() => {
          /* Redirect to Home Screen */
        })
        .catch(errorThrown => this.setState({ error: errorThrown }))
    }
  }

  render() {
    const { loading, error } = this.state

    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>Authentication</Title>
          </Body>
          <Right />
        </Header>
        {loading ? (
          <Content padder>
            <ActivityIndicator />
            <Text> Please wait, loading... </Text>
          </Content>
        ) : (
          <Content padder>
            {error ? (
              <IntroText>
                An error has occurred, unable to autheticate. Please Try again
                later.
                {JSON.stringify(error)}
              </IntroText>
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
