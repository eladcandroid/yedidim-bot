import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navbar, NavItem, Nav } from 'react-bootstrap';
import { checkUserAuth, signOutUser, addNewCall } from '../actions/dataSourceActions';
import { getCallStatus } from '../common/utils';
import { CallSource, CallStatus } from '../constants/consts';
import CallsList from './CallsList';
import AddCall from './AddCall';
import PermissionDialog from "./PermissionDialog";

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
          <span className="user-name">{this.props.user.name}</span>
          <Nav>
            <NavItem eventKey={1} href="#">היסטוריה</NavItem>
            <NavItem eventKey={2} href="#" onClick={this.props.signOutUser.bind(this)}>יציאה</NavItem>
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

    if (!this.props.callsLoaded){
      return <div>Loading...</div>;
    }

    return (
      <div>
        {this.renderNavHeader()}
        <div className="container-home">
          {this.props.allowAdd ?
            <AddCall onAdd={this.onAdd.bind(this)}/>
            : undefined
          }
          <div className="list-title">ארועים חדשים - פייסבוק</div>
          <CallsList calls={this.props.newCalls}/>
          <div className="list-title">ארועים פעילים</div>
          <CallsList calls={this.props.activeCalls}/>
          {!this.props.production ?
            <div>
              <div className="list-title">פיתוח - קריאות שלא הושלמו</div>
              <CallsList calls={this.props.draftCalls}/>
            </div>
            : undefined
          }

          {!this.props.permissionSet ?
            <PermissionDialog/>
            : undefined
          }
        </div>
      </div>);
  }
}

const mapStateToProps = (state) => {
  const calls = state.dataSource.calls;
  return {
    user: state.dataSource.user,
    allowAdd: state.dataSource.allowAdd,
    production: state.dataSource.production,
    permissionSet: state.messaging.permissionSet,
    callsLoaded: calls !== undefined,
    newCalls: calls ? calls.filter(call => getCallStatus(call) === CallStatus.Submitted && call.source === CallSource.FB_BOT) : [],
    activeCalls: calls ? calls.filter(call => getCallStatus(call) === CallStatus.Sent || getCallStatus(call) === CallStatus.Assigned) : [],
    draftCalls: calls ? calls.filter(call => getCallStatus(call) === CallStatus.Draft) : []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkUserAuth: () => {
      dispatch(checkUserAuth());
    },
    signOutUser: () => {
      dispatch(signOutUser());
    },
    addNewCall: (call) => {
      dispatch(addNewCall(call));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

Home.propTypes = {
  checkUserAuth: PropTypes.func,
  signOutUser: PropTypes.func,
  addNewCall: PropTypes.func,
  user: PropTypes.object,
  allowAdd: PropTypes.bool,
  production: PropTypes.bool,
  permissionSet: PropTypes.bool,
  callsLoaded: PropTypes.bool,
  newCalls: PropTypes.array,
  activeCalls: PropTypes.array,
  draftCalls: PropTypes.array
};