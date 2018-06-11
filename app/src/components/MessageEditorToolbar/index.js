import React from 'react';

const MessageEditorToolbar = ({ sendMessage, getPreviousMessages }) => (
  <div>
    <button onClick={getPreviousMessages}>See Previous Messages</button>
    <button onClick={sendMessage}>Send Message</button>
  </div>
);

export default MessageEditorToolbar;
