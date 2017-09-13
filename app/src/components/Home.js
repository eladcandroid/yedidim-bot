import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { checkUserAuth } from '../actions/dataSourceActions';
import CallsList from "./CallsList";
import {CallStatus, getCallStatus} from "../common/utils";

class Home extends React.Component {

  componentWillMount() {
    this.props.checkUserAuth();
  }

  render() {
    if (!this.props.user){
      return (
        <div id="firebaseui-auth-container"/>
      );
    }

    if (!this.props.calls){
      return <div>Loading...</div>;
    }

    return (
      <div>
        <h3 className="pull-right">קריאות</h3>
        <CallsList calls={this.props.calls.filter(call => getCallStatus(call) === CallStatus.Submitted)}/>
        <h3 className="pull-right">קריאות שלא הושלמו</h3>
        <CallsList calls={this.props.calls.filter(call => getCallStatus(call) === CallStatus.InProgress)}/>
      </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    calls: state.dataSource.calls,
    user: state.dataSource.user
    // isMobile: state.dataSource.isMobile,
    // error: state.dataSource.error,

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkUserAuth: () => {
      dispatch(checkUserAuth());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

Home.propTypes = {
  checkUserAuth: PropTypes.func,
  calls: PropTypes.array,
  user: PropTypes.object
};