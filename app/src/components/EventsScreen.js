import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableHighlight, View, SectionList, Text } from 'react-native';
import { getEventStatus, formatEventCase, formatEventTime } from '../common/utils';
import { EventSource, EventStatus } from '../constants/consts';
import EventDetails from './EventDetails';

class EventsListItem extends Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress.bind(this)}>
        <View style={{flex:1, height:50,flexDirection: 'row-reverse'}}>
          <Text style={{width:60,textAlign:'right', paddingLeft:10}}>{formatEventTime(this.props.event)}</Text>
          <Text style={{width:120,textAlign:'right', paddingLeft:10}}>{formatEventCase(this.props.event)}</Text>
          <Text style={{textAlign:'right'}}>{this.props.event.details.address}</Text>
        </View>
      </TouchableHighlight>
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
  constructor(props) {
    super(props);
    this.state = {event: undefined};
  }

  openEventDetails(event) {
    this.setState({event});
  }

  closeEventDetails() {
    this.setState({event: undefined});
  }
  render() {
    let sections = [
      {title: 'ארועים חדשים - פייסבוק', data: this.props.newEvents},
      {title: 'ארועים פעילים', data: this.props.activeEvents}];
    return (
      <View style={{paddingTop:20}}>
        <SectionList
          renderItem={({item}) => <EventsListItem event={item} onPress={this.openEventDetails.bind(this, item)}/>}
          renderSectionHeader={({section}) => <EventsListHeader title={section.title} />}
          sections={sections}/>
        {this.state.event ?
          <EventDetails event={this.state.event} onClose={this.closeEventDetails.bind(this)}/>
          : undefined
        }
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

EventsListItem.propTypes = {
  onPress: PropTypes.func
};