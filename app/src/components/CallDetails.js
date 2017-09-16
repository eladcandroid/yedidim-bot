import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Grid, Row, Col, Button } from 'react-bootstrap';
import { formatCallCase, formatCallTime, getCallStatus } from "../common/utils";
import CopyToClipboard from 'react-copy-to-clipboard';
import {CallStatus} from "../constants/consts";

export default class CallDetails extends React.Component {
  static getCopyText(call) {
    return `שם:${call.details['caller name']}\n  טלפון:${formatCallCase(call)}\n  בעיה:${call.details['more']}\n  פרטים:${call.details['more']}\n  כתובת:${call.details['address']}`;
  }

  constructor(props) {
    super(props);
    this.state = {copied: false};
  }

  onCopy() {
    this.setState({copied: true});
    setTimeout(() => {this.setState({copied: false});}, 2000);
  }

  render() {
    const call = this.props.call || {details: {}};
    return (
      <Modal show={true} onHide={this.props.onClose.bind(this)}>
        <Modal.Body className="call-details">
          <div className="details-header">פרטים</div>
          <Grid fluid={true}>
            {call.timestamp ?
              <Row>
                <Col xs={9} className="details-value">{formatCallTime(call)}</Col>
                <Col xs={3} className="details-title">זמן</Col>
              </Row>
              : undefined
            }
            <Row>
              <Col xs={9} className="details-value">{call.details['caller name']}</Col>
              <Col xs={3} className="details-title">שם</Col>
            </Row>
            <Row>
              <Col xs={9} className="details-value"><a href={`tel:${call.details['phone number']}`}>{call.details['phone number']}</a></Col>
              <Col xs={3} className="details-title">טלפון</Col>
            </Row>
            <Row>
              <Col xs={9} className="details-value">{formatCallCase(call)}</Col>
              <Col xs={3} className="details-title">סוג</Col>
            </Row>
            <Row>
              <Col xs={9} className="details-value">{call.details['address']}</Col>
              <Col xs={3} className="details-title">כתובת</Col>
            </Row>
            <Row>
              <Col xs={9} className="details-value">{call.details['more']}</Col>
              <Col xs={3} className="details-title">פרטים</Col>
            </Row>
          </Grid>
          {getCallStatus(call) === CallStatus.Submitted ?
            <div>
              <CopyToClipboard text={CallDetails.getCopyText(call)} onCopy={this.onCopy.bind(this)}>
                <Button bsStyle="primary">העתק</Button>
              </CopyToClipboard>
              {this.state.copied ? <span>הועתק</span> : undefined}
              <Button bsStyle="success" className="pull-right">טופל</Button>
            </div>
            : undefined
          }
        </Modal.Body>
      </Modal>
    );
  }
}

CallDetails.propTypes = {
  call: PropTypes.object,
  onClose: PropTypes.func
};