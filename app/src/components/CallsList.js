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

    return (
      <div>
        <Table striped bordered condensed className="calls-list">
          <thead>
            <tr>
              <th className="list-header">כתובת</th>
              <th className="list-header">שם</th>
              <th className="list-header">בעיה</th>
              <th className="list-header">זמן</th>
            </tr>
          </thead>
          <tbody>
          {
           this.props.calls.map(call => {
             return (
               <tr key={call.key} className="show-grid" onClick={this.openCallDetails.bind(this, call)}>
                 <td className="list-cell">{call.details.address}</td>
                 <td className="list-cell">{call.details['caller name']}</td>
                 <td className="list-cell">{formatCallCase(call)}</td>
                 <td className="list-cell">{formatCallTime(call)}</td>
               </tr>
             );
           })
          }
          </tbody>
        </Table>
        {this.state.call ?
          <CallDetails call={this.state.call} onClose={this.closeCallDetails.bind(this)}/>
          : undefined
        }
      </div>
    );
  }
}

CallsList.propTypes = {
  calls: PropTypes.array
};