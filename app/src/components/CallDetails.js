import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Grid, Row, Col, Button } from 'react-bootstrap';
import { CallStatus, formatCallCase, formatCallTime, getCallStatus } from "../common/utils";
import CopyToClipboard from 'react-copy-to-clipboard';

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
    setTimeout(() => {this.setState({copied: false})}, 2000);
  }

  render() {
    const call = this.props.call;
    return (
      <Modal show={true} onHide={this.props.onClose.bind(this)}>
        <Modal.Body>
          <h1>פרטים</h1>
          <Grid fluid={true}>
            <Row>
              <Col xs={8}><span className="pull-right">{formatCallTime(call)}</span></Col>
              <Col xs={4}><span className="pull-right">זמן</span></Col>
            </Row>
            <Row>
              <Col xs={8}><span className="pull-right">{call.details['caller name']}</span></Col>
              <Col xs={4}><span className="pull-right">שם</span></Col>
            </Row>
            <Row>
              <Col xs={8}><span className="pull-right"><a href={`tel:${call.details['phone number']}`}>{call.details['phone number']}</a></span></Col>
              <Col xs={4}><span className="pull-right">טלפון</span></Col>
            </Row>
            <Row>
              <Col xs={8}><span className="pull-right">{formatCallCase(call)}</span></Col>
              <Col xs={4}><span className="pull-right">סוג האירוע</span></Col>
            </Row>
            <Row>
              <Col xs={8}><span className="pull-right">{call.details['address']}</span></Col>
              <Col xs={4}><span className="pull-right">כתובת</span></Col>
            </Row>
            <Row>
              <Col xs={8}><span className="pull-right">{call.details['more']}</span></Col>
              <Col xs={4}><span className="pull-right">פרטים</span></Col>
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