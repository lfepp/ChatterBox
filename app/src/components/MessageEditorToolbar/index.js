import React from 'react';

const MessageEditorToolbar = ({ sendMessage, getPreviousMessages }) => (
  <div className="chat-message-editor-toolbar">
    <button onClick={getPreviousMessages}>See Previous Messages</button>
    <button onClick={sendMessage}>Send Message</button>
  </div>
);

export default MessageEditorToolbar;
