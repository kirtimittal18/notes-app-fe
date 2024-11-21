import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmationDialogProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  show,
  onConfirm,
  onCancel,
  message,
}) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button className={`button me-2 cancel-btn`} onClick={onCancel}>
          Cancel
        </button>
        <button className={`button me-2`} onClick={onConfirm}>
          Confirm
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
