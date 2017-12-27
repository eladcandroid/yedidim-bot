import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { Grid, Row, Col, Button } from 'native-base';
import { getEventStatus, formatEventCase, formatEventTime } from '../common/utils';
import { EventSource, EventStatus } from '../constants/consts';
import EventDetails from './EventDetails';


class EventsList extends Component {
  openEventDetails(event) {
    this.props.navigation.navigate('EventDetails', {key: event.key});
  }

  addNewEvent() {
    this.props.navigation.navigate('EventDetails', {});
  }

  renderGrid(events) {
    return (
      <Grid>
        <Col style={{width:30}}>
          <Text style={styles.headerText}/>
          {events.map(event => this.renderRow(event, 3))}
        </Col>
        <Col>
          <Text style={styles.headerText}>עיר</Text>
          {events.map(event => this.renderRow(event, 2))}
        </Col>
        <Col>
          <Text style={styles.headerText}>בעיה</Text>
          {events.map(event => this.renderRow(event, 1))}
        </Col>
        <Col>
          <Text style={styles.headerText}>זמן</Text>
          {events.map(event => this.renderRow(event, 0))}
        </Col>
      </Grid>
    )
  }

  renderRow(event, colNum) {
    return (
      <Row style={styles.headerRow} onPress={this.openEventDetails.bind(this, event)} key={event.key + '_' + colNum}>
          {
            colNum === 0 ?
              <Text style={styles.cellText}>{formatEventTime(event)}</Text>
            : colNum === 1 ?
              <Text style={styles.cellText}>{formatEventCase(event)}</Text>
            : colNum === 2 ?
              <Text style={styles.cellText}>{event.details.city}</Text>
            : event.source === EventSource.FB_BOT ?
              <Image style={styles.fbImage} source={require('../../assets/icons/bot-icon.png')}/>
            : <Text style={styles.cellText}/>
          }
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.allowNew ?
          <View style={styles.buttonRow}>
            <Button style={styles.button} onPress={this.addNewEvent.bind(this)}>
              <Text style={styles.buttonText}>פתיחת אירוע חדש</Text>
            </Button>
          </View>
          : undefined
        }
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.headerTitle}>אירועים חדשים</Text>
          {this.renderGrid(this.props.newEvents)}

          <View style={styles.rowLine}/>

          <Text style={styles.headerTitle}>אירועים פעילים</Text>
          {this.renderGrid(this.props.activeEvents)}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const events = state.dataSource.events;
  return {
    newEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Submitted) : [],
    activeEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Sent || getEventStatus(event) === EventStatus.Assigned) : [],
    allowNew: true
  };
};

export default connect(mapStateToProps)(EventsList);

EventsList.propTypes = {
  newEvents: PropTypes.array,
  activeEvents: PropTypes.array,
  allowNew: PropTypes.bool
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
    textAlign:'right',
    paddingBottom: 10,
    paddingTop: 10
  },
  headerText: {
    height: 30,
    fontSize: 18,
    fontWeight: '500',
    textAlign:'right'
  },
  cellText: {
    height: 30,
    fontSize: 14,
    textAlign:'right'
  },
  headerRow: {
    height:30,
    flexDirection: 'row-reverse'
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
