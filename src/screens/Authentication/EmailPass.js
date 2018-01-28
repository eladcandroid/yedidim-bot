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
  Form,
  Item,
  Label,
  Input,
  Icon
} from 'native-base'
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    marginRight: 20,
    marginLeft: 20
  },
  header: {
    paddingBottom: 20,
    fontSize: 20,
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  item: {
    flexDirection: 'row-reverse'
  },
  button: {
    paddingTop: 30,
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    alignSelf: 'center'
  },
  error: {
    paddingTop: 40,
    color: 'red',
    alignSelf: 'stretch',
    textAlign: 'center'
  }
})

@observer
class EmailPassAuthenticationScreen extends React.Component {
  state = { phoneNumber: '', id: '' }

  handleAuthentication = async () => {
    trackEvent('Navigation', { page: 'EmailPassAuthentication' })
    this.props.signIn(this.state)
  }

  render() {
    const { authError, isLoading } = this.props
    const { phoneNumber, id } = this.state

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
        {isLoading ? (
          <Content padder>
            <FormattedMessage
              id="Authentication.waiting"
              defaultMessage="Please wait, authenticating..."
            >
              {txt => <IntroText>{txt}</IntroText>}
            </FormattedMessage>
            <ActivityIndicator size="large" />
          </Content>
        ) : (
          <Content>
            {authError && (
              <View>
                <FormattedMessage
                  id="Authentication.error"
                  defaultMessage="An error has occurred, unable to authenticate. Please try again later."
                >
                  {txt => <IntroText>{txt}</IntroText>}
                </FormattedMessage>
                <ErrorText>Error Code: {authError}</ErrorText>
              </View>
            )}
            <FormattedMessage
              id="Authentication.notauthenticated"
              defaultMessage="You are not authenticated yet. Please authenticate to receive events."
            >
              {txt => <IntroText>{txt}</IntroText>}
            </FormattedMessage>
            <Form>
              <Item floatingLabel>
                <Label style={{ textAlign: 'left' }}>Phone</Label>
                <Input
                  value={phoneNumber}
                  onChangeText={value => this.setState({ phoneNumber: value })}
                />
              </Item>
              <Item floatingLabel last>
                <Label style={{ textAlign: 'left' }}>ID</Label>
                <Input
                  value={id}
                  onChangeText={value => this.setState({ id: value })}
                />
              </Item>
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
            </Form>
          </Content>
        )}
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  signIn: stores.authStore.signInWithEmailPass,
  authError: stores.authStore.error,
  isLoading: stores.authStore.isLoading
}))(EmailPassAuthenticationScreen)
