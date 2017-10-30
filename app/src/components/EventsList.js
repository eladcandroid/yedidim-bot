import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableHighlight, ScrollView, View, FlatList, Text, StyleSheet, Button } from 'react-native';
import { getEventStatus, formatEventCase, formatEventTime } from '../common/utils';
import { EventSource, EventStatus } from '../constants/consts';
import EventDetails from './EventDetails';

class EventsListItem extends Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress.bind(this)}>
        <View style={styles.row}>
          <Text style={styles.columnTime}>{formatEventTime(this.props.event)}</Text>
          <Text style={styles.columnCase}>{formatEventCase(this.props.event)}</Text>
          <Text style={styles.columnAddress}>{this.props.event.details.city}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class EventsListHeader extends Component {
  render() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.headerTitle}>{this.props.title}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.columnTime}>זמן</Text>
          <Text style={styles.columnCase}>בעיה</Text>
          <Text style={styles.columnAddress}>עיר</Text>
        </View>
      </View>
    );
  }
}

class EventsList extends Component {
  openEventDetails(event) {
    this.props.navigation.navigate('EventDetails', {event});
  }

  addNewEvent() {
    this.props.navigation.navigate('EventDetails', {});
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.allowNew ?
          <Button style={styles.button} title={'פתיחת אירוע חדש'} onPress={this.addNewEvent.bind(this)}/>
          : undefined
        }
        <ScrollView style={styles.scrollContainer}>
          <EventsListHeader title={'אירועים חדשים - פייסבוק'} />
          <FlatList
            data={this.props.newEvents}
            renderItem={({item}) => <EventsListItem event={item} onPress={this.openEventDetails.bind(this, item)}/>}
          />
          <View style={styles.rowLine}/>
          <EventsListHeader title={'אירועים פעילים'} />
          <FlatList
            scrollEnabled={false}
            data={this.props.activeEvents}
            renderItem={({item}) => <EventsListItem event={item} onPress={this.openEventDetails.bind(this, item)}/>}
          />
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const events = state.dataSource.events;
  return {
    newEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Submitted && event.source === EventSource.FB_BOT) : [],
    activeEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Sent || getEventStatus(event) === EventStatus.Assigned) : [],
    allowNew: false
  };
};

export default connect(mapStateToProps)(EventsList);

EventsList.propTypes = {
  newEvents: PropTypes.array,
  activeEvents: PropTypes.array,
  allowNew: PropTypes.boolean
};

EventsListItem.propTypes = {
  onPress: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: 'white'
  },
  scrollContainer: {
    flex:1,
    flexDirection: 'column',
    paddingTop: 20,
    paddingRight: 8,
    paddingLeft: 8,
    paddingBottom: 20,
    backgroundColor: 'white'
  },
  button: {
    width: 150
  },
  listHeader: {
    height: 50,
  },
  headerTitle: {
    fontSize: 18,
    textAlign:'right'
  },
  headerRow: {
    height:30,
    flexDirection: 'row-reverse'
  },
  row: {
    height:50,
    flexDirection: 'row-reverse',
    backgroundColor: 'white'
  },
  rowLine: {
    height: 2,
    backgroundColor: 'black',
    marginTop: 30
  },
  columnTime: {
    width:70,
    textAlign:'right',
    paddingLeft:10
  },
  columnCase: {
    width:110,
    textAlign:'right',
    paddingLeft:10
  },
  columnAddress: {
    textAlign:'right',
    paddingLeft:10,
    flexGrow: 2
  }
});
