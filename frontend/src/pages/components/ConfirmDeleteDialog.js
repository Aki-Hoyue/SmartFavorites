import React from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';

const ConfirmDeleteDialog = ({ isOpen, toggle, filename, onDelete, deleteMessage}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
      <ModalBody>
        
        {!deleteMessage && <>
        <p>Are you sure to delete '{filename}'?</p>
        <div className="d-flex justify-content-end">
          <Button color="danger" onClick={() => { onDelete(); toggle(); }}>Confirm</Button>
          &nbsp;
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </div>
        </>}
        {deleteMessage && <>
          <a href="#close" onClick={toggle} className="close"></a>
          <div className="alert alert-danger" role="alert">{deleteMessage}</div>
        </>}
      </ModalBody>
    </Modal>
  );
};

export default ConfirmDeleteDialog;