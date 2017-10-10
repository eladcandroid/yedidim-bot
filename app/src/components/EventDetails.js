import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, Clipboard } from 'react-native';
import { formatEventCase, formatEventTime, getEventStatus, getCopyText } from "../common/utils";
import { EventStatus } from "../constants/consts";
import { updateEventStatus } from "../actions/dataSourceActions";

class EventDetails extends Component {
  copyToClipboard() {
    Clipboard.setString(getCopyText(this.props.event));
    this.props.goBack();
  }

  sendEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Sent);
    this.props.goBack();
  }

  completeEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Completed);
    this.props.goBack();
  }

  render() {
    const event = this.props.event;
    return (
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingTop:20}}>
        {event.timestamp ?
          <View style={{margin:6}}>
            <Text style={{fontWeight: 'bold', textAlign:'right'}}>זמן</Text>
            <Text style={{textAlign:'right'}}>{formatEventTime(event)}</Text>
          </View>
          : undefined
        }
        <View style={{margin:6}}>
          <Text style={{fontWeight: 'bold', textAlign:'right'}}>שם</Text>
          <Text style={{textAlign:'right'}}>{event.details['caller name']}</Text>
        </View>
        <View style={{margin:6}}>
          <Text style={{fontWeight: 'bold', textAlign:'right'}}>טלפון</Text>
          <Text style={{textAlign:'right'}}>{event.details['phone number']}</Text>
        </View>
        <View style={{margin:6}}>
          <Text style={{fontWeight: 'bold', textAlign:'right'}}>סוג</Text>
          <Text style={{textAlign:'right'}}>{formatEventCase(event)}</Text>
        </View>
        <View style={{margin:6}}>
          <Text style={{fontWeight: 'bold', textAlign:'right'}}>כתובת</Text>
          <Text style={{textAlign:'right'}}>{event.details['address']}</Text>
        </View>
        <View style={{margin:6}}>
          <Text style={{fontWeight: 'bold', textAlign:'right'}}>פרטים</Text>
          <Text style={{textAlign:'right'}}>{event.details['more']}</Text>
        </View>
        {getEventStatus(event) === EventStatus.Submitted ?
          <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between'}}>
            <Button onPress={this.sendEvent.bind(this)} title='שלח'/>
            <Button onPress={this.copyToClipboard.bind(this)} title='העתק'/>
          </View>
          : getEventStatus(event) === EventStatus.Sent ?
            <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between'}}>
              <Button onPress={this.completeEvent.bind(this)} title='טופל'/>
            </View>
            : undefined
        }
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateEventStatus: (event, status) => {
      dispatch(updateEventStatus(event, status));
    },
    goBack: () => {
      ownProps.navigation.goBack();
    }
  };
};

const mapStateToProps = (state, ownProps) => {
  return {
    event: ownProps.navigation.state.params.event || {details: {}}
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  updateEventStatus: PropTypes.func
};