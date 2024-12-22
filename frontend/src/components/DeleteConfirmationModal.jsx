// src/components/DeleteConfirmationModal.js
import React from 'react';

const DeleteConfirmationModal = ({ onDelete, onCancel, productId }) => {
  return (
    <div className="modal">
      <p>Are you sure you want to delete this product?</p>
      <button onClick={() => onDelete(productId)}>Yes, delete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default DeleteConfirmationModal;
