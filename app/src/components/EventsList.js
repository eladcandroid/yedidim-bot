import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, StyleSheet, Image, I18nManager } from 'react-native';
import { Grid, Row, Col, Button } from 'native-base';
import { getEventStatus, formatEventCase, formatEventTime, getTextStyle } from '../common/utils';
import { EventSource, EventStatus, ScreenType } from '../constants/consts';

class EventsList extends Component {
  openEventDetails(event) {
    this.props.navigate(ScreenType.EventDetails, {key: event.key});
  }

  addNewEvent() {
    this.props.navigate(ScreenType.EventDetailsEditor);
  }

  renderGrid(events) {
    let cols = [
      <Col style={{width:30}} key="0">
        <Text style={getTextStyle(styles.headerText)}/>
        {events.map(event => this.renderRow(event, 0))}
      </Col>,
      <Col key="1">
        <Text style={getTextStyle(styles.headerText)}>עיר</Text>
        {events.map(event => this.renderRow(event, 1))}
      </Col>,
      <Col key="2">
        <Text style={getTextStyle(styles.headerText)}>בעיה</Text>
        {events.map(event => this.renderRow(event, 2))}
      </Col>,
      <Col key="3">
        <Text style={getTextStyle(styles.headerText)}>זמן</Text>
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

  renderRow(event, colNum) {
    return (
      <Row style={[styles.headerRow, I18nManager.isRTL? undefined : {flexDirection: 'row-reverse'}]} onPress={this.openEventDetails.bind(this, event)} key={event.key + '_' + colNum}>
          {
            colNum === 3 ?
              <Text style={getTextStyle(styles.cellText)}>{formatEventTime(event)}</Text>
            : colNum === 2 ?
              <Text style={getTextStyle(styles.cellText)}>{formatEventCase(event)}</Text>
            : colNum === 1 ?
              <Text style={getTextStyle(styles.cellText)}>{event.details.city}</Text>
            : event.source === EventSource.FB_BOT ?
              <Image style={styles.fbImage} source={require('../../assets/images/bot-icon.png')}/>
            : <Text style={getTextStyle(styles.cellText)}/>
          }
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonRow}>
          <Button style={styles.button} onPress={this.addNewEvent.bind(this)}>
            <Text style={styles.buttonText}>פתיחת אירוע חדש</Text>
          </Button>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <Text style={getTextStyle(styles.headerTitle)}>אירועים חדשים</Text>
          {this.renderGrid(this.props.newEvents)}

          <View style={styles.rowLine}/>

          <Text style={getTextStyle(styles.headerTitle)}>אירועים פעילים</Text>
          {this.renderGrid(this.props.activeEvents)}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const events = state.dataSource.events;
  return {
    newEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Submitted || getEventStatus(event) === EventStatus.Sent) : [],
    activeEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Assigned) : []
  };
};

export default connect(mapStateToProps)(EventsList);

EventsList.propTypes = {
  newEvents: PropTypes.array,
  activeEvents: PropTypes.array,
  navigate: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: 'white'
  },
  scrollContainer: {
    flex:1,
    flexDirection: 'column',
    paddingRight: 8,
    paddingLeft: 8,
    paddingBottom: 20,
    backgroundColor: 'white'
  },
  buttonRow: {
    justifyContent: 'center',
    paddingTop: 20,
    paddingRight: 40,
    paddingLeft: 40
  },
  button: {
    width: 150,
    alignSelf:'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    alignSelf:'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    paddingBottom: 10,
    paddingTop: 10
  },
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
