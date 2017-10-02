import React from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Modal, Grid, Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formatCallCase, formatCallTime, getCallStatus } from "../common/utils";
import { CallStatus } from "../constants/consts";
import { updateCallStatus } from "../actions/dataSourceActions";

class CallDetails extends React.Component {
  static getCopyText(call) {
    return `*שם:* ${call.details['caller name']}\r\n*טלפון:* ${call.details['phone number']}\r\n*בעיה:* ${formatCallCase(call)}\r\n*פרטים:* ${call.details['more']}\r\n*סוג רכב:* ${call.details['car type']}\r\n*כתובת:* ${call.details['address']}`;
  }

  constructor(props) {
    super(props);
    this.state = {copied: false};
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  onCopy() {
    this.setState({copied: true});
    this.timeout = setTimeout(() => {if (this.state.copied) this.setState({copied: false});}, 2000);
  }

  sendCall() {
    this.props.updateCallStatus(this.props.call, CallStatus.Sent);
    this.props.onClose();
  }

  completeCall() {
    this.props.updateCallStatus(this.props.call, CallStatus.Completed);
    this.props.onClose();
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
              <div className="buttons-row">
                <CopyToClipboard text={CallDetails.getCopyText(call)} onCopy={this.onCopy.bind(this)}>
                  <Button bsStyle="primary">העתק</Button>
                </CopyToClipboard>
                <span className={'copied-label' + (this.state.copied ? ' copied' : '')}>הועתק</span>
                <Button bsStyle="success" onClick={this.sendCall.bind(this)}>שלח</Button>
              </div>
              : getCallStatus(call) === CallStatus.Sent ?
                <div className="buttons-row one">
                  <Button bsStyle="success" onClick={this.completeCall.bind(this)}>טופל</Button>
                </div>
                : undefined
            }
        </Modal.Body>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCallStatus: (call, status) => {
      dispatch(updateCallStatus(call, status));
    }
  };
};

export default connect(null, mapDispatchToProps)(CallDetails);

CallDetails.propTypes = {
  call: PropTypes.object,
  onClose: PropTypes.func,
  updateCallStatus: PropTypes.func
};