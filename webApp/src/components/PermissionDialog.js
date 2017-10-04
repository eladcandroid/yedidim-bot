import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { requestPermission, setMessagingPermission } from "../actions/messagingActions";

class PermissionDialog extends React.Component {

  onClose() {
    this.props.setMessagingPermission(false);
  }
  render() {
    return (
      <Modal show={true} onHide={this.onClose.bind(this)}>
        <Modal.Body className="permissions-dialog">
          <div>בבקשה אשר קבלת התראות</div>
          <Button onClick={this.props.requestPermission.bind(this)}>קבל התראות</Button>
        </Modal.Body>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    requestPermission: () => {
      dispatch(requestPermission());
    },
    setMessagingPermission: () => {
      dispatch(setMessagingPermission());
    }
  };
};

export default connect(null, mapDispatchToProps)(PermissionDialog);

PermissionDialog.propTypes = {
  requestPermission: PropTypes.func,
  setMessagingPermission: PropTypes.func
};