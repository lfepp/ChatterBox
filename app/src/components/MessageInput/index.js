import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const MessageInput = props => (
  <FormGroup controlId="chatMessageInputTextarea">
    <ControlLabel>Enter a message</ControlLabel>
    <FormControl
      componentClass="textarea"
      autoFocus={true}
      value={props.value}
      onChange={props.handleChange}
    />
  </FormGroup>
);

export default MessageInput;
