import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {ScrollView, View, Text, StyleSheet, I18nManager} from 'react-native';
import { Button, Form, Item, Input, Label } from 'native-base';
import DatePicker from 'react-native-datepicker'
import { getTextStyle } from '../common/utils';
import { searchEvents } from '../actions/dataSourceActions';
import EventsList, {EventsListColumn} from './EventsList';

class EventsSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {phone: undefined};
    this.searchEvents = this.searchEvents.bind(this);
  }

  searchEvents() {
    const fromDate = this.state.fromDate ? Date.parse(this.state.fromDate) : undefined;
    const toDate = this.state.toDate ? Date.parse(this.state.toDate) + 24 * 60 * 60 * 1000 : undefined;
    this.props.searchEvents(this.state.phone, fromDate, toDate);
  }

  render() {
    return (
      <View style={styles.container}>
        <Form>
          <Item style={styles.item}>
            <Label style={I18nManager.isRTL ? undefined: {textAlign: 'right'}}>טלפון</Label>
            <Input
              value={this.state.phone}
              keyboardType="numeric"
              onChangeText={(value) => {this.setState({phone: value.trim()})}}/>
          </Item>
          <View style={styles.datePickersRow}>
            <DatePicker
              date={this.state.fromDate}
              mode="date"
              placeholder="מתאריך"
              format="YYYY-MM-DD"
              confirmBtnText="בחר"
              cancelBtnText="בטל"
              onDateChange={(date) => {this.setState({fromDate: date})}}
            />
            <DatePicker
              date={this.state.toDate}
              mode="date"
              placeholder="עד תאריך"
              format="YYYY-MM-DD"
              confirmBtnText="בחר"
              cancelBtnText="בטל"
              onDateChange={(date) => {this.setState({toDate: date})}}
            />
          </View>
          <Button style={styles.button} onPress={this.searchEvents}>
            <Text style={styles.buttonText}>חפש</Text>
          </Button>
        </Form>
        {this.props.events ?
            <ScrollView style={styles.scrollContainer}>
              <Text style={getTextStyle(styles.headerTitle)} allowFontScaling={false}>{this.props.events.length === 0 ? 'לא נמצאו אירועים' : 'אירועים'}</Text>
              {this.props.events.length > 0 &&
                <EventsList
                  events={this.props.events}
                  columns={[EventsListColumn.Time, EventsListColumn.Name, EventsListColumn.Phone, EventsListColumn.Case]}
                  navigate={this.props.navigate}/>}
            </ScrollView>
          : undefined
        }
      </View>
    );
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    searchEvents: (phone, fromDate, toDate) => {
      dispatch(searchEvents(phone, fromDate, toDate));
    }
  };
};

const mapStateToProps = (state) => {
  const events = state.dataSource.searchEvents;
  return {
    events
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsSearch);

EventsList.propTypes = {
  events: PropTypes.array,
  navigate: PropTypes.func.isRequired,
  searchEvents: PropTypes.func
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
  item: {
    flex: 1,
    flexDirection: 'row-reverse'
  },
  datePickersRow: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    flexDirection: 'row-reverse'
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
  }
});
