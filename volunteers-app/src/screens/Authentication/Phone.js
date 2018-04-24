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
  Right,
  Icon
} from 'native-base'
import { View, ActivityIndicator, Alert } from 'react-native'
import styled from 'styled-components/native'
import { AuthSession } from 'expo'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage } from 'react-intl'
import { trackEvent } from 'io/analytics'
import { environment, hostingDomain } from 'config'

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
class PhoneAuthenticationScreen extends React.Component {
  handleAuthentication = async () => {
    trackEvent('Navigation', { page: 'AuthenticationWebView' })

    const redirectUrl = AuthSession.getRedirectUrl()
    const { type, params } = await AuthSession.startAsync({
      authUrl:
        `https://${hostingDomain()}.firebaseapp.com/?` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `firebaseEnv=${encodeURIComponent(environment())}&` +
        `&language=he`
    })

    trackEvent('Navigation', { page: 'BackFromAuthenticationWebView' })

    if (type === 'success') {
      const { verificationId, code } = params
      this.props.signIn({ verificationId, code }) // No redirection is needed, auth state will change and home will be rendered
      // .catch(errorThrown => this.setState({ error: errorThrown }))
    } else {
      Alert.alert(
        'Authentication Failed',
        'Unable to authenticate, please try again'
      )
    }
  }

  render() {
    const { authError } = this.props

    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <FormattedMessage
              id="Authentication.title"
              defaultMessage="Authentication"
            >
              {txt => <Title>{txt}</Title>}
            </FormattedMessage>
          </Body>
          <Right />
        </Header>
        <Content>
          {authError ? (
            <View>
              <FormattedMessage
                id="Authentication.error"
                defaultMessage="An error has occurred, unable to authenticate. Please try again later."
              >
                {txt => <IntroText>{txt}</IntroText>}
              </FormattedMessage>
              <ErrorText>Error Code: {authError}</ErrorText>
            </View>
          ) : (
            <FormattedMessage
              id="Authentication.notauthenticated"
              defaultMessage="You are not authenticated yet. Please authenticate to receive events."
            >
              {txt => <IntroText>{txt}</IntroText>}
            </FormattedMessage>
          )}
          <ButtonsView>
            <StyledButton
              iconLeft
              full
              large
              block
              onPress={this.handleAuthentication}
            >
              <Icon style={{ fontSize: 40 }} name="ios-person" />
              <FormattedMessage
                id="Authentication.button"
                defaultMessage="Authenticate me"
              >
                {txt => <Text>{txt}</Text>}
              </FormattedMessage>
            </StyledButton>
          </ButtonsView>
        </Content>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  signIn: stores.authStore.signInWithPhone,
  authError: stores.authStore.error,
  isLoading: stores.authStore.isLoading
}))(PhoneAuthenticationScreen)
