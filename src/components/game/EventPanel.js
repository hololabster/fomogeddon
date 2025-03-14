
// src/components/game/EventPanel.js
import React from 'react';

const EventPanel = ({ eventInfo }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">Event Status</h2>
      
      {eventInfo && eventInfo.isActive ? (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          <div className="font-medium text-yellow-800">{eventInfo.name} in progress</div>
          <p className="text-sm text-yellow-700 mt-2">{eventInfo.description}</p>
          <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-500 h-full"
              style={{ width: `${(eventInfo.progress / eventInfo.total) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {eventInfo.progress} / {eventInfo.total}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-3 rounded-md text-center">
          {eventInfo && !eventInfo.isActive ? (
            <p className="text-gray-600">Event has ended.</p>
          ) : (
            <p className="text-gray-600">No events have triggered yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventPanel;