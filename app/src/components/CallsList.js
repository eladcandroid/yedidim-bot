import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { formatCallCase, formatCallTime } from "../common/utils";
import CallDetails from "./CallDetails";

export default class CallsList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {call: undefined};
  }

  openCallDetails(call) {
    this.setState({call});
  }

  closeCallDetails() {
    this.setState({call: undefined});
  }

  render() {
    if (!this.props.calls){
      return <div>Loading...</div>;
    }

    if (this.state.call){
      return <CallDetails call={this.state.call} onClose={this.closeCallDetails.bind(this)}/>;
    }

    return (
      <Table striped bordered condensed>
        <thead>
          <tr>
            <th><span className="pull-right">כתובת</span></th>
            <th><span className="pull-right">שם</span></th>
            <th><span className="pull-right">בעיה</span></th>
            <th><span className="pull-right">זמן</span></th>
          </tr>
        </thead>
        <tbody>
        {
         this.props.calls.map(call => {
           return (
             <tr key={call.key} className="show-grid" onClick={this.openCallDetails.bind(this, call)}>
               <td><span className="pull-right">{call.details.address}</span></td>
               <td><span className="pull-right">{call.details['caller name']}</span></td>
               <td><span className="pull-right">{formatCallCase(call)}</span></td>
               <td><span className="pull-right">{formatCallTime(call)}</span></td>
             </tr>
           );
         })
        }
        </tbody>
      </Table>
    );
  }
}

CallsList.propTypes = {
  calls: PropTypes.array
};