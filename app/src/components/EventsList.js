import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, Image, I18nManager } from 'react-native';
import { Grid, Row, Col, Button } from 'native-base';
import { formatEventCase, formatEventTime, getTextStyle } from '../common/utils';
import { EventSource, ScreenType } from '../constants/consts';

class EventsList extends Component {
  openEventDetails(event) {
    this.props.navigate(ScreenType.EventDetails, {key: event.key});
  }

  renderRow(event, colNum) {
    return (
      <Row style={[styles.headerRow, I18nManager.isRTL? undefined : {flexDirection: 'row-reverse'}]} onPress={this.openEventDetails.bind(this, event)} key={event.key + '_' + colNum}>
          {
            colNum === 3 ?
              <Text style={getTextStyle(styles.cellText)} allowFontScaling={false}>{formatEventTime(event)}</Text>
            : colNum === 2 ?
              <Text style={getTextStyle(styles.cellText)} allowFontScaling={false}>{formatEventCase(event)}</Text>
            : colNum === 1 ?
              <Text style={getTextStyle(styles.cellText)} allowFontScaling={false}>{event.details.city}</Text>
            : event.source === EventSource.FB_BOT ?
              <Image style={styles.fbImage} source={require('../../assets/images/bot-icon.png')}/>
            : <Text style={getTextStyle(styles.cellText)}/>
          }
      </Row>
    );
  }

  render() {
    const events = this.props.events;
    let cols = [
      <Col style={{width:30}} key="0">
        <Text style={getTextStyle(styles.headerText)} allowFontScaling={false}/>
        {events.map(event => this.renderRow(event, 0))}
      </Col>,
      <Col key="1">
        <Text style={getTextStyle(styles.headerText)} allowFontScaling={false}>עיר</Text>
        {events.map(event => this.renderRow(event, 1))}
      </Col>,
      <Col key="2">
        <Text style={getTextStyle(styles.headerText)} allowFontScaling={false}>בעיה</Text>
        {events.map(event => this.renderRow(event, 2))}
      </Col>,
      <Col key="3">
        <Text style={getTextStyle(styles.headerText)} allowFontScaling={false}>זמן</Text>
        {events.map(event => this.renderRow(event, 3))}
      </Col>]
    ;
    if (I18nManager.isRTL){
      cols.reverse();
    }
    return (
      <Grid>
        {cols.map(col => col)}
      </Grid>
    )
  }
}

export default EventsList;

EventsList.propTypes = {
  events: PropTypes.array.isRequired,
  navigate: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  headerText: {
    height: 30,
    fontSize: 18,
    fontWeight: '500',
  },
  cellText: {
    height: 30,
    fontSize: 14
  },
  headerRow: {
    height:30
  },
  row: {
    height:50,
  },
  rowLine: {
    height: 2,
    backgroundColor: 'black',
    marginTop: 10
  },
  colImage: {
    width:30
  },
  fbImage: {
    width: 20,
    height: 20
  }
});
