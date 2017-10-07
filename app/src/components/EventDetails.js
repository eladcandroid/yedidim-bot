import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, View, Text, Button, TouchableHighlight, Clipboard } from 'react-native';
import { formatEventCase, formatEventTime, getEventStatus, getCopyText } from "../common/utils";
import { EventStatus } from "../constants/consts";
import { updateEventStatus } from "../actions/dataSourceActions";

class EventDetails extends Component {
  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  copyToClipboard() {
    Clipboard.setString(getCopyText(this.props.event));
    this.props.onClose();
  }

  sendEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Sent);
    this.props.onClose();
  }

  completeEvent() {
    this.props.updateEventStatus(this.props.event, EventStatus.Completed);
    this.props.onClose();
  }

  render() {
    const event = this.props.event || {details: {}};
    return (
      <Modal animationType="slide"
             transparent={false}
             visible={true}
             onRequestClose={this.props.onClose.bind(this)}>
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingTop:20}}>
          <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 20, textAlign:'right'}}>פרטים</Text>
            <TouchableHighlight onPress={this.props.onClose.bind(this)}>
              <Text>חזור</Text>
            </TouchableHighlight>
          </View>
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
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateEventStatus: (event, status) => {
      dispatch(updateEventStatus(event, status));
    }
  };
};

export default connect(null, mapDispatchToProps)(EventDetails);

EventDetails.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func,
  updateEventStatus: PropTypes.func
};