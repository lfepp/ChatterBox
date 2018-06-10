import React from 'react';

const MessageEditorToolbar = ({ sendMessage }) => (
  <div>
    <button onClick={sendMessage}>Send</button>
  </div>
);

export default MessageEditorToolbar;
