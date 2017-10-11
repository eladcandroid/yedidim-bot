import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, Button, Clipboard, StyleSheet } from 'react-native';
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
      <View style={styles.container}>
        {event.timestamp ?
          <View>
            <Text style={styles.fieldName}>זמן</Text>
            <Text style={styles.fieldValue}>{formatEventTime(event)}</Text>
          </View>
          : undefined
        }
        <View>
          <Text style={styles.fieldName}>שם</Text>
          <Text style={styles.fieldValue}>{event.details['caller name']}</Text>
        </View>
        <View>
          <Text style={styles.fieldName}>טלפון</Text>
          <Text style={styles.fieldValue}>{event.details['phone number']}</Text>
        </View>
        <View>
          <Text style={styles.fieldName}>סוג</Text>
          <Text style={styles.fieldValue}>{formatEventCase(event)}</Text>
        </View>
        <View>
          <Text style={styles.fieldName}>כתובת</Text>
          <Text style={styles.fieldValue}>{event.details['address']}</Text>
        </View>
        <View>
          <Text style={styles.fieldName}>פרטים</Text>
          <Text style={styles.fieldValue}>{event.details['more']}</Text>
        </View>
        {getEventStatus(event) === EventStatus.Submitted ?
          <View style={styles.buttonsRow}>
            <Button style={styles.button} onPress={this.sendEvent.bind(this)} title='שלח'/>
            <Button style={styles.button} onPress={this.copyToClipboard.bind(this)} title='העתק'/>
          </View>
          : getEventStatus(event) === EventStatus.Sent ?
            <View style={styles.buttonsRow}>
              <Button style={styles.button} onPress={this.completeEvent.bind(this)} title='טופל'/>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingRight: 8,
    paddingBottom: 10,
    paddingLeft: 8
  },
  fieldName: {
    fontWeight: 'bold',
    textAlign:'right'
  },
  fieldValue: {
    textAlign:'right'
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 20
  },
  button: {
    width: 100
  }
});
