import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navbar, NavItem, Nav } from 'react-bootstrap';
import { checkUserAuth, addCall } from '../actions/dataSourceActions';
import { getCallStatus } from '../common/utils';
import { CallStatus } from '../constants/consts';
import CallsList from './CallsList';
import AddCall from './AddCall';

class Home extends React.Component {

  componentWillMount() {
    this.props.checkUserAuth();
  }

  onAdd(call) {
    this.props.addNewCall(call);
  }

  renderNavHeader() {
    return (
      <Navbar inverse collapseOnSelect className="nav-header">
        <Navbar.Header>
          <Navbar.Brand className="title">ידידים</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse className="nav-menu">
          <span className="user-name">{this.props.user.email}</span>
          <Nav>
            <NavItem eventKey={1} href="#">היסטוריה</NavItem>
            <NavItem eventKey={2} href="#">יציאה</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
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
        {this.renderNavHeader()}
        <div className="container-home">
          <AddCall onAdd={this.onAdd.bind(this)}/>
          <div className="list-title">ארועים חדשים</div>
          <CallsList calls={this.props.calls.filter(call => getCallStatus(call) === CallStatus.Submitted)}/>
          <div className="list-title">ארועים פעילים</div>
          <CallsList calls={this.props.calls.filter(call => getCallStatus(call) === CallStatus.Assigned)}/>
          <div className="list-title">פיתוח - קריאות שלא הושלמו</div>
          <CallsList calls={this.props.calls.filter(call => getCallStatus(call) === CallStatus.InProgress)}/>
        </div>
      </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    calls: state.dataSource.calls,
    user: state.dataSource.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkUserAuth: () => {
      dispatch(checkUserAuth());
    },
    addNewCall: (call) => {
      dispatch(addCall(call));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

Home.propTypes = {
  checkUserAuth: PropTypes.func,
  addNewCall: PropTypes.func,
  calls: PropTypes.array,
  user: PropTypes.object
};