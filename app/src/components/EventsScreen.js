import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, SectionList, Text } from 'react-native';
import { getEventStatus, formatEventCase, formatEventTime } from '../common/utils';
import { EventSource, EventStatus } from '../constants/consts';

class EventsListItem extends Component {
  render() {
    return (
      <View style={{flex:1, height:50,flexDirection: 'row-reverse'}}>
        <Text style={{width:60,textAlign:'right', paddingLeft:10}}>{formatEventTime(this.props.event)}</Text>
        <Text style={{width:120,textAlign:'right', paddingLeft:10}}>{formatEventCase(this.props.event)}</Text>
        <Text style={{textAlign:'right'}}>{this.props.event.details.address}</Text>
      </View>
    );
  }
}

class EventsListHeader extends Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 18, textAlign:'right'}}>{this.props.title}</Text>
      </View>
    );
  }
}

class EventsScreen extends Component {
  render() {
    let sections = [
      {title: 'ארועים חדשים - פייסבוק', data: this.props.newEvents},
      {title: 'ארועים פעילים', data: this.props.activeEvents}];
    return (
      <View style={{paddingTop:20}}>
        <SectionList
          renderItem={({item}) => <EventsListItem event={item}/>}
          renderSectionHeader={({section}) => <EventsListHeader title={section.title} />}
          sections={sections}/>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const events = state.dataSource.events;
  return {
    newEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Submitted && event.source === EventSource.FB_BOT) : [],
    activeEvents: events ? events.filter(event => getEventStatus(event) === EventStatus.Sent || getEventStatus(event) === EventStatus.Assigned) : [],
  };
};

export default connect(mapStateToProps)(EventsScreen);

EventsScreen.propTypes = {
  newEvents: PropTypes.array,
  activeEvents: PropTypes.array,
};