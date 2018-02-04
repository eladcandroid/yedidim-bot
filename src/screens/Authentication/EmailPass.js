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
import { View } from 'react-native'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react/native'
import { FormattedMessage } from 'react-intl'
import { trackEvent } from 'io/analytics'

const IntroText = styled.Text`
  text-align: center;
  font-weight: bold;
  margin: 30px 10px 30px;
  font-size: 16px;
`

const ErrorText = styled.Text`
  text-align: center;
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
`

@observer
class EmailPassAuthenticationScreen extends React.Component {
  state = { phoneNumber: '', id: '' }

  handleAuthentication = async () => {
    trackEvent('Navigation', { page: 'EmailPassAuthentication' })
    this.props.signIn(this.state)
  }

  render() {
    const { authError } = this.props
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
        <Content style={{ flex: 1 }}>
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
          <Form>
            <Item floatingLabel>
              <Label style={{ textAlign: 'left' }}>
                <FormattedMessage
                  id="Authentication.phonenumber"
                  defaultMessage="Phone number"
                >
                  {txt => txt}
                </FormattedMessage>
              </Label>
              <Input
                value={phoneNumber}
                onChangeText={value => this.setState({ phoneNumber: value })}
              />
            </Item>
            <Item floatingLabel>
              <Label style={{ textAlign: 'left' }}>
                <FormattedMessage id="Authentication.id" defaultMessage="ID">
                  {txt => txt}
                </FormattedMessage>
              </Label>
              <Input
                value={id}
                onChangeText={value => this.setState({ id: value })}
              />
            </Item>
          </Form>
        </Content>
        <Button
          style={{ height: 70 }}
          iconLeft
          full
          large
          block
          success
          onPress={this.handleAuthentication}
        >
          <Icon style={{ fontSize: 40 }} name="ios-person" />
          <FormattedMessage
            id="Authentication.button"
            defaultMessage="Authenticate me"
          >
            {txt => <Text>{txt}</Text>}
          </FormattedMessage>
        </Button>
      </Container>
    )
  }
}

export default inject(({ stores }) => ({
  signIn: stores.authStore.signInWithEmailPass,
  authError: stores.authStore.error,
  isLoading: stores.authStore.isLoading
}))(EmailPassAuthenticationScreen)
