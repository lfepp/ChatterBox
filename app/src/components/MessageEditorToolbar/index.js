import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';

const MessageEditorToolbar = props => (
  <ButtonToolbar>
    <Button onClick={props.sendMessage} bsStyle="success">
      {props.isLoggedIn ? 'Send Message' : 'Login or Create Account'}
    </Button>
  </ButtonToolbar>
);

export default MessageEditorToolbar;
