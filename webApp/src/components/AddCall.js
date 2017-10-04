import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import CallDetails from "./CallDetails";

export default class AddCall extends React.Component {

  constructor(props) {
    super(props);
    this.state = {add: false};
  }

  openCallDetails() {
    this.setState({add: true});
  }

  closeCallDetails() {
    this.setState({add: false});
  }

  render() {
    return (
      <div className="button-add-container">
        <Button className="button-add" onClick={this.openCallDetails.bind(this)}>הוספת אירוע</Button>
        {this.state.add ?
          <CallDetails onClose={this.closeCallDetails.bind(this)} onSave={this.props.onAdd.bind(this)}/>
          : undefined
        }
      </div>
    );
  }
}

AddCall.propTypes = {
  onAdd: PropTypes.func
};