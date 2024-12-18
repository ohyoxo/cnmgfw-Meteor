import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const App = () => {
  const [log, setLog] = useState('');

  const handleDownloadAndExecute = () => {
    Meteor.call('files.downloadAndExecute', (error) => {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Operation completed successfully');
      }
    });
  };

  const handleViewLog = () => {
    Meteor.call('files.getLog', (error, result) => {
      if (error) {
        console.error('Error:', error);
      } else {
        setLog(result);
      }
    });
  };

  return (
    <div>
      <h1>Welcome to My Meteor App</h1>
      <button onClick={handleDownloadAndExecute}>
        Download and Execute
      </button>
      <button onClick={handleViewLog}>
        View Log
      </button>
      {log && (
        <pre>
          {log}
        </pre>
      )}
    </div>
  );
};
