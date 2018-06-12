import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';

const MessageEditorToolbar = ({ sendMessage, getPreviousMessages }) => (
  <ButtonToolbar className="chat-message-editor-toolbar">
    <Button onClick={getPreviousMessages}>See Previous Messages</Button>
    <Button onClick={sendMessage} bsStyle="success">Send Message</Button>
  </ButtonToolbar>
);

export default MessageEditorToolbar;
