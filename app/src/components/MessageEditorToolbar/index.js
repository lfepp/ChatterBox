import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';

const MessageEditorToolbar = props => (
  <ButtonToolbar className="chat-message-editor-toolbar">
    {props.canGetPreviousMessages ? <Button onClick={props.getPreviousMessages}>See Previous Messages</Button> : null}
    <Button onClick={props.sendMessage} bsStyle="success">
      {props.isLoggedIn ? 'Send Message' : 'Login or Create Account'}
    </Button>
  </ButtonToolbar>
);

export default MessageEditorToolbar;
