import React, { Component } from 'react';
import { I18nManager, Platform } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Content, Button, Text, Footer, FooterTab, Icon } from 'native-base';
import EventsList from "../components/EventsList";
import EventDetails from "../components/EventDetails";
import EventDetailsEditor from "../components/EventDetailsEditor";
import ProfileScreen from "../components/ProfileScreen";
import { ScreenType } from '../constants/consts';

export const Screens = {
  [ScreenType.EventsList]: {screen: EventsList, title: 'אירועים'},
  [ScreenType.EventDetails]: {screen: EventDetails, title: 'פרטי אירוע', backScreen: ScreenType.EventsList},
  [ScreenType.EventDetailsEditor]: {screen: EventDetailsEditor, title: 'פרטי אירוע', backScreen: ScreenType.EventsList},
  [ScreenType.ProfileScreen]: {screen: ProfileScreen, title: 'משתמש'}
};

class MainScreen extends Component
{
  constructor(props) {
    super(props);
    this.state = {activeScreen: ScreenType.EventsList};
    this.navigate = this.navigate.bind(this);
  }

  setActiveScreen(screen) {
    this.setState({activeScreen: screen});
  }

  navigate(screen, params) {
    this.setState({activeScreen: screen, params});
  }

  render() {
    const activeScreen = Screens[this.state.activeScreen];
    const Component = activeScreen.screen;
    return (
      <Container style={{marginTop: Platform.OS === 'android' ? 24 : 0}}>
        <Header>
          <Left>
            {activeScreen.backScreen ?
              <Button transparent>
                <Icon name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                      onPress={this.navigate.bind(this, activeScreen.backScreen)}/>
              </Button>
              :
              undefined
            }
          </Left>
          <Body>
            <Text style={{color: Platform.OS === 'android'? 'white' : 'black', alignSelf:'center'}}>{activeScreen.title}</Text>
          </Body>
          <Right/>
        </Header>
        <Content>
          <Component navigate={this.navigate} params={this.state.params}/>
        </Content>
        <Footer>
          <FooterTab>
            <Button active={this.state.activeScreen !== ScreenType.ProfileScreen} onPress={this.setActiveScreen.bind(this, ScreenType.EventsList)}>
              <Text>אירועים</Text>
            </Button>
            <Button active={this.state.activeScreen === ScreenType.ProfileScreen} onPress={this.setActiveScreen.bind(this, ScreenType.ProfileScreen)}>
              <Text>משתמש</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default MainScreen;


