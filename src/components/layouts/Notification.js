// src/components/common/Notification.js
import React from 'react';

const Notification = ({ message, type, onClose }) => {
  const bgColor = 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 
    type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${bgColor} text-white`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button 
            className="ml-4 text-white hover:text-gray-200"
            onClick={onClose}
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;