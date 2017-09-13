import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Grid, Row, Col } from 'react-bootstrap';
import { formatCallCase, formatCallTime } from "../common/utils";

export default class CallDetails extends React.Component {

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
        </Modal.Body>
      </Modal>
    );
  }
}

CallDetails.propTypes = {
  call: PropTypes.object,
  onClose: PropTypes.func
};