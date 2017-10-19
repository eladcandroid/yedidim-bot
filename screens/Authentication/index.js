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
import { View } from "react-native";
import styled from "styled-components/native";

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
  constructor() {
    super();
    this.state = {
      phone: '',
      authenticated: false
    };
  }
  render() {
    const { authenticated, phone } = this.state;
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
          <IntroText>
            Please enter your phone number to receive a code by SMS for authentication so to be able to accept events.
          </IntroText>
          <Form>
            <Item>
              <Input
                value={phone}
                keyboardType="numeric"
                disabled={authenticated}
                style={{ 
                    color: (authenticated ? '#d2d4d8' : 'black') 
                }}
                onChangeText={(phone) => this.setState({ phone })}
                placeholder="Phone number"
              />
            </Item>
            {authenticated && (
              <Item>
                <Input keyboardType="numeric" placeholder="Enter code received" />
              </Item>
            )}
          </Form>
          <ButtonsView>
              <StyledButton
                success
                onPress={() => this.setState({ authenticated: true })}
              >
                <Text>{authenticated ? 'Verify Code' : 'Send me the code by SMS'}</Text>
              </StyledButton>
              {authenticated && <StyledButton
                danger
                onPress={() => this.setState({ authenticated: false, phone: '' })}
              >
                <Text>Start Again</Text>
              </StyledButton>}
            </ButtonsView>
        </Content>
      </Container>
    );
  }
}
